'use client'

import { useState, useEffect, useCallback } from 'react'
import { Mic } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface VoiceCaptureProps {
    onResult: (text: string) => void
}

export function VoiceCapture({ onResult }: VoiceCaptureProps) {
    const [isListening, setIsActive] = useState(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [recognition, setRecognition] = useState<any>(null)

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (SpeechRecognition) {
            const rec = new SpeechRecognition()
            rec.continuous = false
            rec.interimResults = false
            rec.lang = 'en-US'

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            rec.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript
                onResult(transcript)
                setIsActive(false)
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            rec.onerror = (event: any) => {
                console.error("Speech Error:", event.error)
                toast.error(`Voice capture failed: ${event.error}`)
                setIsActive(false)
            }

            rec.onend = () => {
                setIsActive(false)
            }

            // Defer state update to avoid cascading render
            setTimeout(() => setRecognition(rec), 0)
        }
    }, [onResult])

    const toggleListening = useCallback(() => {
        if (!recognition) {
            toast.error("Speech recognition not supported in this browser.")
            return
        }

        if (isListening) {
            recognition.stop()
        } else {
            try {
                recognition.start()
                setIsActive(true)
                toast.info("Listening... Speak now.")
            } catch (err) {
                console.error("Start error:", err)
            }
        }
    }, [isListening, recognition])

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleListening}
            className={cn(
                "h-8 w-8 rounded-full transition-all",
                isListening ? "text-red-500 bg-red-50 animate-pulse scale-110" : "text-muted-foreground"
            )}
        >
            {isListening ? <Mic className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
    )
}
