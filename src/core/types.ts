// ---- String literal enums ----

/** Resource flow direction */
export type ResourceFlowType = 'source' | 'sink'

/** Progression event status */
export type ProgressionStatus = 'start' | 'complete' | 'fail'

/** Error severity level */
export type ErrorSeverity = 'debug' | 'info' | 'warning' | 'error' | 'critical'

/** Ad interaction type */
export type AdAction = 'clicked' | 'show' | 'failedShow' | 'rewardReceived'

/** Ad format type */
export type AdType = 'video' | 'rewardedVideo' | 'playable' | 'interstitial' | 'offerWall' | 'banner'

/** Ad error reason (for failed ad shows) */
export type AdError = 'unknown' | 'offline' | 'noFill' | 'internalError' | 'invalidRequest' | 'unableToPrecache'

// ---- Enum mapping objects (string -> SDK numeric) ----

export const RESOURCE_FLOW_MAP: Record<ResourceFlowType, number> = {
  source: 1,
  sink: 2,
}

export const PROGRESSION_STATUS_MAP: Record<ProgressionStatus, number> = {
  start: 1,
  complete: 2,
  fail: 3,
}

export const ERROR_SEVERITY_MAP: Record<ErrorSeverity, number> = {
  debug: 1,
  info: 2,
  warning: 3,
  error: 4,
  critical: 5,
}

export const AD_ACTION_MAP: Record<AdAction, number> = {
  clicked: 1,
  show: 2,
  failedShow: 3,
  rewardReceived: 4,
}

export const AD_TYPE_MAP: Record<AdType, number> = {
  video: 1,
  rewardedVideo: 2,
  playable: 3,
  interstitial: 4,
  offerWall: 5,
  banner: 6,
}

export const AD_ERROR_MAP: Record<AdError, number> = {
  unknown: 1,
  offline: 2,
  noFill: 3,
  internalError: 4,
  invalidRequest: 5,
  unableToPrecache: 6,
}

// ---- Event parameter interfaces ----

/** Parameters for business/purchase events */
export interface BusinessEventParams {
  /** ISO 4217 currency code (e.g. 'USD', 'EUR') */
  currency: string
  /** Amount in cents (e.g. 2900 = $29.00) */
  amount: number
  /** Item category (e.g. 'subscription', 'addon') */
  itemType: string
  /** Specific item identifier (e.g. 'pro_monthly') */
  itemId: string
  /** Where the purchase happened (e.g. 'pricing_page') */
  cartType?: string
  /** Additional custom data */
  customFields?: Record<string, any>
}

/** Parameters for resource (virtual currency) events */
export interface ResourceEventParams {
  /** Whether the resource is gained ('source') or spent ('sink') */
  flowType: ResourceFlowType
  /** Virtual currency name (e.g. 'credits', 'api_calls') */
  currency: string
  /** Amount gained or spent */
  amount: number
  /** Category (e.g. 'referral', 'export') */
  itemType: string
  /** Specific source or sink (e.g. 'invite_accepted', 'csv_export') */
  itemId: string
  /** Additional custom data */
  customFields?: Record<string, any>
}

/** Parameters for progression (multi-step flow) events */
export interface ProgressionEventParams {
  /** Flow status: 'start', 'complete', or 'fail' */
  status: ProgressionStatus
  /** Top-level flow name (e.g. 'onboarding', 'checkout') */
  progression01: string
  /** Current step (e.g. 'profile', 'payment') */
  progression02?: string
  /** Sub-step detail (e.g. 'credit_card') */
  progression03?: string
  /** Completion score or time in seconds */
  score?: number
  /** Additional custom data */
  customFields?: Record<string, any>
}

/** Parameters for design (custom interaction) events */
export interface DesignEventParams {
  /** Colon-separated event hierarchy (max 5 levels, e.g. 'ui:sidebar:toggle') */
  eventId: string
  /** Numeric value associated with the event */
  value?: number
  /** Additional custom data */
  customFields?: Record<string, any>
}

/** Parameters for error events */
export interface ErrorEventParams {
  /** Error severity level */
  severity: ErrorSeverity
  /** Error description message */
  message?: string
  /** Additional custom data */
  customFields?: Record<string, any>
}

