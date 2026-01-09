# Track Specification: Implement Task Recurrence Logic

## Goal
Implement robust support for recurring tasks, allowing users to schedule tasks that repeat daily, weekly, monthly, yearly, or according to custom rules.

## Core Requirements
- **Data Model:** Update the `Task` model (or create a related `Recurrence` model) to store recurrence rules. We will use the standard iCalendar (RFC 5545) RRULE format, as we are using the `rrule` library.
- **Task Creation:** Allow users to set a recurrence rule when creating or editing a task.
- **Task Completion:** When a recurring task is completed:
    - The current instance is marked as completed.
    - The *next* instance of the task is automatically created based on the recurrence rule.
- **UI/UX:**
    - Provide a user-friendly interface for selecting common recurrence patterns (Daily, Weekly, etc.).
    - (Optional/Advanced) Provide a way to define custom recurrence rules.
    - Visual indicator for recurring tasks in the list view.

## Technical Considerations
- **Library:** Use `rrule` for parsing and generating recurrence dates.
- **Database:** Prisma SQLite.
- **Edge Cases:**
    - Completing a task late (should the next one be scheduled based on the original due date or the completion date?). *Decision: Base next occurrence on the original schedule to maintain the pattern.*
    - Infinite recurrence vs. end date/count.

## Success Criteria
- Users can create a task that repeats every day/week.
- Completing a recurring task generates the next occurrence correctly.
- Tests cover standard patterns and edge cases (e.g., leap years, end of month).