import Link from 'next/link'
import { getLists } from '@/app/actions/list'
import { getTaskCounts, getLabels } from '@/app/actions/task'
import { SidebarNav } from './SidebarNav'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Calendar, Sun, Inbox, CalendarDays, Layers, Tag } from 'lucide-react'
import { Button } from './ui/button'
import { CommandMenu } from './CommandMenu'
import { CreateListDialog } from './CreateListDialog'
import { CreateLabelDialog } from './CreateLabelDialog'

import { cn } from '@/lib/utils'

export async function Sidebar() {
  const [lists, counts, labels] = await Promise.all([
      getLists(),
      getTaskCounts(),
      getLabels()
  ])

  const defaultLinks = [
    { name: 'Inbox', icon: Inbox, href: '/', count: counts.inbox }, 
    { name: 'Today', icon: Sun, href: '/today', count: counts.today },
    { name: 'Next 7 Days', icon: CalendarDays, href: '/next-7-days', count: counts.next7Days },
    { name: 'Upcoming', icon: Calendar, href: '/upcoming', count: counts.upcoming },
    { name: 'All Tasks', icon: Layers, href: '/all', count: counts.all },
  ]

  return (
    <div className="h-screen w-64 border-r bg-muted/10 flex flex-col hidden md:flex">
      <div className="p-4 border-b">
        <h1 className="font-bold text-xl tracking-tight mb-4">Gemini Tasks</h1>
        <CommandMenu />
      </div>
      
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-4">
            <div className="py-2">
                <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">Views</h2>
                <nav className="space-y-1">
                    {defaultLinks.map((link) => (
                        <Button
                            key={link.name}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-between"
                            asChild
                        >
                            <Link href={link.href}>
                                <div className="flex items-center">
                                    <link.icon className="mr-2 h-4 w-4" />
                                    {link.name}
                                </div>
                                {link.count > 0 && (
                                    <span className="text-xs text-muted-foreground">{link.count}</span>
                                )}
                            </Link>
                        </Button>
                    ))}
                </nav>
            </div>
            
            <div className="py-2">
                <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">Lists</h2>
                <SidebarNav lists={lists} />
            </div>

            <div className="py-2">
                <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">Labels</h2>
                <nav className="space-y-1">
                    {labels.map((label) => (
                        <Button
                            key={label.id}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start"
                            asChild
                        >
                            <Link href={`/label/${label.id}`}>
                                <Tag className={cn("mr-2 h-3 w-3", label.color?.replace('bg-', 'text-'))} />
                                {label.name}
                            </Link>
                        </Button>
                    ))}
                    <CreateLabelDialog />
                </nav>
            </div>
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t">
        <CreateListDialog />
      </div>
    </div>
  )
}
