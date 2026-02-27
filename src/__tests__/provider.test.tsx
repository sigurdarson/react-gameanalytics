import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, act } from '@testing-library/react'
import React, { useState } from 'react'
import { mockGA } from './setup'
import { GameAnalyticsProvider } from '../react/provider'
import { useGameAnalytics } from '../react/hooks'

// Reset mock between tests
beforeEach(() => {
  mockGA.mockClear()
})

describe('GameAnalyticsProvider', () => {
  it('initializes SDK on mount', () => {
    render(
      <GameAnalyticsProvider gameKey="test-key" secretKey="test-secret">
        <div>child</div>
      </GameAnalyticsProvider>,
    )

    const initCall = mockGA.mock.calls.find((c) => c[0] === 'initialize')
    expect(initCall).toBeDefined()
    expect(initCall![1]).toBe('test-key')
    expect(initCall![2]).toBe('test-secret')
  })

  it('calls configureUserId when userId changes', async () => {
    function TestApp() {
      const [userId, setUserId] = useState<string | undefined>(undefined)
      return (
        <GameAnalyticsProvider gameKey="gk" secretKey="sk" userId={userId}>
          <button onClick={() => setUserId('user-123')}>login</button>
        </GameAnalyticsProvider>
      )
    }

    const { getByText } = render(<TestApp />)

    await act(async () => {
      getByText('login').click()
    })

    const userIdCalls = mockGA.mock.calls.filter((c) => c[0] === 'configureUserId')
    expect(userIdCalls.length).toBeGreaterThan(0)
    expect(userIdCalls[userIdCalls.length - 1]![1]).toBe('user-123')
  })

  it('calls enable/disable when enabled prop changes', async () => {
    function TestApp() {
      const [enabled, setEnabled] = useState(true)
      return (
        <GameAnalyticsProvider gameKey="gk" secretKey="sk" enabled={enabled}>
          <button onClick={() => setEnabled(false)}>disable</button>
        </GameAnalyticsProvider>
      )
    }

    const { getByText } = render(<TestApp />)

    await act(async () => {
      getByText('disable').click()
    })

    const disableCall = mockGA.mock.calls.find((c) => c[0] === 'setEnabledEventSubmission' && c[1] === false)
    expect(disableCall).toBeDefined()
  })
})

describe('useGameAnalytics', () => {
  it('throws when used outside Provider', () => {
    function BadComponent() {
      useGameAnalytics()
      return <div>bad</div>
    }

    // Suppress console.error for expected error
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<BadComponent />)
    }).toThrow('useGameAnalytics must be used within a GameAnalyticsProvider')

    spy.mockRestore()
  })

  it('returns the client within Provider', () => {
    let client: any = null

    function Consumer() {
      client = useGameAnalytics()
      return <div>ok</div>
    }

    render(
      <GameAnalyticsProvider gameKey="gk" secretKey="sk">
        <Consumer />
      </GameAnalyticsProvider>,
    )

    expect(client).toBeDefined()
    expect(typeof client.addDesignEvent).toBe('function')
    expect(typeof client.addBusinessEvent).toBe('function')
    expect(typeof client.setUserId).toBe('function')
  })
})
