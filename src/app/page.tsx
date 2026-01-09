import { getTasks } from './actions/queries'
import { TaskList } from '@/components/TaskList'
import { prisma } from '@/lib/prisma'

export default async function InboxPage() {
  const inbox = await prisma.list.findFirst({ where: { isDefault: true }})
  const tasks = await getTasks({ listId: inbox?.id })

  return <TaskList tasks={tasks} title="Inbox" listId={inbox?.id} />
}