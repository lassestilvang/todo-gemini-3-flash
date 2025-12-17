'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function ViewTransitions() {
  const router = useRouter()

  useEffect(() => {
    // Intercept all link clicks
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')

      if (
        link &&
        link.href &&
        link.href.startsWith(window.location.origin) &&
        !link.target &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (document as any).startViewTransition
      ) {
        e.preventDefault()
        const url = new URL(link.href)
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(document as any).startViewTransition(() => {
          router.push(url.pathname + url.search)
        })
      }
    }

    window.addEventListener('click', handleLinkClick)
    return () => window.removeEventListener('click', handleLinkClick)
  }, [router])

  return null
}
