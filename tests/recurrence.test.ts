import { describe, it, expect } from 'bun:test'
import { RRule } from 'rrule'

describe('Recurrence Logic', () => {
    it('should calculate next daily occurrence', () => {
        const start = new Date('2025-12-17T10:00:00')
        const rule = new RRule({
            freq: RRule.DAILY,
            dtstart: start
        })
        const next = rule.after(start)
        expect(next?.getDate()).toBe(18)
    })

    it('should calculate next weekly occurrence', () => {
        const start = new Date('2025-12-17T10:00:00') // Wednesday
        const rule = new RRule({
            freq: RRule.WEEKLY,
            dtstart: start
        })
        const next = rule.after(start)
        expect(next?.getDate()).toBe(24)
    })

    it('should calculate next weekday (skipping weekend)', () => {
        const friday = new Date('2025-12-19T10:00:00')
        const rule = new RRule({
            freq: RRule.WEEKLY,
            byweekday: [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR],
            dtstart: friday
        })
        const next = rule.after(friday)
        expect(next?.getDay()).toBe(1) // Monday
        expect(next?.getDate()).toBe(22)
    })
})
