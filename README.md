# react-gameanalytics

A fully-typed React wrapper for the [GameAnalytics](https://gameanalytics.com) JavaScript SDK. Provides a React Context + hooks API, a Next.js adapter, and a vanilla JS client for any framework.

> **Note:** This is a community package, not an official GameAnalytics product.

## Features

- **Full SDK coverage** - All GameAnalytics event types: Business, Resource, Progression, Design, Error, and Ad events
- **TypeScript-first** - Complete type safety with optional generic event typing
- **React 18+** - Context Provider with hooks, SSR-safe
- **Next.js support** - App Router and Pages Router adapters with optimized page tracking
- **Framework-agnostic core** - Works with Vue, Svelte, vanilla JS, or anything else
- **Bundled SDK** - Uses the official `gameanalytics` NPM package directly (no CDN scripts)
- **Remote Configs** - Built-in hooks for GameAnalytics Remote Configs and A/B testing
- **Plugin system** - Extensible event pipeline for enrichment, filtering, and custom destinations
- **Consent-ready** - Defer initialization until user consent is granted

## Installation

```bash
npm install react-gameanalytics
# or
yarn add react-gameanalytics
# or
pnpm add react-gameanalytics
```

## Quick Start

### React (Next.js, Vite, Remix, etc.)

```tsx
// app/layout.tsx or src/App.tsx
import { GameAnalyticsProvider } from 'react-gameanalytics/react'

export default function App({ children }) {
  return (
    <GameAnalyticsProvider
      gameKey="your-game-key"
      secretKey="your-secret-key"
    >
      {children}
    </GameAnalyticsProvider>
  )
}
```

```tsx
// Any component
import { useGameAnalytics } from 'react-gameanalytics/react'

export function UpgradeButton() {
  const ga = useGameAnalytics()

  return (
    <button
      onClick={() =>
        ga.addBusinessEvent({
          currency: 'USD',
          amount: 2900,
          itemType: 'subscription',
          itemId: 'pro_monthly',
          cartType: 'pricing_page',
        })
      }
    >
      Upgrade to Pro ($29/mo)
    </button>
  )
}
```

### Next.js (with page tracking)

```tsx
// app/layout.tsx
import { GameAnalyticsProvider } from 'react-gameanalytics/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <GameAnalyticsProvider
          gameKey={process.env.NEXT_PUBLIC_GA_GAME_KEY!}
          secretKey={process.env.NEXT_PUBLIC_GA_SECRET_KEY!}
          trackPageViews
        >
          {children}
        </GameAnalyticsProvider>
      </body>
    </html>
  )
}
```

### Vanilla JS (Vue, Svelte, Angular, etc.)

```ts
import * as ga from 'react-gameanalytics'

ga.init({
  gameKey: 'your-game-key',
  secretKey: 'your-secret-key',
})

ga.addDesignEvent({ eventId: 'ui:sidebar:toggle' })
```

---

## Import Paths

| Path | Use case |
|---|---|
| `react-gameanalytics` | Vanilla JS client (works everywhere) |
| `react-gameanalytics/react` | React Provider + hooks |
| `react-gameanalytics/next` | Next.js adapter (re-exports React hooks) |

---

## Provider Configuration

The `GameAnalyticsProvider` accepts all configuration options as props:

```tsx
<GameAnalyticsProvider
  // Required
  gameKey="your-game-key"
  secretKey="your-secret-key"

  // Identity
  userId={user?.id}               // Auto-calls configureUserId on change
  build="1.2.3"                   // App build/release version

  // Logging
  debug={false}                   // Enable info logging (default: false)
  verbose={false}                 // Enable verbose logging (default: false)

  // Auto-tracking
  trackPageViews={false}          // Track route changes as design events
  autoCrashReporting={false}      // Auto-report uncaught errors
  autoErrorReporting={false}      // Auto-report JS errors

  // Consent
  enabled={true}                  // Set false to defer until consent given

  // Sessions
  manualSessionHandling={false}   // Manage sessions manually

  // Event processing
  eventProcessInterval={8000}     // Event dispatch interval in ms

  // Dimensions (must be set before init)
  customDimensions={{
    dimension01: ['free', 'pro', 'enterprise'],
    dimension02: ['us', 'eu', 'apac'],
    dimension03: ['desktop', 'mobile', 'tablet'],
  }}

  // Resources (must be set before init)
  resourceCurrencies={['credits', 'tokens', 'api_calls']}
  resourceItemTypes={['feature_unlock', 'export', 'integration']}

  // Other
  gamepadEnabled={false}
>
  {children}
</GameAnalyticsProvider>
```

---

## Event Tracking

### useGameAnalytics Hook

```tsx
import { useGameAnalytics } from 'react-gameanalytics/react'

function MyComponent() {
  const ga = useGameAnalytics()

  // ... use ga methods
}
```

### Business Events

Track purchases and subscription transactions.

```tsx
// Subscription upgrade
ga.addBusinessEvent({
  currency: 'USD',           // ISO 4217 currency code
  amount: 2900,              // Amount in cents (2900 = $29.00)
  itemType: 'subscription',  // Item category
  itemId: 'pro_monthly',     // Specific plan or product
  cartType: 'pricing_page',  // Optional: where the purchase happened
  customFields: {            // Optional: extra data
    couponCode: 'LAUNCH20',
    trialConverted: true,
  },
})

// One-time purchase
ga.addBusinessEvent({
  currency: 'EUR',
  amount: 4900,
  itemType: 'addon',
  itemId: 'extra_seats_5',
  cartType: 'settings_billing',
})
```

### Resource Events

Track virtual currency or credit usage (earning and spending).

```tsx
// User earns credits from a referral
ga.addResourceEvent({
  flowType: 'source',        // 'source' (gain) or 'sink' (spend)
  currency: 'credits',       // Virtual currency name
  amount: 500,               // Amount gained/spent
  itemType: 'referral',      // Category
  itemId: 'invite_accepted', // Specific source/sink
})

// User spends API call tokens
ga.addResourceEvent({
  flowType: 'sink',
  currency: 'api_calls',
  amount: 1,
  itemType: 'export',
  itemId: 'csv_export',
})
```

### Progression Events

Track user progress through multi-step flows like onboarding, checkout, or form wizards.

```tsx
// User starts onboarding
ga.addProgressionEvent({
  status: 'start',              // 'start', 'complete', or 'fail'
  progression01: 'onboarding',  // Required: top-level flow
  progression02: 'profile',     // Optional: current step
})

// User completes onboarding
ga.addProgressionEvent({
  status: 'complete',
  progression01: 'onboarding',
  progression02: 'profile',
  score: 85,                    // Optional: completion score or time in seconds
})

// User abandons checkout
ga.addProgressionEvent({
  status: 'fail',
  progression01: 'checkout',
  progression02: 'payment',
  progression03: 'credit_card',
})
```

### Design Events

Track custom interactions and UI events. Supports a 5-level colon-separated hierarchy.

```tsx
// UI interaction
ga.addDesignEvent({
  eventId: 'ui:sidebar:toggle',
})

// Feature usage with a value
ga.addDesignEvent({
  eventId: 'feature:dashboard:widget_added',
  value: 4,   // e.g., total widgets after adding
})

// Search behavior
ga.addDesignEvent({
  eventId: 'search:query:results',
  value: 23,  // number of results returned
})

// Deep hierarchy for detailed tracking
ga.addDesignEvent({
  eventId: 'settings:integrations:slack:webhook:created',
})
```

### Error Events

Track application errors.

```tsx
ga.addErrorEvent({
  severity: 'error',         // 'debug' | 'info' | 'warning' | 'error' | 'critical'
  message: 'Failed to fetch dashboard data: 503 Service Unavailable',
})

// Track a caught exception
try {
  await submitForm(data)
} catch (err) {
  ga.addErrorEvent({
    severity: 'warning',
    message: `Form submission failed: ${err.message}`,
  })
}
```

### Ad Events

Track ad impressions and interactions (for ad-supported apps or content platforms).

```tsx
ga.addAdEvent({
  adAction: 'show',              // 'clicked' | 'show' | 'failedShow' | 'rewardReceived'
  adType: 'banner',              // 'video' | 'rewardedVideo' | 'playable' | 'interstitial' | 'offerWall' | 'banner'
  adSdkName: 'google_adsense',   // Ad SDK name
  adPlacement: 'article_footer', // Placement identifier
})

// User watches a rewarded video to unlock premium content
ga.addAdEvent({
  adAction: 'rewardReceived',
  adType: 'rewardedVideo',
  adSdkName: 'admob',
  adPlacement: 'unlock_report',
  duration: 30,
})
```

### Custom Fields

Every event method accepts optional `customFields` for additional data:

```tsx
ga.addDesignEvent({
  eventId: 'feature:export:csv',
  value: 1,
  customFields: {
    rowCount: 15000,
    fileSize: '2.4MB',
    filters: ['date_range', 'status'],
  },
})
```

---

## User Identity

### Via Provider prop (recommended)

The `userId` prop is reactive. When it changes (e.g., user logs in), `configureUserId` is called automatically.

```tsx
import { useAuth } from './hooks/useAuth'

function App({ children }) {
  const { user } = useAuth()  // Supabase, Firebase, Clerk, etc.

  return (
    <GameAnalyticsProvider
      gameKey="..."
      secretKey="..."
      userId={user?.id}        // undefined when logged out, set when logged in
    >
      {children}
    </GameAnalyticsProvider>
  )
}
```

### Via hook (imperative)

```tsx
const ga = useGameAnalytics()
ga.setUserId('user_abc123')
```

---

## Custom Dimensions

Use dimensions to segment your analytics by plan, region, device, or any other attribute.

### Set available values at init

```tsx
<GameAnalyticsProvider
  customDimensions={{
    dimension01: ['free', 'pro', 'enterprise'],
    dimension02: ['us', 'eu', 'apac'],
    dimension03: ['desktop', 'mobile', 'tablet'],
  }}
>
```

### Set active values at runtime

```tsx
const ga = useGameAnalytics()
ga.setCustomDimension01('pro')        // User's plan
ga.setCustomDimension02('eu')         // User's region
ga.setCustomDimension03('desktop')    // User's device
```

---

## Global Custom Event Fields

Attach fields to every event automatically:

```tsx
const ga = useGameAnalytics()

ga.setGlobalCustomEventFields({
  appVersion: '2.4.1',
  environment: 'production',
  organizationId: 'org_xyz',
})
```

---

## Page View Tracking

Page views are tracked as **design events** with pathname segments mapped to GA's 5-level hierarchy.

```
URL: /dashboard/analytics/reports
Design event: pageView:dashboard:analytics:reports
```

### Enable in Next.js

```tsx
<GameAnalyticsProvider
  gameKey="..."
  secretKey="..."
  trackPageViews
>
```

### With configuration

```tsx
<GameAnalyticsProvider
  gameKey="..."
  secretKey="..."
  trackPageViews={{
    prefix: 'pageView',                            // First level in hierarchy (default)
    excludePaths: ['/admin/*', '/api/*', '/debug'], // Skip these routes
  }}
>
```

### How paths are mapped

| URL path | Design event ID |
|---|---|
| `/` | `pageView:root` |
| `/dashboard` | `pageView:dashboard` |
| `/dashboard/analytics` | `pageView:dashboard:analytics` |
| `/dashboard/analytics/reports` | `pageView:dashboard:analytics:reports` |
| `/settings/billing/invoices/2024` | `pageView:settings:billing:invoices:2024` |
| `/a/b/c/d/e/f` | `pageView:a:b:c:d-e-f` (overflow joined) |

The prefix occupies level 1. Pathname segments fill levels 2-5. If the path exceeds 4 segments, the remaining segments are joined with hyphens into the last level (GA supports a max of 5 levels).

### Manual page tracking (non-Next.js)

For React Router, Remix, or other routers:

```tsx
import { useLocation } from 'react-router-dom'
import { useTrackPageView } from 'react-gameanalytics/react'

function PageTracker() {
  const location = useLocation()
  useTrackPageView(location.pathname)
  return null
}
```

---

## Remote Configs & A/B Testing

### Check if ready

```tsx
const ga = useGameAnalytics()
const isReady = ga.isRemoteConfigsReady()
```

### Get a config value

```tsx
const ga = useGameAnalytics()
const ctaText = ga.getRemoteConfig('cta_button_text', 'Get Started')
```

### useRemoteConfig hook

Subscribe to remote config updates reactively:

```tsx
import { useRemoteConfig } from 'react-gameanalytics/react'

function PricingBanner() {
  const bannerText = useRemoteConfig('pricing_banner', 'Try Pro free for 14 days')

  return <p>{bannerText}</p>
}
```

### Get all remote configs

```tsx
const ga = useGameAnalytics()
const allConfigs = ga.getAllRemoteConfigs()  // Returns JSON string
```

### A/B Testing

```tsx
const ga = useGameAnalytics()
const testId = ga.getABTestingId()
const variantId = ga.getABTestingVariantId()
```

### Listen for config updates

```tsx
const ga = useGameAnalytics()

const unsubscribe = ga.onRemoteConfigsReady(() => {
  console.log('Remote configs loaded!')
})

// Later:
unsubscribe()
```

---

## Session Management

By default, GameAnalytics manages sessions automatically. For manual control:

```tsx
<GameAnalyticsProvider
  gameKey="..."
  secretKey="..."
  manualSessionHandling
>
```

Then in your components:

```tsx
const ga = useGameAnalytics()

// Start when user opens the app
ga.startSession()

// End when user closes or goes idle
ga.endSession()
```

---

## Consent & Privacy

### Defer initialization

Don't load or track anything until the user consents:

```tsx
function App({ children }) {
  const [hasConsent, setHasConsent] = useState(false)

  return (
    <GameAnalyticsProvider
      gameKey="..."
      secretKey="..."
      enabled={hasConsent}
    >
      {children}
      <CookieBanner onAccept={() => setHasConsent(true)} />
    </GameAnalyticsProvider>
  )
}
```

When `enabled` changes from `false` to `true`, the SDK initializes and begins tracking. Events fired while `enabled` is `false` are silently dropped (not queued).

### Toggle at runtime

```tsx
const ga = useGameAnalytics()
ga.disable()   // Stop all event submission
ga.enable()    // Resume event submission
```

---

## Typed Events (Advanced)

For stricter type safety, define your event schemas and pass them as a generic:

```tsx
import { useGameAnalytics } from 'react-gameanalytics/react'

type MyBusinessEvents = {
  upgradeToPro: {
    currency: 'USD' | 'EUR'
    amount: number
    itemType: 'subscription'
    itemId: 'pro_monthly' | 'pro_annual'
  }
  purchaseAddon: {
    currency: 'USD' | 'EUR'
    amount: number
    itemType: 'addon'
    itemId: 'extra_seats_5' | 'extra_seats_10' | 'extra_storage'
  }
}

type MyDesignEvents = {
  'ui:sidebar:toggle': never                    // No extra params
  'feature:dashboard:widget_added': { value: number }
  'search:query:results': { value: number }
}

type MyProgressionEvents = {
  onboardingStart: {
    status: 'start'
    progression01: 'onboarding'
    progression02: string
  }
  onboardingComplete: {
    status: 'complete'
    progression01: 'onboarding'
    progression02: string
    score: number
  }
}

const ga = useGameAnalytics<{
  business: MyBusinessEvents
  design: MyDesignEvents
  progression: MyProgressionEvents
}>()

// Fully typed at compile time:
ga.addBusinessEvent('upgradeToPro', {
  currency: 'USD',
  amount: 2900,
  itemType: 'subscription',
  itemId: 'pro_monthly',
})

ga.addDesignEvent('feature:dashboard:widget_added', { value: 4 })
ga.addDesignEvent('ui:sidebar:toggle')

// Type errors caught at compile time:
ga.addBusinessEvent('upgradeToPro', { currency: 'GBP' })  // Error: 'GBP' not in 'USD' | 'EUR'
ga.addDesignEvent('nonexistent:event')                     // Error: not in MyDesignEvents
```

---

## Plugin System

Plugins intercept events before they're sent to GameAnalytics. Use them for debugging, enrichment, filtering, or forwarding to other services.

### Using built-in plugins

```tsx
import { DebugPlugin, ConsentPlugin } from 'react-gameanalytics'

const ga = useGameAnalytics()

// Log all events to console
ga.addPlugin(new DebugPlugin({ verbose: true }))

// Gate events behind consent
const consent = new ConsentPlugin()
ga.addPlugin(consent)
consent.grant()    // Allow events
consent.revoke()   // Block events
```

### Writing a custom plugin

```tsx
import type { GAPlugin } from 'react-gameanalytics'

const enrichWithOrgContext: GAPlugin = {
  name: 'org-context',
  type: 'enrichment',

  execute(event) {
    return {
      ...event,
      params: {
        ...event.params,
        customFields: {
          ...event.params.customFields,
          organizationId: getCurrentOrgId(),
          userRole: getCurrentUserRole(),
        },
      },
    }
  },
}

ga.addPlugin(enrichWithOrgContext)
ga.removePlugin('org-context')
```

### Plugin types

- **`enrichment`** - Modifies events before dispatch. Return `null` to drop an event.
- **`destination`** - Receives events after dispatch. Use for forwarding to other analytics services.

---

## Vanilla JS API Reference

For non-React usage, the root import provides a complete imperative API:

```ts
import * as ga from 'react-gameanalytics'

// Lifecycle
ga.init(config)
ga.enable()
ga.disable()
ga.isInitialized()

// Events
ga.addBusinessEvent(params)
ga.addResourceEvent(params)
ga.addProgressionEvent(params)
ga.addDesignEvent(params)
ga.addErrorEvent(params)
ga.addAdEvent(params)

// Identity
ga.setUserId(id)
ga.setBuild(version)
ga.setCustomDimension01(value)
ga.setCustomDimension02(value)
ga.setCustomDimension03(value)
ga.setGlobalCustomEventFields(fields)

// Sessions
ga.startSession()
ga.endSession()

// Remote Configs
ga.isRemoteConfigsReady()
ga.getRemoteConfig(key, defaultValue?)
ga.getAllRemoteConfigs()
ga.getABTestingId()
ga.getABTestingVariantId()
ga.onRemoteConfigsReady(callback)

// Plugins
ga.addPlugin(plugin)
ga.removePlugin(name)
```

---

## Framework Examples

### Vite + React

```tsx
// src/main.tsx
import { GameAnalyticsProvider } from 'react-gameanalytics/react'

createRoot(document.getElementById('root')!).render(
  <GameAnalyticsProvider
    gameKey={import.meta.env.VITE_GA_KEY}
    secretKey={import.meta.env.VITE_GA_SECRET}
  >
    <App />
  </GameAnalyticsProvider>
)
```

### Remix

```tsx
// app/root.tsx
import { GameAnalyticsProvider } from 'react-gameanalytics/react'

export default function App() {
  return (
    <GameAnalyticsProvider gameKey="..." secretKey="...">
      <Outlet />
    </GameAnalyticsProvider>
  )
}
```

### Gatsby

```tsx
// gatsby-browser.tsx
import { GameAnalyticsProvider } from 'react-gameanalytics/react'

export const wrapRootElement = ({ element }) => (
  <GameAnalyticsProvider gameKey="..." secretKey="...">
    {element}
  </GameAnalyticsProvider>
)
```

### Vue (Composition API)

```ts
// composables/useAnalytics.ts
import * as ga from 'react-gameanalytics'
import { onMounted } from 'vue'

export function useAnalyticsInit() {
  onMounted(() => {
    ga.init({ gameKey: '...', secretKey: '...' })
  })
}

// In any component:
import * as ga from 'react-gameanalytics'

ga.addDesignEvent({ eventId: 'ui:menu:open' })
```

### Svelte

```svelte
<script>
  import * as ga from 'react-gameanalytics'
  import { onMount } from 'svelte'

  onMount(() => {
    ga.init({ gameKey: '...', secretKey: '...' })
  })

  function handleClick() {
    ga.addDesignEvent({ eventId: 'cta:hero:clicked' })
  }
</script>

<button on:click={handleClick}>Get Started</button>
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_GA_GAME_KEY` | GameAnalytics game key (Next.js) |
| `NEXT_PUBLIC_GA_SECRET_KEY` | GameAnalytics secret key (Next.js) |
| `VITE_GA_KEY` | GameAnalytics game key (Vite) |
| `VITE_GA_SECRET` | GameAnalytics secret key (Vite) |

> **Security note:** The game key and secret key are client-side values. They are visible in your bundle. This is expected and how the official GameAnalytics SDK works. Do not confuse these with server-side API keys.

---

## TypeScript Support

The package is written in TypeScript and ships with full type definitions. All event parameters, configuration options, and hook return types are fully typed.

```ts
import type {
  GameAnalyticsConfig,
  BusinessEventParams,
  ResourceEventParams,
  ProgressionEventParams,
  DesignEventParams,
  ErrorEventParams,
  AdEventParams,
  ResourceFlowType,
  ProgressionStatus,
  ErrorSeverity,
  AdAction,
  AdType,
  GAPlugin,
  GAEvent,
  EventTypeMap,
} from 'react-gameanalytics'
```

---

## Requirements

- **React 18+** (for `/react` and `/next` subpaths)
- **Next.js 13+** (for `/next` subpath)
- **Node.js 16+**

---

## Contributing

Contributions are welcome! Please open an issue to discuss changes before submitting a PR.

## License

MIT
