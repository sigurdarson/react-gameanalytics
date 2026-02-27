'use client'

import { useEffect, useRef } from 'react'
import { useGameAnalyticsContext } from '../react/provider'
import { pathnameToEventId, shouldTrackPath } from '../core/page-tracking'
import type { PageViewConfig } from '../core/types'

// Safely resolve usePathname at module level so hook call order is stable
let usePathnameHook: (() => string) | null = null
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  usePathnameHook = require('next/navigation').usePathname
} catch {
  // next/navigation not available (Pages Router or older Next.js)
}

interface PageTrackerProps {
  config: PageViewConfig
}

/**
 * Renderless component that tracks page views in Next.js.
 * Supports App Router (usePathname) and falls back to Pages Router (router.events).
 */
export function PageTracker({ config }: PageTrackerProps) {
  const ga = useGameAnalyticsContext()
  const prevPathRef = useRef<string | null>(null)

  // Always call the hook unconditionally (Rules of Hooks)
  const appRouterPathname = usePathnameHook ? usePathnameHook() : null

  useEffect(() => {
    const currentPath = appRouterPathname ?? (typeof window !== 'undefined' ? window.location.pathname : null)
    if (!currentPath) return
    if (currentPath === prevPathRef.current) return

    if (config.excludePaths && !shouldTrackPath(currentPath, config.excludePaths)) {
      prevPathRef.current = currentPath
      return
    }

    prevPathRef.current = currentPath
    const eventId = pathnameToEventId(currentPath, config.prefix)
    ga.addDesignEvent({ eventId })
  }, [appRouterPathname, ga, config.excludePaths, config.prefix])

  // Pages Router support via router.events (no hooks, just the singleton Router)
  useEffect(() => {
    if (appRouterPathname !== null) return // Already using App Router

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Router = require('next/router').default

      const handleRouteChange = (url: string) => {
        const urlPath = url.split('?')[0] ?? url
        if (urlPath === prevPathRef.current) return

        if (config.excludePaths && !shouldTrackPath(urlPath, config.excludePaths)) {
          prevPathRef.current = urlPath
          return
        }

        prevPathRef.current = urlPath
        const eventId = pathnameToEventId(urlPath, config.prefix)
        ga.addDesignEvent({ eventId })
      }

      Router.events.on('routeChangeComplete', handleRouteChange)
      return () => {
        Router.events.off('routeChangeComplete', handleRouteChange)
      }
    } catch {
      // Not in Pages Router context either
    }
  }, [appRouterPathname, ga, config.excludePaths, config.prefix])

  return null
}
