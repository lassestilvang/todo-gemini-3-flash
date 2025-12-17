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

interface TaskListProps {
    tasks: any[]
    listId?: string
    title: string
}

export function TaskList({ tasks, listId, title }: TaskListProps) {
    const [newTaskTitle, setNewTaskTitle] = useState("")
    const [date, setDate] = useState<Date | undefined>(undefined)

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

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
            <header className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
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
                {tasks.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                        No tasks yet. Enjoy your day!
                    </div>
                ) : (
                    tasks.map(task => (
                        <TaskItem key={task.id} task={task} />
                    ))
                )}
            </div>
        </div>
    )
}
