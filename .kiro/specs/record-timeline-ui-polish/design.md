# Design Document — `record-timeline-ui-polish`

## Overview

This feature delivers a focused UI/UX polish pass across two pages in the Vitae Next.js health assistant app:

1. **`/records/[id]` — Record Detail page**: Correct profile name display, dynamic nav titles, compact AI disclaimer badge, medication name normalisation, removal of upload-flow artefacts, an upgraded document link, a WhatsApp share preview modal with viral attribution, and a two-column desktop layout for prescriptions.

2. **`/timeline` — Timeline page**: Name casing normalisation, labelled filter chip rows, first-name-only chips on mobile, medication count badges, year-prominent date grouping, a non-empty-state CTA, client-side search, and a sort control.

All changes are confined to the component and service layers. No database schema changes are required — `medication_count` is derived from the `medications_found` JSONB array already fetched via join.

---

## Architecture

The app uses Next.js 14 App Router with a clear server/client component split:

- **Server components** (`app/(app)/records/[id]/page.tsx`, `DocumentDetail.tsx`) handle data fetching and pass props down.
- **Client components** (`TimelineView.tsx`, `ShareButton.tsx`, `MedicationCard.tsx`, `RecordCard.tsx`) handle interactivity.
- **Services** (`services/records.service.ts`) encapsulate Supabase queries.
- **Utilities** (`lib/utils/string.ts`) provide pure, reusable string transformations.

The changes in this feature follow the existing patterns exactly — no new architectural patterns are introduced.

```
app/(app)/records/[id]/page.tsx   (server — adds isOwnProfile derivation)
        │
        └─► DocumentDetail.tsx    (server — dynamic nav title, compact badge, 2-col layout)
                │
                ├─► MedicationCard.tsx   (client — strips prefixes via stripMedicationPrefix)
                └─► ShareButton.tsx      (client — preview modal, viral attribution)
                        └─► SharePreviewModal.tsx  (client — new component)

app/(app)/timeline/page.tsx
        │
        └─► TimelineView.tsx      (client — search, sort, year grouping, labelled chips, CTA)
                └─► RecordCard.tsx  (client — medication count badge)

services/records.service.ts       (adds medication_count to TimelineDocument)
lib/utils/string.ts               (new — toTitleCase, stripMedicationPrefix)
```

---

## Components and Interfaces

### `lib/utils/string.ts` (new file)

Pure utility functions with no dependencies.

```ts
/**
 * Converts each word in a string to title case (first char upper, rest lower).
 * Returns '' for null, undefined, or empty input.
 */
export function toTitleCase(s: string | null | undefined): string

/**
 * Strips a leading medication form prefix from a drug name.
 * Matches: Tab., Cap., Syr., Inj. (case-insensitive, followed by optional space)
 * Example: "Tab. Pantoprazole 40 mg" → "Pantoprazole 40 mg"
 * Example: "CAP.Amoxicillin 500mg"  → "Amoxicillin 500mg"
 */
export function stripMedicationPrefix(name: string): string
// Implementation: name.replace(/^(tab|cap|syr|inj)\.\s*/i, '')
```

### `services/records.service.ts` — `TimelineDocument` interface change

Add `medication_count: number | null` to the existing interface:

```ts
export interface TimelineDocument {
  id: string
  profile_id: string
  profile_name: string
  document_type: string
  document_date: string | null
  doctor_name: string | null
  tags: string[] | null
  summary: string | null
  created_at: string | null
  medication_count: number | null   // ← new field
}
```

In `getAllDocumentsForUser`, the existing query already fetches `document_analyses ( summary )`. Extend the select to also fetch `medications_found` from `document_analyses`, then derive the count:

```ts
// In the select string, change:
//   document_analyses ( summary )
// to:
//   document_analyses ( summary, medications_found )

// In the map:
medication_count: (() => {
  const meds = d.document_analyses?.[0]?.medications_found
  if (!Array.isArray(meds) || d.document_type !== 'prescription') return null
  return meds.length > 0 ? meds.length : null
})(),
```

No new DB query is needed — `medications_found` is already in the joined `document_analyses` row.

### `app/(app)/records/[id]/page.tsx` — `isOwnProfile` derivation

Add one line after the existing `profile` lookup:

```ts
const isOwnProfile = profile?.is_self ?? false
```

Pass it to `DocumentDetail`:

