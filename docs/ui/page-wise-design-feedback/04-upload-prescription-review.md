# 04 — Upload Step 2b — Prescription Review (`/upload`) — UI/UX & CRO Critique

**Screenshot:** `04-pub-upload-s2b-prescription-review.png`
**Route:** `/upload` (review step, Step 2 of 3)
**Goal:** User confirms the OCR-extracted prescription data is correct, then proceeds to AI explanation.
**Stakes:** Highest drop-off risk in the entire flow. Long page, no sticky CTA (in current state), confusing empty fields, buried escape path.

---

## 1. The Single Most Critical Issue — CTA Position

**Current:** "Yes, This Looks Right →" is a sticky button at the very bottom of the page, which on this 7-medicine prescription is ~2000px of scrolling away from where the user starts reading.

Wait — looking at the screenshot more carefully, the "Yes, This Looks Right →" button does appear to be a sticky bottom bar (yellow/amber background). If it is genuinely sticky (fixed position at viewport bottom), this is actually correct.

**But the critical question is:** Is it implemented as `position: sticky` or `position: fixed`? On iOS Safari, `position: sticky` on a form element inside a scroll container does not always behave as expected. Test specifically on:
- iOS Safari (iPhone 14)
- Android Chrome (Samsung Galaxy)
- iOS Chrome

If the button is not visually present at viewport bottom at all times during scroll, this is the highest-priority fix in the product.

**Confirmation:** The screenshot shows the page at full height — the sticky button is at the very bottom of the long page. This suggests it IS fixed/sticky. But it's only visible if the user knows to look. Consider adding a micro-indicator when the user first lands: "Scroll to review, then confirm below ↓" as a one-time hint.

---

## 2. Section Architecture — "MEDICINE 1 / MEDICINE 2" Labels Are Worthless

**Current:** Seven medicines each have a header: "MEDICINE 1", "MEDICINE 2", "MEDICINE 3"... in uppercase grey text.

**The failure:** These labels carry zero information. A user scanning the page to find a specific medication — say, Diclofenac — must read every card. The number "Medicine 4" gives no orientation. Compare to using the medicine name itself as the section header: "Tab. Ultrafen-plus", "Tab. Diclofenac" — instantly scannable, directly useful.

