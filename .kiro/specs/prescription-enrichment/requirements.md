# Requirements Document

## Introduction

The **prescription-enrichment** feature delivers three targeted improvements to the prescription upload and review experience in Vitae. All three improvements are aimed at reducing friction for elderly users — the primary audience — and at making the AI-generated explanation more clinically useful.

1. **Camera capture shortcut** — A single HTML attribute change (`capture="environment"`) on the photo file input in `UploadPicker` so that mobile browsers open the rear camera directly instead of the OS file picker. No new infrastructure required.

2. **Medicine product images** — Real drug-packaging photos sourced from the OpenFDA RxImage API are displayed next to each medicine in `ReviewScreen` (upload validation step) and in `MedicationCard` (AI explanation). The existing illustrated `MedicinePacket` component is retained as a fallback when no image is found. This is a key go-to-market differentiator: elderly users identify medicines by their packaging.

3. **Allergies & food preferences in AI prompt** — The `family_profiles.allergies` column already exists in Supabase but is never read or written. This feature (a) passes the profile's allergies into `buildExplainPrompt()` so Gemini can populate the `avoid` field per medication, and (b) surfaces a UI path on the settings page so users can set and edit allergies for each profile.

No new database tables are required. All schema changes are additive reads/writes to existing columns.

---

## Glossary

- **UploadPicker**: The React client component at `components/features/upload/UploadPicker.tsx` that presents the file-upload and manual-entry options (Step 1 of 3).
- **ReviewScreen**: The React client component at `components/features/upload/ReviewScreen.tsx` that shows OCR-extracted prescription data for user verification (Step 2 of 3).
- **MedicationCard**: The React client component at `components/features/explanation/MedicationCard.tsx` that renders a single medication in the AI explanation view.
- **MedicinePacket**: The illustrated SVG-based drug-packaging placeholder rendered inside `MedicationCard` when no real product photo is available.
- **RxImage_API**: The OpenFDA RxImage REST endpoint at `https://rximage.nlm.nih.gov/api/rximage/1/rxnav?name={name}`. Free, no API key, returns real drug-packaging photos as JSON with an `nlmRxImages` array; each entry has an `imageUrl` field.
- **Explain_Service**: The shared explanation-generation module at `lib/explain.ts`, specifically the `buildExplainPrompt()` function and `generateExplanation()` function.
- **Profile**: A row in the `family_profiles` Supabase table representing one family member's health record.
- **Allergies**: The `allergies text[]` column on `family_profiles`. Stores free-text allergy and food-preference strings (e.g. `["penicillin", "dairy", "NSAIDs"]`).
- **MedicationExplanation**: The TypeScript type (in `types/`) representing one medication entry in the AI explanation response. Already has an `avoid` field.
- **Settings_Page**: The route at `app/(app)/settings/page.tsx`, currently a stub showing email and sign-out only.
- **AllergyEditor**: The new UI component (to be built) that allows a user to view and edit the `allergies` array for a given Profile on the Settings_Page.

---

## Requirements

### Requirement 1: Camera Capture Shortcut on Mobile

**User Story:** As an elderly mobile user, I want tapping "Upload a Photo" to open my rear camera directly, so that I do not have to navigate through the OS file picker to find the camera option.

#### Acceptance Criteria

1. WHEN a user taps the "Upload a Photo" label on a mobile device, THE UploadPicker SHALL present the device's rear-facing camera as the default capture method by setting `capture="environment"` on the photo file input element.
2. WHILE `capture="environment"` is set, THE UploadPicker SHALL continue to accept image files selected from the gallery on devices where the browser falls back to the file picker.
3. THE UploadPicker SHALL retain the existing file-size validation (6 MB limit) and error display for files selected via camera capture.
4. THE UploadPicker SHALL retain the existing accepted MIME types (`image/jpeg`, `image/png`, `image/webp`, `image/*`) for the photo input.

---

### Requirement 2: Medicine Product Images from RxImage API

**User Story:** As an elderly user reviewing my prescription, I want to see a real photo of each medicine's packaging, so that I can confirm I am looking at the correct medicine before I take it.

#### Acceptance Criteria

