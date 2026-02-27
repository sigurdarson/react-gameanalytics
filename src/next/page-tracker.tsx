'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useGameAnalyticsContext } from '../react/provider'
import { pathnameToEventId, shouldTrackPath } from '../core/page-tracking'
import type { PageViewConfig } from '../core/types'

interface PageTrackerProps {
  config: PageViewConfig
}

/**
 * Renderless component that tracks page views in Next.js App Router.
 * Fires a design event on mount and whenever usePathname() changes.
 *
 * SSG safety: wrapped in a Suspense boundary by the Next.js provider,
 * and usePathname is called unconditionally (required by Rules of Hooks).
 * During static generation the Suspense boundary catches the bail-out.
 */
export function PageTracker({ config }: PageTrackerProps) {
  const ga = useGameAnalyticsContext()
  const prevPathRef = useRef<string | null>(null)
  const configRef = useRef(config)
  configRef.current = config
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname) return
    if (pathname === prevPathRef.current) return

    const { excludePaths, prefix } = configRef.current
    if (excludePaths && !shouldTrackPath(pathname, excludePaths)) {
      prevPathRef.current = pathname
      return
    }

    prevPathRef.current = pathname
    const eventId = pathnameToEventId(pathname, prefix)
    ga.addDesignEvent({ eventId })
  }, [pathname, ga])

  return null
}
