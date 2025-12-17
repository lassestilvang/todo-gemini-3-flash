'use client'

import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { SidebarNav } from './SidebarNav'
import { ScrollArea } from '@/components/ui/scroll-area'
import Link from 'next/link'
import { Sun, Inbox, CalendarDays, Layers, Calendar } from 'lucide-react'
import type { List } from '@prisma/client'
import { CreateListDialog } from './CreateListDialog'

interface MobileSidebarProps {
    lists: List[]
    counts: {
        inbox: number
        today: number
        next7Days: number
        upcoming: number
        all: number
        overdue: number
    }
}

export function MobileSidebar({ lists, counts }: MobileSidebarProps) {
    const defaultLinks = [
        { name: 'Inbox', icon: Inbox, href: '/', count: counts.inbox },
        { name: 'Today', icon: Sun, href: '/today', count: counts.today },
        { name: 'Next 7 Days', icon: CalendarDays, href: '/next-7-days', count: counts.next7Days },
        { name: 'Upcoming', icon: Calendar, href: '/upcoming', count: counts.upcoming },
        { name: 'All Tasks', icon: Layers, href: '/all', count: counts.all },
    ]

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
                <div className="h-full flex flex-col border-r bg-muted/10">
                    <div className="p-4 border-b">
                        <h1 className="font-bold text-xl tracking-tight">Gemini Tasks</h1>
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
                        </div>
                    </ScrollArea>
                    
                    <div className="p-4 border-t">
                        <CreateListDialog />
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}