# Specification: Two-Way Calendar Integration

## Overview
Implement a robust, bidirectional synchronization between Gemini Tasks and major calendar providers (Google Calendar, Microsoft Outlook, and Apple iCloud). This feature allows users to see their tasks as calendar events and manage their calendar schedules directly within Gemini Tasks.

## Functional Requirements

### 1. Multi-Provider Support
- Architect a provider-agnostic synchronization engine.
- Initial implementations for:
    - **Google Calendar** (via Google Calendar API / OAuth 2.0).
    - **Microsoft Outlook** (via Microsoft Graph API).
    - **Apple iCloud** (via CalDAV).

### 2. Bidirectional Synchronization
- **Gemini -> Calendar:**
    - Tasks created/updated in synced Gemini lists appear as calendar events.
    - Task title, description, and due date/time map to event title, description, and schedule.
    - Marking a task as "Completed" updates the calendar event (e.g., status label in description or color change).
- **Calendar -> Gemini:**
    - New events created in the calendar are imported into Gemini Tasks.
    - Event deletions in the calendar remove the corresponding task in Gemini Tasks.
- **Bidirectional Deletion:** Deleting an item in one system deletes it in the other.

### 3. Sync Configuration & Scope
- **Granular Control:** Users can enable or disable synchronization for individual task lists.
- **Account Management:** UI to connect and disconnect multiple calendar accounts.
- **On-Demand Initial Sync:** A manual trigger to synchronize existing historical data once an account is linked.
- **Calendar Selection:** Users can choose an existing calendar from the provider or create a new dedicated "Gemini" calendar.

### 4. Technical Implementation
- Secure storage of OAuth tokens.
- Background sync job to handle periodic polling or webhook-based updates.
- Conflict resolution logic (Gemini Tasks usually wins for metadata like priority).

## Acceptance Criteria
- [ ] User can connect a Google Calendar account via OAuth.
- [ ] User can select which specific calendar to sync a list to (or create a new one).
- [ ] Creating a task in a "Work" list (with sync enabled) creates a Google Calendar event.
- [ ] Completing the task in Gemini updates the event on the calendar.
- [ ] Creating an event in Google Calendar creates a task in the corresponding Gemini list.
- [ ] Deleting a task in Gemini removes the event from the calendar.
- [ ] User can manually trigger a full sync of existing items.

## Out of Scope
- Support for shared/collaborative calendars (initial release is personal only).
- Advanced attendee/invitation management within Gemini Tasks.
