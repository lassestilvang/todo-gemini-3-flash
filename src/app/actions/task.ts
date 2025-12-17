'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { RRule } from 'rrule'

export async function getTasks(filter: { 
    listId?: string, 
    date?: Date, 
    upcoming?: boolean,
    next7Days?: boolean,
    all?: boolean
}) {
  const where: {
      listId?: string;
      date?: { gte?: Date; lte?: Date; lt?: Date };
  } = {}

  if (filter.listId) {
    where.listId = filter.listId
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

  // "All" just returns everything, maybe exclude completed? 
  // For now let's return everything sorted by date.

  return await prisma.task.findMany({
    where,
    orderBy: [
        { isCompleted: 'asc' }, // Pending first
        { date: 'asc' }, // Earliest first
        { createdAt: 'desc' }
    ],
    include: {
        list: true,
        labels: true,
        subTasks: true
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

export async function createTask(data: {
    title: string,
    listId?: string,
    date?: Date,
    description?: string,
    priority?: string
}) {
    let listId = data.listId
    
    if (!listId) {
        const inbox = await prisma.list.findFirst({ where: { isDefault: true }})
        listId = inbox?.id
    }

    if (!listId) throw new Error("No list found")

    const task = await prisma.task.create({
        data: {
            title: data.title,
            listId,
            date: data.date,
            description: data.description,
            priority: data.priority || "NONE"
        }
    })
    
    revalidatePath('/')
    return task
}

export async function toggleTask(id: string, isCompleted: boolean) {
    const task = await prisma.task.update({
        where: { id },
        data: { isCompleted },
        include: {
            labels: true,
            subTasks: true
        }
    })

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
                // Create next occurrence
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
}

export async function updateTask(id: string, data: {
    title?: string,
    description?: string | null,
    date?: Date | null,
    deadline?: Date | null,
    priority?: string,
    isCompleted?: boolean,
    recurrence?: string | null
}) {
    const task = await prisma.task.update({
        where: { id },
        data
    })
    revalidatePath('/')
    return task
}

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

export async function deleteTask(id: string) {
    await prisma.task.delete({ where: { id }})
    revalidatePath('/')
}

export async function searchTasks(query: string) {
    if (!query) return []
    
    // We fetch all tasks for client-side fuzzy search, or use prisma search if it's supported
    // For local SQLite, we'll fetch recently created/updated tasks or just search by title
    return await prisma.task.findMany({
        where: {
            title: {
                contains: query
            }
        },
        take: 10,
        include: {
            list: true
        }
    })
}
