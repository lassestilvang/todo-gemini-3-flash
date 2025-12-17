'use client'

import { useState, useEffect } from 'react'
import { 
    Sheet, 
    SheetContent, 
    SheetHeader, 
    SheetTitle, 
    SheetDescription 
} from '@/components/ui/sheet'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Checkbox } from './ui/checkbox'
import { Button } from './ui/button'
import { Trash2, Plus, X, Loader2, Calendar as CalendarIcon } from 'lucide-react'
import { updateTask, createSubTask, toggleSubTask, deleteSubTask, deleteTask, getLabels, addLabelToTask, removeLabelFromTask } from '@/app/actions/task'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { Badge } from './ui/badge'

type TaskWithSubtasks = {
    id: string
    title: string
    description: string | null
    isCompleted: boolean
    date: Date | null
    deadline: Date | null
    priority: string
    recurrence: string | null
    createdAt: Date
    subTasks?: {
        id: string
        title: string
        isCompleted: boolean
    }[]
    labels?: {
        id: string
        name: string
        color: string | null
    }[]
}

interface TaskDetailProps {
    task: TaskWithSubtasks | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function TaskDetail({ task, open, onOpenChange }: TaskDetailProps) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [priority, setPriority] = useState('NONE')
    const [recurrence, setRecurrence] = useState('NONE')
    const [newSubTaskTitle, setNewSubTaskTitle] = useState('')
    const [isUpdating, setIsUpdating] = useState(false)
    const [allLabels, setAllLabels] = useState<{ id: string; name: string; color: string | null }[]>([])

    useEffect(() => {
        if (task) {
            setTitle(task.title || '')
            setDescription(task.description || '')
            setPriority(task.priority || 'NONE')
            setRecurrence(task.recurrence || 'NONE')
            
            // Fetch all labels
            getLabels().then(setAllLabels)
        }
    }, [task])

    if (!task) return null

    const handleUpdate = async (updates: Partial<TaskWithSubtasks>) => {
        setIsUpdating(true)
        try {
            await updateTask(task.id, updates)
        } catch (error) {
            console.error(error)
        } finally {
            setIsUpdating(false)
        }
    }

    const handleAddSubTask = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newSubTaskTitle.trim()) return
        try {
            await createSubTask(task.id, newSubTaskTitle)
            setNewSubTaskTitle('')
        } catch (error) {
            console.error(error)
        }
    }

    const handleDeleteTask = async () => {
        if (confirm("Are you sure you want to delete this task?")) {
            await deleteTask(task.id)
            onOpenChange(false)
        }
    }

    const handleToggleLabel = async (labelId: string) => {
        const isAttached = task.labels?.some(l => l.id === labelId)
        if (isAttached) {
            await removeLabelFromTask(task.id, labelId)
        } else {
            await addLabelToTask(task.id, labelId)
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Task Details</SheetTitle>
                    <SheetDescription>
                        View and edit task details.
                    </SheetDescription>
                </SheetHeader>
                <div className="py-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Title</label>
                        <Input 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={() => title !== task.title && handleUpdate({ title })}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea 
                            placeholder="Add notes..." 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)}
                            onBlur={() => description !== (task.description || '') && handleUpdate({ description })}
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Priority</label>
                            <Select 
                                value={priority} 
                                onValueChange={(val) => {
                                    setPriority(val)
                                    handleUpdate({ priority: val })
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Set Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NONE">None</SelectItem>
                                    <SelectItem value="LOW">Low</SelectItem>
                                    <SelectItem value="MEDIUM">Medium</SelectItem>
                                                                    <SelectItem value="HIGH">High</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                    
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium">Recurrence</label>
                                                            <Select 
                                                                value={recurrence} 
                                                                onValueChange={(val) => {
                                                                    setRecurrence(val)
                                                                    handleUpdate({ recurrence: val === 'NONE' ? null : val })
                                                                }}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Set Recurrence" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="NONE">None</SelectItem>
                                                                    <SelectItem value="DAILY">Daily</SelectItem>
                                                                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                                                                    <SelectItem value="WEEKDAYS">Every Weekday</SelectItem>
                                                                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                                                                    <SelectItem value="YEARLY">Yearly</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 flex flex-col">
                            <label className="text-sm font-medium">Date</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "justify-start text-left font-normal",
                                            !task.date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {task.date ? format(new Date(task.date), "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={task.date ? new Date(task.date) : undefined}
                                        onSelect={(date) => handleUpdate({ date: date ?? null })}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2 flex flex-col">
                            <label className="text-sm font-medium">Deadline</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "justify-start text-left font-normal",
                                            !task.deadline && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {task.deadline ? format(new Date(task.deadline), "PPP") : <span>Set deadline</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={task.deadline ? new Date(task.deadline) : undefined}
                                        onSelect={(deadline) => handleUpdate({ deadline: deadline ?? null })}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Labels</label>
                        <div className="flex flex-wrap gap-2">
                            {allLabels.map((label) => {
                                const isAttached = task.labels?.some(l => l.id === label.id)
                                return (
                                    <Badge 
                                        key={label.id}
                                        variant={isAttached ? "default" : "outline"}
                                        className={cn(
                                            "cursor-pointer transition-all",
                                            isAttached ? (label.color || "bg-primary") : "text-muted-foreground"
                                        )}
                                        onClick={() => handleToggleLabel(label.id)}
                                    >
                                        {label.name}
                                    </Badge>
                                )
                            })}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-medium">Subtasks</label>
                        <div className="space-y-2">
                            {task.subTasks?.map((st) => (
                                <div key={st.id} className="flex items-center gap-2 group">
                                    <Checkbox 
                                        checked={st.isCompleted} 
                                        onCheckedChange={(checked) => toggleSubTask(st.id, !!checked)}
                                    />
                                    <span className={cn(
                                        "flex-1 text-sm",
                                        st.isCompleted && "line-through text-muted-foreground"
                                    )}>
                                        {st.title}
                                    </span>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => deleteSubTask(st.id)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                            <form onSubmit={handleAddSubTask} className="flex items-center gap-2">
                                <Input 
                                    placeholder="Add subtask..." 
                                    value={newSubTaskTitle}
                                    onChange={(e) => setNewSubTaskTitle(e.target.value)}
                                    className="h-8 text-sm"
                                />
                                <Button type="submit" size="sm" variant="ghost">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t mt-auto">
                        <div className="text-[10px] text-muted-foreground flex flex-col">
                            <span>Created {new Date(task.createdAt).toLocaleString()}</span>
                            {isUpdating && <span className="text-primary flex items-center gap-1 mt-1"><Loader2 className="h-3 w-3 animate-spin" /> Saving...</span>}
                        </div>
                        <Button variant="destructive" size="sm" onClick={handleDeleteTask}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Task
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
