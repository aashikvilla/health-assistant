# Design Document — prescription-enrichment

## Overview

This feature delivers three targeted improvements to the prescription upload and review experience in Vitae:

1. **Camera capture shortcut** — A one-line HTML attribute addition (`capture="environment"`) on the photo file input in `UploadPicker` so mobile browsers open the rear camera directly.
2. **Medicine product images via RxImage API** — Real drug-packaging photos fetched from the NLM RxImage API, displayed in `ReviewScreen` and `MedicationCard`, with the existing `MedicinePacket` SVG as fallback.
3. **Allergies in AI prompt + editor UI** — The existing `family_profiles.allergies text[]` column is wired into the explain pipeline and surfaced in a new `AllergyEditor` component on the Settings page.

No new database tables or columns are required. All changes are additive.

---

## Architecture

### Data Flow Diagram

```mermaid
flowchart TD
    subgraph Upload Flow
        UP[UploadPicker\ncapture=environment] -->|File| OCR[OCR API]
        OCR --> RS[ReviewScreen]
        RS -->|medicine name| RxHook[useRxImage hook]
        RxHook -->|cached fetch| RxAPI[RxImage API\nnlm.nih.gov]
        RxAPI -->|imageUrl| RS
        RS -->|PrescriptionData + profileId| ExplainAPI[/api/explain]
    end

    subgraph Explain API
        ExplainAPI -->|profileId| SupabaseRead[(family_profiles\n.allergies)]
        SupabaseRead -->|allergies[]| GenExp[generateExplanation\nlib/explain.ts]
        GenExp -->|prompt with allergies| Gemini[Gemini 2.5 Flash-Lite]
        Gemini -->|PrescriptionExplanation| ExplainAPI
    end

    subgraph Explanation View
        ExplainAPI -->|PrescriptionExplanation| MedCard[MedicationCard]
        MedCard -->|medicine name| RxHook2[useRxImage hook]
        RxHook2 -->|cached fetch| RxAPI
        RxAPI -->|imageUrl| MedCard
    end

    subgraph Settings
        SettingsPage[Settings Page] -->|profiles| AllergyEditor[AllergyEditor]
        AllergyEditor -->|updateAllergies SA| SupabaseWrite[(family_profiles\n.allergies)]
    end
```

### Session-Level RxImage Cache

The `useRxImage` hook uses a module-scope `Map<string, string | null>` as a session cache. Because the hook lives in a client component, the module is loaded once per browser session and the Map persists across re-renders and route navigations within the same tab. The cache key is the lowercased, trimmed medicine name. A `null` value means "fetched, no image found" — this prevents re-fetching for known misses.

```
Module scope:
  rxImageCache: Map<string, string | null>
  rxImageInflight: Map<string, Promise<string | null>>

useRxImage(name):
  1. normalise key = name.toLowerCase().trim()
  2. if cache.has(key) → return { imageUrl: cache.get(key), loading: false }
  3. if inflight.has(key) → await inflight.get(key), return result
  4. create fetch promise → store in inflight
  5. on resolve → store in cache, delete from inflight
  6. on error → store null in cache, delete from inflight
```

The inflight Map prevents duplicate concurrent requests for the same name (e.g. when `ReviewScreen` and `MedicationCard` both mount simultaneously with the same medicine).

---

## Components and Interfaces

### Modified Files

| File | Change |
|------|--------|
| `components/features/upload/UploadPicker.tsx` | Add `capture="environment"` to photo `<input>` |
| `components/features/upload/ReviewScreen.tsx` | Import and render `RxImageSlot` in each medicine card header |
| `components/features/explanation/MedicationCard.tsx` | Replace `MedicinePacket` with `RxImageSlot` (falls back to `MedicinePacket`) |
| `lib/explain.ts` | Add optional `allergies?: string[]` to `buildExplainPrompt` and `generateExplanation` |
| `app/api/explain/route.ts` | Accept optional `profileId` in request body; read allergies from Supabase |
| `app/(app)/settings/page.tsx` | Import and render `AllergyEditor` |

### New Files

| File | Purpose |
|------|---------|
| `hooks/useRxImage.ts` | Client hook — fetches and caches RxImage API responses |
| `components/features/upload/RxImageSlot.tsx` | Shared UI slot: skeleton → real photo → MedicinePacket fallback |
| `components/features/settings/AllergyEditor.tsx` | Profile allergy list + add/remove UI |
| `app/(app)/settings/actions.ts` | Server Action: `updateProfileAllergies` |
| `types/rximage.ts` | TypeScript types for RxImage API response |

