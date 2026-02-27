'use client'

import { type ReactNode } from 'react'
import { GameAnalyticsProvider as ReactProvider } from '../react/provider'
import type { GameAnalyticsConfig, PageViewConfig } from '../core/types'
import { PageTracker } from './page-tracker'

export interface NextGameAnalyticsProviderProps extends GameAnalyticsConfig {
  children: ReactNode
  /** Enable automatic page view tracking. Pass true for defaults or a config object. */
  trackPageViews?: boolean | PageViewConfig
}

/**
 * Next.js GameAnalytics Provider.
 * Wraps the React Provider and adds automatic page tracking when enabled.
 */
export function GameAnalyticsProvider({
  children,
  trackPageViews,
  ...config
}: NextGameAnalyticsProviderProps) {
  const pageViewConfig: PageViewConfig | undefined =
    trackPageViews === true
      ? {}
      : trackPageViews === false || trackPageViews === undefined
        ? undefined
        : trackPageViews

  return (
    <ReactProvider {...config}>
      {pageViewConfig !== undefined && <PageTracker config={pageViewConfig} />}
      {children}
    </ReactProvider>
  )
}
