// Next.js Provider
export { GameAnalyticsProvider } from './provider'
export type { NextGameAnalyticsProviderProps } from './provider'

// Re-export React hooks
export { useGameAnalytics, useRemoteConfig, useTrackPageView } from '../react/hooks'

// Re-export core types
export type {
  GameAnalyticsConfig,
  GameAnalyticsSDK,
  BusinessEventParams,
  ResourceEventParams,
  ProgressionEventParams,
  DesignEventParams,
  ErrorEventParams,
  AdEventParams,
  ResourceFlowType,
  ProgressionStatus,
  ErrorSeverity,
  AdAction,
  AdType,
  PageViewConfig,
  CustomDimensionsConfig,
  GAPlugin,
  GAEvent,
  EventTypeMap,
} from '../core/types'
