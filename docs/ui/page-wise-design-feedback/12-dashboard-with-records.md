# 12 — Dashboard — With Records (`/dashboard`) — UI/UX & CRO Critique

**Screenshot:** `12-dashboard-hub-with-records.png`
**Route:** `/dashboard`
**Goal:** Show the most important health information for the selected profile at a glance. Drive repeat visits by surfacing actionable, personally relevant content.
**Stakes:** This is the home screen for retained users. It determines whether they return daily, weekly, or never. Weak information surfacing = low retention.

---

## 1. Active Medications Strip — Product's Key Daily Feature, Broken

**Current:** "YOUR ACTIVE MEDICATIONS" section shows 7 medications:
- Tab. Ultrafen-plus · 50mg · "As directed by your doctor"
- Tab. Relentus · — · "As directed by your doctor"
- Tab. Ultracal-D · — · "As directed by your doctor"
- Tab. Cartlix · — · "As directed by your doctor"
- Tab. Diclofenac · 50mg · "As directed by your doctor"
- Tab. Ultracal-D · — · "As directed by your doctor" (duplicate)
- Cap. Omepraz · 20mg · "As directed by your doctor"

**Problem 1 — "As directed by your doctor" × 7:** Every single medication row shows the identical frequency string. This is the OCR-extracted value from the prescription. When OCR captures "As directed by your doctor" as the frequency, that value should not be blindly displayed when it adds zero information. The entire medications strip becomes a list of drug names with no differentiating context.

**What the strip should communicate per row (priority order):**
1. Drug name (current ✓)
2. Dosage amount (current, partial — some show "50mg", some show "—")
3. Frequency (NOT "As directed by your doctor" — show "Twice daily", "After meals", or nothing)
4. Duration context (optional: "Day 3 of 7" for a course of antibiotics)

**Fix rule:** If `frequency` value matches any of: "as directed", "as advised", "as prescribed", "per doctor instructions" — show `dosage` in the frequency position, or show nothing. Never repeat generic instructions across 7 rows.

**Problem 2 — Duplicate entry:** "Tab. Ultracal-D" appears twice in the list. This is a data quality issue — either the same medication was extracted twice from the prescription, or two separate medications have the same name. The UI should deduplicate or flag: "Tab. Ultracal-D appears twice — was this prescribed twice?"

**Problem 3 — Broken grey square icons:** Each row has a small grey square (approximately 20×20px) before the drug name. These are clearly broken placeholder boxes where a styled medicine icon or the coloured mini-pill illustration should appear. Broken image placeholders are one of the highest-perceived-quality damage signals in UI — users read them as "this app is broken."

**Fix:** Either use the same coloured medicine-packet illustration as MedicationCard (scaled to 24px), or use a consistent generic pill icon (⬤ or 💊 emoji as fallback). No broken grey squares.

**Problem 4 — All 7 medications listed:** For a user checking their dashboard, seeing 7 medications in a strip is excessive. The strip is designed for a quick glance — "what am I supposed to take today?" Show 3–4, with "View all 7 →" link. The current design defeats its own purpose by showing everything.

---

## 2. Profile Wheel — Active State and Overflow

**Current:** "A" (You, grey), "L" (LAVanya, blue/active), "+" (Add), with "Edit profile" link top-right.

**Active state:** The blue circle for active profile (LAVanya) vs. grey for inactive (You) — works.

**"Edit profile" appears here but not on the empty state:** This inconsistency was noted in Screen 09. Either show it in both states or neither. If it edits the active profile, the label should be "Edit LAVanya" — otherwise users don't know which profile they're editing.

**"Edit profile" is not visible in dashboard with records screenshot.** Wait — looking at the screenshot, it says "Edit profile" is visible top-right. Confirm this is present in both empty and populated states for consistency.

---

## 3. Documents Section — Information Architecture

