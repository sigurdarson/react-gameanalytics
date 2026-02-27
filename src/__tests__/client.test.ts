import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockGA } from './setup'
import { GameAnalyticsClient } from '../core/client'

describe('GameAnalyticsClient', () => {
  let client: GameAnalyticsClient

  beforeEach(() => {
    mockGA.mockClear()
    client = new GameAnalyticsClient()
  })

  describe('init', () => {
    it('calls SDK methods in correct order before initialize', () => {
      client.init({
        gameKey: 'test-key',
        secretKey: 'test-secret',
        debug: true,
        verbose: true,
        manualSessionHandling: true,
        eventProcessInterval: 5000,
        build: '1.0.0',
        userId: 'user-123',
        customDimensions: {
          dimension01: ['free', 'pro'],
          dimension02: ['us', 'eu'],
          dimension03: ['desktop', 'mobile'],
        },
        resourceCurrencies: ['credits'],
        resourceItemTypes: ['feature_unlock'],
      })

      const calls = mockGA.mock.calls.map((c) => c[0])
      const initIdx = calls.indexOf('initialize')
      expect(initIdx).toBeGreaterThan(-1)

      const beforeInit = [
        'setEnabledInfoLog',
        'setEnabledVerboseLog',
        'setEnabledManualSessionHandling',
        'setEventProcessInterval',
        'configureBuild',
        'configureUserId',
        'configureAvailableCustomDimensions01',
        'configureAvailableCustomDimensions02',
        'configureAvailableCustomDimensions03',
        'configureAvailableResourceCurrencies',
        'configureAvailableResourceItemTypes',
      ]

      for (const method of beforeInit) {
        const idx = calls.indexOf(method)
        expect(idx).toBeGreaterThan(-1)
        expect(idx).toBeLessThan(initIdx)
      }
    })

    it('converts eventProcessInterval from ms to seconds', () => {
      client.init({ gameKey: 'gk', secretKey: 'sk', eventProcessInterval: 5000 })
      const call = mockGA.mock.calls.find((c) => c[0] === 'setEventProcessInterval')
      expect(call).toEqual(['setEventProcessInterval', 5])
    })

    it('calls initialize with gameKey and secretKey', () => {
      client.init({ gameKey: 'gk', secretKey: 'sk' })
      const initCall = mockGA.mock.calls.find((c) => c[0] === 'initialize')
      expect(initCall).toEqual(['initialize', 'gk', 'sk'])
    })

    it('sets initialized to true after init', () => {
      expect(client.isInitialized()).toBe(false)
      client.init({ gameKey: 'gk', secretKey: 'sk' })
      expect(client.isInitialized()).toBe(true)
    })

    it('does not initialize twice', () => {
      client.init({ gameKey: 'gk', secretKey: 'sk' })
      mockGA.mockClear()
      client.init({ gameKey: 'gk', secretKey: 'sk' })
      expect(mockGA).not.toHaveBeenCalled()
    })

    it('disables event submission when enabled=false', () => {
      client.init({ gameKey: 'gk', secretKey: 'sk', enabled: false })
      const disableCall = mockGA.mock.calls.find((c) => c[0] === 'setEnabledEventSubmission')
      expect(disableCall).toEqual(['setEnabledEventSubmission', false])
    })
  })

  describe('enable/disable', () => {
    it('calls setEnabledEventSubmission(true) on enable', () => {
      client.enable()
      expect(mockGA).toHaveBeenCalledWith('setEnabledEventSubmission', true)
    })

    it('calls setEnabledEventSubmission(false) on disable', () => {
      client.disable()
      expect(mockGA).toHaveBeenCalledWith('setEnabledEventSubmission', false)
    })
  })

  describe('event methods', () => {
    beforeEach(() => {
      client.init({ gameKey: 'gk', secretKey: 'sk' })
      mockGA.mockClear()
    })

    it('addBusinessEvent maps params correctly', () => {
      client.addBusinessEvent({
        currency: 'USD',
        amount: 2900,
        itemType: 'subscription',
        itemId: 'pro_monthly',
        cartType: 'pricing_page',
      })

      const call = mockGA.mock.calls.find((c) => c[0] === 'addBusinessEvent')
      expect(call).toBeDefined()
      expect(call![1]).toBe('USD')
      expect(call![2]).toBe(2900)
      expect(call![3]).toBe('subscription')
      expect(call![4]).toBe('pro_monthly')
      expect(call![5]).toBe('pricing_page')
    })

    it('addBusinessEvent passes customFields as object', () => {
      const fields = { coupon: 'SAVE20' }
      client.addBusinessEvent({
        currency: 'USD',
        amount: 100,
        itemType: 'sub',
        itemId: 'basic',
        customFields: fields,
      })

      const call = mockGA.mock.calls.find((c) => c[0] === 'addBusinessEvent')
      expect(call![6]).toEqual(fields)
    })

    it('addResourceEvent maps flowType to numeric value', () => {
      client.addResourceEvent({
        flowType: 'source',
        currency: 'credits',
        amount: 500,
        itemType: 'referral',
        itemId: 'invite_accepted',
      })

      const call = mockGA.mock.calls.find((c) => c[0] === 'addResourceEvent')
      expect(call).toBeDefined()
      expect(call![1]).toBe(1) // source -> 1
      expect(call![2]).toBe('credits')
      expect(call![3]).toBe(500)
    })

    it('addProgressionEvent maps status to numeric value', () => {
      client.addProgressionEvent({
        status: 'complete',
        progression01: 'onboarding',
        progression02: 'profile',
        score: 85,
      })

      const call = mockGA.mock.calls.find((c) => c[0] === 'addProgressionEvent')
      expect(call).toBeDefined()
      expect(call![1]).toBe(2) // complete -> 2
      expect(call![2]).toBe('onboarding')
      expect(call![3]).toBe('profile')
      expect(call![4]).toBe('') // progression03 defaults to ''
      expect(call![5]).toBe(85) // score
    })

    it('addProgressionEvent passes customFields in correct position', () => {
      const fields = { step: 'final' }
      client.addProgressionEvent({
        status: 'start',
        progression01: 'checkout',
        customFields: fields,
      })

      const call = mockGA.mock.calls.find((c) => c[0] === 'addProgressionEvent')
      expect(call![5]).toBeUndefined() // score is undefined
      expect(call![6]).toEqual(fields) // customFields in position 6
    })

    it('addDesignEvent passes eventId and value', () => {
      client.addDesignEvent({
        eventId: 'ui:sidebar:toggle',
        value: 4,
      })

      const call = mockGA.mock.calls.find((c) => c[0] === 'addDesignEvent')
      expect(call).toBeDefined()
      expect(call![1]).toBe('ui:sidebar:toggle')
      expect(call![2]).toBe(4)
    })

    it('addDesignEvent passes customFields as object without spurious value', () => {
      const fields = { key: 'value' }
      client.addDesignEvent({
        eventId: 'test',
        customFields: fields,
      })

      const call = mockGA.mock.calls.find((c) => c[0] === 'addDesignEvent')
      expect(call).toBeDefined()
      expect(call![2]).toBeUndefined() // value is undefined, not 0
      expect(call![3]).toEqual(fields) // customFields as object, not JSON string
    })

    it('addErrorEvent maps severity to numeric value', () => {
      client.addErrorEvent({
        severity: 'critical',
        message: 'Something went wrong',
      })

      const call = mockGA.mock.calls.find((c) => c[0] === 'addErrorEvent')
      expect(call).toBeDefined()
      expect(call![1]).toBe(5) // critical -> 5
      expect(call![2]).toBe('Something went wrong')
    })

    it('addAdEvent maps adAction and adType to numeric values', () => {
      client.addAdEvent({
        adAction: 'show',
        adType: 'banner',
        adSdkName: 'google_adsense',
        adPlacement: 'article_footer',
      })

      const call = mockGA.mock.calls.find((c) => c[0] === 'addAdEvent')
      expect(call).toBeDefined()
      expect(call![1]).toBe(2) // show -> 2
      expect(call![2]).toBe(6) // banner -> 6
      expect(call![3]).toBe('google_adsense')
      expect(call![4]).toBe('article_footer')
    })

    it('addAdEvent uses addAdEventWithDuration when duration is set', () => {
      client.addAdEvent({
        adAction: 'show',
        adType: 'rewardedVideo',
        adSdkName: 'admob',
        adPlacement: 'unlock_report',
        duration: 30,
      })

      const call = mockGA.mock.calls.find((c) => c[0] === 'addAdEventWithDuration')
      expect(call).toBeDefined()
      expect(call![5]).toBe(30) // duration
    })

    it('addAdEvent uses addAdEventWithNoAdReason when noAdReason is set', () => {
      client.addAdEvent({
        adAction: 'failedShow',
        adType: 'interstitial',
        adSdkName: 'admob',
        adPlacement: 'between_pages',
        noAdReason: 'noFill',
      })

      const call = mockGA.mock.calls.find((c) => c[0] === 'addAdEventWithNoAdReason')
      expect(call).toBeDefined()
      expect(call![5]).toBe(3) // noFill -> 3
    })

    it('does not dispatch events before init', () => {
      const uninitClient = new GameAnalyticsClient()
      mockGA.mockClear()
      uninitClient.addDesignEvent({ eventId: 'test' })
      expect(mockGA).not.toHaveBeenCalled()
    })
  })

  describe('identity setters', () => {
    it('setUserId calls configureUserId', () => {
      client.setUserId('user-abc')
      expect(mockGA).toHaveBeenCalledWith('configureUserId', 'user-abc')
    })

    it('setBuild calls configureBuild', () => {
      client.setBuild('2.0.0')
      expect(mockGA).toHaveBeenCalledWith('configureBuild', '2.0.0')
    })

    it('setCustomDimension01 calls SDK method', () => {
      client.setCustomDimension01('pro')
      expect(mockGA).toHaveBeenCalledWith('setCustomDimension01', 'pro')
    })

    it('setCustomDimension02 calls SDK method', () => {
      client.setCustomDimension02('eu')
      expect(mockGA).toHaveBeenCalledWith('setCustomDimension02', 'eu')
    })

    it('setCustomDimension03 calls SDK method', () => {
      client.setCustomDimension03('desktop')
      expect(mockGA).toHaveBeenCalledWith('setCustomDimension03', 'desktop')
    })

    it('setGlobalCustomEventFields passes through', () => {
      const fields = { orgId: 'org_123' }
      client.setGlobalCustomEventFields(fields)
      expect(mockGA).toHaveBeenCalledWith('setGlobalCustomEventFields', fields)
    })
  })

  describe('remote configs', () => {
    beforeEach(() => {
      client.init({ gameKey: 'gk', secretKey: 'sk' })
      mockGA.mockClear()
    })

    it('onRemoteConfigsReady passes listener object with onRemoteConfigsUpdated', () => {
      const callback = vi.fn()
      client.onRemoteConfigsReady(callback)

      const call = mockGA.mock.calls.find((c) => c[0] === 'addRemoteConfigsListener')
      expect(call).toBeDefined()
      expect(call![1]).toEqual({ onRemoteConfigsUpdated: callback })
    })

    it('onRemoteConfigsReady unsubscribe removes the same listener object', () => {
      const callback = vi.fn()
      const unsubscribe = client.onRemoteConfigsReady(callback)

      const addCall = mockGA.mock.calls.find((c) => c[0] === 'addRemoteConfigsListener')
      const listenerObj = addCall![1]

      mockGA.mockClear()
      unsubscribe()

      const removeCall = mockGA.mock.calls.find((c) => c[0] === 'removeRemoteConfigsListener')
      expect(removeCall).toBeDefined()
      expect(removeCall![1]).toBe(listenerObj)
    })
  })

  describe('session management', () => {
    beforeEach(() => {
      client.init({ gameKey: 'gk', secretKey: 'sk' })
      mockGA.mockClear()
    })

    it('startSession calls SDK method', () => {
      client.startSession()
      expect(mockGA).toHaveBeenCalledWith('startSession')
    })

    it('endSession calls SDK method', () => {
      client.endSession()
      expect(mockGA).toHaveBeenCalledWith('endSession')
    })

    it('session methods no-op before init', () => {
      const uninitClient = new GameAnalyticsClient()
      mockGA.mockClear()
      uninitClient.startSession()
      uninitClient.endSession()
      expect(mockGA).not.toHaveBeenCalled()
    })
  })
})
