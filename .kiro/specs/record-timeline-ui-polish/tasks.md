# Implementation Plan: Record & Timeline UI Polish

## Overview

Incremental polish pass across the Record Detail (`/records/[id]`) and Timeline (`/timeline`) pages. Tasks are ordered so shared foundations come first, then Record Detail fixes, then Timeline fixes, then larger cross-cutting features.

## Tasks

- [x] 1. Create shared string utility module
  - Create `lib/utils/string.ts` with two exported functions:
    - `toTitleCase(s: string | null | undefined): string`  uppercases the first character of each whitespace-delimited word and lowercases the rest; returns `''` for null, undefined, or empty input
    - `stripMedicationPrefix(name: string): string`  removes a leading `Tab.`, `Cap.`, `Syr.`, or `Inj.` prefix (case-insensitive, followed by optional space) using `name.replace(/^(tab|cap|syr|inj)\.\s*/i, '')`
  - Both functions must be pure and handle all edge cases without throwing (empty string, whitespace-only, null/undefined)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 10.2, 10.3, 10.4_

- [x] 2. Add `medication_count` to `TimelineDocument`  service and type together
  - In `services/records.service.ts`:
    - Add `medication_count: number | null` to the `TimelineDocument` interface
    - Add `medications_found: unknown` to the `DocTimeline` internal type
    - In the `getAllDocumentsForUser` select string, change `document_analyses ( summary )` to `document_analyses ( summary, medications_found )`
    - In the `.map()`, derive `medication_count` using the guard from the design doc:
      ```ts
      const medsFound = d.document_analyses?.[0]?.medications_found
      medication_count:
        d.document_type === 'prescription' && Array.isArray(medsFound) && medsFound.length > 0
          ? medsFound.length
          : null
      ```
  - `medication_count` must be `null` for lab reports and for prescriptions where `medications_found` is absent, null, or empty
  - _Requirements: 13.1, 13.2_

