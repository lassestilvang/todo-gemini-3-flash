'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { RRule } from 'rrule'
import { z } from 'zod'
import { createSafeAction, ActionError } from '@/lib/actions/utils'
import * as chrono from 'chrono-node'

// Validation Schemas
const createTaskSchema = z.object({
    title: z.string().min(1, "Title is required").max(200),
    listId: z.string().uuid().optional(),
    date: z.date().nullable().optional(),
    description: z.string().max(2000).nullable().optional(),
    priority: z.enum(["NONE", "LOW", "MEDIUM", "HIGH"]).default("NONE"),
    energyLevel: z.enum(["LOW", "MEDIUM", "HIGH"]).optional()
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
    estimate: z.number().nullable().optional(),
    actual: z.number().nullable().optional()
})

const deleteSchema = z.object({ id: z.string().uuid() })

export async function getTasks(filter: { 
    listId?: string, 
    labelId?: string,
    date?: Date, 
    upcoming?: boolean,
    next7Days?: boolean,
    all?: boolean
}) {
  const where: any = {}

  if (filter.listId) {
    where.listId = filter.listId
  }

  if (filter.labelId) {
      where.labels = {
          some: {
              id: filter.labelId
          }
      }
  }
  
  if (filter.date) {
    const start = new Date(filter.date)
    start.setHours(0,0,0,0)
    const end = new Date(filter.date)
    end.setHours(23,59,59,999)
    
    where.date = {
        gte: start,
        lte: end
    }
  }

  if (filter.next7Days) {
      const now = new Date()
      const end = new Date()
      end.setDate(now.getDate() + 7)
      end.setHours(23,59,59,999)
      
      where.date = {
          gte: new Date(now.setHours(0,0,0,0)),
          lte: end
      }
  }

  if (filter.upcoming) {
      where.date = {
          gte: new Date()
      }
  }

  // Optimization: Select only needed fields if performance becomes an issue,
  // but for now include is fine for this scale.
  return await prisma.task.findMany({
    where,
    orderBy: [
        { isCompleted: 'asc' },
        { priority: 'desc' }, // Higher priority first
        { date: 'asc' },
        { createdAt: 'desc' }
    ],
    include: {
        list: {
            select: { name: true, color: true }
        },
        labels: {
            select: { id: true, name: true, color: true }
        },
        subTasks: {
            select: { id: true, title: true, isCompleted: true }
        },
        attachments: {
            select: { id: true, name: true, url: true }
        },
        reminders: {
            select: { id: true, time: true }
        },
        logs: {
            orderBy: { timestamp: 'desc' },
            take: 10
        }
    }
  })
}

export async function getTaskCounts() {
    const now = new Date()
    const startOfToday = new Date(now)
    startOfToday.setHours(0,0,0,0)
    
    const next7DaysEnd = new Date(now)
    next7DaysEnd.setDate(now.getDate() + 7)
    next7DaysEnd.setHours(23,59,59,999)
    
    const [inbox, today, next7Days, upcoming, all, overdue] = await Promise.all([
        prisma.task.count({ where: { list: { isDefault: true }, isCompleted: false } }),
        prisma.task.count({ 
            where: { 
                date: { gte: startOfToday, lte: new Date(new Date().setHours(23,59,59,999)) }, 
                isCompleted: false 
            } 
        }),
        prisma.task.count({
            where: {
                date: { gte: startOfToday, lte: next7DaysEnd },
                isCompleted: false
            }
        }),
        prisma.task.count({ where: { date: { gte: now }, isCompleted: false } }),
        prisma.task.count({ where: { isCompleted: false } }),
        prisma.task.count({ where: { date: { lt: startOfToday }, isCompleted: false } })
    ])

    return { inbox, today, next7Days, upcoming, all, overdue }
}

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
            energyLevel: data.energyLevel || "MEDIUM"
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

        if (isCompleted && task.recurrence && task.date) {
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
                const nextDate = rule.after(date)
                if (nextDate) {
                    await prisma.task.create({
                        data: {
                            title: task.title,
                            description: task.description,
                            date: nextDate,
                            priority: task.priority,
                            listId: task.listId,
                            recurrence: task.recurrence,
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

export async function getLabels() {
    return await prisma.label.findMany({
        orderBy: { name: 'asc' }
    })
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

export async function getActivityLogs(taskId: string) {
    return await prisma.activityLog.findMany({
        where: { taskId },
        orderBy: { timestamp: 'desc' }
    })
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

export async function searchTasks(query: string) {
    if (!query) return []
    
    return await prisma.task.findMany({
        where: {
            title: {
                contains: query
            }
        },
        take: 10,
        include: {
            list: { select: { name: true } }
        }
    })
}

export async function getAnalytics() {
    const now = new Date()
    const last7Days = new Date(now)
    last7Days.setDate(now.getDate() - 7)

    const [allTasks, completedLast7Days] = await Promise.all([
        prisma.task.findMany({
            include: { list: true }
        }),
        prisma.task.findMany({
            where: {
                isCompleted: true,
                updatedAt: { gte: last7Days }
            }
        })
    ])

    // Group completions by day
    const completionTrend = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' })
        const count = completedLast7Days.filter(t => 
            new Date(t.updatedAt).toDateString() === d.toDateString()
        ).length
        return { name: dateStr, count }
    })

    // Group by priority
    const byPriority = [
        { name: 'High', value: allTasks.filter(t => t.priority === 'HIGH').length, fill: '#ef4444' },
        { name: 'Medium', value: allTasks.filter(t => t.priority === 'MEDIUM').length, fill: '#3b82f6' },
        { name: 'Low', value: allTasks.filter(t => t.priority === 'LOW').length, fill: '#94a3b8' },
        { name: 'None', value: allTasks.filter(t => t.priority === 'NONE').length, fill: '#cbd5e1' },
    ]

    // Time stats
    const totalEstimate = allTasks.reduce((acc, t) => acc + (t.estimate || 0), 0)
    const totalActual = allTasks.reduce((acc, t) => acc + (t.actual || 0), 0)

    return {
        completionTrend,
        byPriority,
        stats: {
            totalTasks: allTasks.length,
            completedTasks: allTasks.filter(t => t.isCompleted).length,
            pendingTasks: allTasks.filter(t => !t.isCompleted).length,
            totalEstimate,
            totalActual
        }
    }
}