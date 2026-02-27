/**
 * SDK bridge module.
 * Wraps the gameanalytics package's command queue function.
 * Isolated in its own module so tests can mock it cleanly.
 */

/** Call a GameAnalytics SDK command. No-op if SDK is unavailable. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function callSDK(command: string, ...args: any[]): any {
  if (typeof window === 'undefined') return undefined

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('gameanalytics')
    const ga = mod.GameAnalytics || mod.default || mod
    if (ga && typeof ga[command] === 'function') {
      return ga[command](...args)
    }
  } catch {
    // SDK not available
  }

  return undefined
}
