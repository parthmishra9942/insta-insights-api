# Insta Insights

An Android-focused Instagram Analytics demo app built with Expo. Users paste an Instagram link, and the app simulates realistic analytics with editable stats, charts, and local history. Includes a license-key subscription system for 1-month and lifetime access.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080 in dev, proxied at `/api-server`)
- `pnpm --filter @workspace/insta-insights run dev` — run the Expo dev server
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/scripts run generate-licenses -- 1month 5` — generate five 1-month license keys
- `pnpm --filter @workspace/scripts run generate-licenses -- lifetime 3` — generate three lifetime license keys
- Required env: `DATABASE_URL` — Postgres connection string (managed by Replit)
- Required secret: `ADMIN_LICENSE_SECRET` — used to generate license keys

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo ~54, React Native 0.81, expo-router, React Native Reanimated, React Native Gesture Handler
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod, drizzle-zod (for DB table types only)
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (API server), `expo start` (mobile)

## Where things live

- Mobile app: `artifacts/insta-insights/`
  - Entry/layout: `app/_layout.tsx`
  - Tabs: `app/(tabs)/`
  - Insight dashboard: `app/insights/[id].tsx`
  - Shared state: `context/HistoryContext.tsx`, `context/LicenseContext.tsx`
  - UI components: `components/`
- API server: `artifacts/api-server/`
  - Routes: `src/routes/` (health, licenses)
  - Express app: `src/app.ts`
- DB schema: `lib/db/src/schema/`
- API contracts: `lib/api-spec/openapi.yaml` → generated to `lib/api-client-react/` and `lib/api-zod/`
- Admin/license scripts: `scripts/src/generate-licenses.ts`

## Architecture decisions

- License keys are single-use per device: activating a key binds it to the first device and stores an expiry date.
- 1-month keys expire 30 days after activation; lifetime keys never expire.
- The app stores the active license locally and checks expiry on every launch; it still calls the server to activate new keys.
- The mobile app points at the API server via `EXPO_PUBLIC_API_URL` in production, or falls back to the Replit dev domain artifact path `/api-server` during development.
- AsyncStorage persisted shapes are versioned and backfilled on load to avoid crashes after schema changes.

## Product

- Paste an Instagram link to simulate a full analytics dashboard.
- Edit any visible number, percentage, or label inline; percentages/counts auto-sort descending.
- Switch between Overview, Engagement, and Audience tabs.
- View and manage local analysis history.
- Export the latest analytics as text.
- Activate a license key to unlock the app (1-month or lifetime plans).

## User preferences

- Dark analytics theme (near-black surfaces, magenta/purple accent gradient).
- Android-first, built with Expo and tested via Expo Go / EAS Build.

## Gotchas

- The API server must be deployed and `EXPO_PUBLIC_API_URL` set before distributing a production APK.
- `ADMIN_LICENSE_SECRET` must be set before any license keys can be generated.
- `pnpm run typecheck` currently reports pre-existing errors in `artifacts/mockup-sandbox/` only; `api-server` and `insta-insights` typecheck cleanly.
- Always run `pnpm --filter @workspace/db run push` after changing `lib/db/src/schema/`.
- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `lib/api-spec/openapi.yaml`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
- See the `expo` skill for mobile build and deployment guidance.
