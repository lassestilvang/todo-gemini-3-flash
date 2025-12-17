# Gemini Tasks

## Project Overview

Gemini Tasks is a modern, professional daily task planner application. It is designed to be a local-first, privacy-focused, and highly responsive web application.

**Key Technologies:**
*   **Framework:** Next.js 15 (App Router)
*   **Runtime & Package Manager:** Bun
*   **Database:** SQLite (using `better-sqlite3` adapter)
*   **ORM:** Prisma
*   **Styling:** Tailwind CSS
*   **UI Components:** shadcn/ui
*   **Icons:** Lucide React

## Architecture & Conventions

*   **App Router:** Uses Next.js 15 App Router (`src/app`).
*   **Server Actions:** Data mutations are handled via Server Actions located in `src/app/actions`.
*   **Database Access:** All database interaction is done via Prisma Client, instantiated in `src/lib/prisma.ts`.
    *   **Adapter:** Uses `@prisma/adapter-better-sqlite3` for performance.
*   **Components:** UI components are in `src/components`. Reusable UI primitives (shadcn) are in `src/components/ui`.
*   **Styling:** Tailwind CSS is used for all styling. `src/lib/utils.ts` contains the `cn` helper for class merging.
*   **Type Safety:** TypeScript is used throughout with strict mode enabled.

## Setup & Development

**Prerequisites:**
*   [Bun](https://bun.sh/) must be installed.

**Installation:**
```bash
bun install
```

**Database Setup:**
Initialize the SQLite database and generate the Prisma client:
```bash
bunx prisma generate
bunx prisma migrate dev --name init
```

**Running Locally:**
Start the development server:
```bash
bun dev
```
The app will be available at `http://localhost:3000`.

**Building for Production:**
```bash
bun run build
bun start
```

**Testing:**
Run unit tests using Bun's built-in test runner:
```bash
bun test
```

## Project Structure

*   `prisma/`: Database schema (`schema.prisma`) and migrations.
*   `src/app/`: Next.js App Router pages and layouts.
    *   `actions/`: Server Actions for backend logic.
*   `src/components/`: React components.
    *   `ui/`: shadcn/ui primitive components.
*   `src/lib/`: Utility functions and global configurations (e.g., `prisma.ts`).
*   `TODO.md`: Tracks the project's progress and roadmap.

## Current Status

Refer to `TODO.md` for the most up-to-date status of implemented features versus the roadmap. Key features currently implemented include:
*   Task creation and listing (Inbox, Today, Upcoming).
*   Task completion toggling.
*   Responsive Sidebar navigation.
*   Database schema for complex task management (subtasks, etc.).
