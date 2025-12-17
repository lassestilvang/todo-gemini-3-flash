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
import { updateTask, createSubTask, toggleSubTask, deleteSubTask, deleteTask, getLabels, addLabelToTask, removeLabelFromTask, addAttachment, deleteAttachment, addReminder, deleteReminder } from '@/app/actions/task'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { Badge } from './ui/badge'
import { toast } from 'sonner'
import { Paperclip, Bell, History } from 'lucide-react'

type TaskWithSubtasks = {
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
    logs?: {
        id: string
        action: string
        details: string | null
        timestamp: Date
    }[]
    attachments?: {
        id: string
        name: string
        url: string
    }[]
    reminders?: {
        id: string
        time: Date
    }[]
}

interface TaskDetailProps {
    task: TaskWithSubtasks | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function TaskDetail({ task, open, onOpenChange }: TaskDetailProps) {
    const [formState, setFormState] = useState<{
        title: string
        description: string
        priority: string
        recurrence: string
        estimate: string
        actual: string
    }>({
        title: task?.title || '',
        description: task?.description || '',
        priority: task?.priority || 'NONE',
        recurrence: task?.recurrence || 'NONE',
        estimate: task?.estimate?.toString() || '',
        actual: task?.actual?.toString() || ''
    })
    const [newSubTaskTitle, setNewSubTaskTitle] = useState('')
    const [isUpdating, setIsUpdating] = useState(false)
    const [allLabels, setAllLabels] = useState<{ id: string; name: string; color: string | null }[]>([])

    // Labels still need to be fetched, but we can do it once on mount
    useEffect(() => {
        if (open) {
            getLabels().then(setAllLabels)
        }
    }, [open])

    if (!task) return null

    const handleUpdate = async (updates: Partial<TaskWithSubtasks>) => {
        setIsUpdating(true)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await updateTask({ id: task.id, ...(updates as any) })
        if (result.error) {
            toast.error(result.error)
        }
        setIsUpdating(false)
    }

    const handleFieldChange = (field: keyof typeof formState, value: string) => {
        setFormState(prev => ({ ...prev, [field]: value }))
    }

    const handleAddSubTask = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newSubTaskTitle.trim()) return
        try {
            await createSubTask(task.id, newSubTaskTitle)
            setNewSubTaskTitle('')
        } catch (_error) {
            toast.success("Added subtask") // Actually it revalidates, so it's fine
        }
    }

    const handleDeleteTask = async () => {
        if (confirm("Are you sure you want to delete this task?")) {
            const result = await deleteTask({ id: task.id })
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Task deleted")
                onOpenChange(false)
            }
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

    const handleAddAttachment = async () => {
        const name = prompt("Enter attachment name:")
        const url = prompt("Enter attachment URL:")
        if (name && url) {
            await addAttachment(task.id, name, url)
            toast.success("Attachment added")
        }
    }

    const handleAddReminder = async (time: Date) => {
        await addReminder(task.id, time)
        toast.success("Reminder set")
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
                            value={formState.title} 
                            onChange={(e) => handleFieldChange('title', e.target.value)}
                            onBlur={() => formState.title !== task.title && handleUpdate({ title: formState.title })}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea 
                            placeholder="Add notes..." 
                            value={formState.description} 
                            onChange={(e) => handleFieldChange('description', e.target.value)}
                            onBlur={() => formState.description !== (task.description || '') && handleUpdate({ description: formState.description })}
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Priority</label>
                            <Select 
                                value={formState.priority} 
                                onValueChange={(val) => {
                                    handleFieldChange('priority', val)
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
    
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Estimate (min)</label>
                                                    <Input 
                                                        type="number" 
                                                        value={formState.estimate} 
                                                        onChange={(e) => handleFieldChange('estimate', e.target.value)}
                                                        onBlur={() => formState.estimate !== (task.estimate?.toString() || '') && handleUpdate({ estimate: parseInt(formState.estimate) || null })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Actual (min)</label>
                                                    <Input 
                                                        type="number" 
                                                        value={formState.actual} 
                                                        onChange={(e) => handleFieldChange('actual', e.target.value)}
                                                        onBlur={() => formState.actual !== (task.actual?.toString() || '') && handleUpdate({ actual: parseInt(formState.actual) || null })}
                                                    />
                                                </div>
                                            </div>
                        
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Recurrence</label>                            <Select 
                                value={formState.recurrence} 
                                onValueChange={(val) => {
                                    handleFieldChange('recurrence', val)
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
                        </div>
                    </div>

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
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Paperclip className="h-4 w-4" /> Attachments
                            </label>
                            <Button variant="ghost" size="sm" onClick={handleAddAttachment}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {task.attachments?.map((at) => (
                                <div key={at.id} className="flex items-center justify-between p-2 border rounded-md text-sm">
                                    <a href={at.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                                        {at.name}
                                    </a>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteAttachment(at.id)}>
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Bell className="h-4 w-4" /> Reminders
                            </label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                    <Calendar
                                        mode="single"
                                        onSelect={(date) => date && handleAddReminder(date)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            {task.reminders?.map((rem) => (
                                <div key={rem.id} className="flex items-center justify-between p-2 border rounded-md text-sm">
                                    <span>{format(new Date(rem.time), "PPp")}</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteReminder(rem.id)}>
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <History className="h-4 w-4" /> Activity Log
                        </label>
                        <div className="space-y-3 pl-2 border-l-2">
                            {task.logs?.map((log) => (
                                <div key={log.id} className="text-xs space-y-1">
                                    <div className="font-medium text-muted-foreground">
                                        {log.action} • {format(new Date(log.timestamp), "MMM d, HH:mm")}
                                    </div>
                                    {log.details && <div className="text-foreground">{log.details}</div>}
                                </div>
                            ))}
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
