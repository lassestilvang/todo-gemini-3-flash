'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { RRule } from 'rrule'
import { z } from 'zod'
import { createSafeAction, ActionError } from '@/lib/actions/utils'
import * as chrono from 'chrono-node'
import { getNextOccurrence } from '@/lib/recurrence'

// Validation Schemas
const createTaskSchema = z.object({
    title: z.string().min(1, "Title is required").max(200),
    listId: z.string().uuid().optional(),
    date: z.date().nullable().optional(),
    description: z.string().max(2000).nullable().optional(),
    priority: z.enum(["NONE", "LOW", "MEDIUM", "HIGH"]).default("NONE"),
    energyLevel: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    recurrenceRule: z.string().nullable().optional()
})

function parseNLP(input: string) {
    let title = input
    let date: Date | null = null
    let priority: "NONE" | "LOW" | "MEDIUM" | "HIGH" = "NONE"

    // Parse Priority (e.g., !!high, !!med, !!low or p1, p2, p3)
    if (title.includes('!!high') || title.includes('p1')) {
        priority = "HIGH"
        title = title.replace(/!!high|p1/gi, '')
    } else if (title.includes('!!med') || title.includes('p2')) {
        priority = "MEDIUM"
        title = title.replace(/!!med|p2/gi, '')
    } else if (title.includes('!!low') || title.includes('p3')) {
        priority = "LOW"
        title = title.replace(/!!low|p3/gi, '')
    }

    // Parse Date
    const results = chrono.parse(title)
    if (results.length > 0) {
        date = results[0].start.date()
        title = title.replace(results[0].text, '')
    }

    return {
        title: title.trim().replace(/\s+/g, ' '),
        date,
        priority
    }
}

const updateTaskSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).nullable().optional(),
    date: z.date().nullable().optional(),
    deadline: z.date().nullable().optional(),
    priority: z.enum(["NONE", "LOW", "MEDIUM", "HIGH"]).optional(),
    energyLevel: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    isCompleted: z.boolean().optional(),
    recurrence: z.string().nullable().optional(),
    recurrenceRule: z.string().nullable().optional(),
    estimate: z.number().nullable().optional(),
    actual: z.number().nullable().optional()
})

const deleteSchema = z.object({ id: z.string().uuid() })

async function logActivity(taskId: string, action: string, details?: string) {
    await prisma.activityLog.create({
        data: { taskId, action, details }
    })
}

export const createTask = createSafeAction(createTaskSchema, async (data) => {
    let listId = data.listId
    
    const nlp = parseNLP(data.title)
    const finalTitle = nlp.title || data.title
    const finalDate = data.date || nlp.date
    const finalPriority = data.priority !== "NONE" ? data.priority : nlp.priority

    if (!listId) {
        const inbox = await prisma.list.findFirst({ where: { isDefault: true }})
        listId = inbox?.id
    }

    if (!listId) throw new ActionError("No list found")

    const task = await prisma.task.create({
        data: {
            title: finalTitle,
            listId,
            date: finalDate,
            description: data.description,
            priority: finalPriority,
            energyLevel: data.energyLevel || "MEDIUM",
            recurrenceRule: data.recurrenceRule
        }
    })
    
    await logActivity(task.id, "CREATED", `Task "${task.title}" created via ${nlp.date ? 'NLP' : 'Standard'}`)
    revalidatePath('/')
    return task
})

export async function toggleTask(id: string, isCompleted: boolean) {
    try {
        const task = await prisma.task.update({
            where: { id },
            data: { isCompleted },
            include: {
                labels: true,
                subTasks: true
            }
        })

        await logActivity(task.id, isCompleted ? "COMPLETED" : "UNCOMPLETED")

        if (isCompleted && task.date && (task.recurrence || task.recurrenceRule)) {
            let nextDate: Date | null = null

            if (task.recurrenceRule) {
                nextDate = getNextOccurrence(task.recurrenceRule, task.date)
            } else if (task.recurrence) {
                let rule: RRule | null = null
                const date = new Date(task.date)

                switch (task.recurrence) {
                    case 'DAILY':
                        rule = new RRule({ freq: RRule.DAILY, dtstart: date })
                        break
                    case 'WEEKLY':
                        rule = new RRule({ freq: RRule.WEEKLY, dtstart: date })
                        break
                    case 'WEEKDAYS':
                        rule = new RRule({ freq: RRule.WEEKLY, byweekday: [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR], dtstart: date })
                        break
                    case 'MONTHLY':
                        rule = new RRule({ freq: RRule.MONTHLY, dtstart: date })
                        break
                    case 'YEARLY':
                        rule = new RRule({ freq: RRule.YEARLY, dtstart: date })
                        break
                }
                if (rule) {
                    nextDate = rule.after(date)
                }
            }

            if (nextDate) {
                await prisma.task.create({
                    data: {
                        title: task.title,
                        description: task.description,
                        date: nextDate,
                        priority: task.priority,
                        listId: task.listId,
                        recurrence: task.recurrence,
                        recurrenceRule: task.recurrenceRule,
                        labels: {
                            connect: task.labels.map(l => ({ id: l.id }))
                        },
                        subTasks: {
                            create: task.subTasks.map(st => ({
                                title: st.title,
                                isCompleted: false
                            }))
                        }
                    }
                })
            }
        }

        revalidatePath('/')
    } catch (error) {
        console.error("Toggle Task Error:", error)
        throw new ActionError("Failed to toggle task")
    }
}

