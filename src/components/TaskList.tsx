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
        list: { name: string, color: string | null }
        labels: { id: string; name: string; color: string | null }[]
        subTasks?: { id: string; title: string; isCompleted: boolean }[]
        createdAt: Date
    }[]
    listId?: string
    title: string
}

export function TaskList({ tasks, listId, title }: TaskListProps) {
    const [newTaskTitle, setNewTaskTitle] = useState("")
    const [date, setDate] = useState<Date | undefined>(undefined)
    const [showCompleted, setShowCompleted] = useState(true)

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTaskTitle.trim()) return
        
        await createTask({
            title: newTaskTitle,
            listId: listId,
            date: date
        })
        setNewTaskTitle("")
        setDate(undefined)
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

            <form onSubmit={handleAddTask} className="flex gap-2 items-center">
                <Input 
                    placeholder="Add a task..." 
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="flex-1"
                />
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-[240px] justify-start text-left font-normal",
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
            </form>

            <div className="space-y-2">
                {filteredTasks.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                        {tasks.length > 0 ? "No pending tasks." : "No tasks yet. Enjoy your day!"}
                    </div>
                ) : (
                    filteredTasks.map(task => (
                        <TaskItem key={task.id} task={task} />
                    ))
                )}
            </div>
        </div>
    )
}