/** Parameters for ad events */
export interface AdEventParams {
  /** Ad interaction type */
  adAction: AdAction
  /** Ad format type */
  adType: AdType
  /** Name of the ad SDK (e.g. 'google_adsense', 'admob') */
  adSdkName: string
  /** Placement identifier (e.g. 'article_footer') */
  adPlacement: string
  /** Duration in seconds (for video ads). Uses addAdEventWithDuration SDK method. */
  duration?: number
  /** Reason an ad failed to show. Uses addAdEventWithNoAdReason SDK method. */
  noAdReason?: AdError
  /** Additional custom data */
  customFields?: Record<string, any>
}

// ---- Page view configuration ----

/** Configuration for automatic page view tracking */
export interface PageViewConfig {
  /** Prefix for the design event hierarchy (default: 'pageView') */
  prefix?: string
  /** Paths to exclude from tracking (supports glob patterns like '/api/*') */
  excludePaths?: string[]
}

// ---- Custom dimensions configuration ----

/** Available custom dimension values (set before init) */
export interface CustomDimensionsConfig {
  dimension01?: string[]
  dimension02?: string[]
  dimension03?: string[]
}

// ---- Main configuration ----

/** Full configuration for initializing GameAnalytics */
export interface GameAnalyticsConfig {
  /** GameAnalytics game key */
  gameKey: string
  /** GameAnalytics secret key */
  secretKey: string
  /** User identifier (reactive in Provider context) */
  userId?: string
  /** App build/release version */
  build?: string
  /** Enable info-level SDK logging */
  debug?: boolean
  /** Enable verbose SDK logging */
  verbose?: boolean
  /** Track route changes as design events */
  trackPageViews?: boolean | PageViewConfig
  /** Enable/disable event submission (for consent flows) */
  enabled?: boolean
  /** Enable manual session handling */
  manualSessionHandling?: boolean
  /** Event dispatch interval in milliseconds (converted to seconds for SDK internally) */
  eventProcessInterval?: number
  /** Available custom dimension values */
  customDimensions?: CustomDimensionsConfig
  /** Available resource currency names */
  resourceCurrencies?: string[]
  /** Available resource item types */
  resourceItemTypes?: string[]
}

// ---- Plugin system ----

/** Event object passed through the plugin pipeline */
export interface GAEvent {
  /** Event type identifier */
  type: 'business' | 'resource' | 'progression' | 'design' | 'error' | 'ad'
  /** Event parameters */
  params: Record<string, any>
  /** Timestamp when the event was created */
  timestamp: number
}

/** Plugin interface for the event pipeline */
export interface GAPlugin {
  /** Unique plugin name */
  name: string
  /** Plugin type: 'enrichment' modifies before dispatch, 'destination' receives after */
  type: 'enrichment' | 'destination'
  /** Called when the plugin is added */
  setup?: (config: GameAnalyticsConfig) => void
  /** Called when the plugin is removed */
  teardown?: () => void
  /** Process an event. Enrichment plugins return modified event or null to drop. */
  execute(event: GAEvent): GAEvent | null | Promise<GAEvent | null>
}

// ---- Generic event typing (advanced) ----

/** Map of event type names to their typed event definitions */
export interface EventTypeMap {
  business?: Record<string, any>
  resource?: Record<string, any>
  progression?: Record<string, any>
  design?: Record<string, any>
  error?: Record<string, any>
  ad?: Record<string, any>
}

/** Default event type map (no constraints) */
export type DefaultEventTypeMap = Record<string, never>

// ---- SDK interface ----

/** Full SDK interface exposed by the client */
export interface GameAnalyticsSDK {
  // Lifecycle
  init(config: GameAnalyticsConfig): void
  enable(): void
  disable(): void
  isInitialized(): boolean

  // Events
  addBusinessEvent(params: BusinessEventParams): void
  addResourceEvent(params: ResourceEventParams): void
  addProgressionEvent(params: ProgressionEventParams): void
  addDesignEvent(params: DesignEventParams): void
  addErrorEvent(params: ErrorEventParams): void
  addAdEvent(params: AdEventParams): void

  // Identity
  setUserId(id: string): void
  setBuild(version: string): void
  setCustomDimension01(value: string): void
  setCustomDimension02(value: string): void
  setCustomDimension03(value: string): void
  setGlobalCustomEventFields(fields: Record<string, any>): void

  // Sessions
  startSession(): void
  endSession(): void

  // Remote configs
  isRemoteConfigsReady(): boolean
  getRemoteConfig(key: string, defaultValue?: string): string | null
  getAllRemoteConfigs(): string
  onRemoteConfigsReady(callback: () => void): () => void
  getABTestingId(): string
  getABTestingVariantId(): string

  // Plugins
  addPlugin(plugin: GAPlugin): void
  removePlugin(name: string): void
}
