import { getTasks } from '@/app/actions/task'
import { KanbanBoard } from '@/components/KanbanBoard'

export default async function BoardPage() {
  const tasks = await getTasks({ all: true })

  return (
    <div className="h-full flex flex-col p-6 md:p-10 space-y-8">
        <header>
            <h1 className="text-3xl font-bold tracking-tight">Kanban Board</h1>
            <p className="text-muted-foreground">Visualize your tasks by priority.</p>
        </header>
        
        <KanbanBoard tasks={tasks} />
    </div>
  )
}
