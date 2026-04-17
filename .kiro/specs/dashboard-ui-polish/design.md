# Dashboard UI Polish Bugfix Design

## Overview

Four UI polish bugs degrade the dashboard experience. Two live in `ActiveMedicationsStrip` (generic frequency badge noise and an uncapped medication list), one in `ReviewScreen` (duplicate medications pass through without a warning), and one in `dashboard/page.tsx` (all prescription records are rendered with no limit). The fixes are additive and minimal: a helper function, two slice operations, a conditional "View all" link, and a duplicate-detection pass with an inline warning banner. No data model changes are required.

---

## Glossary

- **Bug_Condition (C)**: The set of inputs or render states that trigger one of the four defects.
- **Property (P)**: The desired output or UI state when the bug condition holds  what the fixed code must produce.
- **Preservation**: Existing correct behaviour that must remain byte-for-byte identical after the fix.
- **`isGenericFrequency(value)`**: New helper in `ActiveMedicationsStrip.tsx` that returns `true` when a frequency string carries no useful clinical information.
- **`MAX_DISPLAY`**: Constant (`4`) capping the number of medication rows rendered in `ActiveMedicationsStrip`.
- **`DASHBOARD_RX_LIMIT`**: Constant (`3`) capping the number of prescription records rendered in `dashboard/page.tsx`.
- **`duplicateNames`**: A `Set<string>` computed inside `ReviewScreen` containing lowercased, trimmed medication names that appear more than once in the current list.
- **`removeMedication(i)`**: New handler in `ReviewScreen` that removes the medication at index `i` from `prescription.medications` via `setPrescription`.

---

## Bug Details

### Bug 1  Generic frequency strings in ActiveMedicationsStrip

The bug manifests when `med.duration` (mapped from the `frequency` column in the DB) holds a generic instruction string. The component renders it verbatim as a coloured badge, adding visual noise with no clinical value.

**Formal Specification:**
```
FUNCTION isBugCondition_1(med)
  INPUT: med of type Medication
  OUTPUT: boolean

  RETURN med.duration IS NOT NULL
         AND med.duration.trim() IS NOT EMPTY
         AND isGenericFrequency(med.duration) = true
END FUNCTION
```

**Examples:**
- `med.duration = "as directed"` → badge rendered (bug) / badge omitted (fixed)
- `med.duration = "As Prescribed"` → badge rendered (bug) / badge omitted (fixed)
- `med.duration = "per doctor"` → badge rendered (bug) / badge omitted (fixed)
- `med.duration = "twice daily"` → badge rendered correctly (not a bug case)
- `med.duration = ""` → no badge rendered (not a bug case  already handled)

---

### Bug 2  Medication list not capped in ActiveMedicationsStrip

The bug manifests when `medications.length > 4`. All items are rendered, making the strip arbitrarily long.

**Formal Specification:**
```
FUNCTION isBugCondition_2(medications)
  INPUT: medications of type Medication[]
  OUTPUT: boolean

  RETURN medications.length > MAX_DISPLAY   -- MAX_DISPLAY = 4
END FUNCTION
```

**Examples:**
- 6 medications → all 6 rows rendered, no "View all" link (bug) / 4 rows + "View all 6 →" link (fixed)
- 4 medications → all 4 rows rendered, no link (not a bug case)
- 1 medication → 1 row rendered, no link (not a bug case)

---

### Bug 3  Duplicate medications shown without warning in ReviewScreen

The bug manifests when OCR extracts the same medication name more than once. All entries are shown without any indication of the duplication.

**Formal Specification:**
```
FUNCTION isBugCondition_3(medications, index)
  INPUT: medications of type Medication[], index of type number
  OUTPUT: boolean

  name := medications[index].name.toLowerCase().trim()
  firstOccurrence := medications.findIndex(m => m.name.toLowerCase().trim() = name)

  RETURN firstOccurrence < index   -- i.e. this is a later duplicate
END FUNCTION
```

