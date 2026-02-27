# React + Vite Example

Demonstrates `react-gameanalytics/react` with Vite and React Router.

## Setup

```bash
# From repo root, build the library first
npm run build

# Then install and run
cd examples/react-vite
npm install
npm run dev
```

## What it covers

| Route | Features |
|---|---|
| `/` | Design events, ad events, remote configs |
| `/dashboard` | Business events, resource events, error events |
| `/settings` | Custom dimensions, global custom event fields |
| `/onboarding` | Progression events (multi-step flow) |

Page view tracking uses `useTrackPageView` with React Router's `useLocation`.

## Environment variables

Optional. Create a `.env` file:

```
VITE_GA_GAME_KEY=your-game-key
VITE_GA_SECRET_KEY=your-secret-key
```

Falls back to `demo-key`/`demo-secret` if not set.