export const updateTask = createSafeAction(updateTaskSchema, async (data) => {
    const { id, ...rest } = data
    
    // Fetch current state to compare for logging
    const current = await prisma.task.findUnique({ where: { id } })
    if (!current) throw new ActionError("Task not found")

    const task = await prisma.task.update({
        where: { id },
        data: rest
    })

    // Log changes
    const changes = []
    if (rest.title && rest.title !== current.title) changes.push(`title to "${rest.title}"`)
    if (rest.priority && rest.priority !== current.priority) changes.push(`priority to ${rest.priority}`)
    if (rest.isCompleted !== undefined && rest.isCompleted !== current.isCompleted) changes.push(rest.isCompleted ? 'completed' : 'uncompleted')
    if (rest.estimate !== undefined && rest.estimate !== current.estimate) changes.push(`estimate to ${rest.estimate}m`)
    if (rest.actual !== undefined && rest.actual !== current.actual) changes.push(`actual time to ${rest.actual}m`)
    
    if (changes.length > 0) {
        await logActivity(id, "UPDATED", `Updated ${changes.join(', ')}`)
    }

    revalidatePath('/')
    return task
})

export async function createSubTask(taskId: string, title: string) {
    const subTask = await prisma.subTask.create({
        data: {
            title,
            taskId
        }
    })
    revalidatePath('/')
    return subTask
}

export async function toggleSubTask(id: string, isCompleted: boolean) {
    await prisma.subTask.update({
        where: { id },
        data: { isCompleted }
    })
    revalidatePath('/')
}

export async function deleteSubTask(id: string) {
    await prisma.subTask.delete({ where: { id }})
    revalidatePath('/')
}

export async function createLabel(name: string, color?: string, icon?: string) {
    const label = await prisma.label.create({
        data: { name, color, icon }
    })
    revalidatePath('/')
    return label
}

export async function addLabelToTask(taskId: string, labelId: string) {
    await prisma.task.update({
        where: { id: taskId },
        data: {
            labels: {
                connect: { id: labelId }
            }
        }
    })
    revalidatePath('/')
}

export async function removeLabelFromTask(taskId: string, labelId: string) {
    await prisma.task.update({
        where: { id: taskId },
        data: {
            labels: {
                disconnect: { id: labelId }
            }
        }
    })
    revalidatePath('/')
}

export async function addAttachment(taskId: string, name: string, url: string) {
    const attachment = await prisma.attachment.create({
        data: { taskId, name, url }
    })
    await logActivity(taskId, "ATTACHMENT_ADDED", `Added attachment "${name}"`)
    revalidatePath('/')
    return attachment
}

export async function deleteAttachment(id: string) {
    const attachment = await prisma.attachment.delete({ where: { id }})
    await logActivity(attachment.taskId, "ATTACHMENT_DELETED", `Deleted attachment "${attachment.name}"`)
    revalidatePath('/')
}

export async function addReminder(taskId: string, time: Date) {
    const reminder = await prisma.reminder.create({
        data: { taskId, time }
    })
    await logActivity(taskId, "REMINDER_ADDED", `Set reminder for ${time.toLocaleString()}`)
    revalidatePath('/')
    return reminder
}

export async function deleteReminder(id: string) {
    const reminder = await prisma.reminder.delete({ where: { id }})
    await logActivity(reminder.taskId, "REMINDER_DELETED", "Deleted reminder")
    revalidatePath('/')
}

export const deleteTask = createSafeAction(deleteSchema, async (data) => {
    await prisma.task.delete({ where: { id: data.id }})
    revalidatePath('/')
})