### `useRxImage` Hook

```ts
// hooks/useRxImage.ts
'use client'

export interface UseRxImageResult {
  imageUrl: string | null  // null = no image (fallback to MedicinePacket)
  loading: boolean
  error: boolean
}

export function useRxImage(medicineName: string): UseRxImageResult
```

The hook is a pure client-side data-fetching hook. It never throws — errors are captured and result in `{ imageUrl: null, loading: false, error: true }`.

### `RxImageSlot` Component

```tsx
// components/features/upload/RxImageSlot.tsx
interface RxImageSlotProps {
  medicineName: string
  width?: number   // default 88
  height?: number  // default 100
  className?: string
}
```

Renders one of three states:
- **Loading**: animated skeleton `div` at the specified dimensions, using `bg-surface-subtle animate-pulse rounded-2xl`
- **Loaded**: `<img>` with `alt={medicineName}`, `object-fit: cover`, rounded corners matching `MedicinePacket`
- **Fallback**: `<MedicinePacket name={medicineName} dosage="" />` (existing component, unchanged)

`MedicinePacket` stays in `MedicationCard.tsx` — `RxImageSlot` imports it from there via a named export.

### `AllergyEditor` Component

```tsx
// components/features/settings/AllergyEditor.tsx
'use client'

interface AllergyEditorProps {
  profiles: Array<{ id: string; full_name: string; allergies: string[] }>
}
```

Internal state:
- `selectedProfileId: string` — which profile is being edited
- `pendingInput: string` — the text field value for a new allergy
- `optimisticAllergies: string[]` — local copy updated optimistically before Server Action resolves
- `error: string | null` — inline error from failed Server Action
- `saving: boolean`

The component uses `useTransition` + `useOptimistic` (React 19 / Next.js 15 patterns already in use in the codebase) for optimistic updates.

### `updateProfileAllergies` Server Action

```ts
// app/(app)/settings/actions.ts
'use server'

export async function updateProfileAllergies(
  profileId: string,
  allergies: string[]
): Promise<{ error: string | null }>
```

- Validates auth via `supabase.auth.getUser()`
- Verifies the caller has a `profile_memberships` row for `profileId` (defence-in-depth on top of RLS)
- Normalises: trims whitespace, lowercases for dedup check, re-capitalises first letter for display, enforces max 20 entries
- Executes `UPDATE family_profiles SET allergies = $1, updated_at = now() WHERE id = $2`
- Returns `{ error: null }` on success or `{ error: message }` on failure

### `lib/explain.ts` Changes

```ts
// Updated signatures
export function buildExplainPrompt(
  prescription: PrescriptionData,
  allergies?: string[]   // NEW — optional, no breaking change
): string

export async function generateExplanation(
  prescription: PrescriptionData,
  apiKey: string,
  allergies?: string[]   // NEW — optional, no breaking change
): Promise<PrescriptionExplanation | null>
```

When `allergies` is non-empty, the prompt gains an additional section:

```
Patient allergies and food restrictions: penicillin, dairy, NSAIDs

For each medication, populate the "avoid" field with:
- Any interactions with the listed allergies or food restrictions specific to this medicine
- Any general food/drink/activity contraindications for this medicine
If no interactions apply, still provide general avoidance guidance.
```

### `app/api/explain/route.ts` Changes

The request body type is extended:

```ts
interface ExplainRequestBody extends PrescriptionData {
  profileId?: string   // NEW — optional
}
```

When `profileId` is present:
1. Create authenticated Supabase client
2. Query `family_profiles` for `allergies` where `id = profileId`
3. RLS enforces the caller can only read profiles in their family group
4. Pass allergies to `generateExplanation`
5. On query failure: log error, proceed without allergies

### Settings Page Changes

The `SettingsPage` server component fetches profiles with their allergies:

```ts
// Additional select in settings/page.tsx
const { data: profiles } = await supabase
  .from('family_profiles')
  .select('id, full_name, allergies')
  // RLS returns only profiles in the user's family group
```

Then renders `<AllergyEditor profiles={profiles} />` in a new "Health Profiles" section above the existing "Account" section.

---

## Data Models

### TypeScript Type Changes

**`types/family.ts`** — add `allergies` to `FamilyProfile`:

```ts
export interface FamilyProfile {
  // ... existing fields ...
  allergies: string[]   // NEW — default [] from DB
}
```

**`types/rximage.ts`** — new file:

```ts
export interface RxImageEntry {
  imageUrl: string
  name: string
  ndc11: string
  rxcui: string
}

export interface RxImageApiResponse {
  nlmRxImages: RxImageEntry[]
  replyStatus: {
    success: boolean
    matchCount: number
  }
}
```

