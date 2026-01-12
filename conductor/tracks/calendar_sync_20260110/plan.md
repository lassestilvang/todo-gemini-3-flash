# Implementation Plan: Two-Way Calendar Integration

## Phase 1: Infrastructure & Authentication
- [ ] Task: Database Schema Updates for External Sync
  - [ ] Subtask: Write Tests (Ensure schema supports OAuth tokens, calendar selection, and task-to-external mappings)
  - [ ] Subtask: Implement Feature (Update `schema.prisma` with `ExternalAccount` and `TaskExternalSync` models; add `calendarId` to list settings)
- [ ] Task: OAuth 2.0 Integration (Google)
  - [ ] Subtask: Write Tests (Mock OAuth callback and token exchange)
  - [ ] Subtask: Implement Feature (Add Google OAuth flow and secure token storage in `src/lib/auth/calendar.ts`)
- [ ] Task: Calendar Provider Interface
  - [ ] Subtask: Write Tests (Verify interface adherence for mock provider)
  - [ ] Subtask: Implement Feature (Define `CalendarProvider` abstract class/interface for provider-agnostic logic)
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Infrastructure & Authentication' (Protocol in workflow.md)

## Phase 2: Bidirectional Sync Engine & Discovery
- [ ] Task: Calendar Discovery & Management
  - [ ] Subtask: Write Tests (Mock fetching calendar lists and creating a new calendar)
  - [ ] Subtask: Implement Feature (Implement `listCalendars()` and `createCalendar()` in provider logic)
- [ ] Task: Gemini to External Push Logic
  - [ ] Subtask: Write Tests (Test pushing new tasks and completion status to the *selected* calendar)
  - [ ] Subtask: Implement Feature (Create sync service to export Gemini tasks to the specific `calendarId`)
- [ ] Task: External to Gemini Pull Logic
  - [ ] Subtask: Write Tests (Test importing external events from the *selected* calendar)
  - [ ] Subtask: Implement Feature (Create sync service to import events from the specific `calendarId`)
- [ ] Task: Conflict Resolution & Mapping
  - [ ] Subtask: Write Tests (Ensure updates in both places don't cause infinite loops or data loss)
  - [ ] Subtask: Implement Feature (Implement ID mapping and "last-modified" winning logic)
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Bidirectional Sync Engine & Discovery' (Protocol in workflow.md)

## Phase 3: UI Integration & User Control
- [ ] Task: Calendar Settings Dashboard
  - [ ] Subtask: Write Tests (Verify account connection and calendar list fetching)
  - [ ] Subtask: Implement Feature (Add settings view to connect accounts and display available calendars for selection)
- [ ] Task: Per-List Sync & Calendar Creation
  - [ ] Subtask: Write Tests (Verify selecting an existing calendar or choosing "Create New" option)
  - [ ] Subtask: Implement Feature (Update List settings to allow choosing a specific calendar or creating a new "Gemini" calendar on the provider)
- [ ] Task: Manual Trigger & Progress Feedback
  - [ ] Subtask: Write Tests (Test "Sync Now" action)
  - [ ] Subtask: Implement Feature (Add "Sync Now" button and status indicators in the UI)
- [ ] Task: Conductor - User Manual Verification 'Phase 3: UI Integration & User Control' (Protocol in workflow.md)

## Phase 4: Expanding Provider Support
- [ ] Task: Microsoft Outlook (Graph API) Integration
  - [ ] Subtask: Write Tests (Verify Outlook-specific calendar discovery and mapping)
  - [ ] Subtask: Implement Feature (Implement `OutlookCalendarProvider` using Microsoft Graph)
- [ ] Task: Apple iCloud (CalDAV) Integration
  - [ ] Subtask: Write Tests (Verify CalDAV connection and calendar discovery)
  - [ ] Subtask: Implement Feature (Implement `iCloudCalendarProvider` using CalDAV)
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Expanding Provider Support' (Protocol in workflow.md)
