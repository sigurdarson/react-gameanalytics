# CLAUDE.md - react-gameanalytics

## How to Work on This Project

This project uses **spec-driven development**. Read `SPEC.md` before making any changes. It contains the full task breakdown with explicit verification criteria for each task.

### Workflow
1. Read `SPEC.md` to understand the current task
2. Use **Context7** to fetch up-to-date documentation before implementing
3. Implement the task, following the file list and constraints
4. Run the verification steps listed in the task
5. Move to the next task only when all verification criteria pass

### Context7 Usage
Use the Context7 MCP server to fetch current documentation for:
- `gameanalytics` - official SDK API (resolve library ID first, then fetch docs)
- `react` - React 18+ APIs (useSyncExternalStore, useContext, useEffect)
- `next` - Next.js App Router and Pages Router APIs (usePathname, next/navigation, router.events)
- `tsup` - bundler configuration
- `vitest` - testing patterns

Always resolve the library ID with Context7 first, then fetch documentation. The official `gameanalytics` SDK is the source of truth for method signatures and enum values. Do not rely on memory for SDK details; verify against Context7 docs.

## Project Overview

`react-gameanalytics` is a community-built NPM package that wraps the official [`gameanalytics`](https://www.npmjs.com/package/gameanalytics) NPM package with first-class React support, full TypeScript typing, and a Next.js adapter. It is NOT an official GameAnalytics product.

The package is designed for **web applications**: SaaS products, e-commerce sites, content platforms, dashboards, and any website that benefits from analytics. All examples and documentation use web app contexts (subscriptions, onboarding flows, feature usage, checkout funnels) rather than gaming contexts.

## Architecture

### Package structure (single package, subpath exports)

```
react-gameanalytics/
├── src/
│   ├── core/                    # Framework-agnostic browser client
│   │   ├── client.ts            # GameAnalytics singleton class
│   │   ├── types.ts             # All TypeScript types and interfaces
│   │   ├── events.ts            # Enum mapping + event helpers
│   │   ├── identity.ts          # userId, dimensions, build, global fields
│   │   ├── remote-configs.ts    # Remote configs + AB testing
│   │   ├── session.ts           # Manual session handling
│   │   ├── page-tracking.ts     # Pathname to design event conversion
│   │   ├── plugins.ts           # Plugin manager
│   │   ├── plugins/
│   │   │   ├── debug-plugin.ts
│   │   │   └── consent-plugin.ts
│   │   └── index.ts             # Public barrel exports
│   ├── react/                   # React 18+ bindings
│   │   ├── provider.tsx         # GameAnalyticsProvider
│   │   ├── hooks.ts             # useGameAnalytics, useRemoteConfig, useTrackPageView
│   │   └── index.ts
│   ├── next/                    # Next.js adapter
│   │   ├── provider.tsx         # Next.js Provider (wraps React Provider)
│   │   ├── page-tracker.tsx     # App Router + Pages Router page tracking
│   │   └── index.ts
│   └── __tests__/               # Test suites
│       ├── setup.ts
│       ├── client.test.ts
│       ├── events.test.ts
│       ├── page-tracking.test.ts
│       ├── plugins.test.ts
│       └── provider.test.tsx
├── examples/
│   ├── nextjs/                  # Next.js App Router example (see T19 in SPEC.md)
│   │   ├── app/
│   │   │   ├── layout.tsx       # Provider setup with auth + consent + page tracking
│   │   │   ├── page.tsx         # Landing page with design events
│   │   │   ├── dashboard/       # Business + resource events
│   │   │   ├── settings/        # Dimension + global field changes
│   │   │   ├── onboarding/      # Progression events (multi-step flow)
│   │   │   └── components/      # AuthSimulator, ConsentBanner, EventLog, Nav
│   │   ├── package.json         # Uses "react-gameanalytics": "file:../../"
│   │   └── README.md
│   ├── react-vite/              # React + Vite + React Router example
│   │   ├── src/
│   │   │   ├── App.tsx          # Provider + Router + PageTracker
│   │   │   ├── pages/           # Home, Dashboard, Settings, Onboarding
│   │   │   └── components/      # AuthSimulator, ConsentBanner, EventLog, Nav
│   │   ├── package.json
│   │   └── README.md
│   └── vanilla/                 # Vanilla JS example (no React)
│       ├── src/main.ts          # Direct SDK usage with DOM event listeners
│       ├── index.html           # All event types + identity + plugin log
│       ├── package.json
│       └── README.md
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
├── README.md
├── CLAUDE.md                    # This file
├── PUBLISHING.md                # Versioning and npm publish guide
├── SPEC.md                      # Task breakdown and verification criteria
└── LICENSE
```

### Import paths

```ts
import * as ga from 'react-gameanalytics'          // Core vanilla JS client
import { ... } from 'react-gameanalytics/react'    // React Provider + hooks
import { ... } from 'react-gameanalytics/next'     // Next.js adapter + re-exported hooks
```

### Key design decisions

- **Bundled SDK**: The official `gameanalytics` NPM package is a direct dependency. No CDN script tags.
- **Singleton**: Single `GameAnalyticsClient` instance. No multi-instance support.
- **React 18+ minimum**: Enables `useSyncExternalStore` for SSR-safe state.
- **SSR safe**: All methods no-op when `typeof window === 'undefined'`.
- **userId as reactive prop**: Provider watches `userId` prop and calls `configureUserId` on change. Works with any auth provider (Supabase, Clerk, Firebase, Auth0, etc.).
- **Page tracking via design events**: Pathname segments split into GA's 5-level hierarchy. Opt-in. Uses web app paths like `/dashboard/analytics`, `/settings/billing`.
- **String literal enums**: Our API uses `'source'`, `'start'`, `'error'` etc. Mapped internally to the SDK's numeric enums.

## SDK API Mapping

The package wraps 100% of the official `gameanalytics` JS SDK. See `SPEC.md` for the complete audit table.

### Critical implementation detail: call ordering

The official SDK requires configuration methods to be called BEFORE `initialize()`. The `init()` method in `client.ts` must enforce this order:

```
1. setEnabledInfoLog / setEnabledVerboseLog
2. setEnabledManualSessionHandling
3. setEventProcessInterval (expects seconds; wrapper converts from ms)
4. configureBuild
5. configureUserId
6. configureAvailableCustomDimensions01/02/03
7. configureAvailableResourceCurrencies
8. configureAvailableResourceItemTypes
9. initialize(gameKey, secretKey)  ← LAST
```

### SDK method notes

- `setEventProcessInterval` expects seconds, not milliseconds. The wrapper accepts ms and divides by 1000.
- `addRemoteConfigsListener` expects `{ onRemoteConfigsUpdated: () => void }`, not a bare callback function.
- Ad events use three separate SDK methods: `addAdEvent`, `addAdEventWithDuration` (when `duration` is set), and `addAdEventWithNoAdReason` (when `noAdReason` is set).
- `customFields` parameters are passed as plain objects, never JSON-stringified.

### Enum mappings

The official SDK uses numeric enums. Our wrapper maps string literals:

```ts
// Resource flow
'source' → 1 (EGAResourceFlowType.Source)
'sink'   → 2 (EGAResourceFlowType.Sink)

// Progression status
'start'    → 1 (EGAProgressionStatus.Start)
'complete' → 2 (EGAProgressionStatus.Complete)
'fail'     → 3 (EGAProgressionStatus.Fail)

// Error severity
'debug'    → 1, 'info' → 2, 'warning' → 3, 'error' → 4, 'critical' → 5

// Ad action
'clicked' → 1, 'show' → 2, 'failedShow' → 3, 'rewardReceived' → 4

// Ad type
'video' → 1, 'rewardedVideo' → 2, 'playable' → 3, 'interstitial' → 4, 'offerWall' → 5, 'banner' → 6

// Ad error (noAdReason)
'unknown' → 1, 'offline' → 2, 'noFill' → 3, 'internalError' → 4, 'invalidRequest' → 5, 'unableToPrecache' → 6
```

**Note**: These numeric values have been verified against the `gameanalytics@4.4.7` TypeScript declarations (`node_modules/gameanalytics/dist/GameAnalytics.d.ts`).

## Event Types in Web App Context

When implementing and testing, use these real-world web app examples:

- **Business events**: Subscription upgrades (`pro_monthly`), addon purchases (`extra_seats_5`), one-time payments
- **Resource events**: Credit consumption (`api_calls`, `tokens`), referral rewards
- **Progression events**: Onboarding steps (`onboarding:profile:complete`), checkout funnels (`checkout:payment:fail`)
- **Design events**: UI interactions (`ui:sidebar:toggle`), feature usage (`feature:dashboard:widget_added`), search queries
- **Error events**: API failures, form validation errors, caught exceptions
- **Ad events**: Banner impressions on content pages, rewarded video to unlock reports

## Example Apps

Three example apps demonstrate each import path. All use `"react-gameanalytics": "file:../../"` for local development.

### Running any example
```bash
# From the repo root, build the library first
npm run build

# Next.js (App Router)
cd examples/nextjs && npm install && npm run dev

# React + Vite (React Router)
cd examples/react-vite && npm install && npm run dev

# Vanilla JS (no React)
cd examples/vanilla && npm install && npm run dev
```

### Next.js example (`examples/nextjs/`)
Uses `react-gameanalytics/next`. Tests SSR safety, App Router page tracking, auth/consent.

| Page | Features exercised |
|---|---|
| `/` (Home) | Design events, ad events, auth simulator, consent banner |
| `/dashboard` | Business events, resource events, error events |
| `/dashboard/analytics` | Design event on mount, 3-level page view hierarchy |
| `/settings` | Custom dimension changes, global custom event fields |
| `/onboarding` | Progression events (multi-step flow) |

### React + Vite example (`examples/react-vite/`)
Uses `react-gameanalytics/react` with React Router. Same feature coverage as Next.js but with client-side routing and `useTrackPageView` + `useLocation`.

### Vanilla JS example (`examples/vanilla/`)
Uses `react-gameanalytics` core. No React. Demonstrates all 6 event types, identity management, and plugin system with plain DOM event listeners.

### Testing with examples
- **SSR safety**: `npm run build` in the Next.js example fails if any SSR guard is missing
- **Page tracking**: Navigate between pages and check the EventLog for `pageView:*` design events
- **Identity**: Toggle the auth simulator and verify `userId` changes propagate
- **Consent**: Toggle the consent banner and verify events stop/start
- **All event types**: Each page/section has buttons that fire specific event types

## Page View Tracking

Pathnames are split into GA's 5-level design event hierarchy:

```
/                              → pageView:root
/dashboard                     → pageView:dashboard
/dashboard/analytics           → pageView:dashboard:analytics
/settings/billing/invoices     → pageView:settings:billing:invoices
/settings/billing/invoices/2024 → pageView:settings:billing:invoices:2024 (5 levels, max)
/a/b/c/d/e/f                   → pageView:a:b:c:d-e-f (overflow joined)
```

Prefix occupies level 1. Max 4 pathname segments before overflow. Overflow segments joined with hyphens into the last level.

## Code Style

- TypeScript strict mode
- No `any` types except where interfacing with the official SDK's untyped API
- Use `'use client'` directive on all React and Next.js components
- Export types alongside runtime exports
- Prefer named exports over default exports
- All public methods must have JSDoc comments
- No use of em dashes in comments or documentation

## Build & Test Commands

```bash
# Library
npx tsup           # Build all subpath exports
npx tsc --noEmit   # Type check
npx vitest run     # Run all tests
npx vitest         # Watch mode
npm pack           # Create publishable tarball

# Versioning (see PUBLISHING.md for full guide)
npm run version:patch   # Bug fixes
npm run version:minor   # New features
npm run version:major   # Breaking changes
npm run release:patch   # Version + push + publish

# Example apps (integration testing)
cd examples/nextjs && npm install && npm run dev       # Next.js
cd examples/react-vite && npm install && npm run dev   # React + Vite
cd examples/vanilla && npm install && npm run dev      # Vanilla JS
```
