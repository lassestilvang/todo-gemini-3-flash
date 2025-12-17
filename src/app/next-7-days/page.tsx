import { getTasks } from '../actions/task'
import { TaskList } from '@/components/TaskList'

export default async function Next7DaysPage() {
  const tasks = await getTasks({ next7Days: true })

  return <TaskList tasks={tasks} title="Next 7 Days" />
}
