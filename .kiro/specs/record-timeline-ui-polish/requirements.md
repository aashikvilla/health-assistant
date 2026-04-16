# Requirements Document

## Introduction

This feature covers UI/UX polish across two pages in the Vitae Next.js health assistant app:

1. **`/records/[id]` — Record Detail page**: Fixes and enhancements to how prescriptions and lab reports are displayed, including correct profile name rendering, dynamic navigation titles, a compact disclaimer badge for saved records, medication name normalisation, removal of upload-flow artefacts, an upgraded original-document link, a WhatsApp share preview modal, and a two-column desktop layout.

2. **`/timeline` — Timeline page**: Fixes and enhancements including name casing normalisation, labelled filter chip rows, first-name-only chips on mobile, medication count badges on record cards, year-prominent date grouping, a non-empty-state CTA, client-side search, and a sort control.

All changes are confined to the client/server component layer; no database schema changes are required.

---

## Glossary

- **DocumentDetail**: Server component at `components/features/records/DocumentDetail.tsx` that renders the Record Detail page body.
- **MedicationCard**: Client component at `components/features/explanation/MedicationCard.tsx` that renders a single medication entry.
- **TimelineView**: Client component at `components/features/records/TimelineView.tsx` that renders the filtered, grouped list of records on the Timeline page.
- **RecordCard**: Component at `components/features/records/RecordCard.tsx` that renders a single record row in the timeline.
- **ShareButton**: Client component at `components/features/share/ShareButton.tsx` that opens WhatsApp with a pre-built message.
- **DisclaimerBanner**: Component at `components/features/explanation/DisclaimerBanner.tsx` that renders the AI disclaimer.
- **ProfileName**: The resolved `full_name` value from `family_profiles`, passed as the `profileName` prop into `DocumentDetail` from `app/(app)/records/[id]/page.tsx`.
- **OwnProfile**: A `FamilyProfile` whose `is_self` field is `true`.
- **FamilyProfile**: A profile record from `family_profiles` with fields including `id`, `full_name`, `is_self`, and `relationship`.
- **TimelineDocument**: The `TimelineDocument` type from `services/records.service.ts` with fields `id`, `profile_id`, `profile_name`, `document_type`, `document_date`, `doctor_name`, `tags`, `summary`, `created_at`.
- **RecordDetail**: The `RecordDetail` type from `services/records.service.ts`.
- **MedicationPrefix**: A leading token in a medication name matching the pattern `Tab\.` or `Cap\.` (case-insensitive), e.g. "Tab. Pantoprazole 40 mg".
- **SharePreviewModal**: A modal or bottom sheet shown before opening WhatsApp that displays the exact message text and offers Confirm / Cancel actions.
- **ViralAttributionLine**: The footer line appended to every WhatsApp share message: "Shared via Vitae — upload yours at vitae.health".
- **TitleCase**: A string transformation where the first letter of each word is uppercased and the rest are lowercased, e.g. "LAvanya" → "Lavanya".
- **CompactDisclaimerBadge**: A single-line inline badge (using the existing `Badge` component with `variant="warning"`) that replaces the full `DisclaimerBanner` on saved records.
- **UploadFlow**: The multi-step upload wizard at `/dashboard/upload/[profileId]` that includes progress step dots.
- **DesktopLayout**: A CSS grid layout applied at `md` breakpoint (≥ 768 px) that places the medication list in the left column and doctor notes + share button in the right column.
- **YearGroup**: A top-level date group header showing only the year (e.g. "2024") when records span more than one calendar year.
- **MonthGroup**: A sub-group header showing the month (e.g. "March") nested under a YearGroup.
- **SortOrder**: One of three values — `newest_first`, `oldest_first`, or `by_type` — controlling the order of records in TimelineView.
- **SearchQuery**: A user-entered string used to filter TimelineDocument records client-side against `doctor_name`, `tags`, and medication names.

---

## Requirements

### Requirement 1: Correct Profile Name Display on Record Detail

**User Story:** As a user viewing a saved record, I want to see the correct display name for the patient, so that I can confirm whose record I am reading.

#### Acceptance Criteria

1. THE `DocumentDetail` SHALL render the `profileName` prop value in the "For …" line using the `full_name` resolved in `app/(app)/records/[id]/page.tsx`.
2. WHEN the `profileName` prop is an empty string or undefined, THE `DocumentDetail` SHALL display "Family Member" as the fallback.
3. THE `DocumentDetail` SHALL NOT display raw database identifiers (e.g. email addresses or user IDs) in the "For …" line.