**Examples:**
- `["Paracetamol", "Ibuprofen", "Paracetamol"]` → index 2 is a duplicate; no warning shown (bug) / warning banner above card 2 (fixed)
- `["Paracetamol", "PARACETAMOL"]` → index 1 is a duplicate (case-insensitive); no warning (bug) / warning banner (fixed)
- `["Paracetamol", "Ibuprofen"]` → no duplicates; no warning (not a bug case)

---

### Bug 4  Prescriptions section renders all records with no limit

The bug manifests when `prescriptions.length > 3`. All records are rendered in the dashboard, making the page excessively long.

**Formal Specification:**
```
FUNCTION isBugCondition_4(prescriptions)
  INPUT: prescriptions of type Prescription[]
  OUTPUT: boolean

  RETURN prescriptions.length > DASHBOARD_RX_LIMIT   -- DASHBOARD_RX_LIMIT = 3
END FUNCTION
```

**Examples:**
- 5 prescriptions → all 5 rendered, "View all" link always visible (bug) / 3 rendered + "View all →" link (fixed)
- 3 prescriptions → all 3 rendered, no "View all" link (not a bug case)
- 0 prescriptions → empty state shown (not a bug case)

---

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- A medication with a specific, informative `duration` (e.g. "twice daily", "1-0-1", "after meals") MUST continue to render its frequency badge.
- A medication with an empty or null `duration` MUST continue to render without a badge.
- The "N active" badge in the `ActiveMedicationsStrip` card header MUST continue to show the total count from the full `medications` prop, not the capped slice.
- When `medications.length <= 4`, all items MUST continue to render with no "View all" link.
- When all medications in `ReviewScreen` have unique names, no warning banners MUST appear.
- Editing a medication field in `ReviewScreen` MUST continue to update local state immediately.
- Clicking "Yes, This Looks Right →" in `ReviewScreen` MUST continue to call `onConfirm` with the current prescription data.
- When `prescriptions.length <= 3`, all records MUST continue to render with no "View all →" link.
- When `prescriptions.length === 0`, the `EmptyPrescriptions` component MUST continue to render.
- The existing "View all" link in `dashboard/page.tsx` (currently shown whenever `!isEmpty`) MUST be replaced by the capped logic  it should only appear when `prescriptions.length > DASHBOARD_RX_LIMIT`.

**Scope:**
All inputs that do NOT satisfy any of the four bug conditions above are completely unaffected by these fixes. This includes:
- Mouse/touch interactions with prescription list items and action buttons
- Profile switching via `ProfileSectionWithEdit`
- Lab alert card rendering
- Upload CTA button
- Sign-out flow

---

## Hypothesized Root Cause

### Bug 1
The component renders `med.duration` unconditionally whenever it is truthy. There is no filter for semantically empty strings. The fix is a pure addition: a helper function and a conditional skip.

### Bug 2
The component maps over the full `medications` array with no slice. The fix adds a `MAX_DISPLAY` constant, slices the array before mapping, and appends a conditional link.

### Bug 3
`ReviewScreen` has no duplicate-detection logic. Each medication card is rendered independently with no cross-card awareness. The fix adds a pre-render pass to build `duplicateNames` and injects a warning banner for later occurrences.

### Bug 4
`dashboard/page.tsx` maps over the full `prescriptions` array. The existing "View all" link is gated on `!isEmpty` (i.e. any non-empty list), not on whether the list exceeds the cap. The fix adds `DASHBOARD_RX_LIMIT`, slices the array, and adjusts the "View all" condition.

---

## Correctness Properties

Property 1: Bug Condition  Generic Frequency Badge Suppression

_For any_ `Medication` where `med.duration` is a non-empty string and `isGenericFrequency(med.duration)` returns `true`, the fixed `ActiveMedicationsStrip` SHALL omit the frequency badge entirely for that medication row, rendering nothing in its place.

**Validates: Requirements 2.1**

Property 2: Bug Condition  Medication List Capped at 4

_For any_ `medications` array where `medications.length > 4`, the fixed `ActiveMedicationsStrip` SHALL render exactly 4 medication rows and SHALL render a "View all N →" link below the list (where N equals `medications.length`), while the "N active" header badge SHALL reflect the full total.

