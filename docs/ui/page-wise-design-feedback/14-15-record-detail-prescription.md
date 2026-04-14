# 14+15 — Record Detail, Prescription (`/records/[id]`) — UI/UX & CRO Critique

**Screenshots:** `14-record-detail-rx-meta-and-meds.png` (top section) + `15-record-detail-rx-ai-cards-and-share.png` (bottom section)
**Route:** `/records/[id]`
**Goal:** Display a saved prescription record with full AI explanation. This is the primary ongoing value screen — users return here repeatedly to reference their medications.
**Stakes:** This screen is used at the pharmacy, at a follow-up appointment, at home when trying to remember a dosage. Real-world utility is the standard. Confusion here costs health.

---

## SCREEN 14 — Top Section (Meta + Medication List)

---

### 1. "For aashikvilla99" — Username as Patient Name

**Current:** Below the doctor name heading, "For aashikvilla99" is the patient attribution.

This problem appears on multiple screens and represents a fundamental data-binding error. The patient name on a medical record detail should be:
- The profile's `full_name` (e.g., "For Aashik" or "For Aashik Sharma")
- NOT the authentication username handle

At a doctor's appointment or pharmacy, a user shows this screen on their phone. "For aashikvilla99" on a medical record does not look credible, professional, or trustworthy. It looks like a debugging artefact.

**Fix:** In `records.service.ts`, when assembling the `RecordDetail`, pull `profileName` from `family_profiles.full_name`, not from `auth.users.email` or any username-derived field. This is already implemented for `profileName` in `records/[id]/page.tsx` — the issue may be in how the display name is being resolved for the authenticated user's own profile vs. family member profiles.

---

### 2. Diagnosis Tag — Colour and Shape

**Current:** "R knee pain and difficulty in going up by stairs" in a teal rounded-rectangle badge below the doctor name.

**What works:** Teal colour is distinct from the rest of the meta text. Badge communicates "category" not "data."

**What fails:**
- The tag text is long (44 characters) and does not truncate — it wraps to two lines. At 14px, a two-line badge below the doctor name pushes the medication section header further down the page.
- On mobile (375px), this tag wraps to 3 lines, consuming significant vertical space before the user sees any medication content.

**Fix:** Truncate tags at 30–35 characters with ellipsis and expand on tap. Or extract the key noun phrase ("Knee pain") and store it as a shorter display tag, with the full text accessible in an expanded view.

---

### 3. Navigation — Back Arrow Goes to Dashboard

**Current:** "←" back arrow in the top-left nav.

**What works:** Navigating back to the dashboard is the expected "exit" behaviour from a record detail.

**Missing:** A breadcrumb or nav label showing context. On desktop, the narrow page width with just "Prescription" as the header title leaves users disoriented: which prescription? Whose? The nav area should show: "← Records · M. M. Joynal Abedin · Nov 2010" or at minimum "← Back to LAVanya's Records."

---

### 4. WhatsApp Icon — Nav Placement

**Current:** WhatsApp icon in the top-right corner of the nav.

**The issue:** Top-right icons are discovery-dependent — users must look for them. On mobile, the top-right is outside the natural thumb reach zone. The WhatsApp share icon here is correct for "quick share while reading" but insufficient as the primary share mechanism.

The full-width green WhatsApp button at the bottom of screen 15 is the primary share CTA. The nav icon should be visually lighter to avoid competing with the bottom button.

**Accessibiltiy:** The icon alone without a text label has `aria-label="Share via WhatsApp"` requirement.

---

### 5. "MEDICATIONS · 7" Section Header

**Current:** "MEDICATIONS · 7" in uppercase tracking above the medication list.

**What works:** The count "7" is useful information at a glance.

**What fails:** "MEDICATIONS" in 10px uppercase is barely readable. With 7 medications and a count in the header, a more useful framing would be "7 Medications" at 14px medium weight with a pill icon. The current presentation feels like a database field label.

---

### 6. Medication Rows — "As directed by your doctor" × 7

**Current:** Each medication row shows:
- Drug name (bold)
- "As directed by your doctor" (frequency, in grey)
- Dosage (right-aligned, grey)

**This is Screen 14 — the pre-AI-merge state.** The medication list here is the raw OCR data, not the AI-enriched cards. The prescription was saved without rich AI data, and the on-demand explanation hasn't fired yet.

After the record+explanation merge (now implemented in the codebase), Screen 14 and 15 are the same page. But the issue of "As directed by your doctor" × 7 persists in the merged view (Screen 15) as well.

**The usability damage:** Seven identical "As directed by your doctor" rows mean users cannot scan the list to find a specific medication's frequency. Every row looks identical. The medication list becomes a drug name lookup table — nothing more.

