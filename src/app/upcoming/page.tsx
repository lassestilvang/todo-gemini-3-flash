import { getTasks } from '../actions/task'
import { TaskList } from '@/components/TaskList'

export default async function UpcomingPage() {
  const tasks = await getTasks({ upcoming: true })

  return <TaskList tasks={tasks} title="Upcoming" />
}
