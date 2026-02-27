import type { GAPlugin, GAEvent } from '../types'

interface ConsentPluginOptions {
  /** If true, events fired before consent are queued and dispatched on grant(). Default: false */
  queueUntilConsent?: boolean
}

/** Gates all events behind user consent (GDPR/cookie consent flows) */
export class ConsentPlugin implements GAPlugin {
  name = 'consent'
  type = 'enrichment' as const
  private _granted = false
  private _queue: GAEvent[] = []
  private _queueEnabled: boolean
  private _onGrant: ((events: GAEvent[]) => void) | null = null

  constructor(options: ConsentPluginOptions = {}) {
    this._queueEnabled = options.queueUntilConsent ?? false
  }

  /** Allow events to pass through */
  grant(): void {
    this._granted = true
    if (this._queueEnabled && this._queue.length > 0) {
      const queued = [...this._queue]
      this._queue = []
      if (this._onGrant) {
        this._onGrant(queued)
      }
    }
  }

  /** Block events from passing through */
  revoke(): void {
    this._granted = false
  }

  /** Check if consent has been granted */
  isGranted(): boolean {
    return this._granted
  }

  /** Register a callback for when queued events should be dispatched */
  onGrantFlush(callback: (events: GAEvent[]) => void): void {
    this._onGrant = callback
  }

  execute(event: GAEvent): GAEvent | null {
    if (this._granted) return event
    if (this._queueEnabled) {
      this._queue.push(event)
    }
    return null
  }
}
