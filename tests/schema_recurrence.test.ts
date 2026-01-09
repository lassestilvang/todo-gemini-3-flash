import { describe, it, expect } from 'bun:test'
import { prisma } from '../src/lib/prisma'

describe('Task Schema Recurrence', () => {
    it('should allow creating a task with a recurrence rule', async () => {
        const task = await prisma.task.create({
            data: {
                title: 'Recurring Task',
                list: {
                    create: { name: 'Test List' }
                },
                recurrenceRule: 'FREQ=DAILY'
            }
        })

        expect(task).toHaveProperty('recurrenceRule', 'FREQ=DAILY')
        
        // Cleanup
        await prisma.task.delete({ where: { id: task.id } })
        await prisma.list.delete({ where: { id: task.listId } })
    })
})