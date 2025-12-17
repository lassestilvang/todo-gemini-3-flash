'use client'

import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface AnalyticsData {
    completionTrend: { name: string; count: number }[]
    byPriority: { name: string; value: number; fill: string }[]
    stats: {
        totalTasks: number
        completedTasks: number
        pendingTasks: number
        totalEstimate: number
        totalActual: number
    }
}

interface AnalyticsChartsProps {
    data: AnalyticsData
}

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card className="col-span-2 md:col-span-1 border-primary/10">
                <CardHeader>
                    <CardTitle className="text-lg">Completion Trend</CardTitle>
                    <CardDescription>Tasks completed in the last 7 days</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.completionTrend}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                fontSize={12} 
                                tick={{ fill: 'currentColor', opacity: 0.5 }}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                fontSize={12} 
                                tick={{ fill: 'currentColor', opacity: 0.5 }}
                            />
                            <Tooltip 
                                cursor={{ fill: 'currentColor', opacity: 0.05 }}
                                contentStyle={{ 
                                    backgroundColor: 'hsl(var(--background))', 
                                    borderColor: 'hsl(var(--border))',
                                    borderRadius: '8px'
                                }}
                            />
                            <Bar 
                                dataKey="count" 
                                fill="hsl(var(--primary))" 
                                radius={[4, 4, 0, 0]} 
                                barSize={30}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="border-primary/10">
                <CardHeader>
                    <CardTitle className="text-lg">Priority Distribution</CardTitle>
                    <CardDescription>Tasks by priority level</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data.byPriority}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.byPriority.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'hsl(var(--background))', 
                                    borderColor: 'hsl(var(--border))',
                                    borderRadius: '8px'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="col-span-2 border-primary/10">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">Time Accuracy</CardTitle>
                        <CardDescription>Comparison of Estimated vs Actual time (min)</CardDescription>
                    </div>
                    <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-primary" />
                            <span>Estimated: {data.stats.totalEstimate}m</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-amber-500" />
                            <span>Actual: {data.stats.totalActual}m</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="h-[100px] flex items-center">
                    <div className="w-full space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Efficiency: {data.stats.totalEstimate > 0 ? Math.round((data.stats.totalEstimate / (data.stats.totalActual || 1)) * 100) : 0}%</span>
                        </div>
                        <div className="h-4 w-full bg-muted rounded-full overflow-hidden flex">
                            <div 
                                className="h-full bg-primary transition-all" 
                                style={{ width: `${Math.min(100, (data.stats.totalEstimate / (data.stats.totalEstimate + data.stats.totalActual || 1)) * 100)}%` }} 
                            />
                            <div 
                                className="h-full bg-amber-500 transition-all" 
                                style={{ width: `${Math.min(100, (data.stats.totalActual / (data.stats.totalEstimate + data.stats.totalActual || 1)) * 100)}%` }} 
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
