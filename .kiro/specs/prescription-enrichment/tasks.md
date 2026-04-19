# Implementation Plan: prescription-enrichment

## Overview

Three targeted improvements implemented in dependency order: types and shared infrastructure first, then client-side hooks and server-side logic, then UI components, then wiring everything together. Each task builds directly on the previous one. Sanity checks are included as sub-tasks where a quick manual API call or app interaction can confirm the implementation is working before moving on.

## Tasks

- [ ] 1. Add TypeScript types
  - [ ] 1.1 Create `types/rximage.ts` with `RxImageEntry` and `RxImageApiResponse` interfaces as specified in the design
    - `RxImageEntry`: `{ imageUrl: string; name: string; ndc11: string; rxcui: string }`
    - `RxImageApiResponse`: `{ nlmRxImages: RxImageEntry[]; replyStatus: { success: boolean; matchCount: number } }`
    - _Requirements: 2.1, 2.2_
  - [ ] 1.2 Re-export the new types from `types/index.ts`
    - Add `export type { RxImageEntry, RxImageApiResponse } from './rximage'`
    - _Requirements: 2.1_
  - [ ] 1.3 Add `allergies: string[]` field to `FamilyProfile` interface in `types/family.ts`
    - Default is `[]` (matches DB column default `{}`)
    - _Requirements: 3.1, 4.1, 5.2_
  - [ ] 1.4 Update `rowToProfile` in `services/family.service.ts` to map the `allergies` column
    - Add `allergies` to the `ProfileRow` type and include it in the `rowToProfile` return value (default to `[]` if null)
    - _Requirements: 4.1_

- [ ] 2. Camera capture shortcut
  - [ ] 2.1 Add `capture="environment"` to the photo `<input>` in `components/features/upload/UploadPicker.tsx`
    - The input already has `accept="image/jpeg,image/png,image/webp,image/*"` and `onChange={handleFileChange}` — add `capture="environment"` alongside those attributes
    - Do not change the PDF input or the manual entry form
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [ ] 2.2 Sanity check — open the upload flow on a mobile device (or Chrome DevTools mobile emulation), tap "Upload a Photo", and confirm the rear camera opens directly instead of the file picker

- [ ] 3. `useRxImage` hook
  - [ ] 3.1 Create `hooks/useRxImage.ts` implementing the module-scope cache and inflight deduplication described in the design
    - Module-scope `rxImageCache: Map<string, string | null>` and `rxImageInflight: Map<string, Promise<string | null>>`
    - Normalise key: `name.toLowerCase().trim()`
    - Apply a 5-second `AbortController` timeout to each fetch
    - On any error (network, non-2xx, JSON parse, missing `nlmRxImages`): store `null` in cache, return `{ imageUrl: null, loading: false, error: true }`
    - Return type: `{ imageUrl: string | null; loading: boolean; error: boolean }`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6_
  - [ ] 3.2 Sanity check — in a browser console or a temporary `useEffect`, call `fetch('https://rximage.nlm.nih.gov/api/rximage/1/rxnav?name=metformin')` and confirm the response contains an `nlmRxImages` array with at least one entry that has an `imageUrl`

- [ ] 4. `RxImageSlot` component
  - [ ] 4.1 Create `components/features/upload/RxImageSlot.tsx`
    - Props: `{ medicineName: string; width?: number; height?: number; className?: string }` (defaults: `width=88`, `height=100`)
    - Uses `useRxImage(medicineName)` internally
    - Three render states:
      - **Loading**: `<div>` with `bg-surface-subtle animate-pulse rounded-2xl` at the specified dimensions
      - **Loaded**: `<img src={imageUrl} alt={medicineName} style={{ objectFit: 'cover' }} className="rounded-2xl w-full h-full" />`
      - **Fallback** (`imageUrl === null`): render `<MedicinePacket name={medicineName} dosage="" />` — import `MedicinePacket` as a named export from `MedicationCard.tsx` (see task 5.1)
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.7_

