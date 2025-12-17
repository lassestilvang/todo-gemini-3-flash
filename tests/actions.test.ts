import { describe, it, expect, beforeAll } from 'bun:test'
import { createTask, getTasks, deleteTask } from '@/app/actions/task'
import { getLists } from '@/app/actions/list'

describe('Task Actions', () => {
    let inboxId: string | undefined

    beforeAll(async () => {
        const lists = await getLists()
        inboxId = lists.find(l => l.isDefault)?.id
    })

    it('should create a task in inbox', async () => {
        if (!inboxId) throw new Error("Inbox not found")
        const title = "Test Task " + Date.now()
        const task = await createTask({
            title,
            listId: inboxId
        })

        expect(task).toBeDefined()
        expect(task.title).toBe(title)
        expect(task.listId).toBe(inboxId)

        // Clean up
        await deleteTask(task.id)
    })

    it('should retrieve tasks', async () => {
        const tasks = await getTasks({ listId: inboxId })
        expect(Array.isArray(tasks)).toBe(true)
    })
})