---

### Requirement 2: Dynamic Navigation Title

**User Story:** As a user, I want the navigation bar title to reflect whose record I am viewing, so that I can immediately understand the context without reading the body.

#### Acceptance Criteria

1. WHEN the record belongs to an OwnProfile (`is_self === true`), THE `DocumentDetail` SHALL display "Your Prescription" (or "Your Lab Report") as the navigation title.
2. WHEN the record belongs to a FamilyProfile that is not the OwnProfile, THE `DocumentDetail` SHALL display "[ProfileName]'s Prescription" (or "[ProfileName]'s Lab Report") as the navigation title, where `[ProfileName]` is the `full_name` value.
3. THE `DocumentDetail` SHALL accept an `isOwnProfile` boolean prop (derived in `app/(app)/records/[id]/page.tsx` by checking `profile.is_self`) to determine which title variant to render.

---

### Requirement 3: Compact Disclaimer Badge on Saved Records

**User Story:** As a user viewing a saved record, I want a compact AI disclaimer instead of a large yellow banner, so that the disclaimer is present without dominating the page layout.

#### Acceptance Criteria

1. WHEN `DocumentDetail` renders a saved record (i.e. outside the upload flow), THE `DocumentDetail` SHALL render a CompactDisclaimerBadge in place of the full `DisclaimerBanner`.
2. THE CompactDisclaimerBadge SHALL use the existing `Badge` component with `variant="warning"` and display the text "AI-generated summary — consult your doctor".
3. THE full `DisclaimerBanner` SHALL continue to render during the upload flow review screens (`ReviewScreen`, `LabReportReviewScreen`) and SHALL NOT be changed by this requirement.
4. THE CompactDisclaimerBadge SHALL be visible and readable at all viewport widths supported by the app.

---

### Requirement 4: Strip Medication Name Prefixes

**User Story:** As a user reading my prescription, I want medication names shown without "Tab." or "Cap." prefixes, so that the names are cleaner and easier to read.

#### Acceptance Criteria

1. THE `MedicationCard` SHALL strip any leading MedicationPrefix from `medication.name` before rendering the name in the card title and the `MedicinePacket` illustration.
2. WHEN a medication name begins with a MedicationPrefix (e.g. "Tab. Pantoprazole 40 mg"), THE `MedicationCard` SHALL display the name without that prefix (e.g. "Pantoprazole 40 mg").
3. WHEN a medication name does not begin with a MedicationPrefix, THE `MedicationCard` SHALL display the name unchanged.
4. THE prefix-stripping logic SHALL be case-insensitive (e.g. "tab." and "TAB." are both stripped).
5. THE prefix-stripping SHALL NOT affect the `dosage` or `frequency` fields.

---

### Requirement 5: Remove Upload-Flow Progress Dots from Record Detail

**User Story:** As a user viewing a saved record, I want the page to be free of upload-flow UI artefacts, so that the interface is clean and unambiguous.

#### Acceptance Criteria

1. THE `/records/[id]` page SHALL NOT render any progress step indicator (step dots, stepper, or progress bar) that belongs to the upload flow.
2. WHEN a progress step component is conditionally included in a shared layout, THE layout SHALL NOT render it on the `/records/[id]` route.

---

### Requirement 6: Prominent "View Original Document" Link

**User Story:** As a user, I want the link to my original uploaded document to be visually prominent, so that I can easily find and open it.

#### Acceptance Criteria

1. THE `DocumentLink` sub-component inside `DocumentDetail` SHALL render with a visually distinct style that makes it stand out from surrounding content sections.
2. THE `DocumentLink` SHALL display a labelled call-to-action text of "View your original prescription →" for prescription records and "View your original lab report →" for lab report records.
3. THE `DocumentLink` SHALL retain its existing behaviour of opening the signed URL in a new tab.
4. WHEN `signedFileUrl` is null, THE `DocumentDetail` SHALL NOT render the `DocumentLink`.

---

### Requirement 7: WhatsApp Share Preview Modal

**User Story:** As a user sharing a prescription via WhatsApp, I want to preview the exact message before it is sent, so that I can confirm the content and avoid accidental shares.

#### Acceptance Criteria

