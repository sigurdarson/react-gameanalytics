// Core vanilla JS client
export { GameAnalyticsClient, ga } from './client'

// Types
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
  DefaultEventTypeMap,
} from './types'

// Enum maps
export {
  RESOURCE_FLOW_MAP,
  PROGRESSION_STATUS_MAP,
  ERROR_SEVERITY_MAP,
  AD_ACTION_MAP,
  AD_TYPE_MAP,
} from './types'

// Event helpers
export {
  mapResourceFlowType,
  mapProgressionStatus,
  mapErrorSeverity,
  mapAdAction,
  mapAdType,
} from './events'

// Page tracking
export { pathnameToEventId, shouldTrackPath } from './page-tracking'

// Plugins
export { PluginManager } from './plugins'
export { DebugPlugin } from './plugins/debug-plugin'
export { ConsentPlugin } from './plugins/consent-plugin'

// Top-level convenience exports (bind to singleton)
import { ga } from './client'

/** Initialize GameAnalytics with configuration */
export const init = ga.init.bind(ga)
/** Enable event submission */
export const enable = ga.enable.bind(ga)
/** Disable event submission */
export const disable = ga.disable.bind(ga)
/** Check if SDK is initialized */
export const isInitialized = ga.isInitialized.bind(ga)

/** Track a business/purchase event */
export const addBusinessEvent = ga.addBusinessEvent.bind(ga)
/** Track a resource (virtual currency) event */
export const addResourceEvent = ga.addResourceEvent.bind(ga)
/** Track a progression (multi-step flow) event */
export const addProgressionEvent = ga.addProgressionEvent.bind(ga)
/** Track a design (custom interaction) event */
export const addDesignEvent = ga.addDesignEvent.bind(ga)
/** Track an error event */
export const addErrorEvent = ga.addErrorEvent.bind(ga)
/** Track an ad event */
export const addAdEvent = ga.addAdEvent.bind(ga)

/** Set the user identifier */
export const setUserId = ga.setUserId.bind(ga)
/** Set the app build version */
export const setBuild = ga.setBuild.bind(ga)
/** Set custom dimension 01 */
export const setCustomDimension01 = ga.setCustomDimension01.bind(ga)
/** Set custom dimension 02 */
export const setCustomDimension02 = ga.setCustomDimension02.bind(ga)
/** Set custom dimension 03 */
export const setCustomDimension03 = ga.setCustomDimension03.bind(ga)
/** Set global custom event fields */
export const setGlobalCustomEventFields = ga.setGlobalCustomEventFields.bind(ga)

/** Start a manual session */
export const startSession = ga.startSession.bind(ga)
/** End the current session */
export const endSession = ga.endSession.bind(ga)

/** Check if remote configs are ready */
export const isRemoteConfigsReady = ga.isRemoteConfigsReady.bind(ga)
/** Get a remote config value */
export const getRemoteConfig = ga.getRemoteConfig.bind(ga)
/** Get all remote configs as JSON string */
export const getAllRemoteConfigs = ga.getAllRemoteConfigs.bind(ga)
/** Subscribe to remote config ready events */
export const onRemoteConfigsReady = ga.onRemoteConfigsReady.bind(ga)
/** Get the A/B testing ID */
export const getABTestingId = ga.getABTestingId.bind(ga)
/** Get the A/B testing variant ID */
export const getABTestingVariantId = ga.getABTestingVariantId.bind(ga)

/** Add a plugin to the event pipeline */
export const addPlugin = ga.addPlugin.bind(ga)
/** Remove a plugin by name */
export const removePlugin = ga.removePlugin.bind(ga)
