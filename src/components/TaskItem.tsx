'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toggleTask, deleteTask } from '@/app/actions/task'
import { Calendar, Trash2, Play, Zap, Repeat } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TaskDetail } from './TaskDetail'
import { toast } from 'sonner'
import { useSound } from '@/lib/hooks/use-sound'

// Type definition to match Prisma include
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
    recurrenceRule: string | null
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

interface TaskItemProps {
    task: TaskWithDetails
    onFocus?: (task: TaskWithDetails) => void
}

export function TaskItem({ task, onFocus }: TaskItemProps) {
    const [completed, setCompleted] = useState(task.isCompleted)
    const [detailOpen, setDetailOpen] = useState(false)
    const { playSound } = useSound()

    const handleToggle = async (checked: boolean) => {
        setCompleted(checked)
        if (checked) playSound('success')
        else playSound('click')
        
        try {
            await toggleTask(task.id, checked)
        } catch {
            setCompleted(!checked)
            toast.error("Failed to update task")
        }
    }

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation()
        if(confirm("Are you sure?")) {
            playSound('delete')
            const result = await deleteTask({ id: task.id })
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Task deleted")
            }
        }
    }

    return (
        <>
        <div className={cn(
            "group flex items-center justify-between p-3 border rounded-lg bg-card hover:shadow-sm transition-all cursor-pointer",
            completed && "opacity-60"
        )} onClick={() => setDetailOpen(true)}>
            <div className="flex items-center gap-3 flex-1">
                <Checkbox 
                    checked={completed} 
                    onCheckedChange={handleToggle}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded-full w-5 h-5"
                />
                <div className="flex flex-col text-left">
                    <span className={cn(
                        "font-medium",
                        completed && "line-through text-muted-foreground"
                    )}>
                        {task.title}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                        {task.list.name !== "Inbox" && (
                             <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-primary/50" />
                                {task.list.name}
                             </span>
                        )}
                        {task.recurrenceRule && (
                            <span className="flex items-center gap-1 text-primary">
                                <Repeat className="w-3 h-3" />
                            </span>
                        )}
                        {task.date && (
                            <span className={cn(
                                "flex items-center gap-1",
                                new Date(task.date) < new Date() && !completed ? "text-red-500" : ""
                            )}>
                                <Calendar className="w-3 h-3" />
                                {format(new Date(task.date), "MMM d")}
                            </span>
                        )}
                        {task.priority !== "NONE" && (
                            <Badge variant="outline" className={cn(
                                "text-[10px] px-1 py-0 h-4",
                                task.priority === "HIGH" ? "text-red-500 border-red-200" : 
                                task.priority === "MEDIUM" ? "text-blue-500 border-blue-200" : "text-gray-500"
                            )}>
                                {task.priority}
                            </Badge>
                        )}
                        {task.energyLevel && (
                            <Badge variant="secondary" className={cn(
                                "text-[10px] px-1 py-0 h-4 gap-0.5",
                                task.energyLevel === "HIGH" ? "bg-orange-500/10 text-orange-600 border-orange-200" : 
                                task.energyLevel === "LOW" ? "bg-green-500/10 text-green-600 border-green-200" : ""
                            )}>
                                <Zap className="w-2.5 h-2.5 fill-current" />
                                {task.energyLevel}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!completed && onFocus && (
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-primary hover:bg-primary/10" 
                        onClick={(e) => { e.stopPropagation(); onFocus(task) }}
                    >
                        <Play className="w-4 h-4 fill-current" />
                    </Button>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={handleDelete}>
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </div>
        
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <TaskDetail key={task.id} task={task as any} open={detailOpen} onOpenChange={setDetailOpen} />
        </>
    )
}
