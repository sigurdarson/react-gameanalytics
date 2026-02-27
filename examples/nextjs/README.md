# Example: Next.js App

A working Next.js application that exercises all `react-gameanalytics` features. Used for integration testing and as a usage reference.

## Setup

```bash
# From the repo root, build the library first
npm install
npm run build

# Then set up the example
cd examples/nextjs
npm install
```

## Environment Variables

Copy the example env file and add your GameAnalytics keys:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_GA_GAME_KEY=your-game-key
NEXT_PUBLIC_GA_SECRET_KEY=your-secret-key
```

You can also run without real keys for development. The SDK will initialize but events won't reach the GA dashboard.

## Running

```bash
npm run dev       # Start dev server at http://localhost:3000
npm run build     # Production build (tests SSR safety)
```

## Pages

| Page | URL | Features |
|---|---|---|
| Home | `/` | Design events, auth simulator, consent banner |
| Dashboard | `/dashboard` | Business events (subscription upgrade), resource events (credit spend) |
| Analytics | `/dashboard/analytics` | Design event on mount, 3-level page view hierarchy |
| Settings | `/settings` | Custom dimension changes, global custom event fields |
| Onboarding | `/onboarding` | Progression events across a multi-step flow |

## Components

- **AuthSimulator** - Toggle login/logout to test reactive `userId` changes
- **ConsentBanner** - Toggle consent to test `enabled` prop (events stop/start)
- **EventLog** - Live display of all fired events using `DebugPlugin`
- **Nav** - Navigation links to test page view tracking

## What to Look For

- **EventLog panel** shows every event in real time with type, params, and timestamp
- **Page navigation** should produce `pageView:*` design events in the log
- **Auth toggle** should update the userId shown in the log header
- **Consent toggle** should stop/start events appearing in the log
- **No console errors** related to SSR or hydration mismatches
