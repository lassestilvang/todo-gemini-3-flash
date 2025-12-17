-- CreateTable
CREATE TABLE "List" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "icon" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" DATETIME,
    "deadline" DATETIME,
    "isAllDay" BOOLEAN NOT NULL DEFAULT false,
    "estimate" INTEGER,
    "actual" INTEGER,
    "priority" TEXT NOT NULL DEFAULT 'NONE',
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "recurrence" TEXT,
    "listId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Task_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SubTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "taskId" TEXT NOT NULL,
    CONSTRAINT "SubTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Label" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "icon" TEXT
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT,
    "size" INTEGER,
    "taskId" TEXT NOT NULL,
    CONSTRAINT "Attachment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "taskId" TEXT NOT NULL,
    CONSTRAINT "ActivityLog_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "time" DATETIME NOT NULL,
    "taskId" TEXT NOT NULL,
    CONSTRAINT "Reminder_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_LabelToTask" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_LabelToTask_A_fkey" FOREIGN KEY ("A") REFERENCES "Label" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_LabelToTask_B_fkey" FOREIGN KEY ("B") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_LabelToTask_AB_unique" ON "_LabelToTask"("A", "B");

-- CreateIndex
CREATE INDEX "_LabelToTask_B_index" ON "_LabelToTask"("B");
