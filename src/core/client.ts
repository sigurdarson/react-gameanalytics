import type {
  GameAnalyticsConfig,
  GameAnalyticsSDK,
  BusinessEventParams,
  ResourceEventParams,
  ProgressionEventParams,
  DesignEventParams,
  ErrorEventParams,
  AdEventParams,
  GAPlugin,
  GAEvent,
} from './types'
import {
  mapResourceFlowType,
  mapProgressionStatus,
  mapErrorSeverity,
  mapAdAction,
  mapAdType,
  mapAdError,
} from './events'
import { PluginManager } from './plugins'
import { callSDK } from './sdk'

/**
 * GameAnalytics client singleton.
 * Wraps the official gameanalytics NPM package with a typed API.
 * All methods are SSR-safe and no-op when window is unavailable.
 */
export class GameAnalyticsClient implements GameAnalyticsSDK {
  private _initialized = false
  private _config: GameAnalyticsConfig | null = null
  private _pluginManager = new PluginManager()
  private _remoteConfigListeners = new Map<() => void, { onRemoteConfigsUpdated: () => void }>()

  private get isBrowser(): boolean {
    return typeof window !== 'undefined'
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private call(command: string, ...args: any[]): any {
    return callSDK(command, ...args)
  }

  // ---- Lifecycle ----

  /** Initialize the SDK with configuration. Calls config methods in required order before initialize(). */
  init(config: GameAnalyticsConfig): void {
    if (!this.isBrowser || this._initialized) return

    this._config = config
    this._pluginManager.setup(config)

    // 1. Logging
    if (config.debug) {
      this.call('setEnabledInfoLog', true)
    }
    if (config.verbose) {
      this.call('setEnabledVerboseLog', true)
    }

    // 2. Session handling
    if (config.manualSessionHandling) {
      this.call('setEnabledManualSessionHandling', true)
    }

    // 3. Event processing (convert ms to seconds for SDK)
    if (config.eventProcessInterval !== undefined) {
      this.call('setEventProcessInterval', config.eventProcessInterval / 1000)
    }

    // 4. Build
    if (config.build) {
      this.call('configureBuild', config.build)
    }

    // 7. User ID
    if (config.userId) {
      this.call('configureUserId', config.userId)
    }

    // 8. Custom dimensions
    if (config.customDimensions?.dimension01) {
      this.call('configureAvailableCustomDimensions01', config.customDimensions.dimension01)
    }
    if (config.customDimensions?.dimension02) {
      this.call('configureAvailableCustomDimensions02', config.customDimensions.dimension02)
    }
    if (config.customDimensions?.dimension03) {
      this.call('configureAvailableCustomDimensions03', config.customDimensions.dimension03)
    }

    // 9. Resources
    if (config.resourceCurrencies) {
      this.call('configureAvailableResourceCurrencies', config.resourceCurrencies)
    }
    if (config.resourceItemTypes) {
      this.call('configureAvailableResourceItemTypes', config.resourceItemTypes)
    }

    // 10. Initialize (LAST)
    this.call('initialize', config.gameKey, config.secretKey)
    this._initialized = true

    // Handle enabled=false after init
    if (config.enabled === false) {
      this.disable()
    }
  }

  /** Enable event submission */
  enable(): void {
    this.call('setEnabledEventSubmission', true)
  }

  /** Disable event submission */
  disable(): void {
    this.call('setEnabledEventSubmission', false)
  }

  /** Check if the SDK has been initialized */
  isInitialized(): boolean {
    if (!this.isBrowser) return false
    return this._initialized
  }

  // ---- Events ----

  private dispatchEvent(event: GAEvent, dispatch: () => void): void {
    const result = this._pluginManager.executeSync(event)
    if (result === null) return
    dispatch()
    this._pluginManager.forward(result)
  }

  /** Track a purchase or subscription event */
  addBusinessEvent(params: BusinessEventParams): void {
    if (!this.isBrowser || !this._initialized) return
    const event: GAEvent = { type: 'business', params, timestamp: Date.now() }
    this.dispatchEvent(event, () => {
      this.call(
        'addBusinessEvent',
        params.currency,
        params.amount,
        params.itemType,
        params.itemId,
        params.cartType ?? '',
        params.customFields,
      )
    })
  }

  /** Track virtual currency gain or spend */
  addResourceEvent(params: ResourceEventParams): void {
    if (!this.isBrowser || !this._initialized) return
    const event: GAEvent = { type: 'resource', params, timestamp: Date.now() }
    this.dispatchEvent(event, () => {
      this.call(
        'addResourceEvent',
        mapResourceFlowType(params.flowType),
        params.currency,
        params.amount,
        params.itemType,
        params.itemId,
        params.customFields,
      )
    })
  }

  /** Track progress through a multi-step flow */
  addProgressionEvent(params: ProgressionEventParams): void {
    if (!this.isBrowser || !this._initialized) return
    const event: GAEvent = { type: 'progression', params, timestamp: Date.now() }
    this.dispatchEvent(event, () => {
      this.call(
        'addProgressionEvent',
        mapProgressionStatus(params.status),
        params.progression01,
        params.progression02 ?? '',
        params.progression03 ?? '',
        params.score,
        params.customFields,
      )
    })
  }

  /** Track a custom design/interaction event */
  addDesignEvent(params: DesignEventParams): void {
    if (!this.isBrowser || !this._initialized) return
    const event: GAEvent = { type: 'design', params, timestamp: Date.now() }
    this.dispatchEvent(event, () => {
      this.call(
        'addDesignEvent',
        params.eventId,
        params.value,
        params.customFields,
      )
    })
  }

  /** Track an application error */
  addErrorEvent(params: ErrorEventParams): void {
    if (!this.isBrowser || !this._initialized) return
    const event: GAEvent = { type: 'error', params, timestamp: Date.now() }
    this.dispatchEvent(event, () => {
      this.call(
        'addErrorEvent',
        mapErrorSeverity(params.severity),
        params.message ?? '',
        params.customFields,
      )
    })
  }

  /** Track an ad impression or interaction */
  addAdEvent(params: AdEventParams): void {
    if (!this.isBrowser || !this._initialized) return
    const event: GAEvent = { type: 'ad', params, timestamp: Date.now() }
    this.dispatchEvent(event, () => {
      const action = mapAdAction(params.adAction)
      const type = mapAdType(params.adType)
      if (params.noAdReason !== undefined) {
        this.call(
          'addAdEventWithNoAdReason',
          action, type, params.adSdkName, params.adPlacement,
          mapAdError(params.noAdReason),
          params.customFields,
        )
      } else if (params.duration !== undefined) {
        this.call(
          'addAdEventWithDuration',
          action, type, params.adSdkName, params.adPlacement,
          params.duration,
          params.customFields,
        )
      } else {
        this.call(
          'addAdEvent',
          action, type, params.adSdkName, params.adPlacement,
          params.customFields,
        )
      }
    })
  }

  // ---- Identity ----

  /** Set the user identifier */
  setUserId(id: string): void {
    this.call('configureUserId', id)
  }

  /** Set the app build version */
  setBuild(version: string): void {
    this.call('configureBuild', version)
  }

  /** Set custom dimension 01 value */
  setCustomDimension01(value: string): void {
    this.call('setCustomDimension01', value)
  }

  /** Set custom dimension 02 value */
  setCustomDimension02(value: string): void {
    this.call('setCustomDimension02', value)
  }

  /** Set custom dimension 03 value */
  setCustomDimension03(value: string): void {
    this.call('setCustomDimension03', value)
  }

  /** Set global custom event fields attached to every event */
  setGlobalCustomEventFields(fields: Record<string, any>): void {
    this.call('setGlobalCustomEventFields', fields)
  }

  // ---- Sessions ----

  /** Start a new session (requires manualSessionHandling) */
  startSession(): void {
    if (!this.isBrowser || !this._initialized) return
    this.call('startSession')
  }

  /** End the current session (requires manualSessionHandling) */
  endSession(): void {
    if (!this.isBrowser || !this._initialized) return
    this.call('endSession')
  }

  // ---- Remote Configs ----

  /** Check if remote configs have been fetched */
  isRemoteConfigsReady(): boolean {
    if (!this.isBrowser) return false
    return this.call('isRemoteConfigsReady') ?? false
  }

  /** Get a remote config value by key */
  getRemoteConfig(key: string, defaultValue?: string): string | null {
    if (!this.isBrowser) return defaultValue ?? null
    return this.call('getRemoteConfigsValueAsString', key, defaultValue ?? '') ?? defaultValue ?? null
  }

  /** Get all remote configs as a JSON string */
  getAllRemoteConfigs(): string {
    if (!this.isBrowser) return ''
    return this.call('getRemoteConfigsContentAsString') ?? ''
  }

  /** Subscribe to remote config ready events. Returns an unsubscribe function. */
  onRemoteConfigsReady(callback: () => void): () => void {
    if (!this.isBrowser) return () => {}
    const listener = { onRemoteConfigsUpdated: callback }
    this.call('addRemoteConfigsListener', listener)
    this._remoteConfigListeners.set(callback, listener)
    return () => {
      this.call('removeRemoteConfigsListener', listener)
      this._remoteConfigListeners.delete(callback)
    }
  }

  /** Get the A/B testing ID */
  getABTestingId(): string {
    if (!this.isBrowser) return ''
    return this.call('getABTestingId') ?? ''
  }

  /** Get the A/B testing variant ID */
  getABTestingVariantId(): string {
    if (!this.isBrowser) return ''
    return this.call('getABTestingVariantId') ?? ''
  }

  // ---- Plugins ----

  /** Add a plugin to the event pipeline */
  addPlugin(plugin: GAPlugin): void {
    this._pluginManager.add(plugin)
  }

  /** Remove a plugin by name */
  removePlugin(name: string): void {
    this._pluginManager.remove(name)
  }
}

/** Singleton GameAnalytics client instance */
export const ga = new GameAnalyticsClient()
