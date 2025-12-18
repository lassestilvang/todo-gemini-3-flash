import { getTasks } from '@/app/actions/task'
import { TaskList } from '@/components/TaskList'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

export default async function LabelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const label = await prisma.label.findUnique({
    where: { id }
  })

  if (!label) {
    notFound()
  }

  const tasks = await getTasks({ labelId: id })

  return <TaskList tasks={tasks} title={`Label: ${label.name}`} />
}
