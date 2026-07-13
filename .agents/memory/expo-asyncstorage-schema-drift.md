---
name: Expo AsyncStorage schema drift
description: Why old persisted records crashed the UI after adding fields to a stored data shape, and the fix pattern used.
---

When a demo/simulated-data app persists generated objects to AsyncStorage (or any client-side store) and later adds new fields to that data shape, records saved before the change are missing those fields. Rendering code that assumes the new shape (e.g. `data.newField.map(...)`) throws on load, which an ErrorBoundary surfaces as a generic "Something went wrong" crash screen — easy to misdiagnose as a UI bug when it's actually a stale-data bug.

**Why:** This bit an Instagram-Insights-clone Expo app: fields like `topSources`, `watchTimeCurve`, and a rates/profileVisits reshape were added across sessions, but links analyzed in earlier sessions and already saved to AsyncStorage kept the old shape. Opening one of those old links crashed the insights screen.

**How to apply:** On load, run each stored record through a `normalize`/`deepMerge` step against a freshly generated default of the same shape — recursively fill any `undefined` key in the stored record from the fresh default, keeping every value the stored record already has. Apply this any time a persisted data shape for demo/simulated data evolves; don't rely on "it worked in this session" since old device storage won't match.
