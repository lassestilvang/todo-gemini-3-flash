'use server'

import { prisma } from '@/lib/prisma'

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

export async function getLabels() {
    return await prisma.label.findMany({
        orderBy: { name: 'asc' }
    })
}

export async function getActivityLogs(taskId: string) {
    return await prisma.activityLog.findMany({
        where: { taskId },
        orderBy: { timestamp: 'desc' }
    })
}

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