**Validates: Requirements 2.2**

Property 3: Bug Condition  Duplicate Medication Warning

_For any_ `medications` array in `ReviewScreen` where a name appears more than once (case-insensitive, trimmed), the fixed component SHALL render an inline warning banner immediately above every card that is a later occurrence of that name, and the banner SHALL include a "Remove" button that removes that entry from the list.

**Validates: Requirements 2.4, 2.5**

Property 4: Bug Condition  Prescriptions Section Capped at 3

_For any_ `prescriptions` array where `prescriptions.length > 3`, the fixed `dashboard/page.tsx` SHALL render exactly 3 prescription list items and SHALL render a "View all →" link.

**Validates: Requirements 2.6**

Property 5: Preservation  Informative Frequency Badges Unchanged

_For any_ `Medication` where `isGenericFrequency(med.duration)` returns `false` and `med.duration` is non-empty, the fixed `ActiveMedicationsStrip` SHALL produce the same badge output as the original component.

**Validates: Requirements 3.1, 3.2**

Property 6: Preservation  ReviewScreen Edit and Confirm Flow Unchanged

_For any_ `PrescriptionData` where all medication names are unique, the fixed `ReviewScreen` SHALL produce identical rendered output and identical `onConfirm` payload as the original component.

**Validates: Requirements 3.4, 3.7, 3.8**

Property 7: Preservation  Dashboard Empty and Exact-Limit States Unchanged

_For any_ `prescriptions` array where `prescriptions.length <= 3`, the fixed `dashboard/page.tsx` SHALL render all records with no "View all →" link; when `prescriptions.length === 0` it SHALL render `EmptyPrescriptions`.

**Validates: Requirements 3.5, 3.6**

---

## Fix Implementation

### Bug 1  `components/features/hub/ActiveMedicationsStrip.tsx`

**Specific Changes:**

1. **Add `isGenericFrequency` helper** (module-level, above the component):
   ```ts
   const GENERIC_FREQUENCY_PATTERNS = [
     'as directed',
     'as advised',
     'as prescribed',
     'per doctor',
     'as directed by',
     'as per doctor',
     'as recommended',
   ]

   function isGenericFrequency(value: string): boolean {
     const lower = value.toLowerCase().trim()
     return GENERIC_FREQUENCY_PATTERNS.some((p) => lower.includes(p))
   }
   ```

2. **Guard the badge render**: change the existing `{med.duration && (...badge...)}` condition to `{med.duration && !isGenericFrequency(med.duration) && (...badge...)}`.

---

### Bug 2  `components/features/hub/ActiveMedicationsStrip.tsx`

**Specific Changes:**

1. **Add constant**: `const MAX_DISPLAY = 4` (module-level).
2. **Slice before mapping**: `const displayedMeds = medications.slice(0, MAX_DISPLAY)` inside the component, then map over `displayedMeds` instead of `medications`.
3. **Keep total count in header**: the `{medications.length} active` badge already uses the prop directly  no change needed there.
4. **Adjust divider logic**: the `borderBottom` condition uses `i < medications.length - 1`; update to `i < displayedMeds.length - 1`.
5. **Add "View all" link** below the `<div className="px-4 pb-3 ...">` block:
   ```tsx
   {medications.length > MAX_DISPLAY && (
     <div className="px-4 pb-3 pt-1">
       <Link href="/timeline" className="text-xs font-semibold text-primary hover:underline">
         View all {medications.length} →
       </Link>
     </div>
   )}
   ```
   Import `Link` from `next/link`.

---

### Bug 3  `components/features/upload/ReviewScreen.tsx`

**Specific Changes:**

1. **Add `removeMedication` handler**:
   ```ts
   function removeMedication(index: number) {
     setPrescription((p) => ({
       ...p,
       medications: p.medications.filter((_, i) => i !== index),
     }))
   }
   ```

2. **Compute `duplicateNames`** inside the render (before the JSX return), derived from `prescription.medications`:
   ```ts
   const duplicateNames = new Set<string>()
   const seen = new Set<string>()
   for (const med of prescription.medications) {
     const key = med.name?.toLowerCase().trim() ?? ''
     if (key && seen.has(key)) duplicateNames.add(key)
     else if (key) seen.add(key)
   }
   ```

