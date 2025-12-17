import { describe, it, expect, beforeAll } from 'bun:test'
import { createTask, addAttachment, addReminder, deleteTask } from '@/app/actions/task'
import { getLists } from '@/app/actions/list'

describe('Task Extensions', () => {
    let inboxId: string

    beforeAll(async () => {
        const lists = await getLists()
        inboxId = lists.find(l => l.isDefault)!.id
    })

    it('should add an attachment', async () => {
        const taskResult = await createTask({
            title: "Attachment Task",
            listId: inboxId,
            priority: "NONE"
        })
        const task = taskResult.data!

        const attachment = await addAttachment(task.id, "Test Doc", "https://example.com/doc")
        expect(attachment.name).toBe("Test Doc")
        
        // Clean up
        await deleteTask({ id: task.id })
    })

    it('should add a reminder', async () => {
        const taskResult = await createTask({
            title: "Reminder Task",
            listId: inboxId,
            priority: "NONE"
        })
        const task = taskResult.data!

        const time = new Date()
        time.setHours(time.getHours() + 1)
        
        const reminder = await addReminder(task.id, time)
        expect(new Date(reminder.time).getTime()).toBe(time.getTime())

        // Clean up
        await deleteTask({ id: task.id })
    })
})
