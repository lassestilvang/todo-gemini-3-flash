import { getTasks } from '../actions/task'
import { TaskList } from '@/components/TaskList'

export default async function TodayPage() {
  const tasks = await getTasks({ date: new Date() })

  return <TaskList tasks={tasks} title="Today" />
}