- [ ] 5. Export `MedicinePacket` from `MedicationCard`
  - [ ] 5.1 Add a named export for `MedicinePacket` in `components/features/explanation/MedicationCard.tsx`
    - Change `function MedicinePacket(...)` to `export function MedicinePacket(...)` so `RxImageSlot` can import it
    - No other changes to `MedicationCard` in this task
    - _Requirements: 2.3_

- [ ] 6. Wire `RxImageSlot` into `ReviewScreen` and `MedicationCard`
  - [ ] 6.1 Update `components/features/upload/ReviewScreen.tsx` to render `RxImageSlot` in each medicine card header
    - Import `RxImageSlot` from `./RxImageSlot`
    - In the medicine card header `<div>` (the one with `borderLeft: 3px solid ${accent}`), add `<RxImageSlot medicineName={medName} width={56} height={64} className="rounded-xl shrink-0" />` before the numbered circle, or place it as a leading visual — match the existing card layout
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  - [ ] 6.2 Update `components/features/explanation/MedicationCard.tsx` to replace the `<MedicinePacket>` render with `<RxImageSlot>`
    - Import `RxImageSlot` from `@/components/features/upload/RxImageSlot`
    - Replace `<MedicinePacket name={displayName} dosage={medication.dosage} />` with `<RxImageSlot medicineName={displayName} width={88} height={100} />`
    - Keep `MedicinePacket` defined and exported in this file (it is still used as the fallback inside `RxImageSlot`)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.7_
  - [ ] 6.3 Sanity check — open the explanation view for any saved prescription, expand a medication card, and confirm either a real drug-packaging photo or the illustrated `MedicinePacket` placeholder is shown (never a broken image or blank space)

- [ ] 7. Update `lib/explain.ts` to accept allergies
  - [ ] 7.1 Add optional `allergies?: string[]` parameter to `buildExplainPrompt(prescription, allergies?)`
    - When `allergies` is non-empty, append the allergy section to the prompt (see design for exact wording)
    - When `allergies` is `undefined`, `null`, or `[]`, the prompt is identical to the current output — no breaking change for existing callers
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [ ] 7.2 Add optional `allergies?: string[]` parameter to `generateExplanation(prescription, apiKey, allergies?)`
    - Pass `allergies` through to `buildExplainPrompt`
    - Existing callers that omit the parameter continue to work unchanged
    - _Requirements: 3.1, 3.4_
  - [ ] 7.3 Sanity check — call `buildExplainPrompt({ doctor: 'Dr. Test', illness: 'Hypertension', date: '2024-01-01', medications: [{ name: 'Amlodipine', dosage: '5mg', frequency: '1-0-0', duration: '30', confidence: 'high' }] }, ['penicillin', 'dairy'])` in a Node REPL or a quick test script and confirm the returned string contains both "penicillin" and "dairy"

- [ ] 8. Update `app/api/explain/route.ts` to read and pass allergies
  - [ ] 8.1 Extend the request body type to accept optional `profileId?: string`
    - Parse `profileId` from the request JSON alongside the existing `PrescriptionData` fields
    - _Requirements: 4.1, 4.2_
  - [ ] 8.2 When `profileId` is present, create an authenticated Supabase server client and query `family_profiles` for the `allergies` column where `id = profileId`
    - Use `supabase.from('family_profiles').select('allergies').eq('id', profileId).single()`
    - RLS enforces the caller can only read profiles in their family group
    - On query failure: `console.error` the error and proceed with `allergies = undefined`
    - _Requirements: 4.1, 4.3, 4.4_
  - [ ] 8.3 Pass the retrieved `allergies` array (or `undefined`) to `generateExplanation`
    - When `profileId` is absent (public upload flow), call `generateExplanation` without allergies — preserving existing behaviour
    - _Requirements: 4.2, 4.3_
  - [ ] 8.4 Sanity check — using a REST client (curl, Postman, or the browser fetch API), POST to `/api/explain` with a valid `profileId` for a profile that has allergies set in the DB, and confirm the returned explanation's `medications[0].avoid` field contains allergy-relevant content

- [ ] 9. Pass `profileId` from the upload flow to the explain API
  - [ ] 9.1 Locate where the upload flow calls `/api/explain` (in `app/(app)/dashboard/upload/[profileId]/actions.ts` or the page component) and add `profileId` to the request body
    - The `profileId` is already available in the route segment — pass it through to the fetch call
    - _Requirements: 4.1, 4.3_

