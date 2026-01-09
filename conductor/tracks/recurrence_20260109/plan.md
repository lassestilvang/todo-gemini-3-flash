# Track Plan: Implement Task Recurrence Logic

## Phase 1: Backend & Data Model [checkpoint: 79d53f2]
- [x] Task: Update Prisma Schema for Recurrence [19e13f0]
  - [ ] Subtask: Write Tests (Ensure schema changes are valid and migration runs)
  - [ ] Subtask: Implement Feature (Add `recurrenceRule` field to Task model, run migration)
- [x] Task: Utility Functions for Recurrence (RRule) [59367ac]
  - [ ] Subtask: Write Tests (Unit tests for `getNextOccurrence` logic using `rrule`)
  - [ ] Subtask: Implement Feature (Create `lib/recurrence.ts` helper functions)
- [x] Task: Task Completion Logic Update [900785b]
  - [ ] Subtask: Write Tests (Simulate completing a recurring task, expect new task creation)
  - [ ] Subtask: Implement Feature (Update `completeTask` server action to handle recurrence)

## Phase 2: Frontend Integration [checkpoint: fbeaefc]
- [x] Task: Recurrence Input Component [f408197]
  - [ ] Subtask: Write Tests (Component test for selecting recurrence options)
  - [ ] Subtask: Implement Feature (Create `RecurrencePicker` component with options: Daily, Weekly, Custom)
- [x] Task: Integrate into Task Form [c408662]
  - [x] Subtask: Write Tests (Integration test: Create task with recurrence)
  - [x] Subtask: Implement Feature (Add `RecurrencePicker` to `CreateTaskDialog` and `TaskDetail`)
- [x] Task: UI Indicators [c408662]
  - [x] Subtask: Write Tests (Ensure icon renders for recurring tasks)
  - [x] Subtask: Implement Feature (Add recurrence icon to `TaskItem`)

## Phase 3: Validation
- [ ] Task: End-to-End Testing
  - [ ] Subtask: Write Tests (Full flow: Create recurring task -> Complete it -> Verify next task appears)
  - [ ] Subtask: Implement Feature (Run E2E tests and fix any bugs)
