import { describe, it, expect } from 'bun:test'

describe('Analytics Calculations', () => {
    it('should calculate efficiency correctly', () => {
        const totalEstimate = 100
        const totalActual = 80
        const efficiency = totalEstimate > 0 ? Math.round((totalEstimate / (totalActual || 1)) * 100) : 0
        expect(efficiency).toBe(125)
    })

    it('should handle zero actual time in efficiency', () => {
        const totalEstimate = 100
        const totalActual = 0
        const efficiency = totalEstimate > 0 ? Math.round((totalEstimate / (totalActual || 1)) * 100) : 0
        expect(efficiency).toBe(10000) // 100 / 1 * 100
    })

    it('should handle zero estimate in efficiency', () => {
        const totalEstimate = 0
        const totalActual = 100
        const efficiency = totalEstimate > 0 ? Math.round((totalEstimate / (totalActual || 1)) * 100) : 0
        expect(efficiency).toBe(0)
    })
})
