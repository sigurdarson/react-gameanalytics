import { describe, it, expect, vi } from 'vitest'
import { PluginManager } from '../core/plugins'
import { DebugPlugin } from '../core/plugins/debug-plugin'
import { ConsentPlugin } from '../core/plugins/consent-plugin'
import type { GAPlugin, GAEvent } from '../core/types'

function makeEvent(type: GAEvent['type'] = 'design'): GAEvent {
  return {
    type,
    params: { eventId: 'test:event' },
    timestamp: Date.now(),
  }
}

describe('PluginManager', () => {
  it('runs enrichment plugins in order', async () => {
    const manager = new PluginManager()
    const calls: string[] = []

    manager.add({
      name: 'first',
      type: 'enrichment',
      execute(event) {
        calls.push('first')
        return { ...event, params: { ...event.params, first: true } }
      },
    })

    manager.add({
      name: 'second',
      type: 'enrichment',
      execute(event) {
        calls.push('second')
        return { ...event, params: { ...event.params, second: true } }
      },
    })

    const result = await manager.execute(makeEvent())
    expect(calls).toEqual(['first', 'second'])
    expect(result?.params.first).toBe(true)
    expect(result?.params.second).toBe(true)
  })

  it('drops event when enrichment plugin returns null', async () => {
    const manager = new PluginManager()

    manager.add({
      name: 'blocker',
      type: 'enrichment',
      execute() {
        return null
      },
    })

    const result = await manager.execute(makeEvent())
    expect(result).toBeNull()
  })

  it('forwards events to destination plugins', () => {
    const manager = new PluginManager()
    const received: GAEvent[] = []

    manager.add({
      name: 'dest',
      type: 'destination',
      execute(event) {
        received.push(event)
        return event
      },
    })

    const event = makeEvent()
    manager.forward(event)
    expect(received).toHaveLength(1)
    expect(received[0]).toBe(event)
  })

  it('calls setup on add and teardown on remove', () => {
    const manager = new PluginManager()
    const setup = vi.fn()
    const teardown = vi.fn()

    const config = { gameKey: 'test', secretKey: 'test' }
    manager.setup(config)

    manager.add({ name: 'test', type: 'enrichment', execute: (e) => e, setup, teardown })
    expect(setup).toHaveBeenCalledWith(config)

    manager.remove('test')
    expect(teardown).toHaveBeenCalled()
  })
})

describe('DebugPlugin', () => {
  it('logs events and passes them through', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const plugin = new DebugPlugin()
    const event = makeEvent()

    const result = plugin.execute(event)
    expect(result).toBe(event)
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('logs verbose output with table', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const tableSpy = vi.spyOn(console, 'table').mockImplementation(() => {})
    const plugin = new DebugPlugin({ verbose: true })
    const event = makeEvent()

    plugin.execute(event)
    expect(logSpy).toHaveBeenCalled()
    expect(tableSpy).toHaveBeenCalled()
    logSpy.mockRestore()
    tableSpy.mockRestore()
  })
})

describe('ConsentPlugin', () => {
  it('drops events before grant', () => {
    const plugin = new ConsentPlugin()
    const result = plugin.execute(makeEvent())
    expect(result).toBeNull()
  })

  it('passes events after grant', () => {
    const plugin = new ConsentPlugin()
    plugin.grant()
    const event = makeEvent()
    const result = plugin.execute(event)
    expect(result).toBe(event)
  })

  it('blocks events after revoke', () => {
    const plugin = new ConsentPlugin()
    plugin.grant()
    plugin.revoke()
    const result = plugin.execute(makeEvent())
    expect(result).toBeNull()
  })

  it('queues events when queueUntilConsent is true', () => {
    const plugin = new ConsentPlugin({ queueUntilConsent: true })
    const flushed: GAEvent[] = []
    plugin.onGrantFlush((events) => flushed.push(...events))

    const event1 = makeEvent()
    const event2 = makeEvent()
    plugin.execute(event1)
    plugin.execute(event2)
    expect(flushed).toHaveLength(0)

    plugin.grant()
    expect(flushed).toHaveLength(2)
  })
})
