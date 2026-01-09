'use client'

import React from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface RecurrencePickerProps {
    value: string | null // RFC 5545 RRULE string
    onChange: (rule: string | null) => void
}

export const RECURRENCE_PRESETS = [
    { label: 'None', value: null },
    { label: 'Daily', value: 'FREQ=DAILY' },
    { label: 'Weekly', value: 'FREQ=WEEKLY' },
    { label: 'Monthly', value: 'FREQ=MONTHLY' },
    { label: 'Yearly', value: 'FREQ=YEARLY' },
    { label: 'Weekdays', value: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR' },
]

export function RecurrencePicker({ value, onChange }: RecurrencePickerProps) {
    // Find if the current value matches a preset
    const currentPreset = RECURRENCE_PRESETS.find(p => p.value === value)
    const displayValue = currentPreset ? (currentPreset.value || 'NONE') : (value ? 'CUSTOM' : 'NONE')

    return (
        <Select 
            value={displayValue} 
            onValueChange={(val) => {
                if (val === 'NONE') {
                    onChange(null)
                } else if (val === 'CUSTOM') {
                    // Placeholder for custom rule editing
                    // For now, selecting custom does nothing if already custom, 
                    // or could prompt for a string.
                } else {
                    onChange(val)
                }
            }}
        >
            <SelectTrigger className="w-full h-9">
                <SelectValue placeholder="Set Recurrence" />
            </SelectTrigger>
            <SelectContent>
                {RECURRENCE_PRESETS.map(p => (
                    <SelectItem key={p.value || 'NONE'} value={p.value || 'NONE'}>
                        {p.label}
                    </SelectItem>
                ))}
                {displayValue === 'CUSTOM' && (
                    <SelectItem value="CUSTOM">Custom Rule</SelectItem>
                )}
            </SelectContent>
        </Select>
    )
}
