import {
  ga,
  init,
  enable,
  disable,
  addDesignEvent,
  addBusinessEvent,
  addResourceEvent,
  addProgressionEvent,
  addErrorEvent,
  addAdEvent,
  setUserId,
  setCustomDimension01,
  addPlugin,
  type GAPlugin,
  type GAEvent,
} from 'react-gameanalytics'

// Event log UI
const logEntries = document.getElementById('log-entries')!
const logCount = document.getElementById('log-count')!
const statusEl = document.getElementById('status')!
let count = 0

function logEvent(type: string, params: Record<string, unknown>) {
  count++
  logCount.textContent = String(count)

  if (count === 1) {
    logEntries.innerHTML = ''
  }

  const entry = document.createElement('div')
  entry.className = 'log-entry'
  const time = new Date().toLocaleTimeString()
  entry.innerHTML = `<span class="log-time">[${time}]</span> <span class="log-type">${type}</span>: ${JSON.stringify(params)}`
  logEntries.appendChild(entry)
  logEntries.scrollTop = logEntries.scrollHeight
}

// Initialize
document.getElementById('btn-init')!.addEventListener('click', () => {
  init({
    gameKey: 'demo-key',
    secretKey: 'demo-secret',
    debug: true,
    resourceCurrencies: ['credits'],
    resourceItemTypes: ['export'],
    customDimensions: {
      dimension01: ['free', 'pro', 'enterprise'],
    },
  })

  // Add logging plugin after init
  const logPlugin: GAPlugin = {
    name: 'vanilla-log',
    type: 'enrichment',
    execute(event: GAEvent) {
      logEvent(event.type, event.params)
      return event
    },
  }
  addPlugin(logPlugin)

  statusEl.innerHTML = 'SDK Status: <strong>Initialized</strong>'
})

document.getElementById('btn-enable')!.addEventListener('click', () => {
  enable()
  statusEl.innerHTML = 'SDK Status: <strong>Enabled</strong>'
})

document.getElementById('btn-disable')!.addEventListener('click', () => {
  disable()
  statusEl.innerHTML = 'SDK Status: <strong>Disabled</strong>'
})

// Design events
document.getElementById('btn-design-1')!.addEventListener('click', () => {
  addDesignEvent({ eventId: 'ui:cta:hero_clicked' })
})

document.getElementById('btn-design-2')!.addEventListener('click', () => {
  addDesignEvent({ eventId: 'feature:search:executed', value: 23 })
})

// Business events
document.getElementById('btn-business')!.addEventListener('click', () => {
  addBusinessEvent({
    currency: 'USD',
    amount: 2900,
    itemType: 'subscription',
    itemId: 'pro_monthly',
    cartType: 'dashboard_upgrade',
  })
})

// Resource events
document.getElementById('btn-resource-sink')!.addEventListener('click', () => {
  addResourceEvent({
    flowType: 'sink',
    currency: 'credits',
    amount: 10,
    itemType: 'export',
    itemId: 'csv_export',
  })
})

document.getElementById('btn-resource-source')!.addEventListener('click', () => {
  addResourceEvent({
    flowType: 'source',
    currency: 'credits',
    amount: 50,
    itemType: 'export',
    itemId: 'referral_bonus',
  })
})

// Progression events
document.getElementById('btn-prog-start')!.addEventListener('click', () => {
  addProgressionEvent({
    status: 'start',
    progression01: 'onboarding',
    progression02: 'profile',
  })
})

document.getElementById('btn-prog-complete')!.addEventListener('click', () => {
  addProgressionEvent({
    status: 'complete',
    progression01: 'onboarding',
    progression02: 'profile',
  })
})

document.getElementById('btn-prog-fail')!.addEventListener('click', () => {
  addProgressionEvent({
    status: 'fail',
    progression01: 'onboarding',
    progression02: 'profile',
  })
})

// Error events
document.getElementById('btn-error-warn')!.addEventListener('click', () => {
  addErrorEvent({
    severity: 'warning',
    message: 'Dashboard widget failed to load: timeout after 5000ms',
  })
})

document.getElementById('btn-error-err')!.addEventListener('click', () => {
  addErrorEvent({
    severity: 'error',
    message: 'Failed to fetch analytics data: 503 Service Unavailable',
  })
})

document.getElementById('btn-error-crit')!.addEventListener('click', () => {
  addErrorEvent({
    severity: 'critical',
    message: 'Payment processing failed: gateway unreachable',
  })
})

// Ad events
document.getElementById('btn-ad-show')!.addEventListener('click', () => {
  addAdEvent({
    adAction: 'show',
    adType: 'banner',
    adSdkName: 'google_adsense',
    adPlacement: 'homepage_footer',
  })
})

document.getElementById('btn-ad-reward')!.addEventListener('click', () => {
  addAdEvent({
    adAction: 'rewardReceived',
    adType: 'rewardedVideo',
    adSdkName: 'admob',
    adPlacement: 'unlock_report',
    duration: 30,
  })
})

document.getElementById('btn-ad-fail')!.addEventListener('click', () => {
  addAdEvent({
    adAction: 'failedShow',
    adType: 'interstitial',
    adSdkName: 'admob',
    adPlacement: 'between_pages',
    noAdReason: 'noFill',
  })
})

// Identity
document.getElementById('btn-set-user')!.addEventListener('click', () => {
  setUserId('user_abc123')
  statusEl.innerHTML = 'SDK Status: <strong>User: user_abc123</strong>'
})

document.getElementById('btn-clear-user')!.addEventListener('click', () => {
  setUserId('')
  statusEl.innerHTML = 'SDK Status: <strong>User cleared</strong>'
})

document.getElementById('btn-set-dim')!.addEventListener('click', () => {
  setCustomDimension01('pro')
  statusEl.innerHTML = 'SDK Status: <strong>Dimension01: pro</strong>'
})