**`types/index.ts`** — re-export:

```ts
export type { RxImageEntry, RxImageApiResponse } from './rximage'
```

### No Database Changes

`family_profiles.allergies text[]` already exists with default `{}`. No migration required.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: File size validation rejects oversized files

*For any* file size in bytes, the upload validation logic SHALL reject files strictly greater than 6,291,456 bytes (6 MB) and accept files at or below that threshold, regardless of how the file was selected (camera capture or gallery).

**Validates: Requirements 1.3**

---

### Property 2: RxImage fetch URL encodes the medicine name

*For any* non-empty medicine name string, the URL constructed by `useRxImage` SHALL contain that name (URL-encoded) as the `name` query parameter sent to `https://rximage.nlm.nih.gov/api/rximage/1/rxnav`.

**Validates: Requirements 2.1**

---

### Property 3: First image is always selected from non-empty results

*For any* `RxImageApiResponse` where `nlmRxImages` is non-empty, the resolved `imageUrl` SHALL equal `nlmRxImages[0].imageUrl` — the first entry in the array.

**Validates: Requirements 2.2, 2.3**

---

### Property 4: Any fetch failure produces null image (no error surfaced)

*For any* error condition during the RxImage API fetch (network error, timeout, 4xx, 5xx, malformed JSON), `useRxImage` SHALL resolve to `{ imageUrl: null, loading: false }` and SHALL NOT propagate the error to the component tree.

**Validates: Requirements 2.4**

---

### Property 5: Session cache prevents duplicate network requests

*For any* medicine name, calling `useRxImage` N times (N ≥ 2) within the same browser session SHALL result in exactly one network request to the RxImage API for that name, with all subsequent calls reading from the in-memory cache.

**Validates: Requirements 2.6**

---

### Property 6: Rendered image always carries the medicine name as alt text

*For any* medicine name for which a real product image URL is resolved, the rendered `<img>` element SHALL have an `alt` attribute that contains the medicine name string.

**Validates: Requirements 2.7**

---

### Property 7: Non-empty allergies always appear in the built prompt

*For any* non-empty `allergies` string array passed to `buildExplainPrompt`, every allergy string in the array SHALL appear verbatim in the returned prompt string.

**Validates: Requirements 3.1, 3.2**

---

### Property 8: Empty or absent allergies produce no allergy injection in prompt

*For any* call to `buildExplainPrompt` where `allergies` is `undefined`, `null`, or an empty array, the returned prompt string SHALL be identical to the prompt produced by the pre-feature implementation (no allergy section injected).

**Validates: Requirements 3.3, 3.4**

---

### Property 9: All profile names appear in AllergyEditor

*For any* list of family profiles passed to `AllergyEditor`, every profile's `full_name` SHALL appear in the rendered output.

**Validates: Requirements 5.1**

---

### Property 10: All allergy tags for a profile appear as removable tags

*For any* profile with any `allergies` array, every allergy string in that array SHALL appear as a rendered, removable tag in the `AllergyEditor` when that profile is selected.

**Validates: Requirements 5.2**

---

### Property 11: Add/remove allergy round-trip correctness

*For any* valid allergy string added to a profile's allergy list, the string SHALL be present in the persisted `allergies` array. Conversely, *for any* allergy string removed from the list, it SHALL be absent from the persisted array.

**Validates: Requirements 5.3, 5.4**

---

### Property 12: Allergy normalisation deduplicates case-insensitively

*For any* pair of allergy strings that are equal after lowercasing and trimming whitespace, the `updateProfileAllergies` action SHALL store only one entry — not both.

**Validates: Requirements 5.7**

---

## Error Handling

### RxImage API Failures

All errors are silently swallowed by `useRxImage`. The hook catches:
- `fetch` network errors (no internet, DNS failure)
- HTTP responses with non-2xx status
- JSON parse errors on malformed responses
- Responses where `nlmRxImages` is missing or not an array

In all cases the hook returns `{ imageUrl: null, loading: false, error: true }` and `RxImageSlot` renders `MedicinePacket`. No toast, no error boundary, no console error in production.

A 5-second `AbortController` timeout is applied to each fetch to prevent indefinite loading skeletons on slow connections.

### Allergy Read Failure in Explain API

If the Supabase query for `family_profiles.allergies` fails:
1. The error is logged server-side via `console.error` (visible in Vercel logs)
2. `generateExplanation` is called with `allergies: undefined`
3. The response to the client is identical to a no-allergy request — no error is surfaced

