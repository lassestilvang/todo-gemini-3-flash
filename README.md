# Gemini Tasks

A modern, professional daily task planner built with Next.js 15, Bun, Tailwind CSS, shadcn/ui, and Prisma (SQLite).

## Features

- **Lists:** Organize tasks into Inbox and custom lists.
- **Smart Views:** Today, Upcoming, All Tasks.
- **Task Management:** Create, Complete, Delete, Prioritize, Schedule.
- **Search:** Fast command menu (Cmd+K).
- **Responsive:** Mobile-friendly with sidebar/drawer.
- **Dark Mode:** System default.

## Setup

1.  Install dependencies:
    ```bash
    bun install
    ```

2.  Setup Database:
    ```bash
    bunx prisma generate
    bunx prisma migrate dev --name init
    ```

3.  Run Development Server:
    ```bash
    bun dev
    ```

4.  Build for Production:
    ```bash
    bun run build
    bun start
    ```

## Technologies

- **Framework:** Next.js 15 (App Router)
- **Runtime:** Bun
- **Database:** SQLite (via Better-SQLite3)
- **ORM:** Prisma 7 (with adapter)
- **UI:** shadcn/ui + Tailwind CSS
- **Icons:** Lucide React
- **Dates:** date-fns

## Testing

To run tests (ensure environment is configured):
```bash
bun test
```