- [x] 3. Record Detail  `isOwnProfile` prop flow (`page.tsx` → `DocumentDetail`)
  - In `app/(app)/records/[id]/page.tsx`:
    - After the existing `profile` lookup, add: `const isOwnProfile = profile?.is_self ?? false`
    - Pass `isOwnProfile={isOwnProfile}` to `<DocumentDetail>`
  - In `components/features/records/DocumentDetail.tsx`:
    - Add `isOwnProfile: boolean` to `DocumentDetailProps`
    - Derive `const displayName = profileName || 'Family Member'`
    - Derive the nav title:
      ```ts
      const navTitle = isOwnProfile
        ? `Your ${docTypeLabel}`
        : `${displayName}'s ${docTypeLabel}`
      ```
    - Replace the static `{docTypeLabel}` in the `<h1>` with `{navTitle}`
    - Use `displayName` (not the raw `profileName` prop) in the "For …" line
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3_

- [x] 4. Record Detail  compact disclaimer badge
  - In `components/features/records/DocumentDetail.tsx`:
    - Replace the `<DisclaimerBanner>` block with a `<Badge variant="warning" dot>` displaying "AI-generated summary  consult your doctor"
    - Keep the `{hasAI && ...}` condition unchanged
    - Do not modify `DisclaimerBanner.tsx` itself  it continues to be used in `ReviewScreen` and `LabReportReviewScreen`
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 5. Record Detail  strip medication name prefixes in `MedicationCard`
  - In `components/features/explanation/MedicationCard.tsx`:
    - Import `stripMedicationPrefix` from `@/lib/utils/string`
    - At the top of the `MedicationCard` render function, derive: `const displayName = stripMedicationPrefix(medication.name)`
    - Use `displayName` in the card `<h3>` title and pass it as the `name` prop to `<MedicinePacket>`
    - Leave `medication.dosage` and `medication.frequency` untouched
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 6. Record Detail  upgrade `DocumentLink` CTA text
  - In `components/features/records/DocumentDetail.tsx`:
    - Add a `documentType: string` prop to the `DocumentLink` sub-component
    - Derive `ctaText`:
      ```ts
      const ctaText = documentType === 'prescription'
        ? 'View your original prescription →'
        : 'View your original lab report →'
      ```
    - Replace the static "View original document" `<p>` text with `{ctaText}`
    - Pass `documentType={documentType}` at both `<DocumentLink>` call sites (prescription and lab report sections)
    - Preserve the existing `{signedFileUrl && <DocumentLink ... />}` null guard
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 7. Verify Req 5  no upload-flow progress dots on Record Detail (inspection only)
  - Open `app/(app)/layout.tsx` and `app/(app)/dashboard/layout.tsx` and confirm neither file renders a stepper, progress dots, or step indicator component
  - Confirm the upload-flow progress UI lives entirely within `app/(app)/dashboard/upload/[profileId]/page.tsx` as local state
  - No code change is required if confirmed
  - _Requirements: 5.1, 5.2_

- [x] 8. Timeline  name casing and labelled filter chip rows
  - In `components/features/records/TimelineView.tsx`:
    - Import `toTitleCase` from `@/lib/utils/string`
    - Apply `toTitleCase(p.full_name)` to every profile name before rendering it in filter chips and any other display location within the component
    - Add a `"Who:"` label `<span className="text-xs font-semibold text-text-muted shrink-0">Who:</span>` to the left of the profile chip row (inside the existing `{multiProfile && ...}` block)
    - Add a `"Type:"` label `<span className="text-xs font-semibold text-text-muted shrink-0">Type:</span>` to the left of the document type chip row
    - Align labels with the first chip using `flex items-center gap-2`
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 11.1, 11.2, 11.3, 11.4_

- [x] 9. Timeline  first-name-only chips on mobile
  - In `components/features/records/TimelineView.tsx`:
    - For each profile chip button, replace the single text node with two `<span>` elements:
      ```tsx
      <span className="md:hidden">{toTitleCase(p.full_name).split(' ')[0]}</span>
      <span className="hidden md:inline">{toTitleCase(p.full_name)}</span>
      ```
    - Leave the "All" label unchanged
  - _Requirements: 12.1, 12.2, 12.3_

- [x] 10. Timeline  medication count badge on `RecordCard`
  - In `components/features/records/RecordCard.tsx`:
    - Inside the content area, below the existing tags row, add:
      ```tsx
      {isPrescription && record.medication_count != null && record.medication_count > 0 && (
        <Badge variant="primary" size="sm">
          {record.medication_count} medication{record.medication_count === 1 ? '' : 's'}
        </Badge>
      )}
      ```
  - Badge must not render for lab reports or when `medication_count` is null or 0
  - _Requirements: 13.1, 13.2, 13.3_

- [x] 11. Timeline  year-prominent date grouping
  - In `components/features/records/TimelineView.tsx`:
    - Replace the existing `groupByMonth` function with a new `groupByYearMonth` function that returns `{ multiYear: boolean, groups: [string, [string, TimelineDocument[]][]][] }`  a year → month → docs structure
    - `multiYear` is `true` when the document set spans more than one distinct calendar year
    - When `multiYear === false`: render flat month groups with "Month Year" headers (existing behaviour)
    - When `multiYear === true`: render year headers (four-digit year, visually prominent  `font-bold text-base`) with nested month sub-group headers showing month name only (e.g. "March")
    - Preserve descending sort order (newest first by default)
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [x] 12. Timeline  "Add another record" CTA
  - In `components/features/records/TimelineView.tsx`:
    - Import `Button` from `@/components/ui`
    - After the grouped records list (inside the `filtered.length > 0` branch), add:
      ```tsx
      <div className="pt-4 flex justify-center">
        <Button variant="secondary" href="/dashboard">
          Add another record →
        </Button>
      </div>
      ```
    - CTA must not render when `filtered.length === 0`
  - _Requirements: 15.1, 15.2, 15.3_

- [x] 13. Timeline  client-side search
  - In `components/features/records/TimelineView.tsx`:
    - Add `const [searchQuery, setSearchQuery] = useState('')` state
    - Import `Input` from `@/components/ui`
    - Render a search input above the filter chip rows:
      ```tsx
      <Input
        aria-label="Search records"
        placeholder="Search by doctor, condition, or medication…"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      ```
    - Apply the search filter as the first step in the filter pipeline (before profile and type filters):
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
    - Feed `searchFiltered` into the existing profile and type filters (all filters ANDed)
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6_

- [x] 14. Timeline  sort control
  - In `components/features/records/TimelineView.tsx`:
    - Add `const [sortOrder, setSortOrder] = useState<'newest_first' | 'oldest_first' | 'by_type'>('newest_first')` state
    - Implement `applySort(docs, order)` (newest_first, oldest_first, by_type as per design doc)
    - Render a segmented sort control using the existing `CHIP_BASE`/`CHIP_ON`/`CHIP_OFF` pattern with `aria-label="Sort records"` and three options: "Newest first", "Oldest first", "By type"
    - Apply `applySort` after the combined filter step and before `groupByYearMonth`
    - Default to `newest_first` on initial render
  - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7_

- [x] 15. Create `SharePreviewModal` component
  - Create `components/features/share/SharePreviewModal.tsx` as a new client component
  - Props: `{ message: string; onConfirm: () => void; onCancel: () => void }`
  - Layout:
    - Backdrop: `fixed inset-0 bg-black/40 z-50`
    - Mobile sheet: `fixed bottom-0 inset-x-0 rounded-t-3xl bg-surface-container-lowest`
    - Desktop modal: `md:relative md:rounded-3xl md:max-w-lg md:mx-auto`
    - Message text: `<pre className="whitespace-pre-wrap font-body text-sm text-text-primary">` inside a `max-h-[50vh] overflow-y-auto` container
  - Accessibility:
    - `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to the modal title element
    - `useEffect` for Escape key with cleanup
    - Focus trap: move focus to the modal container on mount via `useEffect` + `ref.current?.focus()`
  - Buttons: "Cancel" (`<Button variant="secondary">`) and "Share on WhatsApp" (`bg-[#25D366]` green button)
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

