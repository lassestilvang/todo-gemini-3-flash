# Track Plan: Implement Task Recurrence Logic

## Phase 1: Backend & Data Model
- [x] Task: Update Prisma Schema for Recurrence [19e13f0]
  - [ ] Subtask: Write Tests (Ensure schema changes are valid and migration runs)
  - [ ] Subtask: Implement Feature (Add `recurrenceRule` field to Task model, run migration)
- [x] Task: Utility Functions for Recurrence (RRule) [59367ac]
  - [ ] Subtask: Write Tests (Unit tests for `getNextOccurrence` logic using `rrule`)
  - [ ] Subtask: Implement Feature (Create `lib/recurrence.ts` helper functions)
- [ ] Task: Task Completion Logic Update
  - [ ] Subtask: Write Tests (Simulate completing a recurring task, expect new task creation)
  - [ ] Subtask: Implement Feature (Update `completeTask` server action to handle recurrence)

## Phase 2: Frontend Integration
- [ ] Task: Recurrence Input Component
  - [ ] Subtask: Write Tests (Component test for selecting recurrence options)
  - [ ] Subtask: Implement Feature (Create `RecurrencePicker` component with options: Daily, Weekly, Custom)
- [ ] Task: Integrate into Task Form
  - [ ] Subtask: Write Tests (Integration test: Create task with recurrence)
  - [ ] Subtask: Implement Feature (Add `RecurrencePicker` to `CreateTaskDialog` and `TaskDetail`)
- [ ] Task: UI Indicators
  - [ ] Subtask: Write Tests (Ensure icon renders for recurring tasks)
  - [ ] Subtask: Implement Feature (Add recurrence icon to `TaskItem`)

## Phase 3: Validation
- [ ] Task: End-to-End Testing
  - [ ] Subtask: Write Tests (Full flow: Create recurring task -> Complete it -> Verify next task appears)
  - [ ] Subtask: Implement Feature (Run E2E tests and fix any bugs)