3. **Track first-occurrence index** to suppress the banner on the first occurrence:
   The loop above already handles this: `duplicateNames` only contains names seen *more than once*, and the banner is shown only when `duplicateNames.has(key) && firstOccurrenceIndex < i`.

   Simpler implementation: inside the `.map((med, i) => ...)`, compute:
   ```ts
   const key = med.name?.toLowerCase().trim() ?? ''
   const isLaterDuplicate =
     duplicateNames.has(key) &&
     prescription.medications.findIndex(
       (m) => m.name?.toLowerCase().trim() === key
     ) < i
   ```

4. **Render warning banner** immediately above the card `<div>` when `isLaterDuplicate`:
   ```tsx
   {isLaterDuplicate && (
     <div className="flex items-center gap-3 bg-warning-subtle rounded-xl px-4 py-3 border border-warning/20 mb-1">
       <svg className="w-4 h-4 text-warning flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
           d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
       </svg>
       <p className="flex-1 text-sm text-text-secondary">
         <strong className="text-text-primary">"{med.name}"</strong> appears more than once  was this prescribed twice?
       </p>
       <button
         onClick={() => removeMedication(i)}
         className="text-xs font-semibold text-error hover:underline flex-shrink-0"
       >
         Remove
       </button>
     </div>
   )}
   ```

---

### Bug 4  `app/(app)/dashboard/page.tsx`

**Specific Changes:**

1. **Add constant** near the top of the file (after imports): `const DASHBOARD_RX_LIMIT = 3`.
2. **Slice prescriptions** before rendering:
   ```ts
   const displayedPrescriptions = prescriptions.slice(0, DASHBOARD_RX_LIMIT)
   ```
3. **Update the "View all" link condition**: change `{!isEmpty && (...)}` to `{prescriptions.length > DASHBOARD_RX_LIMIT && (...)}`.
4. **Map over `displayedPrescriptions`** instead of `prescriptions` in the list render.

---

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate each bug on unfixed code, then verify the fix works correctly and preserves existing behaviour.

---

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate each bug BEFORE implementing the fix. Confirm or refute the root cause analysis.

**Test Plan**: Render each affected component with inputs that satisfy the bug condition and assert the incorrect output is present. Run these tests on the UNFIXED code to observe failures.

**Test Cases:**

1. **Generic badge rendered** (Bug 1): Render `ActiveMedicationsStrip` with `medications=[{name:"Aspirin", duration:"as directed"}]`; assert the badge element with text "as directed" is present in the DOM. (Will fail on fixed code  badge should be absent.)

2. **List not capped** (Bug 2): Render `ActiveMedicationsStrip` with 6 medications; assert 6 rows are rendered and no "View all" link is present. (Will fail on fixed code.)

3. **No duplicate warning** (Bug 3): Render `ReviewScreen` with `medications=[{name:"Paracetamol",...},{name:"Ibuprofen",...},{name:"Paracetamol",...}]`; assert no warning banner is present. (Will fail on fixed code.)

4. **All prescriptions rendered** (Bug 4): Render the prescriptions section with 5 items; assert 5 list items are rendered. (Will fail on fixed code.)

**Expected Counterexamples:**
- Badge text "as directed" is present when it should be absent.
- 6 medication rows rendered when only 4 should appear.
- No warning banner for the second "Paracetamol" entry.
- 5 prescription rows rendered when only 3 should appear.

---

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed code produces the expected behaviour.

