'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, CheckCircle2, Play, Pause, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toggleTask } from '@/app/actions/task'
import { toast } from 'sonner'
import { Badge } from './ui/badge'

interface FocusOverlayProps {
    task: { id: string; title: string; description: string | null }
    onClose: () => void
}

export function FocusOverlay({ task, onClose }: FocusOverlayProps) {
    const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes
    const [isActive, setIsActive] = useState(false)

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1)
            }, 1000)
        }
        return () => { if (interval) clearInterval(interval) }
    }, [isActive, timeLeft])

    useEffect(() => {
        if (timeLeft === 0 && isActive) {
            toast.success("Focus session complete!")
            setTimeout(() => setIsActive(false), 0)
        }
    }, [timeLeft, isActive])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const handleComplete = async () => {
        await toggleTask(task.id, true)
        toast.success("Task completed in focus mode!")
        onClose()
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
        >
            <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-6 right-6" 
                onClick={onClose}
            >
                <X className="h-6 w-6" />
            </Button>

            <div className="max-w-2xl w-full space-y-12">
                <div className="space-y-4">
                    <Badge variant="outline" className="px-3 py-1 text-sm font-medium tracking-widest uppercase opacity-50">
                        Focusing on
                    </Badge>
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tight">{task.title}</h2>
                    {task.description && (
                        <p className="text-muted-foreground text-lg max-w-md mx-auto line-clamp-2">
                            {task.description}
                        </p>
                    )}
                </div>

                <div className="space-y-8">
                    <div className="text-8xl md:text-9xl font-mono font-bold tracking-tighter tabular-nums">
                        {formatTime(timeLeft)}
                    </div>
                    
                    <div className="flex items-center justify-center gap-4">
                        <Button 
                            size="lg" 
                            variant={isActive ? "outline" : "default"}
                            className="h-16 w-16 rounded-full"
                            onClick={() => setIsActive(!isActive)}
                        >
                            {isActive ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 fill-current" />}
                        </Button>
                        <Button 
                            size="lg" 
                            variant="ghost" 
                            className="h-16 w-16 rounded-full"
                            onClick={() => { setIsActive(false); setTimeLeft(25 * 60) }}
                        >
                            <RotateCcw className="h-6 w-6" />
                        </Button>
                    </div>
                </div>

                <div className="pt-12">
                    <Button 
                        size="lg" 
                        className="rounded-full px-8 py-6 text-xl h-auto" 
                        onClick={handleComplete}
                    >
                        <CheckCircle2 className="mr-2 h-6 w-6" />
                        Complete Task
                    </Button>
                </div>
            </div>
        </motion.div>
    )
}