- [x] 16. Update `ShareButton`  preview modal + viral attribution
  - In `components/features/share/ShareButton.tsx`:
    - Import `SharePreviewModal` from `./SharePreviewModal`
    - Add `const [showPreview, setShowPreview] = useState(false)` state
    - In `buildSummaryText`, append the viral attribution line after the disclaimer:
      ```ts
      lines.push('⚠️ AI-generated summary. Consult your doctor before making any changes.')
      lines.push('')
      lines.push('Shared via Vitae  upload yours at vitae.health')
      ```
    - Change `handleShare` to set `showPreview(true)` instead of opening WhatsApp directly
    - Add `handleConfirm` that opens WhatsApp then sets `showPreview(false)`
    - Render `{showPreview && <SharePreviewModal ... />}` in the return
  - _Requirements: 7.1, 7.4, 7.5, 8.1, 8.2, 8.3_

- [x] 17. Record Detail  two-column desktop layout for prescriptions
  - In `components/features/records/DocumentDetail.tsx`:
    - Wrap the prescription section content in a two-column grid at the `md:` breakpoint:
      ```tsx
      <div className="md:grid md:grid-cols-[1fr_380px] md:gap-8 md:items-start">
        <div>{/* medications section */}</div>
        <div>{/* doctor notes + share button + doc link */}</div>
      </div>
      ```
    - Left column: medications `<section>`
    - Right column: `DoctorNotes`, `DocumentLink`, and the full `ShareButton`
    - Lab report section remains single-column at all viewport widths
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

## Notes

- `lib/utils/string.ts` (task 1) must be created before tasks 5 and 8 which import from it
- The `medication_count` service change (task 2) must be done before the `RecordCard` badge (task 10)
- `isOwnProfile` prop flow (task 3) must be done as a single atomic change across `page.tsx` and `DocumentDetail.tsx`
- `SharePreviewModal` (task 15) must be created before modifying `ShareButton` (task 16)
- Task 7 is inspection-only  the upload stepper is local state in the upload page, not in any shared layout
