# react-gameanalytics

## Why

The current GameAnalytics JavaScript SDK integration requires a raw `<script>` tag, a global command queue, and stringly-typed function calls with no TypeScript support. This makes it painful to use in modern React and Next.js web applications. There is no official React wrapper, no hook-based API, no SSR safety, and no way to get compile-time event validation. Developers building SaaS products, e-commerce sites, content platforms, and other web apps have to write their own brittle wrappers every time.

## What

A community-built NPM package called `react-gameanalytics` that wraps the official [`gameanalytics`](https://www.npmjs.com/package/gameanalytics) NPM package. It provides:

1. A **framework-agnostic core** (vanilla JS) that works anywhere
2. **React 18+ bindings** with Context Provider and hooks
3. A **Next.js adapter** with App Router and Pages Router support
4. **Full TypeScript types** for all 6 event types, all configuration, and optional generic event typing
5. **100% coverage** of the official SDK's API surface (events, identity, sessions, remote configs, A/B testing, plugins)

The package uses subpath exports from a single NPM package:
- `react-gameanalytics` - vanilla JS core
- `react-gameanalytics/react` - React Provider + hooks
- `react-gameanalytics/next` - Next.js adapter (re-exports React hooks)

The repository also includes a **test Next.js application** (`examples/nextjs`) that serves as both an integration test and a usage reference.

## Constraints

### Must
- Must wrap 100% of the official `gameanalytics` SDK API surface
- Must support all 6 event types: Business, Resource, Progression, Design, Error, Ad
- Must support `customFields` on every event method
- Must map human-readable string literals to the SDK's numeric enums
- Must call all configuration methods BEFORE `initialize()` (SDK requirement)
- Must be SSR-safe: all methods no-op when `typeof window === 'undefined'`
- Must use the official `gameanalytics` NPM package as a direct dependency (no CDN scripts)
- Must support React 18+ as a minimum
- Must support Next.js 13+ (App Router and Pages Router)
- Must make `userId` a reactive prop on the Provider that auto-calls `configureUserId`
- Must make page view tracking opt-in, using design events with 5-level hierarchy
- Must support `trackPageViews` config with `prefix` and `excludePaths` options
- Must ship ESM + CJS + TypeScript declarations via tsup
- Must include JSDoc comments on all public methods
- Must include a comprehensive README with examples for every feature
- Must use `'use client'` directive on all React/Next.js components
- Must include a working Next.js example app that exercises all major features

### Must Not
- Must not use CDN script tags or dynamic script injection
- Must not access `window` or `document` without SSR guards
- Must not call SDK configuration methods after `initialize()`
- Must not use the `@gameanalytics/` scoped package name (reserved for official packages)
- Must not require React for the core vanilla JS client
- Must not support multi-instance (not needed)
- Must not use em dashes in documentation or comments

### Out of Scope
- React Native support
- Multi-instance SDK support (multiple game keys)
- Server-side event tracking (Node.js)
- Migration tooling from old script snippet
- Documentation website (README is sufficient for v1)
- Storybook or interactive component demos

## Current State

No package exists. Starting from scratch. The official `gameanalytics` NPM package is available at https://www.npmjs.com/package/gameanalytics and provides the underlying SDK. All research, architecture decisions, API design, type definitions, and the CLAUDE.md are complete and ready for implementation.

## Tasks

### T1: Project scaffolding
**What:** Initialize the project with package.json, tsconfig, tsup config, vitest config, and the directory structure. Set up subpath exports, peer dependencies, and build scripts.
**Files:**
- `CREATE package.json` - name, exports, dependencies, peerDependencies, scripts
- `CREATE tsconfig.json` - strict mode, JSX, path aliases
- `CREATE tsup.config.ts` - 3 entry points (core, react, next), ESM + CJS + dts
- `CREATE vitest.config.ts` - test setup
- `CREATE src/core/index.ts` - empty barrel export
- `CREATE src/react/index.ts` - empty barrel export
- `CREATE src/next/index.ts` - empty barrel export
- `CREATE .gitignore`
- `CREATE LICENSE` - MIT

**Verify:**
- `npm install` succeeds
- `npx tsup` builds without errors and produces `dist/core/`, `dist/react/`, `dist/next/`
- `npx tsc --noEmit` passes
- Subpath exports resolve correctly in a test consumer

---

### T2: TypeScript types
**What:** Define all TypeScript interfaces, types, and enums for the entire SDK surface. This is the foundation every other file imports from. Includes event params, config, plugin system, generic event typing, and enum mappings from string literals to SDK numeric values.
**Files:**
- `CREATE src/core/types.ts` - All types:
  - `GameAnalyticsConfig` (all config options including trackPageViews, customDimensions, etc.)
  - `BusinessEventParams`, `ResourceEventParams`, `ProgressionEventParams`, `DesignEventParams`, `ErrorEventParams`, `AdEventParams`
  - `ResourceFlowType`, `ProgressionStatus`, `ErrorSeverity`, `AdAction`, `AdType` (string literal unions)
  - `PageViewConfig` (prefix, excludePaths)
  - `GAPlugin`, `GAEvent` (plugin system)
  - `EventTypeMap`, `DefaultEventTypeMap`, `TypedEventMethod` (generic event typing)
  - `GameAnalyticsSDK<TEvents>` (full SDK interface)
  - Enum mapping objects: `RESOURCE_FLOW_MAP`, `PROGRESSION_STATUS_MAP`, `ERROR_SEVERITY_MAP`, `AD_ACTION_MAP`, `AD_TYPE_MAP`

**Verify:**
- `npx tsc --noEmit` passes with strict mode
- All 6 event param interfaces include optional `customFields?: Record<string, any>`
- All string-to-enum maps are exhaustive (no missing values)
- `GameAnalyticsSDK` interface includes every method from the API audit: 6 event methods, identity setters, session methods, remote config methods, plugin methods, lifecycle methods, state queries
- `GameAnalyticsConfig` includes every pre-init configuration option

---

### T3: Core client - lifecycle and configuration
**What:** Implement the `GameAnalyticsClient` singleton class with `init()`, `enable()`, `disable()`, `isInitialized()`, and all pre-init configuration calls. The `init()` method must call configuration methods in the correct order before calling `initialize()` on the official SDK. All methods must be SSR-safe.
**Files:**
- `CREATE src/core/client.ts` - `GameAnalyticsClient` class:
  - `init(config)` - calls all `configure*` and `setEnabled*` methods, then `initialize()`
  - `enable()` / `disable()` - wraps `setEnabledEventSubmission`
  - `isInitialized()` - wraps SDK's `isInitialized()`
  - SSR guard: `private get isBrowser()` check on every method
  - Singleton export: `export const ga = new GameAnalyticsClient()`
- `EDIT src/core/index.ts` - export `ga` singleton and re-export types

**Verify:**
- Importing `ga` from core and calling `ga.init()` in a browser environment calls the official SDK's configuration + initialize methods in order
- Calling any method in an SSR context (no `window`) does nothing and does not throw
- `ga.isInitialized()` returns `false` before init, `true` after
- `ga.enable()` and `ga.disable()` call `setEnabledEventSubmission` correctly
- Configuration methods are called BEFORE `initialize()` (verify call order)

---

### T4: Core client - event methods
**What:** Implement all 6 event tracking methods on the client. Each method maps our typed params object to the official SDK's positional arguments and converts string literal enums to numeric values.
**Files:**
- `CREATE src/core/events.ts` - helper functions:
  - `mapResourceFlowType(flowType: ResourceFlowType): number`
  - `mapProgressionStatus(status: ProgressionStatus): number`
  - `mapErrorSeverity(severity: ErrorSeverity): number`
  - `mapAdAction(adAction: AdAction): number`
  - `mapAdType(adType: AdType): number`
- `EDIT src/core/client.ts` - add methods to `GameAnalyticsClient`:
  - `addBusinessEvent(params: BusinessEventParams)` - e.g., subscription upgrades, addon purchases
  - `addResourceEvent(params: ResourceEventParams)` - e.g., credit usage, token consumption
  - `addProgressionEvent(params: ProgressionEventParams)` - e.g., onboarding steps, checkout flow
  - `addDesignEvent(params: DesignEventParams)` - e.g., UI interactions, feature usage
  - `addErrorEvent(params: ErrorEventParams)` - e.g., API failures, caught exceptions
  - `addAdEvent(params: AdEventParams)` - e.g., ad impressions on content platforms

**Verify:**
- Each method maps params to the correct positional args for the official SDK
- String enums are mapped correctly (e.g., `'source'` becomes the correct numeric value)
- `customFields` is passed as the last argument when present, omitted when not
- Optional params (like `cartType`, `progression02`, `score`, `value`) are handled correctly
- All methods are SSR-safe and no-op before `init()` is called

---

### T5: Core client - identity and runtime setters
**What:** Implement identity management and runtime setter methods.
**Files:**
- `CREATE src/core/identity.ts` - helper logic if needed
- `EDIT src/core/client.ts` - add methods:
  - `setUserId(id: string)` - e.g., set after Supabase/Clerk auth resolves
  - `setBuild(version: string)` - e.g., app release version
  - `setCustomDimension01(value: string)` - e.g., user's plan tier
  - `setCustomDimension02(value: string)` - e.g., user's region
  - `setCustomDimension03(value: string)` - e.g., user's device type
  - `setGlobalCustomEventFields(fields: Record<string, any>)` - e.g., orgId, appVersion

**Verify:**
- `setUserId` calls `configureUserId` on the official SDK
- `setBuild` calls `configureBuild`
- Each `setCustomDimension` calls the corresponding SDK method
- `setGlobalCustomEventFields` passes through correctly
- All methods are SSR-safe

---

### T6: Core client - session management
**What:** Implement manual session handling.
**Files:**
- `CREATE src/core/session.ts` - if any session helpers are needed
- `EDIT src/core/client.ts` - add methods:
  - `startSession()`
  - `endSession()`
- `EDIT src/core/types.ts` - ensure `manualSessionHandling` is in `GameAnalyticsConfig`

**Verify:**
- `startSession()` and `endSession()` call the official SDK methods
- `manualSessionHandling: true` in config calls `setManualSessionHandling(true)` before init
- Both methods are SSR-safe and no-op if not initialized

---

### T7: Core client - remote configs and A/B testing
**What:** Implement remote config retrieval, listeners, and A/B testing ID methods. Useful for feature flags, dynamic copy, and experiment variants.
**Files:**
- `CREATE src/core/remote-configs.ts` - listener management logic
- `EDIT src/core/client.ts` - add methods:
  - `isRemoteConfigsReady(): boolean`
  - `getRemoteConfig(key: string, defaultValue?: string): string | null` - e.g., `getRemoteConfig('cta_text', 'Get Started')`
  - `getAllRemoteConfigs(): string`
  - `onRemoteConfigsReady(callback: () => void): () => void` (returns cleanup fn)
  - `getABTestingId(): string`
  - `getABTestingVariantId(): string`

**Verify:**
- `getRemoteConfig` wraps `getRemoteConfigsValueAsString`
- `getAllRemoteConfigs` wraps `getRemoteConfigsContentAsString`
- `onRemoteConfigsReady` calls `addRemoteConfigsListener` and returns a function that calls `removeRemoteConfigsListener`
- A/B testing ID methods return strings from the SDK
- All methods are SSR-safe (return sensible defaults: `false`, `null`, `''`)

---

### T8: Core client - plugin system
**What:** Implement the plugin pipeline. Events pass through enrichment plugins before dispatch and are forwarded to destination plugins after dispatch.
**Files:**
- `CREATE src/core/plugins.ts` - `PluginManager` class:
  - `add(plugin: GAPlugin)`
  - `remove(name: string)`
  - `execute(event: GAEvent): Promise<GAEvent | null>` - runs enrichment pipeline
  - `forward(event: GAEvent)` - sends to destination plugins
  - `setup(config)` / `teardown()`
- `EDIT src/core/client.ts` - integrate plugin manager:
  - `addPlugin(plugin: GAPlugin)`
  - `removePlugin(name: string)`
  - Each event method runs through plugin pipeline before dispatching to SDK

**Verify:**
- Enrichment plugins can modify events (returned modified event is used)
- Enrichment plugins can drop events (returning `null` skips dispatch)
- Multiple enrichment plugins execute in order of addition
- Destination plugins receive events after SDK dispatch
- Plugin `setup()` is called on add, `teardown()` on remove
- Removing a plugin by name works correctly

---

### T9: Core client - page tracking utility
**What:** Implement the pathname-to-design-event conversion utility and path exclusion logic. This is framework-agnostic; the React/Next layers call it.
**Files:**
- `CREATE src/core/page-tracking.ts`:
  - `pathnameToEventId(pathname: string, prefix?: string): string` - splits path into up to 5 colon-separated levels
  - `shouldTrackPath(pathname: string, excludePaths: string[]): boolean` - glob matching for exclusions

**Verify:**
- `/` maps to `pageView:root`
- `/dashboard` maps to `pageView:dashboard`
- `/dashboard/analytics` maps to `pageView:dashboard:analytics`
- `/settings/billing/invoices/2024` maps to `pageView:settings:billing:invoices:2024` (5 levels, max)
- `/a/b/c/d/e/f` maps to `pageView:a:b:c:d-e-f` (overflow joined with hyphens)
- Custom prefix: `/dashboard` with prefix `nav` maps to `nav:dashboard`
- `shouldTrackPath('/admin/settings', ['/admin/*'])` returns `false`
- `shouldTrackPath('/dashboard', ['/admin/*'])` returns `true`
- `shouldTrackPath('/login', ['/login'])` returns `false` (exact match)
- `shouldTrackPath('/api/webhooks', ['/api/*'])` returns `false`

---

### T10: Core - final exports and vanilla JS API
**What:** Wire up all barrel exports from `src/core/index.ts` so the root import path provides the complete vanilla JS API surface.
**Files:**
- `EDIT src/core/index.ts` - export:
  - `ga` singleton (named export)
  - All public methods from `ga` as top-level named exports (`init`, `addBusinessEvent`, etc.) for `import * as ga from 'react-gameanalytics'` usage
  - All types
  - Built-in plugins (`DebugPlugin`, `ConsentPlugin`) if implemented, otherwise defer to T15

**Verify:**
- `import * as ga from 'react-gameanalytics'` resolves and provides `ga.init()`, all event methods, identity methods, session methods, remote config methods
- `import { GameAnalyticsConfig, BusinessEventParams, ... } from 'react-gameanalytics'` exports all types
- `npx tsup` builds the core entry point without errors
- `npx tsc --noEmit` passes

---

### T11: React Provider
**What:** Implement the `GameAnalyticsProvider` component that initializes the SDK, manages reactive `userId`, handles `enabled` toggling, and provides the client via React Context.
**Files:**
- `CREATE src/react/provider.tsx`:
  - `GameAnalyticsContext` - React Context holding the client
  - `GameAnalyticsProvider` component:
    - Calls `ga.init(config)` in a `useEffect` on mount
    - Watches `userId` prop with `useEffect`, calls `ga.setUserId()` on change (supports any auth provider: Supabase, Clerk, Firebase, etc.)
    - Watches `enabled` prop, calls `ga.enable()` / `ga.disable()`
    - Watches `customDimension01/02/03` props if provided
    - `'use client'` directive at top
  - Props: all of `GameAnalyticsConfig` plus `children`

**Verify:**
- Provider initializes SDK on mount (client-side only)
- Changing `userId` prop calls `configureUserId` / `setUserId`
- Setting `enabled={false}` calls `disable()`, switching to `true` calls `enable()`
- SSR: no `window` access during server render
- Error thrown if `useGameAnalytics()` is called outside Provider

---

### T12: React hooks
**What:** Implement `useGameAnalytics`, `useRemoteConfig`, and `useTrackPageView` hooks.
**Files:**
- `CREATE src/react/hooks.ts`:
  - `useGameAnalytics<TEvents?>()` - returns the client from Context with typed methods
  - `useRemoteConfig(key, defaultValue?)` - subscribes to remote config updates, returns current value. Useful for dynamic UI copy, feature flags, pricing experiments.
  - `useTrackPageView(pathname)` - fires a design event when pathname changes
- `EDIT src/react/index.ts` - export Provider, all hooks, re-export core types

**Verify:**
- `useGameAnalytics()` returns the client with all methods
- `useGameAnalytics()` throws if used outside Provider
- Generic typing: `useGameAnalytics<MyEvents>()` constrains event method signatures
- `useRemoteConfig` returns the current value and re-renders when configs update
- `useTrackPageView` fires a design event on pathname change using `pathnameToEventId`
- All hooks have `'use client'` compatible usage

---

### T13: Next.js Provider
**What:** Implement the Next.js-specific Provider that wraps the React Provider and adds `'use client'` boundary and page tracking integration.
**Files:**
- `CREATE src/next/provider.tsx`:
  - Wraps `GameAnalyticsProvider` from `../react`
  - `'use client'` directive
  - If `trackPageViews` is enabled, mounts a `<PageTracker />` renderless component
  - Accepts same props as React Provider plus `trackPageViews`

**Verify:**
- Provider works in Next.js App Router (`app/layout.tsx`)
- Provider works in Next.js Pages Router (`pages/_app.tsx`)
- `'use client'` boundary is present
- Without `trackPageViews`, no page tracking component is mounted

---

### T14: Next.js page tracker
**What:** Implement automatic page view tracking for both Next.js App Router and Pages Router. Tracks navigations across pages like `/dashboard`, `/settings/billing`, `/reports/monthly`.
**Files:**
- `CREATE src/next/page-tracker.tsx`:
  - `AppRouterPageTracker` - uses `usePathname()` from `next/navigation`
  - `PagesRouterPageTracker` - uses `useRouter()` from `next/router` with `router.events`
  - Both use `pathnameToEventId` and `shouldTrackPath` from core
  - Auto-detects which router is available
- `EDIT src/next/index.ts` - export Next.js Provider, re-export all hooks from `../react`, re-export core types

**Verify:**
- App Router: navigating between routes (e.g., `/dashboard` to `/settings/billing`) fires design events with correct hierarchical eventIds
- Pages Router: `routeChangeComplete` fires design events
- `excludePaths` config is respected (e.g., `/api/*` and `/admin/*` paths don't fire events)
- Custom `prefix` is used in the eventId
- Initial page load is tracked
- Path overflow (>4 segments) is joined correctly

---

### T15: Built-in plugins
**What:** Implement `DebugPlugin` and `ConsentPlugin` as built-in convenience plugins.
**Files:**
- `CREATE src/core/plugins/debug-plugin.ts`:
  - Logs all events to `console.log` / `console.table`
  - `verbose` option for detailed output including timestamps and params
- `CREATE src/core/plugins/consent-plugin.ts`:
  - Blocks all events until `grant()` is called (for GDPR/cookie consent flows)
  - `revoke()` blocks events again
  - `queueUntilConsent` option (default: false, events are dropped, not queued)
- `EDIT src/core/index.ts` - export both plugins

**Verify:**
- `DebugPlugin`: events appear in console with type, params, and timestamp
- `DebugPlugin` with `verbose: true` logs additional detail
- `ConsentPlugin`: events are dropped before `grant()` is called
- `ConsentPlugin.grant()` allows events through
- `ConsentPlugin.revoke()` blocks events again
- With `queueUntilConsent: true`, events fired before consent are dispatched on `grant()`

---

### T16: Tests
**What:** Write the test suite covering all critical paths. Mock the official `gameanalytics` module.
**Files:**
- `CREATE src/__tests__/client.test.ts` - core client tests:
  - Init calls SDK methods in correct order
  - All 6 event methods map params correctly (e.g., business event for a subscription, progression event for onboarding flow)
  - SSR safety (no errors without `window`)
  - Enable/disable toggling
  - Identity setters
- `CREATE src/__tests__/events.test.ts` - enum mapping tests:
  - Every string literal maps to correct numeric value
  - Invalid values are handled gracefully
- `CREATE src/__tests__/page-tracking.test.ts` - page tracking utility tests:
  - All pathname-to-eventId conversions from T9 verify criteria (using web app paths like `/dashboard/analytics`, `/settings/billing`)
  - Exclusion path matching (e.g., `/api/*`, `/admin/*`)
- `CREATE src/__tests__/plugins.test.ts` - plugin system tests:
  - Enrichment modification and filtering
  - Destination forwarding
  - Plugin lifecycle (setup, teardown)
- `CREATE src/__tests__/provider.test.tsx` - React Provider tests:
  - Initializes on mount
  - userId reactivity (simulating auth state changes)
  - Enabled toggle (simulating consent)
  - Hook throws outside Provider
- `CREATE src/__tests__/setup.ts` - test setup, SDK mocks

**Verify:**
- `npx vitest run` passes all tests
- No test accesses `window` without proper mocking
- Official `gameanalytics` module is fully mocked (no real SDK calls in tests)

---

### T17: README
**What:** Write the comprehensive README.md with full documentation. All examples should use web app contexts: SaaS subscriptions, e-commerce checkouts, user onboarding, dashboard interactions, API usage tracking, content platforms, etc.
**Files:**
- `CREATE README.md` (use the README already drafted as the basis, verify it reflects all final implementations)

**Verify:**
- Every public method has at least one usage example using web app context
- Quick start examples for: Next.js App Router, Next.js Pages Router, Vite + React, Remix, Gatsby, Vue, Svelte, vanilla JS
- All 6 event types documented with web-focused param descriptions and examples
- Provider props fully documented
- Page tracking config documented with web app path mapping table (e.g., `/dashboard/analytics`, `/settings/billing`)
- Remote configs and A/B testing documented with web app examples (e.g., CTA text, pricing banners)
- Typed events section with web app generic example (subscription tiers, onboarding flows)
- Plugin system documented with web-relevant custom plugin example (e.g., org context enrichment)
- Environment variables table
- TypeScript imports section listing all exported types

---

### T18: Final build and publish prep
**What:** Ensure the full build pipeline works, all exports resolve, and the package is ready for `npm publish`.
**Files:**
- `EDIT package.json` - verify all fields: name, version, description, keywords, license, exports, files, repository
- `CREATE .npmignore` - exclude src, tests, config files, examples/ from published package
- Verify `dist/` output structure

**Verify:**
- `npm run build` (tsup) completes without errors
- `npx tsc --noEmit` passes
- `npx vitest run` passes all tests
- `npm pack` produces a tarball with correct contents (dist/, README, LICENSE, package.json)
- Subpath imports resolve: `react-gameanalytics`, `react-gameanalytics/react`, `react-gameanalytics/next`
- No `src/`, test files, or `examples/` in the published package
- Package size is reasonable (<100KB excluding gameanalytics dependency)

---

### T19: Example Next.js application
**What:** Create a working Next.js App Router application in `examples/nextjs/` that imports the local package and exercises all major features. This serves as both an integration test and a usage reference. The app simulates a simple SaaS dashboard with multiple pages, user auth simulation, and event tracking throughout. It links to the local package via a relative path so changes to the library are immediately testable.
**Files:**
- `CREATE examples/nextjs/package.json` - Next.js 14+, React 18+, TypeScript, dependency on `"react-gameanalytics": "file:../../"`
- `CREATE examples/nextjs/tsconfig.json`
- `CREATE examples/nextjs/next.config.js`
- `CREATE examples/nextjs/.env.local.example` - template with `NEXT_PUBLIC_GA_GAME_KEY` and `NEXT_PUBLIC_GA_SECRET_KEY`
- `CREATE examples/nextjs/app/layout.tsx` - Root layout with `GameAnalyticsProvider` from `react-gameanalytics/next`:
  - `userId` wired to a simulated auth state
  - `trackPageViews` enabled with `excludePaths: ['/api/*']`
  - `debug: true`
  - Custom dimensions: `dimension01: ['free', 'pro', 'enterprise']`
- `CREATE examples/nextjs/app/page.tsx` - Landing/home page:
  - Button that fires a design event (`ui:cta:hero_clicked`)
  - Displays current `userId` and tracking status
- `CREATE examples/nextjs/app/dashboard/page.tsx` - Dashboard page:
  - Button that fires a business event (simulated subscription upgrade)
  - Button that fires a resource event (simulated credit spend)
  - Shows navigation to other pages to demonstrate page tracking
- `CREATE examples/nextjs/app/dashboard/analytics/page.tsx` - Analytics sub-page:
  - Fires a design event on mount (`feature:analytics:viewed`)
  - Demonstrates the 3-level page view hierarchy (`pageView:dashboard:analytics`)
- `CREATE examples/nextjs/app/settings/page.tsx` - Settings page:
  - Button to simulate changing custom dimension (plan tier switch)
  - Button to simulate setting global custom event fields (orgId)
- `CREATE examples/nextjs/app/onboarding/page.tsx` - Onboarding flow:
  - Multi-step form with progression events (`start`, `complete`, `fail`)
  - Step 1: profile setup, Step 2: team invite, Step 3: integration connect
  - Each step fires the appropriate progression event with the step as `progression02`
- `CREATE examples/nextjs/app/components/AuthSimulator.tsx` - Client component:
  - Toggle button to simulate login/logout
  - Uses React state to set/unset a fake userId
  - Passed up to layout via context or state management
  - Demonstrates reactive `userId` prop on Provider
- `CREATE examples/nextjs/app/components/ConsentBanner.tsx` - Client component:
  - Simple banner with Accept/Decline buttons
  - Demonstrates the `enabled` prop toggling
- `CREATE examples/nextjs/app/components/EventLog.tsx` - Client component:
  - Uses the `DebugPlugin` to capture and display fired events in-browser
  - Shows a live log of all events with type, eventId/params, and timestamp
  - Useful for visual verification during development and testing
- `CREATE examples/nextjs/app/components/Nav.tsx` - Navigation:
  - Links to all pages (Home, Dashboard, Dashboard/Analytics, Settings, Onboarding)
  - Demonstrates that page tracking fires on each navigation
- `CREATE examples/nextjs/README.md` - How to run the example:
  - `cd examples/nextjs && npm install && npm run dev`
  - Explains the `.env.local` setup
  - Lists what each page demonstrates

**Verify:**
- `cd examples/nextjs && npm install` succeeds (resolves local package via `file:../../`)
- `npm run dev` starts the Next.js dev server without errors
- `npm run build` completes without errors (SSR safety confirmed)
- Navigating between pages fires page view design events visible in the EventLog component
- Clicking the upgrade button on `/dashboard` fires a business event
- Clicking the spend credits button fires a resource event
- Walking through `/onboarding` steps fires progression events (start, complete)
- Toggling the auth simulator changes `userId` and the Provider re-configures it
- Toggling the consent banner enables/disables event submission
- Custom dimension changes on `/settings` are reflected in subsequent events
- The EventLog component shows all fired events with correct types and params
- No console errors related to SSR or hydration mismatches

## Validation

The implementation is complete when:

1. **Build**: `npx tsup` produces `dist/core/`, `dist/react/`, `dist/next/` with `.mjs`, `.cjs`, and `.d.ts` files for each
2. **Types**: `npx tsc --noEmit` passes with zero errors in strict mode
3. **Tests**: `npx vitest run` passes all test suites with no failures
4. **SDK coverage**: Every method listed in the CLAUDE.md API audit table has a corresponding implementation and at least one test
5. **SSR safety**: Importing and calling any method in a Node.js environment (no `window`) does not throw
6. **React Provider**: Mounts in a React 18 app, initializes SDK, and `useGameAnalytics()` returns a working client
7. **Next.js**: Provider works in both App Router (`app/layout.tsx`) and Pages Router (`pages/_app.tsx`) contexts
8. **Page tracking**: Enabling `trackPageViews` fires correctly formatted design events on route changes with web app paths
9. **Events**: All 6 event types can be tracked through the hook with correct params passed to the official SDK
10. **Identity**: Changing `userId` prop on Provider (e.g., after Supabase auth) updates the SDK's configured user ID
11. **Plugins**: A custom enrichment plugin can modify events, and returning `null` drops them
12. **Package**: `npm pack` produces a publishable tarball with correct exports and no source files
13. **Example app**: `cd examples/nextjs && npm install && npm run build` succeeds. `npm run dev` starts and all pages render without errors. All event types are exercised and visible in the EventLog component.
