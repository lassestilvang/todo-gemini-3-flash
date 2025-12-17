'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function ShortcutManager() {
    const router = useRouter()

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only trigger if not typing in an input/textarea
            if (
                document.activeElement?.tagName === 'INPUT' || 
                document.activeElement?.tagName === 'TEXTAREA'
            ) {
                return
            }

            // Navigation shortcuts
            if (e.shiftKey) {
                switch (e.key.toLowerCase()) {
                    case 'i': router.push('/'); break
                    case 't': router.push('/today'); break
                    case 'u': router.push('/upcoming'); break
                    case 'b': router.push('/board'); break
                    case 'l': router.push('/analytics'); break
                    case 'a': 
                        // Focus the "Add task" input
                        const input = document.querySelector('input[placeholder*="Add a task"]') as HTMLInputElement
                        if (input) {
                            e.preventDefault()
                            input.focus()
                        }
                        break
                }
            }

            // Number shortcuts for main views
            if (!e.shiftKey && !e.metaKey && !e.ctrlKey) {
                switch (e.key) {
                    case '1': router.push('/'); break
                    case '2': router.push('/today'); break
                    case '3': router.push('/next-7-days'); break
                    case '4': router.push('/upcoming'); break
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [router])

    return null
}