**AI opportunity:** The AI explanation step generates rich data (Treats, How to take, Side effects, Avoid). When this data is available, the medication list should switch to the MedicationCard format. When it's not available (legacy records), the row should at minimum show dosage only, not the generic frequency string.

---

### 7. "Read plain-language explanation →" CTA — Pre-Merge State

**Current:** Sticky blue bar at the bottom of screen 14: "Read plain-language explanation →"

This two-page UX (record list → separate explanation page) has been fixed in the current codebase. The explanation is now inline on `/records/[id]`. Screenshot 14 documents the old state.

The new single-page experience (Screen 15) is the correct implementation. ✓

---

## SCREEN 15 — Bottom Section (AI Cards + Share)

---

### 8. Nav Title — "Your Prescription"

**Current:** "Your Prescription" as the nav title (confirmed in screenshot 15).

**What works:** More personalised than just "Prescription."

**Issue:** "Your Prescription" is correct when viewing your own profile's records. When a parent views a child's prescription, "Your Prescription" is factually wrong — it's "LAVanya's Prescription." The nav title should be dynamic: `{profileName}'s Prescription` for family members, "Your Prescription" for own profile only.

---

### 9. Sub-Header Line

**Current:** "M. Joynal Abedin · 11 Nov 2010 · For aashikvilla99" in tiny muted text below the nav.

**Three problems:**
1. "M. Joynal Abedin" — note the first initial "M." only. The full doctor name in the meta block is "M. M. Joynal Abedin" — the sub-header truncates to "M. Joynal Abedin." This inconsistency (one "M." vs two "M. M.") may be a display-length truncation bug.
2. "For aashikvilla99" — same username issue as before
3. The entire line is in very small (11px?) muted text. When a user shares this screen via screenshot, this attribution line will be barely legible.

**Fix:** Full doctor name, real patient display name, slightly larger text (13px minimum).

---

### 10. Disclaimer Banner — Peak-End Rule Violation (Repeated)

**Current:** Full-width yellow banner: "AI generated summary. Do not adjust medication based on this. Consult M. M. Joynal Abedin before making any changes."

This is the third screen in the authenticated flow where the disclaimer banner is the first prominent element. The pattern is consistent and consistently wrong.

**When this screen is viewed:** A user opens a saved prescription to reference it at home, at the pharmacy, or at a follow-up appointment. They already saved this prescription. They've already read the explanation. They are returning to a familiar screen for a specific reference purpose (finding a dosage, sharing the list, checking a side effect).

Showing a full-width anxiety-inducing banner as the first thing on a screen they're returning to is noise at best, user-hostility at worst.

**Fix for the saved record context:** On `/records/[id]` (not the upload flow), reduce the disclaimer to a small "ⓘ AI-generated" badge in the record meta area. The full disclaimer belongs on the first viewing only — after that, it's clutter.

---

### 11. "Step 3 of 3" — Progress Dots on a Saved Record Page

**Current:** Three filled progress dots appear at the top of Screen 15.

This is a confirmed bug: the progress indicator from the upload flow is leaking onto the saved record detail page. The record is already saved — there is no "step 3 of 3" context. These dots must be removed from `/records/[id]`.

---

### 12. MedicationCards — The Product's Signature

**Current:** 7 cards with:
- Coloured medicine-packet illustration (unique, excellent)
- Drug name (large)
- Dosage (below name)
- "As directed by your doctor" in teal (frequency — generic, useless)
- "View details →" expand link
- Expanded: Treats / How to take / Side effects / Avoid

**What's excellent:** The visual identity of these cards is the best design work in the product. The coloured medicine-packet illustration is distinctive and non-generic. The expandable detail sections are well-organised information architecture.

**What still needs fixing:**

1. **"As directed by your doctor" in the AI cards:** Even in the AI-enriched view, the frequency field shows the generic OCR value. The AI explanation step (which generates Treats/How to take/Side effects) should also generate a specific, context-aware frequency statement. Instruction to LLM: "For this medication in this clinical context, provide a more specific frequency guidance: 'Typically 1–2 times daily' or 'Usually prescribed after meals'."

2. **"Tab." and "Cap." prefixes:** "Tab. Ultrafen plus", "Cap. Omepraz" — these OCR artefacts from prescription format appear in the card title and the medicine-packet illustration text. The illustration text "Tab." looks wrong on a card that's meant to be a polished AI output. Strip at normalisation layer.

