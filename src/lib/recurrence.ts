import { RRule } from 'rrule'

export function getNextOccurrence(ruleString: string, lastDate: Date): Date | null {
    try {
        const options = RRule.parseString(ruleString)
        options.dtstart = lastDate

        const rule = new RRule(options)
        return rule.after(lastDate)
    } catch (e) {
        console.error('Failed to parse recurrence rule:', e)
        return null
    }
}