**Fix:** Replace "MEDICINE N" with the extracted medicine name as the bold section header. Move the name field inside the card to a secondary position or remove it as a separate editable field (since it's already the header).

**Secondary fix:** Add a "jump to" anchor list at the top of the medicines section: small tappable chips for each medicine name, allowing quick navigation. For 7 medicines this is marginal, but for 10+ medicines on a long prescription, this is essential.

---

## 3. Empty Fields — "Tap to add..." Antipattern at Scale

**Current:** Each medicine has fields for Name, Dosage, and Duration. When OCR doesn't extract a value, the field shows "Tap to add..." as a placeholder.

**The problem:** 7 medicines × 2–3 empty fields = up to 21 "Tap to add..." placeholders. The page looks like the OCR failed catastrophically. Users interpret multiple empty "tap to add" fields as system failure, not as "OCR had partial success."

**Cognitive load (Miller's Law):** Asking a user to verify and potentially fill 21 fields simultaneously is beyond working memory capacity. Users will do one of three things: (1) skim-confirm everything without reading, (2) feel overwhelmed and abandon, (3) spend 5+ minutes filling every field (high friction, low retention).

**Better approach:**
- Fields the OCR couldn't extract should be collapsed by default. Show a single "+ Add duration" link per medicine, not an empty placeholder field.
- Only show fields where OCR found something — pre-filled values should be verified; missing values are optional additions.
- For Dosage specifically: if OCR found the medicine name but not dosage, show a greyed-out "N/A" not a tappable empty field. The difference signals: "we didn't find this" vs. "please fill this in."

---

## 4. Edit Buttons — Visual Noise at Scale

**Current:** Every field has an "Edit" text link in blue on the right side.

**The problem:** 7 medicines × 3 fields × 1 Edit button = 21 blue "Edit" labels visible simultaneously. The page is visually dominated by the word "Edit" in repeated blue text. This creates:
1. **Visual noise:** The important content (medicine names, dosages) competes with 21 identical blue labels.
2. **False urgency:** Showing "Edit" on every field implies every field needs attention. Most fields are correctly extracted.
3. **Fitts's Law violation:** Edit buttons are at the far right margin, far from the values they edit (values are on the left). Distance from value to edit button is 300–400px on desktop.

**Better pattern:** No permanent Edit buttons. Instead, make fields inline-editable on tap/click (like Google Docs). The field visually activates (border appears, cursor shows) when tapped. No separate edit buttons needed. A small ✓ appears to confirm the edit.

**Medical app precedent:** Apple Health, Google Health Connect — both use inline-editable fields, not rows of Edit buttons.

---

## 5. PRESCRIPTION INFO Section — Good but Incomplete

**Current:** Shows Doctor Name, Date, Illness/Diagnosis — each with an Edit button. Values shown: "M. M. Joynal Abedin", "11 Nov 2010", "R knee pain and difficulty in going up by stairs."

**What works:** Compact, clear, shows the extracted values — good.

**What's missing:**
- **No hospital/clinic name extraction** — FRD specifies extracting doctor and clinic. If the OCR found a clinic name, it should show here.
- **No confidence indicator** — If the OCR is 95% confident in "M. M. Joynal Abedin" but only 60% confident in "11 Nov 2010" (common for handwritten dates), the lower-confidence fields should have a subtle visual signal: a yellow underline, a "⚠ Verify this" tag. This helps users know which fields to check vs. trust.
- **Date format:** "11 Nov 2010" — is this from 2010 or is it a sample prescription? If it's genuinely from 2010, this is an extremely old prescription and the review should flag it: "This prescription is 14 years old — is this correct?"

---

## 6. The Disclaimer — Wrong Placement and Wrong Tone

**Current:** At the very bottom of the medicines section, in small grey text: "In general — always consult your doctor before making any medical decision."

**Serial Position Effect:** The last thing on a very long page gets read by fewer than 10% of users who reach the confirmation step. A medical disclaimer hidden at the bottom of a 7-medicine form is legally inadequate and practically invisible.

**Better placement:** The disclaimer should appear once, prominently, between the PRESCRIPTION INFO section and the MEDICINES section — before the user reviews any medicine data. "⚠ These details were extracted automatically. They may contain errors. Always confirm with your doctor before taking any medication." This placement is: (a) more legally defensible, (b) actually read by users, (c) sets the right expectation before the user starts reviewing.

---

## 7. "Upload a different prescription" — Buried Escape

**Current:** Text link at the very bottom of the page, after the footer and just above the sticky CTA.

**The problem:** The escape path (going back) is the hardest element to find on the page. If a user realises halfway through reviewing that they uploaded the wrong document, they must scroll to the absolute bottom of a 2000px page to find the cancel/restart link. This creates unnecessary friction for what should be a simple action.

**Fix:** Place a "← Upload different file" link in the nav bar (top-left, next to the logo), or as a subtle link in the page title area: "Check the Details — [wrong document?]." This gives users the escape path at the natural starting point of the review, not at the end.

---

## 8. Visual Design — Flat, Clinical, No Personality

**Current:** White background, grey section headers, blue Edit buttons, outlined field boxes. Clean but sterile.

**The opportunity:** This is the longest screen in the entire flow. Users spend the most time here. It is also the most "data entry" feeling — which is cognitively exhausting. The visual design should work to reduce that cognitive weight:

1. **Section grouping:** PRESCRIPTION INFO and MEDICINES FOUND should have distinct background colours or subtle card containers to visually separate them. Currently they merge into one flat list.

2. **Medicine cards:** Each medicine group (Name + Dosage + Duration) should be contained in a card with a subtle shadow and rounded corners. Currently they're just labelled groups of fields — no visual boundary. Cards feel more manageable than flat field groups.

3. **Colour accents:** The only colour is blue (Edit buttons). Adding a subtle coloured left-border on each medicine card (same colour system as MedicationCards in the explanation screen) would both delight the user and visually connect the review step to the result step.

4. **Empty vs. filled visual differentiation:** Filled fields (OCR success) should have a subtle green tint or ✓ icon. Empty fields (OCR missed) should have an amber tint. This immediately tells users "the green ones are confirmed, the amber ones need your attention" — a massive cognitive shortcut.

---

## 9. Accessibility Audit

**Form labels:** Every editable field needs an explicit `<label>` element associated via `for`/`id`, not just placeholder text. "Tap to add..." as placeholder is not a label. Screen readers cannot identify what the field is for without a proper label.

**Required vs. optional:** Which fields are required to proceed? Currently, the UI doesn't distinguish required from optional. The CTA should be enabled at all times (users should be able to confirm even with empty dosage fields) — but visually unclear. If any fields are required, mark them with a standard asterisk (*) and a legend.

**Scroll and focus management:** When a user taps "Edit" on a field, the screen should not jump. The field should activate in-place with no scroll offset. On mobile, the keyboard appearing pushes content up — the active field must remain visible when the keyboard is open. Test this thoroughly on iOS Safari.

**Error states:** If the user submits without required fields (if any are required), the error must identify the specific field ("Medicine 3 name is required") not a generic "Please complete all fields."

---

## 10. Mobile-Specific Issues

**7 medicines × 4 rows = 28 rows on mobile:** On a 375px screen with 48px row height minimum, this is 1344px of content before the sticky CTA. That is ~4 full screens of scrolling. The experience will feel exhausting.

**Possible solution:** Collapse all medicines to single-line "pill" format by default:
```
[Tab. Ultrafen-plus] [50mg] [— duration] [✓]
[Tab. Relentus] [—] [—] [!]
```
Green ✓ = fully extracted, amber ! = missing fields. User taps a pill to expand and edit. This compresses 28 rows to 7 rows. The user only expands what needs fixing.

**Keyboard overlap:** When editing a field and the soft keyboard appears (takes ~40% of screen on mobile), the sticky CTA button should remain visible above the keyboard, not be hidden behind it. This requires specific handling: if keyboard is open, the CTA moves to just above the keyboard, not at the absolute screen bottom.

**Long press / text selection:** In editable fields, users will want to select-all and replace. Test that long-press text selection works correctly in every input field.

---

## 11. CRO Notes

**This screen is the highest drop-off risk in the flow.** The user has committed enough to upload, endured OCR processing, and now faces a long form. Their willingness to complete decreases with every empty field and every scroll.

**Two key interventions:**
1. **Progress micro-celebration:** When the user confirms (taps "Yes, This Looks Right →"), show a brief "✓ Details confirmed — getting your explanation!" animation before transitioning to Screen 05. This micro-celebration rewards the effort and sets a positive peak before the wait.
2. **Number of correctable issues:** Show a counter at the top: "7 fields need your attention" → "3 fields left to review" as the user fills things in. Reduces perceived burden and creates Goal-Gradient Effect (I'm almost done!).
