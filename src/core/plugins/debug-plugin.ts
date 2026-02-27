import type { GAPlugin, GAEvent } from '../types'

interface DebugPluginOptions {
  /** Enable detailed output with timestamps and full params */
  verbose?: boolean
}

/** Logs all events to the console for debugging */
export class DebugPlugin implements GAPlugin {
  name = 'debug'
  type = 'enrichment' as const
  private verbose: boolean

  constructor(options: DebugPluginOptions = {}) {
    this.verbose = options.verbose ?? false
  }

  execute(event: GAEvent): GAEvent {
    if (this.verbose) {
      console.log(
        `[GameAnalytics] ${event.type} event at ${new Date(event.timestamp).toISOString()}`,
      )
      console.table(event.params)
    } else {
      console.log(`[GameAnalytics] ${event.type}:`, event.params)
    }
    return event
  }
}