```tsx
<DocumentDetail
  record={record}
  profileName={profileName}
  signedFileUrl={signedFileUrl}
  isOwnProfile={isOwnProfile}   // ← new prop
/>
```

### `components/features/records/DocumentDetail.tsx` — prop changes

Updated `DocumentDetailProps`:

```ts
interface DocumentDetailProps {
  record:        RecordDetail
  profileName:   string
  signedFileUrl: string | null
  isOwnProfile:  boolean          // ← new prop
}
```

**Nav title logic:**

```ts
const navTitle = isOwnProfile
  ? `Your ${docTypeLabel}`
  : `${profileName || 'Family Member'}'s ${docTypeLabel}`
```

**CompactDisclaimerBadge** — replaces `<DisclaimerBanner>` inside `DocumentDetail` only:

```tsx
{hasAI && (
  <Badge variant="warning" dot>
    AI-generated summary — consult your doctor
  </Badge>
)}
```

`DisclaimerBanner` itself is unchanged and continues to be used in `ReviewScreen` and `LabReportReviewScreen`.

**DocumentLink** — receives `documentType` prop and renders type-specific CTA text:

```tsx
function DocumentLink({
  url,
  fileUrl,
  documentType,
}: {
  url: string
  fileUrl: string | null
  documentType: string
}) {
  const ctaText = documentType === 'prescription'
    ? 'View your original prescription →'
    : 'View your original lab report →'
  // ... rest of component
}
```

**Desktop 2-column layout** (prescriptions only, at `md:` breakpoint):

```tsx
{isPrescription && (
  <div className="md:grid md:grid-cols-[1fr_380px] md:gap-8 md:items-start">
    <div>{/* medications section */}</div>
    <div>{/* doctor notes + share button + doc link */}</div>
  </div>
)}
```

Lab reports remain single-column at all widths.

### `components/features/explanation/MedicationCard.tsx` — prefix stripping

Import `stripMedicationPrefix` from `lib/utils/string` and apply it before rendering:

```ts
import { stripMedicationPrefix } from '@/lib/utils/string'

// In MedicationCard render:
const displayName = stripMedicationPrefix(medication.name)
// Use displayName in the card title and pass to MedicinePacket
```

The `dosage` and `frequency` fields are not touched.

### `components/features/share/SharePreviewModal.tsx` (new file)

Client component. Renders as a bottom sheet on mobile and a centred modal on desktop.

```ts
interface SharePreviewModalProps {
  message: string
  onConfirm: () => void
  onCancel: () => void
}
```

**Layout:**
- Backdrop: `fixed inset-0 bg-black/40 z-50`
- Mobile sheet: `fixed bottom-0 inset-x-0 rounded-t-3xl bg-surface-container-lowest`
- Desktop modal: `md:relative md:rounded-3xl md:max-w-lg md:mx-auto`
- Message text: `<pre className="whitespace-pre-wrap font-body text-sm text-text-primary">` inside a `max-h-[50vh] overflow-y-auto` container

**Accessibility:**
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to the modal title
- `useEffect` for Escape key listener: `document.addEventListener('keydown', handleKeyDown)`
- Focus trap: focus moves to the modal container on mount via `useEffect` + `ref.current?.focus()`

**Buttons:**
- "Cancel" — `<Button variant="secondary">` calls `onCancel`
- "Share on WhatsApp" — `<button className="... bg-[#25D366] text-white ...">` calls `onConfirm`

### `components/features/share/ShareButton.tsx` — preview modal + viral attribution

**State addition:**

```ts
const [showPreview, setShowPreview] = useState(false)
```

**`buildSummaryText` change** — append viral attribution after the disclaimer line:

```ts
lines.push('⚠️ AI-generated summary. Consult your doctor before making any changes.')
lines.push('')
lines.push('Shared via Vitae — upload yours at vitae.health')  // ← new
```

**`handleShare` change** — sets `showPreview = true` instead of opening WhatsApp directly:

```ts
function handleShare() {
  setShowPreview(true)
}