**Current:** "YOUR DOCUMENTS · View all" header, followed by one prescription card: "M. M. Joynal Abedin · 11 Nov 2010 · 7 medications · [R knee pain and difficulty in going up by stairs...] · ⋮"

**What works:**
- Doctor name + date + medication count is a good information density choice
- "View all" link to timeline is correct

**What fails:**

**1. Section header "YOUR DOCUMENTS" when a profile is selected:** If LAVanya is the active profile, this should read "LAVANYA'S DOCUMENTS" — not "YOUR DOCUMENTS." The pronoun "YOUR" is contextually wrong when viewing a family member's profile. This is a personalisation bug.

**2. Diagnosis tag truncated with "...":** "R knee pain and difficulty in going up by stairs" truncates mid-sentence with "...". Tags are the primary scannable differentiator between records. A truncated tag is useless. Either:
- Shorten at source: if the tag is >30 chars, extract the key noun phrase ("Knee Pain")
- Allow 2-line display
- Show the tag in a tooltip on hover/tap

**3. Only one document visible:** If the user has multiple documents, showing only one before "View all" means the section has a very low information density for its visual weight. Show 2–3 rows before the "View all" link. The section currently takes the same vertical space whether showing 1 or 3 items.

**4. Three-dot menu (⋮) on the document row:** The overflow menu's contents are unknown. This is a known antipattern (mystery meat navigation). At minimum, the overflow should contain: "View Record", "Share via WhatsApp", "Delete." If "Delete" is in there, it needs a confirmation dialog — deleting a medical record is destructive. If the menu is empty or only has "Delete", replace it with a trash icon directly.

**5. Lab Report visibility:** The documents section shows prescriptions. Where are lab reports? Do they appear in the same section? If yes, their card design should differ slightly from prescriptions (a flask/lab icon vs. a prescription icon). If no, there should be a separate "Lab Reports" section or a unified "All Records" view. The current section header "YOUR DOCUMENTS" implies all document types, but the card design (showing "7 medications") is prescription-specific.

---

## 4. "Upload for yourself" Sticky CTA

**Current:** A sticky bottom button: "+ Upload for yourself" (full-width, blue).

**What works:** Sticky placement is correct. The "+" prefix is a standard affordance for "add new."

**What's wrong:** "Upload for yourself" when LAVanya (another profile) is selected is confusing. The user looking at LAVanya's dashboard will expect "Upload for LAVanya," not "Upload for yourself." The CTA must be contextual:
- When viewing own profile: "Upload for yourself →"
- When viewing LAVanya's profile: "Upload for LAVanya →"

This is a one-line change in the CTA label using the active profile name. The impact: eliminates the "whose upload is this?" confusion when navigating to the upload flow from a family member's profile.

---

## 5. Visual Design — Flat and Sparse

**Current:** White background, grey section headers (uppercase, 10px), white cards with light grey borders. Clean but low visual energy.

**The "sticky note board" problem:** The dashboard should feel like a living health companion, not a read-only list. Currently it feels like a simple list view — no colour, no visual accent, no personality.

**Specific improvements:**

1. **Medications strip:** Give each medication row a subtle left-border accent in the same colour as its MedicationCard counterpart. This connects the strip visually to the detailed card view and adds colour to an otherwise monochrome list.

2. **Section headers:** "YOUR ACTIVE MEDICATIONS" in uppercase 10px grey — too small, too corporate. Consider: "Active Medications" at 14px medium weight with a subtle pill icon prefix. More readable, less clinical.

3. **Profile wheel section:** The family profiles section is the most important navigational element on the page but is visually the least prominent. Bold the active profile name, add a subtle "selected" ring (not just a different background colour — a ring).

4. **Card hierarchy:** Currently the only document card has no visual hierarchy beyond the three-dot menu. High-priority items (recent lab results with abnormal values, upcoming medication end dates) should have a different visual treatment than routine records.

---

## 6. Missing Features That Should Be Here (Per FRD)

