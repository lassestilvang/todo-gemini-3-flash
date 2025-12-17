import { getTasks } from '../actions/task'
import { TaskList } from '@/components/TaskList'

export default async function AllPage() {
  const tasks = await getTasks({ all: true })

  return <TaskList tasks={tasks} title="All Tasks" />
}
