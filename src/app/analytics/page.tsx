import { getAnalytics } from '@/app/actions/task'
import { AnalyticsCharts } from '@/components/AnalyticsCharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, ListTodo, Timer, Zap } from 'lucide-react'

export default async function AnalyticsPage() {
  const data = await getAnalytics()

  const summaryCards = [
      { title: "Total Tasks", value: data.stats.totalTasks, icon: ListTodo, color: "text-primary" },
      { title: "Completions", value: data.stats.completedTasks, icon: CheckCircle2, color: "text-green-500" },
      { title: "Estimated", value: `${data.stats.totalEstimate}m`, icon: Timer, color: "text-blue-500" },
      { title: "Actual", value: `${data.stats.totalActual}m`, icon: Zap, color: "text-amber-500" },
  ]

  return (
    <div className="h-full flex flex-col p-6 md:p-10 space-y-8">
        <header>
            <h1 className="text-3xl font-bold tracking-tight">Flow Analytics</h1>
            <p className="text-muted-foreground">Monitor your productivity and task efficiency.</p>
        </header>
        
        <div className="grid gap-4 md:grid-cols-4">
            {summaryCards.map((card) => (
                <Card key={card.title} className="border-primary/5">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                        <card.icon className={`h-4 w-4 ${card.color}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{card.value}</div>
                    </CardContent>
                </Card>
            ))}
        </div>

        <AnalyticsCharts data={data} />
    </div>
  )
}
