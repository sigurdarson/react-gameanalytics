# Vanilla JS Example

Demonstrates the core `react-gameanalytics` package without React. Uses only the framework-agnostic client.

## Setup

```bash
# From repo root, build the library first
npm run build

# Then install and run
cd examples/vanilla
npm install
npm run dev
```

## What it covers

- SDK initialization with `init()`
- Enable/disable toggling
- All 6 event types: design, business, resource, progression, error, ad
- Identity management (userId, custom dimensions)
- Plugin system (event log via enrichment plugin)

## Import path

This example imports from the root package:

```ts
import { init, addDesignEvent, ... } from 'react-gameanalytics'
```

No React or Next.js dependencies are needed.
