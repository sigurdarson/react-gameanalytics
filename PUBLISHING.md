# Publishing react-gameanalytics

This document covers versioning, building, and publishing the package to npm.

## Versioning

This project follows [Semantic Versioning](https://semver.org/):

- **PATCH** (`0.1.0` -> `0.1.1`): Bug fixes, documentation updates, internal refactors with no API changes
- **MINOR** (`0.1.0` -> `0.2.0`): New features, new event types, new hooks, new exports (backwards-compatible)
- **MAJOR** (`0.1.0` -> `1.0.0`): Breaking API changes, removed exports, changed method signatures, dropped React/Next.js version support

### Version bump commands

```bash
# Patch release (bug fixes)
npm version patch

# Minor release (new features)
npm version minor

# Major release (breaking changes)
npm version major

# Set a specific version
npm version 1.0.0

# Pre-release versions
npm version prepatch --preid=beta    # 0.1.1-beta.0
npm version preminor --preid=beta    # 0.2.0-beta.0
npm version premajor --preid=beta    # 1.0.0-beta.0
npm version prerelease --preid=beta  # Increment pre-release number
```

`npm version` automatically:
1. Updates `version` in `package.json`
2. Creates a git commit with message `v{version}`
3. Creates a git tag `v{version}`

## Pre-publish checklist

Run these before every publish:

```bash
# 1. Ensure clean working directory
git status

# 2. Type check
npx tsc --noEmit

# 3. Run tests
npx vitest run

# 4. Build all subpath exports
npx tsup

# 5. Verify the package contents
npm pack --dry-run

# 6. Test with examples (optional but recommended)
cd examples/nextjs && npm install && npm run build && cd ../..
cd examples/react-vite && npm install && npm run build && cd ../..
cd examples/vanilla && npm install && npm run build && cd ../..
```

## Publishing to npm

```bash
# First time: login to npm
npm login

# Publish (runs prepublishOnly which triggers build automatically)
npm publish

# Publish a pre-release with a dist tag
npm publish --tag beta

# Publish with public access (if scoped package)
npm publish --access public
```

## Full release workflow

```bash
# 1. Make sure you're on main and up to date
git checkout main
git pull

# 2. Run all checks
npx tsc --noEmit
npx vitest run
npx tsup

# 3. Bump version (choose one)
npm version patch   # or minor, or major

# 4. Push commit and tag
git push
git push --tags

# 5. Publish
npm publish
```

## For agents: how to bump the version

When making changes that require a version bump, follow this decision tree:

1. **Did you fix a bug without changing any public API?** -> `npm version patch`
2. **Did you add new exports, hooks, methods, or config options?** -> `npm version minor`
3. **Did you rename, remove, or change the signature of any public API?** -> `npm version major`
4. **Is this an unstable pre-release?** -> `npm version prerelease --preid=beta`

After bumping, always:
- Verify the new version: `node -p "require('./package.json').version"`
- Run `npx tsc --noEmit && npx vitest run && npx tsup` to validate the build

### What counts as public API

Everything exported from these entry points:
- `react-gameanalytics` (core): `init`, `enable`, `disable`, all `add*Event` functions, identity setters, plugin system, type exports
- `react-gameanalytics/react`: `GameAnalyticsProvider`, `useGameAnalytics`, `useRemoteConfig`, `useTrackPageView`, type re-exports
- `react-gameanalytics/next`: `NextGameAnalyticsProvider`, `PageTracker`, re-exported hooks

### Examples of each version type

**Patch** (0.1.0 -> 0.1.1):
- Fix enum mapping for ad events
- Fix SSR guard in page tracking
- Update internal SDK call ordering
- Fix TypeScript types to match runtime behavior

**Minor** (0.1.0 -> 0.2.0):
- Add `useABTest` hook
- Add `onSessionStart`/`onSessionEnd` callbacks to provider
- Add new plugin type
- Support new event parameters added by SDK update

**Major** (0.x.x -> 1.0.0 or 1.x.x -> 2.0.0):
- Rename `addBusinessEvent` to `trackPurchase`
- Remove `useTrackPageView` in favor of automatic tracking
- Change `GameAnalyticsProvider` required props
- Drop React 18 support (require React 19+)