1. WHEN the user taps the WhatsApp share button (either the nav icon or the full button), THE `ShareButton` SHALL display a SharePreviewModal before opening WhatsApp.
2. THE SharePreviewModal SHALL show the complete message text that will be sent, formatted identically to the text passed to `wa.me`.
3. THE SharePreviewModal SHALL provide a "Share on WhatsApp" confirm action and a "Cancel" action.
4. WHEN the user confirms, THE `ShareButton` SHALL open `https://wa.me/?text=<encoded>` in a new tab and close the modal.
5. WHEN the user cancels, THE `ShareButton` SHALL close the modal without opening WhatsApp.
6. THE SharePreviewModal SHALL be accessible: it SHALL trap focus while open, SHALL be dismissible via the Escape key, and SHALL have an appropriate ARIA role of `dialog`.
7. THE SharePreviewModal SHALL render as a bottom sheet on mobile viewports (< 768 px) and as a centred modal on desktop viewports (≥ 768 px).

---

### Requirement 8: Viral Attribution Line in WhatsApp Share Message

**User Story:** As a product owner, I want every WhatsApp share message to include a viral attribution line, so that recipients are encouraged to upload their own records.

#### Acceptance Criteria

1. THE `buildSummaryText` function in `ShareButton` SHALL append the ViralAttributionLine "Shared via Vitae — upload yours at vitae.health" as the final line of every generated message.
2. THE ViralAttributionLine SHALL appear after the existing "⚠️ AI-generated summary" disclaimer line.
3. THE share message SHALL include the patient name (from the `patientName` prop) in the opening line.

---

### Requirement 9: Two-Column Desktop Layout on Record Detail

**User Story:** As a desktop user viewing a prescription, I want to see the medication list and doctor notes side by side, so that I can read both without scrolling back and forth.

#### Acceptance Criteria

1. WHEN the viewport width is ≥ 768 px and the record is a prescription, THE `DocumentDetail` SHALL render a two-column CSS grid layout with the medication list in the left column and the doctor notes section plus share button in the right column.
2. WHEN the viewport width is < 768 px, THE `DocumentDetail` SHALL render a single-column stacked layout (existing behaviour).
3. THE two-column layout SHALL display both columns simultaneously without requiring horizontal scrolling.
4. WHEN the record is a lab report, THE `DocumentDetail` SHALL use the single-column layout at all viewport widths.

---

### Requirement 10: Name Casing Normalisation on Timeline

**User Story:** As a user viewing the timeline, I want profile names to appear in correct title case, so that names like "LAvanya" are displayed as "Lavanya".

#### Acceptance Criteria

1. THE `TimelineView` SHALL apply a `toTitleCase` utility function to every `profile_name` value before rendering it in filter chips and any other display locations within the component.
2. THE `toTitleCase` utility SHALL convert each word in the input string so that the first character is uppercased and all subsequent characters are lowercased.
3. THE `toTitleCase` utility SHALL handle null or empty string inputs by returning an empty string.
4. THE `toTitleCase` utility SHALL be defined in a shared utility module (e.g. `lib/utils/string.ts`) so it can be reused across components.

---

### Requirement 11: Labelled Filter Chip Rows on Timeline

**User Story:** As a user, I want the filter chip rows on the timeline to have clear row labels, so that I can immediately understand what each row of chips filters.

#### Acceptance Criteria

1. THE `TimelineView` SHALL render a "Who:" label to the left of the profile filter chip row.
2. THE `TimelineView` SHALL render a "Type:" label to the left of the document type filter chip row.
3. THE row labels SHALL be styled consistently with the existing `text-text-muted` token and SHALL be visually aligned with the first chip in each row.
4. WHEN only one profile exists (the `multiProfile` condition is false), THE "Who:" row SHALL NOT be rendered.

---

### Requirement 12: First-Name-Only Filter Chips on Mobile

**User Story:** As a mobile user, I want profile filter chips to show only the first name, so that chips remain compact and the row does not overflow on small screens.

#### Acceptance Criteria

1. WHEN the viewport width is < 768 px, THE `TimelineView` SHALL display only the first word of `profile.full_name` in each profile filter chip.
2. WHEN the viewport width is ≥ 768 px, THE `TimelineView` SHALL display the full `profile.full_name` in each profile filter chip.
3. THE first-name extraction SHALL use the first whitespace-delimited token of the TitleCase-normalised `full_name`.

---

### Requirement 13: Medication Count Badge on RecordCard

**User Story:** As a user scanning the timeline, I want to see how many medications a prescription contains, so that I can quickly gauge the complexity of each record.

