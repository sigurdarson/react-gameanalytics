import {
  RESOURCE_FLOW_MAP,
  PROGRESSION_STATUS_MAP,
  ERROR_SEVERITY_MAP,
  AD_ACTION_MAP,
  AD_TYPE_MAP,
  AD_ERROR_MAP,
  type ResourceFlowType,
  type ProgressionStatus,
  type ErrorSeverity,
  type AdAction,
  type AdType,
  type AdError,
} from './types'

/** Map a resource flow type string to its SDK numeric value */
export function mapResourceFlowType(flowType: ResourceFlowType): number {
  return RESOURCE_FLOW_MAP[flowType]
}

/** Map a progression status string to its SDK numeric value */
export function mapProgressionStatus(status: ProgressionStatus): number {
  return PROGRESSION_STATUS_MAP[status]
}

/** Map an error severity string to its SDK numeric value */
export function mapErrorSeverity(severity: ErrorSeverity): number {
  return ERROR_SEVERITY_MAP[severity]
}

/** Map an ad action string to its SDK numeric value */
export function mapAdAction(adAction: AdAction): number {
  return AD_ACTION_MAP[adAction]
}

/** Map an ad type string to its SDK numeric value */
export function mapAdType(adType: AdType): number {
  return AD_TYPE_MAP[adType]
}

/** Map an ad error reason string to its SDK numeric value */
export function mapAdError(adError: AdError): number {
  return AD_ERROR_MAP[adError]
}
