import { describe, it, expect } from 'bun:test'
import { getNextOccurrence } from '../src/lib/recurrence'

describe('Recurrence Utility', () => {
    it('should calculate the next occurrence based on a daily rule', () => {
        const start = new Date('2025-01-01T10:00:00')
        const rule = 'FREQ=DAILY'
        const next = getNextOccurrence(rule, start)
        expect(next).toEqual(new Date('2025-01-02T10:00:00'))
    })

    it('should calculate the next occurrence based on a weekly rule', () => {
        const start = new Date('2025-01-01T10:00:00') // Wednesday
        const rule = 'FREQ=WEEKLY'
        const next = getNextOccurrence(rule, start)
        expect(next).toEqual(new Date('2025-01-08T10:00:00')) // Next Wednesday
    })

    it('should return null if no further occurrences', () => {
        const start = new Date('2025-01-01T10:00:00')
        // Rule that ends yesterday
        const rule = 'FREQ=DAILY;UNTIL=20241231T000000Z' 
        const next = getNextOccurrence(rule, start)
        expect(next).toBeNull()
    })
})