1. WHEN a medicine card is rendered in ReviewScreen or MedicationCard, THE System SHALL fetch a product image for that medicine from the RxImage_API using the medicine name as the query parameter.
2. WHEN the RxImage_API returns one or more results in the `nlmRxImages` array, THE System SHALL display the `imageUrl` of the first result as the medicine's product photo.
3. WHEN the RxImage_API returns an empty `nlmRxImages` array, THE System SHALL display the MedicinePacket illustrated placeholder instead of a product photo.
4. IF the RxImage_API request fails or times out, THEN THE System SHALL display the MedicinePacket illustrated placeholder and SHALL NOT surface an error to the user.
5. WHILE a product image is loading, THE System SHALL display a loading skeleton in the image area that matches the dimensions of the MedicinePacket placeholder (88×100 px in MedicationCard).
6. THE System SHALL cache RxImage_API responses for the duration of the browser session so that the same medicine name does not trigger duplicate network requests within a single upload or explanation session.
7. WHERE a product image is displayed, THE System SHALL render it with an accessible `alt` attribute containing the medicine name.
8. THE System SHALL fetch RxImage_API images client-side only; no server-side proxy is required because the API is public and CORS-permissive.

---

### Requirement 3: Allergies Passed into AI Explanation Prompt

**User Story:** As a caregiver managing prescriptions for a family member with known allergies, I want the AI explanation to flag potential interactions between prescribed medicines and the profile's allergies, so that I can raise concerns with the doctor before the medicine is taken.

#### Acceptance Criteria

1. WHEN `generateExplanation()` is called with a Profile that has a non-empty `allergies` array, THE Explain_Service SHALL include the profile's allergies in the prompt sent to Gemini.
2. WHEN allergies are included in the prompt, THE Explain_Service SHALL instruct Gemini to populate the `avoid` field of each MedicationExplanation with any relevant allergy interactions or food/drink contraindications specific to that medicine.
3. WHEN `generateExplanation()` is called with a Profile whose `allergies` array is empty or null, THE Explain_Service SHALL generate the explanation without allergy context, preserving existing behaviour.
4. THE Explain_Service SHALL accept an optional `allergies: string[]` parameter in `buildExplainPrompt()` without breaking existing callers that do not pass allergies.
5. WHEN the AI explanation is displayed and the `avoid` field for a medication is non-empty, THE MedicationCard SHALL display the `avoid` field content in the existing "Avoid" detail row.

---

### Requirement 4: Allergy Data Read Path (Upload Flow)

**User Story:** As a caregiver uploading a prescription for a family member, I want the AI explanation to automatically use that member's saved allergies, so that I do not have to re-enter allergy information on every upload.

#### Acceptance Criteria

1. WHEN the authenticated upload flow calls the explain API for a specific `profileId`, THE System SHALL read the `allergies` column from the corresponding `family_profiles` row.
2. WHEN the public (unauthenticated) upload flow calls the explain API, THE System SHALL generate the explanation without allergy context because no profile is associated.
3. THE System SHALL pass the retrieved `allergies` array to `generateExplanation()` so that Requirement 3 criteria are satisfied.
4. IF the `family_profiles` query for allergies fails, THEN THE System SHALL proceed with explanation generation without allergies and SHALL log the error server-side.

---

### Requirement 5: Allergy Editor on Settings Page

**User Story:** As a user, I want to view and edit the allergies and food preferences for each family profile from the settings page, so that the AI explanation can use up-to-date information.

#### Acceptance Criteria

1. THE Settings_Page SHALL display a list of all family profiles accessible to the authenticated user.
2. WHEN a user selects a profile on the Settings_Page, THE AllergyEditor SHALL display the current `allergies` array for that profile as a list of removable tags.
3. WHEN a user types a new allergy or food preference and confirms it, THE AllergyEditor SHALL add the entry to the profile's `allergies` array and persist the change to the `family_profiles` table via a Server Action.
4. WHEN a user removes an allergy tag, THE AllergyEditor SHALL remove that entry from the profile's `allergies` array and persist the change to the `family_profiles` table via a Server Action.
5. IF the Server Action to update allergies fails, THEN THE AllergyEditor SHALL display an inline error message and SHALL retain the user's unsaved input so the user can retry.
6. THE AllergyEditor SHALL enforce a maximum of 20 allergy entries per profile to prevent unbounded prompt growth.
7. THE AllergyEditor SHALL trim whitespace and deduplicate entries (case-insensitive) before persisting, so that "Penicillin" and "penicillin" are not stored as separate entries.
8. WHEN the allergies list for a profile is empty, THE AllergyEditor SHALL display an empty-state prompt encouraging the user to add known allergies or food restrictions.
