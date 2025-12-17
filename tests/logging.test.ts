import { describe, it, expect, beforeAll } from 'bun:test'
import { createTask, getActivityLogs, updateTask, deleteTask } from '@/app/actions/task'
import { getLists } from '@/app/actions/list'

describe('Activity Logging', () => {
    let inboxId: string

    beforeAll(async () => {
        const lists = await getLists()
        inboxId = lists.find(l => l.isDefault)!.id
    })

    it('should log task creation', async () => {
        const taskResult = await createTask({
            title: "Log Test Task",
            listId: inboxId,
            priority: "NONE"
        })
        
        const task = taskResult.data!
        const logs = await getActivityLogs(task.id)
        
        expect(logs.some(l => l.action === "CREATED")).toBe(true)
        
        // Clean up
        await deleteTask({ id: task.id })
    })

    it('should log task updates', async () => {
        const taskResult = await createTask({
            title: "Log Update Task",
            listId: inboxId,
            priority: "NONE"
        })
        const task = taskResult.data!

        await updateTask({
            id: task.id,
            priority: "HIGH"
        })

        const logs = await getActivityLogs(task.id)
        expect(logs.some(l => l.action === "UPDATED" && l.details?.includes("priority to HIGH"))).toBe(true)

        // Clean up
        await deleteTask({ id: task.id })
    })
})
