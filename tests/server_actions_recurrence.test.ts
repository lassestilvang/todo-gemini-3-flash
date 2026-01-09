import { describe, it, expect, mock } from 'bun:test'
import { prisma } from '../src/lib/prisma'
import { toggleTask } from '../src/app/actions/task'

// Mock next/cache
mock.module('next/cache', () => ({
    revalidatePath: () => {}
}))

describe('Server Action Recurrence', () => {
    it('should create next task when recurring task is completed', async () => {
        // Create a task due today with daily recurrence
        const today = new Date()
        today.setHours(10, 0, 0, 0)
        
        const task = await prisma.task.create({
            data: {
                title: 'Daily Standup',
                date: today,
                recurrenceRule: 'FREQ=DAILY',
                priority: 'HIGH',
                list: {
                    create: { name: 'Work' }
                }
            }
        })

        // Complete the task
        await toggleTask(task.id, true)

        // Verify original is completed
        const completedTask = await prisma.task.findUnique({ where: { id: task.id } })
        expect(completedTask?.isCompleted).toBe(true)

        // Verify next task created
        // Next occurrence should be tomorrow
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const nextTask = await prisma.task.findFirst({
            where: {
                title: 'Daily Standup',
                isCompleted: false,
                date: tomorrow,
                // recurrenceRule should be copied
                recurrenceRule: 'FREQ=DAILY' 
            }
        })

        expect(nextTask).not.toBeNull()
        expect(nextTask?.listId).toBe(task.listId)

        // Cleanup
        await prisma.task.deleteMany({ where: { title: 'Daily Standup' } })
        await prisma.list.delete({ where: { id: task.listId } })
    })
})