This preserves the existing explain flow as the fallback.

### AllergyEditor Server Action Failure

If `updateProfileAllergies` returns `{ error: string }`:
1. The optimistic update is rolled back to the pre-action state
2. An inline error message is displayed below the input field using `text-error` token
3. The user's typed input is retained in `pendingInput` so they can retry without re-typing
4. The `saving` state is cleared so the UI is interactive again

### Backward Compatibility

`buildExplainPrompt` and `generateExplanation` are called from two places today:
- `app/api/explain/route.ts` — will be updated to pass allergies
- `app/(app)/explanation/[id]/page.tsx` — calls `generateExplanation` directly for on-demand re-generation; this caller does not pass allergies and will continue to work unchanged because the parameter is optional

---

## Testing Strategy

### Unit Tests

Focus on specific examples and edge cases:

- `buildExplainPrompt` with no allergies produces the same output as before (backward compat)
- `buildExplainPrompt` with allergies includes each allergy string in the output
- `updateProfileAllergies` normalisation: `"  Penicillin  "` → `"Penicillin"`, `"penicillin"` deduped against `"Penicillin"`
- `updateProfileAllergies` rejects arrays longer than 20 entries
- `RxImageSlot` renders skeleton when `loading: true`
- `RxImageSlot` renders `<img>` with correct `alt` when `imageUrl` is set
- `RxImageSlot` renders `MedicinePacket` when `imageUrl` is null
- `AllergyEditor` shows empty-state when `allergies` is `[]`
- `AllergyEditor` shows inline error and retains input when Server Action fails

### Property-Based Tests

Using **fast-check** (already a common choice in the TypeScript/Next.js ecosystem; install as `fast-check`). Each property test runs a minimum of 100 iterations.

**Tag format:** `// Feature: prescription-enrichment, Property {N}: {property_text}`

| Property | Generator | Assertion |
|----------|-----------|-----------|
| P1: File size validation | `fc.integer({ min: 0, max: 20_000_000 })` | `size > 6_291_456 → rejected; size ≤ 6_291_456 → accepted` |
| P2: RxImage URL encoding | `fc.string({ minLength: 1 })` (medicine names) | `fetchedUrl.includes(encodeURIComponent(name))` |
| P3: First image selected | `fc.array(fc.record({ imageUrl: fc.webUrl() }), { minLength: 1 })` | `result === arr[0].imageUrl` |
| P4: Fetch failure → null | `fc.oneof(networkError, httpError, malformedJson)` | `result.imageUrl === null && !result.loading` |
| P5: Cache deduplication | `fc.string({ minLength: 1 })`, `fc.integer({ min: 2, max: 10 })` (call count) | `fetchCallCount === 1` |
| P6: Alt text contains name | `fc.string({ minLength: 1 })` (medicine names) | `img.alt.includes(name)` |
| P7: Allergies in prompt | `fc.array(fc.string({ minLength: 1 }), { minLength: 1 })` | `allergies.every(a => prompt.includes(a))` |
| P8: No allergies → no injection | `fc.constantFrom(undefined, null, [])` | `prompt === buildExplainPrompt(prescription)` |
| P9: All profiles rendered | `fc.array(fc.record({ id: fc.uuid(), full_name: fc.string({ minLength: 1 }), allergies: fc.array(fc.string()) }), { minLength: 1 })` | `profiles.every(p => rendered.includes(p.full_name))` |
| P10: All allergy tags rendered | `fc.array(fc.string({ minLength: 1 }), { minLength: 1 })` | `allergies.every(a => rendered.includes(a))` |
| P11: Add/remove round-trip | `fc.string({ minLength: 1 })` (allergy to add/remove) | add: `result.includes(allergy)`; remove: `!result.includes(allergy)` |
| P12: Normalisation dedup | `fc.string({ minLength: 1 }).map(s => [s, s.toUpperCase(), '  ' + s + '  '])` | `result.length === 1` |

### Integration Tests

- POST `/api/explain` with a valid `profileId` → verify Supabase is queried for allergies (mock Supabase client)
- POST `/api/explain` without `profileId` → verify `generateExplanation` called with `allergies: undefined`
- POST `/api/explain` when Supabase query fails → verify explanation still returned (no 500)

### Accessibility

- `RxImageSlot` `<img>` must have non-empty `alt` (verified by P6 property test)
- `AllergyEditor` remove buttons must have `aria-label="Remove {allergy}"` (unit test)
- New allergy input must have an associated `<label>` (unit test)
- All interactive elements meet 44×44px touch target minimum (visual review)
