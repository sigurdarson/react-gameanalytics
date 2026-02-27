'use client'

import { useEffect, useRef, useState } from 'react'
import { useGameAnalyticsContext } from './provider'
import { pathnameToEventId } from '../core/page-tracking'
import type { GameAnalyticsSDK, PageViewConfig } from '../core/types'

/**
 * Access the GameAnalytics client from within a Provider.
 * Returns the singleton client with all SDK methods.
 */
export function useGameAnalytics(): GameAnalyticsSDK {
  return useGameAnalyticsContext()
}

/**
 * Subscribe to a remote config value reactively.
 * Re-renders when remote configs become ready.
 */
export function useRemoteConfig(key: string, defaultValue?: string): string | null {
  const ga = useGameAnalyticsContext()
  const [value, setValue] = useState<string | null>(() => {
    return ga.getRemoteConfig(key, defaultValue) ?? defaultValue ?? null
  })

  useEffect(() => {
    // Update immediately in case configs are already ready
    setValue(ga.getRemoteConfig(key, defaultValue) ?? defaultValue ?? null)

    // Listen for config updates
    const unsubscribe = ga.onRemoteConfigsReady(() => {
      setValue(ga.getRemoteConfig(key, defaultValue) ?? defaultValue ?? null)
    })

    return unsubscribe
  }, [ga, key, defaultValue])

  return value
}

/**
 * Track page views as design events when the pathname changes.
 * Uses the pathnameToEventId utility for 5-level hierarchy mapping.
 */
export function useTrackPageView(
  pathname: string | null,
  config?: PageViewConfig,
): void {
  const ga = useGameAnalyticsContext()
  const prevPathRef = useRef<string | null>(null)

  useEffect(() => {
    if (!pathname) return
    if (pathname === prevPathRef.current) return
    prevPathRef.current = pathname

    const eventId = pathnameToEventId(pathname, config?.prefix)
    ga.addDesignEvent({ eventId })
  }, [ga, pathname, config?.prefix])
}
