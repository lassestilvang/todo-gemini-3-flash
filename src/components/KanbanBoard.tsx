'use client'

import { motion } from 'framer-motion'
import { TaskItem } from './TaskItem'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

type TaskWithDetails = {
    id: string
    title: string
    description: string | null
    isCompleted: boolean
    date: Date | null
    deadline: Date | null
    priority: string
    energyLevel: string | null
    recurrence: string | null
    estimate: number | null
    actual: number | null
    list: { name: string, color: string | null }
    labels: { id: string, name: string, color: string | null }[]
    subTasks?: { id: string; title: string; isCompleted: boolean }[]
    attachments?: { id: string; name: string; url: string }[]
    reminders?: { id: string; time: Date }[]
    logs?: { id: string; action: string; details: string | null; timestamp: Date }[]
    createdAt: Date
}

interface KanbanBoardProps {
    tasks: TaskWithDetails[]
}

const PRIORITIES = ["HIGH", "MEDIUM", "LOW", "NONE"]

export function KanbanBoard({ tasks }: KanbanBoardProps) {
    const groupedTasks = PRIORITIES.reduce((acc, priority) => {
        acc[priority] = tasks.filter(t => t.priority === priority && !t.isCompleted)
        return acc
    }, {} as Record<string, TaskWithDetails[]>)

    const completedTasks = tasks.filter(t => t.isCompleted)

    return (
        <ScrollArea className="w-full h-full pb-10">
            <div className="flex gap-6 min-w-max">
                {PRIORITIES.map((priority) => (
                    <div key={priority} className="w-80 flex flex-col space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <span className={cn(
                                    "w-2 h-2 rounded-full",
                                    priority === "HIGH" ? "bg-red-500" : 
                                    priority === "MEDIUM" ? "bg-blue-500" : 
                                    priority === "LOW" ? "bg-gray-500" : "bg-muted"
                                )} />
                                {priority}
                                <span className="ml-2 bg-muted text-[10px] py-0.5 px-1.5 rounded-full">
                                    {groupedTasks[priority].length}
                                </span>
                            </h3>
                        </div>
                        
                        <div className="flex-1 space-y-3 p-2 bg-muted/30 rounded-xl min-h-[200px]">
                            {groupedTasks[priority].map((task) => (
                                <motion.div 
                                    key={task.id} 
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    <TaskItem task={task as any} />
                                </motion.div>
                            ))}
                            {groupedTasks[priority].length === 0 && (
                                <div className="h-20 flex items-center justify-center text-xs text-muted-foreground italic">
                                    No tasks
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                <div className="w-80 flex flex-col space-y-4">
                    <div className="px-2">
                        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                            Completed
                            <span className="ml-2 bg-muted text-[10px] py-0.5 px-1.5 rounded-full">
                                {completedTasks.length}
                            </span>
                        </h3>
                    </div>
                    <div className="flex-1 space-y-3 p-2 bg-muted/30 rounded-xl min-h-[200px] opacity-60">
                        {completedTasks.map((task) => (
                            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                            <TaskItem key={task.id} task={task as any} />
                        ))}
                    </div>
                </div>
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    )
}