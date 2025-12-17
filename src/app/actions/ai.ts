'use server'

import { model } from '@/lib/gemini'
import { prisma } from '@/lib/prisma'
import { createSafeAction, ActionError } from '@/lib/actions/utils'
import { z } from 'zod'

export async function getDailyBriefing() {
  if (!model) throw new ActionError("AI features are not configured. Please add GEMINI_API_KEY to your .env file.")

  const tasks = await prisma.task.findMany({
    where: {
      isCompleted: false,
      OR: [
        { date: { lte: new Date() } },
        { priority: "HIGH" }
      ]
    },
    include: { list: true }
  })

  if (tasks.length === 0) return "You're all caught up! No high priority or overdue tasks for today."

  const prompt = `You are a professional personal assistant. Here is a list of my current tasks:
${tasks.map(t => `- ${t.title} (${t.priority} priority, List: ${t.list.name}, Due: ${t.date?.toLocaleDateString() || 'No date'})`).join('\n')}

Provide a concise, motivating daily briefing (3-4 sentences). 
Identify the top 3 most important tasks I should focus on today and briefly explain why. 
Tone: Professional, encouraging, and clear.`

  try {
    const result = await model.generateContent(prompt)
    return result.response.text()
  } catch (error) {
    console.error("Gemini Error:", error)
    throw new ActionError("Failed to generate briefing")
  }
}

const decomposeSchema = z.object({
    taskId: z.string().uuid(),
    taskTitle: z.string(),
    taskDescription: z.string().nullable()
})

export const decomposeTask = createSafeAction(decomposeSchema, async (data) => {
    if (!model) throw new ActionError("AI features are not configured.")

    const prompt = `Break down the following complex task into 3-5 simple, actionable sub-tasks:
Task: ${data.taskTitle}
Description: ${data.taskDescription || 'No description'}

Respond ONLY with a JSON array of strings, like this: ["Sub-task 1", "Sub-task 2", "Sub-task 3"]`

    try {
        const result = await model.generateContent(prompt)
        const text = result.response.text()
        const subTasks = JSON.parse(text.substring(text.indexOf('['), text.lastIndexOf(']') + 1))
        
        // Create subtasks in DB
        await prisma.subTask.createMany({
            data: subTasks.map((title: string) => ({
                title,
                taskId: data.taskId
            }))
        })

        return subTasks
    } catch (error) {
        console.error("AI Decomposition Error:", error)
        throw new ActionError("Failed to break down task")
    }
})

const suggestLabelsSchema = z.object({
    taskTitle: z.string(),
    taskDescription: z.string().nullable(),
    availableLabels: z.array(z.object({
        id: z.string(),
        name: z.string()
    }))
})

export const suggestLabels = createSafeAction(suggestLabelsSchema, async (data) => {
    if (!model) throw new ActionError("AI features are not configured.")

    const prompt = `Based on the task title and description, suggest the most relevant labels from the provided list.
Task: ${data.taskTitle}
Description: ${data.taskDescription || 'No description'}
Available Labels: ${data.availableLabels.map(l => l.name).join(', ')}

Respond ONLY with a JSON array of the label names that apply (max 3), like this: ["Label 1", "Label 2"]`

    try {
        const result = await model.generateContent(prompt)
        const text = result.response.text()
        const suggestions = JSON.parse(text.substring(text.indexOf('['), text.lastIndexOf(']') + 1))
        
        // Return label IDs for the suggestions
        return data.availableLabels
            .filter(l => suggestions.includes(l.name))
            .map(l => l.id)
    } catch (error) {
        console.error("AI Label Suggestion Error:", error)
        throw new ActionError("Failed to suggest labels")
    }
})

export async function getSmartRescheduleSuggestions() {
    if (!model) throw new ActionError("AI features are not configured.")

    const overdueTasks = await prisma.task.findMany({
        where: {
            isCompleted: false,
            date: { lt: new Date() }
        },
        include: { list: true }
    })

    if (overdueTasks.length === 0) return []

    const prompt = `I have the following overdue tasks:
${overdueTasks.map(t => `- ${t.title} (Overdue since: ${t.date?.toLocaleDateString()})`).join('\n')}

Suggest new realistic dates for these tasks (e.g., Today, Tomorrow, Next Monday) based on their names.
Respond ONLY with a JSON array of objects with "taskId" and "suggestedDate" (as a human-readable string), like this: [{"taskId": "...", "suggestedDate": "Tomorrow"}]`

    try {
        const result = await model.generateContent(prompt)
        const text = result.response.text()
        return JSON.parse(text.substring(text.indexOf('['), text.lastIndexOf(']') + 1))
    } catch (error) {
        console.error("AI Reschedule Error:", error)
        throw new ActionError("Failed to get reschedule suggestions")
    }
}