#### Acceptance Criteria

1. WHEN a `TimelineDocument` has a `medication_count` value greater than 0, THE `RecordCard` SHALL render a badge displaying "[N] medication[s]" (singular when N = 1, plural otherwise).
2. WHEN `medication_count` is null, zero, or the record is a lab report, THE `RecordCard` SHALL NOT render the medication count badge.
3. THE medication count badge SHALL use the existing `Badge` component with `variant="primary"` and `size="sm"`.

> **Note:** `TimelineDocument` does not currently include a `medication_count` field. This requirement implies adding `medication_count: number | null` to the `TimelineDocument` interface and populating it in `recordsService.getAllDocumentsForUser` via a join to the `medications` table or the `document_analyses.medications_found` JSONB array length.

---

### Requirement 14: Year-Prominent Date Grouping on Timeline

**User Story:** As a user whose records span multiple years, I want records grouped by year first and then by month, so that I can navigate my health history chronologically.

#### Acceptance Criteria

1. WHEN the records in `TimelineView` span more than one calendar year, THE `TimelineView` SHALL render YearGroup headers as the primary grouping level and MonthGroup headers as sub-groups within each year.
2. WHEN all records fall within a single calendar year, THE `TimelineView` SHALL render only MonthGroup headers (existing behaviour), without a YearGroup header.
3. THE YearGroup header SHALL display the four-digit year (e.g. "2024") in a visually prominent style (larger or bolder than the MonthGroup header).
4. THE MonthGroup header SHALL display the month name only (e.g. "March") when nested under a YearGroup, and "Month Year" (e.g. "March 2024") when rendered standalone.
5. THE grouping SHALL preserve the existing descending sort order (newest records first by default).

---

### Requirement 15: "Add Another Record" CTA Below Existing Records

**User Story:** As a user who has records on the timeline, I want a prompt to add more records at the bottom of the list, so that I am reminded to keep my health history up to date.

#### Acceptance Criteria

1. WHEN `TimelineView` renders at least one record, THE `TimelineView` SHALL render an "Add another record →" call-to-action below the last record group.
2. THE CTA SHALL be a `Button` component with `variant="secondary"` and `href="/dashboard"`.
3. THE CTA SHALL NOT be rendered when the filtered list is empty (the existing empty state is shown instead).

---

### Requirement 16: Client-Side Search on Timeline

**User Story:** As a user with many records, I want to search my timeline by doctor name, condition tag, or medication name, so that I can quickly find a specific record.

#### Acceptance Criteria

1. THE `TimelineView` SHALL render a search input field above the filter chip rows.
2. WHEN the user types a SearchQuery of one or more characters, THE `TimelineView` SHALL filter the displayed records to those where at least one of the following matches (case-insensitive, partial match): `doctor_name`, any value in `tags`, or any medication name in the record's summary or tags.
3. WHEN the SearchQuery is empty, THE `TimelineView` SHALL display all records (subject to active profile and type filters).
4. THE search filter SHALL be applied in combination with the existing profile and type filters (all active filters are ANDed together).
5. THE search input SHALL have a placeholder text of "Search by doctor, condition, or medication…".
6. THE search input SHALL be accessible with an associated `<label>` or `aria-label` of "Search records".

> **Note:** Because `TimelineDocument` does not carry individual medication names, the search against medication names will match against the `tags` array and `summary` field. A future enhancement may add a `medication_names` field to `TimelineDocument`.

---

### Requirement 17: Sort Control on Timeline

**User Story:** As a user, I want to sort my timeline records by date or document type, so that I can view my history in the order most useful to me.

#### Acceptance Criteria

1. THE `TimelineView` SHALL render a sort control (e.g. a segmented control or select element) that allows the user to choose a SortOrder.
2. THE sort control SHALL offer three options: "Newest first", "Oldest first", and "By type".
3. WHEN SortOrder is `newest_first`, THE `TimelineView` SHALL display records with the most recent `document_date` first (existing default behaviour).
4. WHEN SortOrder is `oldest_first`, THE `TimelineView` SHALL display records with the earliest `document_date` first.
5. WHEN SortOrder is `by_type`, THE `TimelineView` SHALL group records by `document_type` (prescriptions before lab reports) and within each type sort by `document_date` descending.
6. THE sort control SHALL default to `newest_first` on initial render.
7. THE sort control SHALL be accessible with an associated `aria-label` of "Sort records".
