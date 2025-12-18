'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getDailyBriefing } from '@/app/actions/ai'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export function AIBriefing() {
    const [mounted, setMounted] = useState(false)
    const [briefing, setBriefing] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleGenerate = async () => {
        setIsLoading(true)
        try {
            const result = await getDailyBriefing()
            setBriefing(result)
        } catch {
            toast.error("Failed to generate briefing")
        } finally {
            setIsLoading(false)
        }
    }

    if (!mounted) return null

    return (
        <Card className="border-primary/20 bg-primary/5 glass mb-8 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles className="w-12 h-12 text-primary" />
            </div>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Gemini Daily Briefing
                </CardTitle>
                {!briefing && !isLoading && (
                    <Button size="sm" onClick={handleGenerate} variant="secondary" className="h-8">
                        Generate
                    </Button>
                )}
                {briefing && (
                    <Button size="icon" onClick={handleGenerate} variant="ghost" className="h-8 w-8 text-muted-foreground" disabled={isLoading}>
                        <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div 
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2 text-sm text-muted-foreground py-2"
                        >
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Consulting Gemini for your priorities...
                        </motion.div>
                    ) : briefing ? (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap"
                        >
                            {briefing}
                        </motion.div>
                    ) : (
                        <motion.p 
                            key="placeholder"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-sm text-muted-foreground"
                        >
                            Get an AI-powered overview of your day based on your priority tasks.
                        </motion.p>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    )
}
