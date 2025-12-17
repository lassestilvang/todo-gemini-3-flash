'use client'

import { useState } from 'react'
import { TaskItem } from './TaskItem'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, Calendar as CalendarIcon } from 'lucide-react'
import { createTask } from '@/app/actions/task'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import * as chrono from 'chrono-node'
import { FocusOverlay } from './FocusOverlay'
import { AnimatePresence } from 'framer-motion'

interface TaskListProps {
    tasks: {
        id: string
        title: string
        description: string | null
        isCompleted: boolean
        date: Date | null
        deadline: Date | null
        priority: string
        recurrence: string | null
        estimate: number | null
        actual: number | null
        list: { name: string, color: string | null }
        labels: { id: string; name: string; color: string | null }[]
        subTasks?: { id: string; title: string; isCompleted: boolean }[]
        attachments?: { id: string; name: string; url: string }[]
        reminders?: { id: string; time: Date }[]
        logs?: { id: string; action: string; details: string | null; timestamp: Date }[]
        createdAt: Date
    }[]
    listId?: string
    title: string
}

export function TaskList({ tasks, listId, title }: TaskListProps) {
    const [newTaskTitle, setNewTaskTitle] = useState("")
    const [date, setDate] = useState<Date | undefined>(undefined)
    const [showCompleted, setShowCompleted] = useState(true)
    const [focusedTask, setFocusedTask] = useState<any | null>(null)

    // NLP Preview
    const [nlpPreview, setNlpPreview] = useState<{ date: Date | null, priority: string } | null>(null)

    useEffect(() => {
        if (!newTaskTitle.trim()) {
            setNlpPreview(null)
            return
        }

        const results = chrono.parse(newTaskTitle)
        let detectedDate = results.length > 0 ? results[0].start.date() : null
        
        let detectedPriority = "NONE"
        if (newTaskTitle.includes('!!high') || newTaskTitle.includes('p1')) detectedPriority = "HIGH"
        else if (newTaskTitle.includes('!!med') || newTaskTitle.includes('p2')) detectedPriority = "MEDIUM"
        else if (newTaskTitle.includes('!!low') || newTaskTitle.includes('p3')) detectedPriority = "LOW"

        if (detectedDate || detectedPriority !== "NONE") {
            setNlpPreview({ date: detectedDate, priority: detectedPriority })
        } else {
            setNlpPreview(null)
        }
    }, [newTaskTitle])

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTaskTitle.trim()) return
        
        const result = await createTask({
            title: newTaskTitle,
            listId: listId,
            date: date,
            priority: "NONE"
        })

        if (result.error) {
            toast.error(result.error)
        } else {
            setNewTaskTitle("")
            setDate(undefined)
            toast.success("Task created")
        }
    }

    const filteredTasks = showCompleted ? tasks : tasks.filter(t => !t.isCompleted)

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
            <header className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowCompleted(!showCompleted)}
                    className="text-muted-foreground"
                >
                    {showCompleted ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                    {showCompleted ? "Hide Completed" : "Show Completed"}
                </Button>
            </header>

            <form onSubmit={handleAddTask} className="space-y-2">
                <div className="flex gap-2 items-center">
                    <div className="relative flex-1">
                        <Input 
                            placeholder="Add a task (e.g. Lunch tomorrow !!high)" 
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            className="pr-10"
                        />
                        {nlpPreview && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 pointer-events-none">
                                {nlpPreview.date && (
                                    <Badge variant="secondary" className="text-[10px] px-1 py-0 h-5">
                                        <CalendarIcon className="w-3 h-3 mr-1" />
                                        {format(nlpPreview.date, "MMM d")}
                                    </Badge>
                                )}
                                {nlpPreview.priority !== "NONE" && (
                                    <Badge variant="outline" className={cn(
                                        "text-[10px] px-1 py-0 h-5",
                                        nlpPreview.priority === "HIGH" ? "bg-red-500/10 text-red-500 border-red-500/20" : ""
                                    )}>
                                        {nlpPreview.priority}
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-[240px] justify-start text-left font-normal hidden md:flex",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <Button type="submit">
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                    </Button>
                </div>
            </form>

            <div className="space-y-2">
                {filteredTasks.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                        {tasks.length > 0 ? "No pending tasks." : "No tasks yet. Enjoy your day!"}
                    </div>
                ) : (
                    filteredTasks.map(task => (
                        <TaskItem key={task.id} task={task} onFocus={setFocusedTask} />
                    ))
                )}
            </div>

            <AnimatePresence>
                {focusedTask && (
                    <FocusOverlay 
                        task={focusedTask} 
                        onClose={() => setFocusedTask(null)} 
                    />
                )}
            </AnimatePresence>
        </div>
    )
}
