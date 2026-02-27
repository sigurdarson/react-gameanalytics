/**
 * SDK bridge module.
 * Bridges between our typed API and the official gameanalytics SDK.
 *
 * The SDK is imported via a standard require/import so that consumer bundlers
 * (webpack, vite, etc.) can resolve and include it in the client bundle.
 * The SDK self-initializes on load (calling navigator, etc.), so we defer
 * the import to the first callSDK invocation and guard it with a window check.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sdkModule: any = null
let sdkAttempted = false

function getSDK() {
  if (sdkModule) return sdkModule
  if (sdkAttempted) return null
  if (typeof window === 'undefined') return null

  sdkAttempted = true
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('gameanalytics')
    sdkModule = mod.GameAnalytics || mod.default?.GameAnalytics || mod
    return sdkModule
  } catch {
    return null
  }
}

/** Call a GameAnalytics SDK command. No-op if SDK is unavailable. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function callSDK(command: string, ...args: any[]): any {
  if (typeof window === 'undefined') return undefined

  const sdk = getSDK()
  if (sdk && typeof sdk[command] === 'function') {
    return sdk[command](...args)
  }

  return undefined
}