function handleConfirm() {
  const text = buildSummaryText({ ... })
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  setShowPreview(false)
}
```

**Render** — conditionally render `SharePreviewModal`:

```tsx
{showPreview && (
  <SharePreviewModal
    message={buildSummaryText({ doctorName, patientName, date, medications, doctorNotes })}
    onConfirm={handleConfirm}
    onCancel={() => setShowPreview(false)}
  />
)}
```

### `components/features/records/TimelineView.tsx` — search, sort, year grouping, labelled chips, CTA

**New state:**

```ts
const [searchQuery, setSearchQuery] = useState('')
const [sortOrder, setSortOrder]     = useState<'newest_first' | 'oldest_first' | 'by_type'>('newest_first')
```

**Filter pipeline** (applied in this order):

1. Search filter (case-insensitive partial match against `doctor_name`, `tags`, `summary`)
2. Profile filter
3. Type filter
4. Sort
5. Group

**Search filter:**

```ts
const lowerQuery = searchQuery.toLowerCase().trim()
const searchFiltered = lowerQuery === ''
  ? documents
  : documents.filter((d) => {
      if (d.doctor_name?.toLowerCase().includes(lowerQuery)) return true
      if (d.tags?.some((t) => t.toLowerCase().includes(lowerQuery))) return true
      if (d.summary?.toLowerCase().includes(lowerQuery)) return true
      return false
    })
```

**Sort function:**

```ts
function applySort(docs: TimelineDocument[], order: SortOrder): TimelineDocument[] {
  if (order === 'newest_first') return [...docs].sort((a, b) => compareDates(b, a))
  if (order === 'oldest_first') return [...docs].sort((a, b) => compareDates(a, b))
  // by_type: prescriptions first, then lab reports, each group newest-first
  const rx  = docs.filter((d) => d.document_type === 'prescription').sort((a, b) => compareDates(b, a))
  const lab = docs.filter((d) => d.document_type !== 'prescription').sort((a, b) => compareDates(b, a))
  return [...rx, ...lab]
}
```

**Year grouping function:**

```ts
function groupByYearMonth(docs: TimelineDocument[]): {
  multiYear: boolean
  groups: [string, [string, TimelineDocument[]][]][]
} {
  // Returns year → month → docs structure
  // multiYear: true when docs span more than one calendar year
}
```

Rendering logic:
- `multiYear === false`: render flat month groups (existing behaviour, month header shows "Month Year")
- `multiYear === true`: render year headers with nested month sub-groups (month header shows "Month" only)

**Labelled chip rows:**

```tsx
{/* Who row */}
{multiProfile && (
  <div className="flex items-center gap-2 overflow-x-auto -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
    <span className="text-xs font-semibold text-text-muted shrink-0">Who:</span>
    {/* chips */}
  </div>
)}

{/* Type row */}
<div className="flex items-center gap-2 overflow-x-auto -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
  <span className="text-xs font-semibold text-text-muted shrink-0">Type:</span>
  {/* chips */}
</div>
```

**First-name-only on mobile** — use responsive Tailwind classes on chip text:

```tsx
<button ...>
  <span className="md:hidden">{toTitleCase(p.full_name).split(' ')[0]}</span>
  <span className="hidden md:inline">{toTitleCase(p.full_name)}</span>
</button>
```

**Sort control** — segmented control using the existing `CHIP_BASE` pattern:

```tsx
<div className="flex items-center gap-2" aria-label="Sort records">
  {SORT_OPTIONS.map(({ key, label }) => (
    <button
      key={key}
      onClick={() => setSortOrder(key)}
      className={[CHIP_BASE, sortOrder === key ? CHIP_ON : CHIP_OFF].join(' ')}
      style={chipStyle(sortOrder === key)}
    >
      {label}
    </button>
  ))}
