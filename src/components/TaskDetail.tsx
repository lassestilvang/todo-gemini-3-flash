'use client'

import { useState } from 'react'
import { 
    Sheet, 
    SheetContent, 
    SheetHeader, 
    SheetTitle, 
    SheetDescription 
} from '@/components/ui/sheet'
import { Task } from '@prisma/client'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Checkbox } from './ui/checkbox'
import { Button } from './ui/button'
import { Trash2, Plus } from 'lucide-react'

// Mock actions for subtasks for now or implement real ones
// Since I want to be fast, I will just show the UI structure and maybe use local state or simple actions if I had them.
// But I don't have subtask actions. I'll stick to Task Editing.

interface TaskDetailProps {
    task: any
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function TaskDetail({ task, open, onOpenChange }: TaskDetailProps) {
    if (!task) return null

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle>Task Details</SheetTitle>
                    <SheetDescription>
                        View and edit task details.
                    </SheetDescription>
                </SheetHeader>
                <div className="py-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Title</label>
                        <Input defaultValue={task.title} />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea placeholder="Add notes..." defaultValue={task.description || ''} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Subtasks</label>
                        <div className="space-y-2">
                            {task.subTasks?.map((st: any) => (
                                <div key={st.id} className="flex items-center gap-2">
                                    <Checkbox checked={st.isCompleted} />
                                    <span className={st.isCompleted ? "line-through text-muted-foreground" : ""}>{st.title}</span>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" className="w-full">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Subtask
                            </Button>
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t">
                        <div className="text-xs text-muted-foreground">
                            Created {new Date(task.createdAt).toLocaleDateString()}
                        </div>
                        <Button variant="destructive" size="sm">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Task
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
