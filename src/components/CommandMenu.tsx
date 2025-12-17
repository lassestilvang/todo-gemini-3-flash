'use client'

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Calendar,
  Layers,
  Inbox,
  Sun,
  Clock
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { searchTasks } from "@/app/actions/task"
import { useDebounce } from "@/lib/hooks/use-debounce"

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<{ id: string; title: string; listId: string; list: { name: string } }[]>([])
  const debouncedQuery = useDebounce(query, 300)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  React.useEffect(() => {
    if (debouncedQuery) {
        searchTasks(debouncedQuery).then(setResults)
    } else {
        setResults([])
    }
  }, [debouncedQuery])

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-4 py-2 w-full text-left"
      >
          <Search className="w-4 h-4" />
          Search tasks...
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-auto opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
            placeholder="Type a command or search..." 
            value={query}
            onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          {results.length > 0 && (
            <CommandGroup heading="Tasks">
                {results.map(task => (
                    <CommandItem key={task.id} onSelect={() => { setOpen(false); router.push(`/list/${task.listId}`) }}>
                        <Clock className="mr-2 h-4 w-4" />
                        <span>{task.title}</span>
                        <span className="ml-auto text-xs text-muted-foreground">{task.list.name}</span>
                    </CommandItem>
                ))}
            </CommandGroup>
          )}

          <CommandGroup heading="Suggestions">
            <CommandItem onSelect={() => { setOpen(false); router.push('/') }}>
              <Inbox className="mr-2 h-4 w-4" />
              Inbox
            </CommandItem>
            <CommandItem onSelect={() => { setOpen(false); router.push('/today') }}>
              <Sun className="mr-2 h-4 w-4" />
              Today
            </CommandItem>
            <CommandItem onSelect={() => { setOpen(false); router.push('/upcoming') }}>
              <Calendar className="mr-2 h-4 w-4" />
              Upcoming
            </CommandItem>
            <CommandItem onSelect={() => { setOpen(false); router.push('/all') }}>
              <Layers className="mr-2 h-4 w-4" />
              All Tasks
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}