</div>
```

**Search input:**

```tsx
<Input
  aria-label="Search records"
  placeholder="Search by doctor, condition, or medication…"
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>
```

**CTA at bottom:**

```tsx
{filtered.length > 0 && (
  <div className="pt-4 flex justify-center">
    <Button variant="secondary" href="/dashboard">
      Add another record →
    </Button>
  </div>
)}
```

### `components/features/records/RecordCard.tsx` — medication count badge

```tsx
{isPrescription && record.medication_count != null && record.medication_count > 0 && (
  <Badge variant="primary" size="sm">
    {record.medication_count} medication{record.medication_count === 1 ? '' : 's'}
  </Badge>
)}
```

Place the badge inside the content area, below the tags row.

---

## Data Models

### `TimelineDocument` (updated)

```ts
export interface TimelineDocument {
  id: string
  profile_id: string
  profile_name: string
  document_type: string
  document_date: string | null
  doctor_name: string | null
  tags: string[] | null
  summary: string | null
  created_at: string | null
  medication_count: number | null   // derived from medications_found JSONB array length
}
```

`medication_count` is `null` for lab reports and for prescriptions where `medications_found` is empty or absent. It is never negative.

### `DocTimeline` internal type (updated)

The internal Supabase join shape in `records.service.ts` needs `medications_found` added:

```ts
type DocTimeline = {
  id: string
  profile_id: string
  document_type: string
  document_date: string | null
  doctor_name: string | null
  tags: string[] | null
  created_at: string | null
  document_analyses: Array<{
    summary: string
    medications_found: unknown   // ← new
  }>
}
```

### `DocumentDetailProps` (updated)

```ts
interface DocumentDetailProps {
  record:        RecordDetail
  profileName:   string
  signedFileUrl: string | null
  isOwnProfile:  boolean          // ← new
}
```

### `SharePreviewModalProps` (new)

```ts
interface SharePreviewModalProps {
  message:   string
  onConfirm: () => void
  onCancel:  () => void
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: `toTitleCase` produces title-cased words

*For any* non-empty string, every whitespace-delimited word in `toTitleCase(s)` must have its first character uppercased and all subsequent characters lowercased.

**Validates: Requirements 10.2**

---

### Property 2: `stripMedicationPrefix` removes known prefixes

*For any* medication name that begins with a recognised prefix (`Tab.`, `Cap.`, `Syr.`, `Inj.`, case-insensitive), `stripMedicationPrefix(name)` must return the name with that prefix removed, and the result must not start with any recognised prefix.

**Validates: Requirements 4.1, 4.2, 4.4**

---

### Property 3: `stripMedicationPrefix` is identity for names without prefixes

*For any* string that does not begin with a recognised medication prefix, `stripMedicationPrefix(name)` must return the string unchanged.

**Validates: Requirements 4.3**

---

### Property 4: `buildSummaryText` always ends with the viral attribution line

*For any* valid combination of `doctorName`, `patientName`, `date`, `medications`, and `doctorNotes`, the output of `buildSummaryText` must end with the line `"Shared via Vitae — upload yours at vitae.health"`.

**Validates: Requirements 8.1**

---

### Property 5: Viral attribution line appears after the disclaimer line

*For any* valid share inputs, the index of `"Shared via Vitae — upload yours at vitae.health"` in the `buildSummaryText` output must be greater than the index of the disclaimer line `"⚠️ AI-generated summary"`.

**Validates: Requirements 8.2**

---

### Property 6: Share message opening line contains the patient name

*For any* non-empty `patientName` string, the first line of `buildSummaryText` output must contain `patientName`.

**Validates: Requirements 8.3**

---

### Property 7: SharePreviewModal displays the exact message that will be sent

*For any* valid share inputs, the text rendered inside `SharePreviewModal` must equal the string returned by `buildSummaryText` for those same inputs.

**Validates: Requirements 7.2**

---

### Property 8: Search filter returns only matching documents

*For any* non-empty search query and any document set, every document in the filtered result must contain the query string (case-insensitive) in at least one of `doctor_name`, `tags`, or `summary`.

**Validates: Requirements 16.2**

---

### Property 9: Empty search query is a no-op

*For any* document set, applying the search filter with an empty query must return all documents in the set (before profile and type filters are applied).

**Validates: Requirements 16.3**

---

### Property 10: All active filters are ANDed

*For any* document set and any combination of search query, profile filter, and type filter, the filtered result must equal the intersection of the results produced by each filter applied independently.

**Validates: Requirements 16.4**

---

### Property 11: `newest_first` sort produces descending date order

*For any* document set, applying `newest_first` sort must produce a list where each document's `document_date` is greater than or equal to the next document's `document_date`.

**Validates: Requirements 17.3**

---

### Property 12: `oldest_first` sort produces ascending date order

*For any* document set, applying `oldest_first` sort must produce a list where each document's `document_date` is less than or equal to the next document's `document_date`.

**Validates: Requirements 17.4**

---

### Property 13: `by_type` sort places all prescriptions before all lab reports

*For any* document set containing both prescriptions and lab reports, applying `by_type` sort must produce a list where every prescription appears before every lab report, and within each type the documents are sorted by `document_date` descending.

**Validates: Requirements 17.5**

---

### Property 14: Multi-year grouping produces one group per distinct year

*For any* document set whose `document_date` values span more than one calendar year, `groupByYearMonth` must return exactly one top-level group per distinct year present in the set.

**Validates: Requirements 14.1**

---

### Property 15: Single-year grouping produces no year-level headers

*For any* document set where all `document_date` values fall within the same calendar year, `groupByYearMonth` must return `multiYear: false` and produce only month-level groups.

**Validates: Requirements 14.2**

---

### Property 16: Medication count badge pluralisation is correct

*For any* prescription `TimelineDocument` with `medication_count = N` where `N > 0`, the badge text must be `"${N} medication"` when `N === 1` and `"${N} medications"` when `N > 1`.

**Validates: Requirements 13.1**

---

### Property 17: Dynamic nav title uses profile name for non-own profiles

*For any* non-empty `profileName` string and `isOwnProfile = false`, the nav title rendered by `DocumentDetail` must equal `"${profileName}'s Prescription"` or `"${profileName}'s Lab Report"` depending on `documentType`.

**Validates: Requirements 2.2**

---

## Error Handling

### `toTitleCase` and `stripMedicationPrefix`

Both functions are pure and total — they handle all inputs without throwing:
- `toTitleCase(null)` and `toTitleCase(undefined)` return `''`
- `toTitleCase('')` returns `''`
- `stripMedicationPrefix('')` returns `''`
- Inputs with only whitespace are handled gracefully

### `medication_count` derivation in `getAllDocumentsForUser`

The `medications_found` field may be `null`, `undefined`, or a non-array value in legacy records. The derivation must guard against this:

```ts
const medsFound = d.document_analyses?.[0]?.medications_found
const medication_count =
  d.document_type === 'prescription' && Array.isArray(medsFound) && medsFound.length > 0
    ? medsFound.length
    : null
```

### `SharePreviewModal` — Escape key listener cleanup

The `useEffect` that registers the Escape key listener must return a cleanup function to remove the listener when the component unmounts, preventing memory leaks:

```ts
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onCancel()
  }
  document.addEventListener('keydown', handleKeyDown)
  return () => document.removeEventListener('keydown', handleKeyDown)
}, [onCancel])
```

### `profileName` fallback in `DocumentDetail`

The `profileName` prop may be an empty string (when `profile?.full_name` is empty). The nav title and "For …" line must both fall back to `'Family Member'`:

```ts
const displayName = profileName || 'Family Member'
```

### `signedFileUrl` null guard

`DocumentLink` is only rendered when `signedFileUrl` is non-null. This is already enforced by the existing `{signedFileUrl && <DocumentLink ... />}` pattern and must be preserved.

### Search with null fields

`doctor_name`, `tags`, and `summary` may all be `null` on a `TimelineDocument`. The search filter must use optional chaining and null-safe access:

```ts
d.doctor_name?.toLowerCase().includes(lowerQuery)
d.tags?.some((t) => t.toLowerCase().includes(lowerQuery))
d.summary?.toLowerCase().includes(lowerQuery)
```

---

## Testing Strategy

### Unit Tests

Unit tests cover specific examples, edge cases, and error conditions. They are the primary testing mechanism for UI components and conditional rendering logic.

**`lib/utils/string.ts`**
- `toTitleCase`: empty string, null, single word, multi-word, already-correct casing, all-caps, mixed case
- `stripMedicationPrefix`: each prefix variant (Tab., Cap., Syr., Inj.), uppercase variants, no prefix, empty string, prefix without trailing space

**`components/features/share/ShareButton.tsx` / `buildSummaryText`**
- Viral attribution line is present and is the last non-empty line
- Attribution appears after the disclaimer line
- Patient name appears in the first line
- Empty medications array produces no medications section
- Empty doctorNotes array produces no notes section

**`components/features/share/SharePreviewModal.tsx`**
- Renders with `role="dialog"` and `aria-modal="true"`
- Escape key calls `onCancel`
- Cancel button calls `onCancel`
- Confirm button calls `onConfirm`
- Message text is rendered verbatim

**`components/features/records/TimelineView.tsx`**
- Search input renders with correct `aria-label` and `placeholder`
- Sort control renders with `aria-label="Sort records"` and all three options
- "Who:" label renders when `multiProfile` is true, absent when false
- "Type:" label always renders
- CTA renders when filtered list is non-empty, absent when empty
- Year headers render when records span multiple years
- Month-only headers render when nested under year headers
- "Month Year" format renders when single-year mode

**`components/features/records/RecordCard.tsx`**
- Badge renders for prescription with `medication_count > 0`
- Badge absent for `medication_count = null`
- Badge absent for `medication_count = 0`
- Badge absent for lab reports regardless of count
- Singular "medication" for count = 1, plural "medications" for count > 1

**`components/features/records/DocumentDetail.tsx`**
- Nav title is "Your Prescription" when `isOwnProfile = true` and `documentType = 'prescription'`
- Nav title is "Your Lab Report" when `isOwnProfile = true` and `documentType = 'lab_report'`
- Nav title is "Family Member's Prescription" when `isOwnProfile = false` and `profileName = ''`
- `Badge` with `variant="warning"` renders in place of `DisclaimerBanner`
- Two-column grid class present for prescriptions at `md:` breakpoint
- Two-column grid class absent for lab reports
- `DocumentLink` absent when `signedFileUrl = null`

### Property-Based Tests

Property-based tests use [fast-check](https://github.com/dubzzz/fast-check) (TypeScript-native, no additional setup required in a Next.js project). Each test runs a minimum of 100 iterations.

**`lib/utils/string.ts` — `toTitleCase`**

```
// Feature: record-timeline-ui-polish, Property 1: toTitleCase produces title-cased words
fc.property(fc.string(), (s) => {
  const result = toTitleCase(s)
  result.split(/\s+/).filter(Boolean).forEach((word) => {
    expect(word[0]).toBe(word[0].toUpperCase())
    expect(word.slice(1)).toBe(word.slice(1).toLowerCase())
  })
})
```

**`lib/utils/string.ts` — `stripMedicationPrefix`**

```
// Feature: record-timeline-ui-polish, Property 2: stripMedicationPrefix removes known prefixes
// Feature: record-timeline-ui-polish, Property 3: stripMedicationPrefix is identity for names without prefixes
```

**`components/features/share/ShareButton.tsx` — `buildSummaryText`**

```
// Feature: record-timeline-ui-polish, Property 4: buildSummaryText always ends with viral attribution
// Feature: record-timeline-ui-polish, Property 5: Viral attribution appears after disclaimer
// Feature: record-timeline-ui-polish, Property 6: Opening line contains patient name
```

**`components/features/records/TimelineView.tsx` — filter and sort logic**

```
// Feature: record-timeline-ui-polish, Property 8: Search filter returns only matching documents
// Feature: record-timeline-ui-polish, Property 9: Empty search query is a no-op
// Feature: record-timeline-ui-polish, Property 10: All active filters are ANDed
// Feature: record-timeline-ui-polish, Property 11: newest_first sort produces descending date order
// Feature: record-timeline-ui-polish, Property 12: oldest_first sort produces ascending date order
// Feature: record-timeline-ui-polish, Property 13: by_type sort places prescriptions before lab reports
// Feature: record-timeline-ui-polish, Property 14: Multi-year grouping produces one group per distinct year
// Feature: record-timeline-ui-polish, Property 15: Single-year grouping produces no year-level headers
```

**`components/features/records/RecordCard.tsx`**

```
// Feature: record-timeline-ui-polish, Property 16: Medication count badge pluralisation is correct
```

**`components/features/records/DocumentDetail.tsx`**

```
// Feature: record-timeline-ui-polish, Property 17: Dynamic nav title uses profile name for non-own profiles
```

### Integration / Smoke Tests

- **Req 5 (progress dots)**: Code review confirms `app/(app)/layout.tsx` and `app/(app)/dashboard/layout.tsx` contain no stepper or progress component. The upload-flow progress UI lives entirely within `app/(app)/dashboard/upload/[profileId]/page.tsx` as local state — it is not in any shared layout. No code change is needed; this is verified by inspection.
- **Responsive layout**: Manual visual review at 375 px (mobile) and 1280 px (desktop) for the two-column prescription layout, bottom-sheet modal, and first-name chip truncation.
- **`medication_count` derivation**: Integration test against a seeded Supabase test database verifying that `getAllDocumentsForUser` returns the correct `medication_count` for prescriptions with known `medications_found` arrays.
