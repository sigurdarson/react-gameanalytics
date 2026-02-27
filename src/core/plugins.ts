import type { GAPlugin, GAEvent, GameAnalyticsConfig } from './types'

/** Manages the plugin pipeline for event enrichment and forwarding */
export class PluginManager {
  private plugins: GAPlugin[] = []
  private config: GameAnalyticsConfig | null = null

  /** Register a plugin and call its setup method */
  add(plugin: GAPlugin): void {
    this.plugins.push(plugin)
    if (this.config) {
      plugin.setup?.(this.config)
    }
  }

  /** Remove a plugin by name and call its teardown method */
  remove(name: string): void {
    const index = this.plugins.findIndex((p) => p.name === name)
    if (index !== -1) {
      this.plugins[index]!.teardown?.()
      this.plugins.splice(index, 1)
    }
  }

  /** Run enrichment plugins asynchronously. Returns the modified event or null if dropped. */
  async execute(event: GAEvent): Promise<GAEvent | null> {
    let current: GAEvent | null = event
    for (const plugin of this.plugins) {
      if (plugin.type !== 'enrichment' || current === null) break
      current = await plugin.execute(current)
    }
    return current
  }

  /** Run enrichment plugins synchronously. Returns the modified event or null if dropped. */
  executeSync(event: GAEvent): GAEvent | null {
    let current: GAEvent | null = event
    for (const plugin of this.plugins) {
      if (plugin.type !== 'enrichment' || current === null) break
      const result = plugin.execute(current)
      // If result is a Promise, skip async plugins in sync mode
      if (result instanceof Promise) {
        continue
      }
      current = result
    }
    return current
  }

  /** Forward an event to all destination plugins */
  forward(event: GAEvent): void {
    for (const plugin of this.plugins) {
      if (plugin.type === 'destination') {
        plugin.execute(event)
      }
    }
  }

  /** Store config and call setup on all registered plugins */
  setup(config: GameAnalyticsConfig): void {
    this.config = config
    for (const plugin of this.plugins) {
      plugin.setup?.(config)
    }
  }

  /** Call teardown on all registered plugins */
  teardown(): void {
    for (const plugin of this.plugins) {
      plugin.teardown?.()
    }
    this.plugins = []
  }
}