**Lab Alert card (FRD F5):** The FRD mentions surfacing out-of-range lab values on the dashboard. The current implementation has an `abnormalMarkers` structure. A "Lab Alert" card at the top of the dashboard — "⚠ LAVanya's recent CBC: 2 values outside range — [View]" — would be a high-value addition to the dashboard for users who have lab reports.

**Medication reminders strip:** FRD F4 specifies upcoming medication times. A "Coming up today" section: "💊 Tab. Ultrafen-plus at 2:00 PM" would drive daily engagement. Without any time-aware content, the dashboard is static — users have no reason to open it daily.

**Lab value trend signal:** FRD F5 specifies trending for repeated tests. If LAVanya has had multiple CBC reports, a tiny spark chart showing Haemoglobin trend over time would be a "wow" feature visible right on the dashboard. "Haemoglobin: ▲ improving over 3 tests" as a one-line entry in the documents section.

---

## 7. "Active" Pill/Badge Near Medications Header

**Current:** A small "Active" pill visible to the right of "YOUR ACTIVE MEDICATIONS."

**The ambiguity:** Is "Active" a filter toggle (showing only active medications, vs. all including discontinued ones)? Or is it a status indicator for the section? This is a mystery meat element. Users who see it will tap it expecting something — if it doesn't respond or if it's just decorative, it's a trust-eroding broken interaction.

**Fix:** If it's a filter, label it clearly: "Filter: Active ▾" with a dropdown to show "All" / "Active" / "Completed." If it's just a label/status, remove it — the section header "YOUR ACTIVE MEDICATIONS" already communicates that these are active.

---

## 8. Accessibility

**Section headers:** "YOUR ACTIVE MEDICATIONS" and "YOUR DOCUMENTS" must be semantic heading elements (`<h2>` or `<h3>`), not styled divs. Screen readers use headings to navigate between sections.

**Document card:** The entire card should be a tappable link to the record detail. The clickable area must cover the full card, not just the card title. Minimum 44px height on mobile.

**Three-dot menu accessibility:** The ⋮ button needs `aria-label="More options for M. M. Joynal Abedin record"` and `aria-haspopup="menu"`. The menu items need keyboard navigation (arrow keys to navigate, Enter to select, Escape to close).

---

## 9. Mobile Issues

**Active medications strip with 7 items:** On mobile (375px), 7 rows × ~56px each = 392px of medication list. This is half a phone screen. With section header, document section, and sticky CTA, the total page height becomes approximately 700–800px — just over 1 phone screen. Manageable, but test that all content is above the sticky CTA's overlap area.

**Sticky CTA overlap:** The "+ Upload for yourself" sticky bottom button covers the last visible document card row when the user is near the bottom of the page. Add a bottom padding to the scroll container equal to the CTA height (~60px) to prevent content from being hidden behind it.

**Profile wheel swipe:** On mobile, the profile wheel should support horizontal swipe for profile switching. With only 2 profiles (and a "+" chip), 3 elements fit easily. With 5 profiles, swipe navigation is essential.

---

## 10. CRO and Retention

**The dashboard is the retention screen.** Users return to it because it has value for their daily life. Currently, the value proposition of daily visits is weak: the medication list doesn't change unless they upload a new prescription, the documents list doesn't change.

**To drive daily engagement (ranked by impact):**
1. **Medication time reminders:** "Take Tab. Ultrafen-plus now" as a card when it's medication time
2. **Lab trend signals:** "LAVanya's Haemoglobin improved from 11.2 → 12.5 since last test ▲"
3. **Upcoming checkup prompts:** "You haven't uploaded a lab report in 6 months. Time for a checkup? →"
4. **Anniversary/follow-up alerts:** "It's been 14 days since LAVanya's last prescription — did you visit the doctor?"

None of these are on the roadmap in the current screenshots, but they're all described in the FRD. Building one of them (daily medication reminder card) would transform the dashboard from a "check occasionally" screen to a "open daily" screen.
