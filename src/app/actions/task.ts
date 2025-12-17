'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getTasks(filter: { 
    listId?: string, 
    date?: Date, 
    upcoming?: boolean,
    all?: boolean
}) {
  const where: any = {}

  if (filter.listId) {
    where.listId = filter.listId
  }
  
  if (filter.date) {
    // Basic date matching for "Today" - this ignores time for simplicity in this MVP
    // Ideally we use startOfDay and endOfDay
    const start = new Date(filter.date)
    start.setHours(0,0,0,0)
    const end = new Date(filter.date)
    end.setHours(23,59,59,999)
    
    where.date = {
        gte: start,
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
    
    const [inbox, today, upcoming, all, overdue] = await Promise.all([
        prisma.task.count({ where: { list: { isDefault: true }, isCompleted: false } }),
        prisma.task.count({ 
            where: { 
                date: { gte: startOfToday, lte: new Date(new Date().setHours(23,59,59,999)) }, 
                isCompleted: false 
            } 
        }),
        prisma.task.count({ where: { date: { gte: now }, isCompleted: false } }),
        prisma.task.count({ where: { isCompleted: false } }),
        prisma.task.count({ where: { date: { lt: now }, isCompleted: false } })
    ])

    return { inbox, today, upcoming, all, overdue }
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
    await prisma.task.update({
        where: { id },
        data: { isCompleted }
    })
    revalidatePath('/')
}

export async function deleteTask(id: string) {
    await prisma.task.delete({ where: { id }})
    revalidatePath('/')
}
