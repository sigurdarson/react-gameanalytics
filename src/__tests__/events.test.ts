import { describe, it, expect } from 'vitest'
import {
  mapResourceFlowType,
  mapProgressionStatus,
  mapErrorSeverity,
  mapAdAction,
  mapAdType,
} from '../core/events'

describe('Enum mappings', () => {
  describe('mapResourceFlowType', () => {
    it('maps source to 1', () => {
      expect(mapResourceFlowType('source')).toBe(1)
    })
    it('maps sink to 2', () => {
      expect(mapResourceFlowType('sink')).toBe(2)
    })
  })

  describe('mapProgressionStatus', () => {
    it('maps start to 1', () => {
      expect(mapProgressionStatus('start')).toBe(1)
    })
    it('maps complete to 2', () => {
      expect(mapProgressionStatus('complete')).toBe(2)
    })
    it('maps fail to 3', () => {
      expect(mapProgressionStatus('fail')).toBe(3)
    })
  })

  describe('mapErrorSeverity', () => {
    it('maps debug to 1', () => {
      expect(mapErrorSeverity('debug')).toBe(1)
    })
    it('maps info to 2', () => {
      expect(mapErrorSeverity('info')).toBe(2)
    })
    it('maps warning to 3', () => {
      expect(mapErrorSeverity('warning')).toBe(3)
    })
    it('maps error to 4', () => {
      expect(mapErrorSeverity('error')).toBe(4)
    })
    it('maps critical to 5', () => {
      expect(mapErrorSeverity('critical')).toBe(5)
    })
  })

  describe('mapAdAction', () => {
    it('maps clicked to 1', () => {
      expect(mapAdAction('clicked')).toBe(1)
    })
    it('maps show to 2', () => {
      expect(mapAdAction('show')).toBe(2)
    })
    it('maps failedShow to 3', () => {
      expect(mapAdAction('failedShow')).toBe(3)
    })
    it('maps rewardReceived to 4', () => {
      expect(mapAdAction('rewardReceived')).toBe(4)
    })
  })

  describe('mapAdType', () => {
    it('maps video to 1', () => {
      expect(mapAdType('video')).toBe(1)
    })
    it('maps rewardedVideo to 2', () => {
      expect(mapAdType('rewardedVideo')).toBe(2)
    })
    it('maps playable to 3', () => {
      expect(mapAdType('playable')).toBe(3)
    })
    it('maps interstitial to 4', () => {
      expect(mapAdType('interstitial')).toBe(4)
    })
    it('maps offerWall to 5', () => {
      expect(mapAdType('offerWall')).toBe(5)
    })
    it('maps banner to 6', () => {
      expect(mapAdType('banner')).toBe(6)
    })
  })
})
