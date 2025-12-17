'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { List as ListIcon } from 'lucide-react'
import type { List } from '@prisma/client'

interface SidebarNavProps {
  lists: List[]
}

export function SidebarNav({ lists }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className="space-y-1">
      {lists.filter(l => !l.isDefault).map((list) => {
        const textColor = list.color ? list.color.replace('bg-', 'text-') : 'text-foreground'
        
        return (
          <Button
            key={list.id}
            variant={pathname === `/list/${list.id}` ? 'secondary' : 'ghost'}
            size="sm"
            className="w-full justify-start"
            asChild
          >
            <Link href={`/list/${list.id}`}>
              <span className={cn("mr-2 flex items-center justify-center w-4 h-4", textColor)}>
                {list.icon || <ListIcon className="h-4 w-4" />}
              </span>
              {list.name}
            </Link>
          </Button>
        )
      })}
    </nav>
  )
}
