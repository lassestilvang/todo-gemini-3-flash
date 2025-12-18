'use client'

import { useState, useEffect } from 'react'
import { Loader2, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getSmartRescheduleSuggestions } from '@/app/actions/ai'
import { updateTask } from '@/app/actions/task'
import { toast } from 'sonner'
import { AnimatePresence } from 'framer-motion'
import * as chrono from 'chrono-node'

export function RescheduleSuggestions() {
    const [mounted, setMounted] = useState(false)
    const [suggestions, setSuggestions] = useState<{ taskId: string, suggestedDate: string, title: string }[] | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleFetch = async () => {
        setIsLoading(true)
        try {
            const result = await getSmartRescheduleSuggestions()
            setSuggestions(result)
        } catch {
            toast.error("Failed to fetch suggestions")
        } finally {
            setIsLoading(false)
        }
    }

    const handleApply = async (taskId: string, suggestedDateStr: string) => {
        const date = chrono.parseDate(suggestedDateStr)
        if (!date) {
            toast.error("Invalid date suggested")
            return
        }

        const result = await updateTask({ id: taskId, date })
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success(`Task rescheduled to ${suggestedDateStr}`)
            setSuggestions(prev => prev ? prev.filter(s => s.taskId !== taskId) : null)
        }
    }

    if (!mounted) return null

    return (
        <Card className="border-amber-500/20 bg-amber-500/5 glass mb-8 overflow-hidden relative">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <Calendar className="w-5 h-5" />
                    AI Smart Rescheduling
                </CardTitle>
                {!suggestions && !isLoading && (
                    <Button size="sm" onClick={handleFetch} variant="outline" className="h-8 border-amber-200">
                        Scan Overdue
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Analyzing your schedule...
                        </div>
                    ) : suggestions && suggestions.length > 0 ? (
                        <div className="space-y-3">
                            <p className="text-xs text-muted-foreground mb-2">Gemini suggests moving these overdue tasks:</p>
                            {suggestions.map((s) => (
                                <div key={s.taskId} className="flex items-center justify-between bg-background/50 p-2 rounded-md border text-sm">
                                    <span className="truncate flex-1 mr-2">{s.suggestedDate}: Next steps for this task?</span>
                                    <Button size="sm" variant="ghost" className="h-7 text-amber-600 hover:text-amber-700 hover:bg-amber-100" onClick={() => handleApply(s.taskId, s.suggestedDate)}>
                                        Reschedule
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : suggestions && suggestions.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">No overdue tasks found. Great job!</p>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Let Gemini help you find the best time for your overdue tasks.
                        </p>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    )
}
