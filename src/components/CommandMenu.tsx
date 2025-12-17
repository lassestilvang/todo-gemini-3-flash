'use client'

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  Calculator,
  Search
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)
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
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem onSelect={() => { setOpen(false); router.push('/') }}>
              Inbox
            </CommandItem>
            <CommandItem onSelect={() => { setOpen(false); router.push('/today') }}>
              Today
            </CommandItem>
            <CommandItem onSelect={() => { setOpen(false); router.push('/upcoming') }}>
              Upcoming
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
