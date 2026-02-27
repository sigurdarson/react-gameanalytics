'use client'

import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react'
import { ga, type GameAnalyticsConfig } from '../core'

const GameAnalyticsContext = createContext<typeof ga | null>(null)

/** Access the GameAnalytics client from context */
export function useGameAnalyticsContext() {
  const client = useContext(GameAnalyticsContext)
  if (!client) {
    throw new Error('useGameAnalytics must be used within a GameAnalyticsProvider')
  }
  return client
}

export interface GameAnalyticsProviderProps extends GameAnalyticsConfig {
  children: ReactNode
}

/**
 * GameAnalytics React Provider.
 * Initializes the SDK on mount and provides the client via context.
 * Watches userId, enabled, and custom dimension props for reactive updates.
 */
export function GameAnalyticsProvider({
  children,
  userId,
  enabled,
  ...config
}: GameAnalyticsProviderProps) {
  const initializedRef = useRef(false)

  // Initialize on mount
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    ga.init({ ...config, userId, enabled })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Watch userId changes
  useEffect(() => {
    if (!initializedRef.current) return
    if (userId !== undefined) {
      ga.setUserId(userId)
    }
  }, [userId])

  // Watch enabled changes
  useEffect(() => {
    if (!initializedRef.current) return
    if (enabled === true) {
      ga.enable()
    } else if (enabled === false) {
      ga.disable()
    }
  }, [enabled])

  return (
    <GameAnalyticsContext.Provider value={ga}>
      {children}
    </GameAnalyticsContext.Provider>
  )
}