**Pseudocode:**
```
FOR ALL med WHERE isGenericFrequency(med.duration) DO
  render ActiveMedicationsStrip with [med]
  ASSERT badge for med.duration is NOT in DOM
END FOR

FOR ALL medications WHERE medications.length > MAX_DISPLAY DO
  render ActiveMedicationsStrip with medications
  ASSERT rendered rows = MAX_DISPLAY
  ASSERT "View all N →" link is present with correct N
END FOR

FOR ALL medications WHERE duplicateNames(medications) is non-empty DO
  render ReviewScreen with medications
  FOR EACH later duplicate at index i DO
    ASSERT warning banner is present above card i
    ASSERT "Remove" button in banner calls removeMedication(i)
  END FOR
END FOR

FOR ALL prescriptions WHERE prescriptions.length > DASHBOARD_RX_LIMIT DO
  render dashboard prescriptions section with prescriptions
  ASSERT rendered items = DASHBOARD_RX_LIMIT
  ASSERT "View all →" link is present
END FOR
```

---

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed code produces the same result as the original.

**Pseudocode:**
```
FOR ALL med WHERE NOT isGenericFrequency(med.duration) AND med.duration IS NOT EMPTY DO
  ASSERT ActiveMedicationsStrip_original(med) = ActiveMedicationsStrip_fixed(med)
END FOR

FOR ALL medications WHERE medications.length <= MAX_DISPLAY DO
  ASSERT ActiveMedicationsStrip_original(medications) = ActiveMedicationsStrip_fixed(medications)
  ASSERT "View all" link is NOT present
END FOR

FOR ALL medications WHERE all names are unique DO
  ASSERT ReviewScreen_original(medications) = ReviewScreen_fixed(medications)
  ASSERT no warning banners present
END FOR

FOR ALL prescriptions WHERE prescriptions.length <= DASHBOARD_RX_LIMIT DO
  ASSERT dashboard_original(prescriptions) = dashboard_fixed(prescriptions)
  ASSERT "View all →" link is NOT present
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because it generates many input combinations automatically and catches edge cases (e.g. single-character frequency strings, medications with empty names, prescriptions at the exact limit boundary).

**Preservation Test Cases:**

1. **Informative badge preserved**: Render with `duration="twice daily"`  badge must appear with correct text and colour.
2. **Empty duration preserved**: Render with `duration=""`  no badge, no crash.
3. **Exact-4 list preserved**: Render with exactly 4 medications  all 4 rows, no "View all" link.
4. **Unique medications in ReviewScreen**: Render with 3 unique medications  no banners, confirm flow unchanged.
5. **Exact-3 prescriptions preserved**: Render dashboard with exactly 3 prescriptions  all 3 shown, no "View all" link.
6. **Empty prescriptions preserved**: Render dashboard with 0 prescriptions  `EmptyPrescriptions` shown.

---

### Unit Tests

- `isGenericFrequency`: test each pattern in the list, mixed case, leading/trailing whitespace, and strings that should return `false`.
- `removeMedication`: verify it removes the correct index and leaves other entries intact.
- `ActiveMedicationsStrip` with 0, 1, 4, 5, and 10 medications  assert row count and link presence.
- `ReviewScreen` with no duplicates, one duplicate pair, two duplicate pairs, and a triplicate.
- Dashboard prescriptions section with 0, 1, 3, 4, and 10 prescriptions.

### Property-Based Tests

- Generate random `Medication[]` arrays; for each, assert that the number of rendered rows in `ActiveMedicationsStrip` is `min(medications.length, MAX_DISPLAY)`.
- Generate random frequency strings; assert `isGenericFrequency` returns `true` iff the string contains one of the known patterns (case-insensitive).
- Generate random `PrescriptionData` with varying duplicate rates; assert that exactly the later-occurrence duplicates receive warning banners.
- Generate random prescription arrays; assert rendered count is `min(prescriptions.length, DASHBOARD_RX_LIMIT)` and "View all" link presence matches `prescriptions.length > DASHBOARD_RX_LIMIT`.

### Integration Tests

- Full dashboard render with a profile that has 6 active medications and 5 prescriptions: assert strip shows 4 rows + "View all 6 →", prescriptions section shows 3 items + "View all →".
- Upload flow: scan a prescription image that produces duplicate medication names; assert warning banners appear in `ReviewScreen`, remove one duplicate, confirm  assert `onConfirm` receives the deduplicated list.
- Verify "View all N →" in `ActiveMedicationsStrip` navigates to `/timeline`.