3. **No dosage context in expanded view:** The expanded view shows Treats / How to take / Side effects / Avoid. It doesn't show the specific dosage amount. If "Tab. Ultrafen plus" is at 50mg, and the user opens the card details, the dosage should appear prominently within the expanded context: "50mg · Take as directed · After meals." Context-awareness in the expanded view.

4. **All 7 cards collapsed by default is correct.** But the first card could be pre-expanded to demonstrate the interaction pattern for first-time viewers. "Tap any card to learn more" as a one-time hint on first record view.

---

### 13. "Things to Tell Your Doctor" Section

**Current:** Dashed-border box with 4 bullet points of advice.

**What works:** The dashed border correctly differentiates this from medication cards. The content is specific and genuinely useful.

**What could be improved:**

1. **Section title:** "Things to tell your doctor" is good but passive. "📋 Bring This to Your Next Appointment" is more actionable. Or: "Questions to Ask Your Doctor."

2. **Bullet readability:** Four bullets of 1–2 sentences each. On mobile these can feel dense. Add more visual breathing room between bullets (12px gap vs. 8px).

3. **Tappable copy:** Each bullet point could be individually tappable to expand or to copy to clipboard. A user preparing for a doctor's appointment might want to copy the list to their phone's notes or message it. "Copy to clipboard" icon per bullet, or "Copy all questions" at the bottom of the section.

---

### 14. WhatsApp Share — Full Width Button

**Current:** Full-width green "Share via WhatsApp" button at the bottom of the content, above the sticky CTA area.

**What works:** Full-width, correct colour (WhatsApp green #25D366), clear label.

**What could improve the share experience:**

1. **Preview of what gets shared:** Before sharing, users should see a preview: "This is what you'll share: [mini preview]." Blind sharing of medical records to WhatsApp is a privacy concern — users should know exactly what message will be sent.

2. **Share content format:** What exactly is shared? Presumably a formatted text list of medications + "Things to tell your doctor." The share message should include a Vitae attribution link: "From Vitae — upload your own prescription at [URL]" — this is organic viral acquisition. Every share is a product impression for the recipient.

3. **Share personalisation:** "Share [patient name]'s prescription" vs. generic. When a caregiver shares their parent's prescription with a sibling, the message should include the patient name.

---

### 15. "Save to My Records" Button — Wrong Component

**Current:** A dark full-width button at the very bottom: "Save to My Records."

This button must not exist on `/records/[id]`. The record is already saved. This is `ExplanationActions` rendering incorrectly.

**User confusion:** "Is my record not saved? Was my upload incomplete?" This button on a saved record page is the most trust-damaging element on this screen. A user who taps it gets an unexpected error or re-save flow, neither of which is the right behaviour.

**Fix:** Remove `ExplanationActions` from the record detail page. It belongs only on the public `/upload` flow.

---

## Cross-Screen Issues (14+15)

### Desktop Layout

Both screens render as a narrow (~400px) centred column on desktop. On a 1440px desktop, this is a 400px card in a 1440px window. The content is correct but the layout is clearly a mobile-first design not adapted for desktop.

**Desktop opportunity:** Side-by-side layout:
- Left column (600px): Meta header + medication list
- Right column (400px): Doctor notes + share button + view original document

This would make much better use of horizontal space and allow users to view the medication list and doctor notes simultaneously.

### Original Document Link

Both screens may show a "View original document" link if the file was stored. This is a significant trust feature — users can verify the AI extraction against the original. Make it more prominent: "View your original prescription →" with a document icon, not a small text link.

---

## Accessibility

**MedicationCard expand/collapse:** Each card must have `aria-expanded` attribute updated on toggle. The button text should change from "View details" to "Hide details" when expanded.

**Focus management:** When a card is expanded, focus should not jump — the card stays in place and content appears below. But the user should be able to Tab to the newly revealed content.

**WhatsApp button:** Must have `aria-label="Share prescription via WhatsApp"` — not just "Share via WhatsApp" without context of what's being shared.

**Colour contrast in medication cards:** The teal frequency text ("As directed by your doctor") against white card background — verify this passes WCAG AA (4.5:1 for small text).

---

## Mobile Priority Fixes

| Fix | Impact | Effort |
|---|---|---|
| Remove "Save to My Records" button | Trust critical | 30min |
| Remove step 3 progress dots | Clutter | 30min |
| Fix "For aashikvilla99" to display name | Identity/trust | 1h |
| Reduce disclaimer to compact form on saved records | Peak-end quality | 1h |
| Strip "Tab." / "Cap." from card titles | Polish | 2h |
| Add share preview before WhatsApp share | Privacy/trust | 4h |
| Add viral attribution to WhatsApp share message | Growth | 1h |
| Desktop 2-column layout | Desktop UX | 1 day |
