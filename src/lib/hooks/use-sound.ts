'use client'

import { useCallback } from 'react'

export function useSound() {
    const playSound = useCallback((type: 'success' | 'click' | 'delete') => {
        // We'll use the browser's oscillator for pure, zero-asset haptic sounds
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
        const context = new AudioContextClass()
        const oscillator = context.createOscillator()
        const gain = context.createGain()

        oscillator.connect(gain)
        gain.connect(context.destination)

        const now = context.currentTime

        switch (type) {
            case 'success':
                oscillator.type = 'sine'
                oscillator.frequency.setValueAtTime(440, now)
                oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.1)
                gain.gain.setValueAtTime(0.1, now)
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2)
                oscillator.start(now)
                oscillator.stop(now + 0.2)
                break
            case 'click':
                oscillator.type = 'triangle'
                oscillator.frequency.setValueAtTime(150, now)
                gain.gain.setValueAtTime(0.05, now)
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05)
                oscillator.start(now)
                oscillator.stop(now + 0.05)
                break
            case 'delete':
                oscillator.type = 'sawtooth'
                oscillator.frequency.setValueAtTime(100, now)
                oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.2)
                gain.gain.setValueAtTime(0.05, now)
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2)
                oscillator.start(now)
                oscillator.stop(now + 0.2)
                break
        }
    }, [])

    return { playSound }
}
