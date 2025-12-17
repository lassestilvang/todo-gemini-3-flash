import { getTasks } from '@/app/actions/task'
import { TaskList } from '@/components/TaskList'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

export default async function CustomListPage({ params }: { params: { id: string } }) {
  const { id } = await params
  const list = await prisma.list.findUnique({ where: { id } })
  
  if (!list) notFound()

  const tasks = await getTasks({ listId: id })

  return <TaskList tasks={tasks} title={list.name} listId={id} />
}
