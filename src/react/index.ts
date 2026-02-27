// React Provider
export { GameAnalyticsProvider } from './provider'
export type { GameAnalyticsProviderProps } from './provider'

// React hooks
export { useGameAnalytics, useRemoteConfig, useTrackPageView } from './hooks'

// Re-export core types for convenience
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
