import { describe, it, expect } from 'vitest'
import { pathnameToEventId, shouldTrackPath } from '../core/page-tracking'

describe('pathnameToEventId', () => {
  it('maps / to pageView:root', () => {
    expect(pathnameToEventId('/')).toBe('pageView:root')
  })

  it('maps /dashboard to pageView:dashboard', () => {
    expect(pathnameToEventId('/dashboard')).toBe('pageView:dashboard')
  })

  it('maps /dashboard/analytics to pageView:dashboard:analytics', () => {
    expect(pathnameToEventId('/dashboard/analytics')).toBe('pageView:dashboard:analytics')
  })

  it('maps /settings/billing/invoices to pageView:settings:billing:invoices', () => {
    expect(pathnameToEventId('/settings/billing/invoices')).toBe(
      'pageView:settings:billing:invoices',
    )
  })

  it('maps /settings/billing/invoices/2024 to 5 levels (max)', () => {
    expect(pathnameToEventId('/settings/billing/invoices/2024')).toBe(
      'pageView:settings:billing:invoices:2024',
    )
  })

  it('joins overflow segments with hyphens', () => {
    expect(pathnameToEventId('/a/b/c/d/e/f')).toBe('pageView:a:b:c:d-e-f')
  })

  it('uses custom prefix', () => {
    expect(pathnameToEventId('/dashboard', 'nav')).toBe('nav:dashboard')
  })

  it('handles custom prefix with root path', () => {
    expect(pathnameToEventId('/', 'nav')).toBe('nav:root')
  })

  it('handles trailing slashes', () => {
    expect(pathnameToEventId('/dashboard/')).toBe('pageView:dashboard')
  })
})

describe('shouldTrackPath', () => {
  it('returns false for exact match exclusion', () => {
    expect(shouldTrackPath('/login', ['/login'])).toBe(false)
  })

  it('returns true when path does not match any exclusion', () => {
    expect(shouldTrackPath('/dashboard', ['/admin/*'])).toBe(true)
  })

  it('returns false for glob wildcard match', () => {
    expect(shouldTrackPath('/admin/settings', ['/admin/*'])).toBe(false)
  })

  it('returns false for api wildcard match', () => {
    expect(shouldTrackPath('/api/webhooks', ['/api/*'])).toBe(false)
  })

  it('returns true when no exclusions match', () => {
    expect(shouldTrackPath('/dashboard/analytics', ['/admin/*', '/api/*'])).toBe(true)
  })

  it('handles empty exclusion list', () => {
    expect(shouldTrackPath('/anything', [])).toBe(true)
  })

  it('matches base path for glob pattern', () => {
    expect(shouldTrackPath('/admin', ['/admin/*'])).toBe(false)
  })
})