- [ ] 10. `updateProfileAllergies` Server Action
  - [ ] 10.1 Create `app/(app)/settings/actions.ts` with the `updateProfileAllergies` Server Action
    - Signature: `async function updateProfileAllergies(profileId: string, allergies: string[]): Promise<{ error: string | null }>`
    - Auth check: `supabase.auth.getUser()` — return `{ error: 'Unauthorized' }` if no user
    - Membership check: verify a `profile_memberships` row exists for `(user_id, profileId)` — return `{ error: 'Forbidden' }` if not
    - Normalisation: trim whitespace, deduplicate case-insensitively (keep first occurrence, re-capitalise first letter for display), enforce max 20 entries (return `{ error: 'Maximum 20 allergies allowed' }` if exceeded after dedup)
    - Execute: `UPDATE family_profiles SET allergies = $1, updated_at = now() WHERE id = $2`
    - Return `{ error: null }` on success or `{ error: message }` on failure
    - _Requirements: 5.3, 5.4, 5.5, 5.6, 5.7_

- [ ] 11. `AllergyEditor` component
  - [ ] 11.1 Create `components/features/settings/AllergyEditor.tsx`
    - `'use client'` directive
    - Props: `{ profiles: Array<{ id: string; full_name: string; allergies: string[] }> }`
    - Internal state: `selectedProfileId` (default to first profile's id), `pendingInput: string`, `optimisticAllergies: string[]`, `error: string | null`, `saving: boolean`
    - Use `useTransition` + `useOptimistic` for optimistic updates (same pattern as other client components in the codebase)
    - Profile selector: render each profile's `full_name` as a selectable tab/chip; switching profile resets `optimisticAllergies` to that profile's `allergies`
    - Allergy tags: render each allergy as a removable tag with a button that has `aria-label="Remove {allergy}"`
    - Empty state: when `optimisticAllergies` is empty, show an `<EmptyState>` (from `@/components/ui`) with a prompt to add known allergies
    - Add input: `<Input label="Add allergy or food restriction" ...>` (from `@/components/ui`) with a confirm button; on confirm, call `updateProfileAllergies` and update optimistic state
    - Error display: show `error` below the input using `text-error` token; retain `pendingInput` on failure
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

- [ ] 12. Wire `AllergyEditor` into the Settings page
  - [ ] 12.1 Update `app/(app)/settings/page.tsx` to fetch profiles with allergies and render `AllergyEditor`
    - Add `allergies` to the Supabase select: `.select('id, full_name, allergies')`
    - Render `<AllergyEditor profiles={profiles} />` in a new "Health Profiles" section above the existing "Account" section, using the same section header pattern (`font-display text-[11px] font-bold text-text-muted uppercase tracking-widest`)
    - _Requirements: 5.1, 5.2_
  - [ ] 12.2 Sanity check — open the Settings page, select a profile, add an allergy (e.g. "penicillin"), and confirm it appears as a removable tag; then remove it and confirm it disappears; check the `family_profiles` row in Supabase to confirm the `allergies` column was updated correctly

- [ ] 13. Final checkpoint
  - Ensure the app builds without TypeScript errors (`next build` or `tsc --noEmit`)
  - Verify the full upload flow end-to-end: take a photo → review screen shows medicine images → AI explanation shows allergy-aware `avoid` field for a profile with allergies set
  - Ask the user if any questions arise before closing out

## Notes

- Tasks marked with `*` are optional — none in this plan since no automated tests are included per the feature brief
- Sanity checks are manual verification steps, not automated tests — run them in the browser or with a REST client
- `MedicinePacket` must be exported from `MedicationCard.tsx` (task 5.1) before `RxImageSlot` can import it (task 4.1) — keep this order
- The `allergies` field added to `FamilyProfile` (task 1.3) must be mapped in `rowToProfile` (task 1.4) before the Settings page select query (task 12.1) will have data to pass to `AllergyEditor`
- The explain API change (task 8) is backward-compatible — the public upload flow continues to work without `profileId`
