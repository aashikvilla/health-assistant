# 07 — Lab Report Review — Auth Upload Step 2 — UI/UX & CRO Critique

**Screenshot:** `07-auth-upload-s2-lab-report-review.png`
**Route:** `/dashboard/upload/[profileId]` (authenticated, lab report review step)
**Goal:** User reviews OCR-extracted lab test values before submitting for AI analysis.
**Stakes:** 20+ rows of clinical data. This is the most cognitively demanding screen in the product. Mistakes here (user confirms wrong data) affect clinical interpretation.

---

## 1. The Title — A Critical Error That Destroys Credibility

**Current:** "Upload Prescription" in the top-left of the screen. This is a lab report flow.

**Why this matters beyond aesthetics:** A user uploading their blood test report sees "Upload Prescription" as the page title. Their first reaction is one of two things:
1. "I made a mistake — I uploaded the wrong document type."
2. "This app doesn't know what I uploaded — how can I trust its analysis?"

Both reactions are damaging. The first causes them to go back and re-upload (unnecessary friction, potential loop). The second destroys trust in the AI analysis before they've seen it.

**FRD requirement:** The app correctly detects document types (F1, F2). The document type is known at this step. The title MUST reflect it. This is a data-binding bug, not a design decision.

**Fix:** Render the page title dynamically based on `document_type`: "Upload Prescription" → "Upload Lab Report." One-line change. Highest credibility impact per line of code.

---

## 2. Information Density — 20+ Rows Is Cognitively Lethal

**Current:** All 20+ test parameters from a Complete Blood Count (CBC) are displayed as individual rows, each with: test name, result value, reference range, and an Edit button. No grouping, no categorisation, no visual hierarchy between normal and abnormal values.

**Miller's Law violation:** The human working memory holds 7±2 chunks. Presenting 20+ equal-weight rows overwhelms this limit completely. Users will:
1. Skim-confirm without reading ("Yes, this looks right" without verifying anything)
2. Abandon — the wall of data is too daunting
3. Over-correct — edit values they shouldn't (see section 4)

**Clinical context:** A CBC report has well-established clinical groupings:
- RBC Indices: Packed Cell Volume, MCV, MCH, MCHC, RBC count, Haemoglobin
- White Blood Cells: Total WBC, Neutrophils, Lymphocytes, Eosinophils, Monocytes, Basophils
- Platelets: Total platelet count

**Fix:** Group by clinical category with collapsible section headers:

```
▸ Red Blood Cells (6 tests) — 1 outside range
▸ White Blood Cells (8 tests) — all normal
▸ Platelets (2 tests) — all normal
```

This collapses 20+ rows to 3 section headers. Each section can be expanded individually. The user's job changes from "review 20 items" to "check the 1 category with an abnormal value." This is Tesler's Law applied correctly — the complexity of 20 clinical tests is hidden by the system, not dumped on the user.

---

## 3. Abnormal Values — Insufficient Visual Weight

**Current:** The "High" badge on PCV row is in red text. Other "Normal" rows have green "Normal" text.

**What works:** The badge differentiation exists — abnormal values do get a visual marker.

**What fails:**

1. **"Normal" badge on every normal row is noise.** Showing a "Normal" badge on 18 of 20 rows trains users to ignore badges entirely. Use Von Restorff Effect correctly: the normal state should be invisible (no badge), the abnormal state should be highly visible. Remove all "Normal" badges. Show only "High", "Low", "Critical" indicators.

2. **The abnormal value (PCV: 57.5) is not visually prioritised within the row.** The test name and value are the same visual weight as normal rows. An abnormal row should have: a coloured left border (red for high, yellow for low), the value in bold, and the "High" badge in a more prominent red background.

3. **Edit button on the abnormal row:** Why is there an Edit button on a clinically significant "High" value? Allowing users to edit a haemoglobin value that reads "High" is medically irresponsible. The user cannot correct a lab value — it came from a laboratory instrument. If it's high, it's high.

---

## 4. Edit Buttons — Tesler's Law Violation

**Current:** Every row has an "Edit" text button in blue at the far right.

**The fundamental problem:** This screen is for verifying OCR extraction, not for medical data entry. The only OCR errors a user can legitimately correct are:
- Patient name (OCR misread the name)
- Date (OCR misread "02 Dec 2019" as "12 Dec 2019")
- Lab name / referring doctor (OCR truncation)
- Test name (OCR misread "Haemoglobin" as "Haernog|obin")

**What a user CANNOT and SHOULD NOT correct:**
- Numeric test results (if OCR read 57.5, either it's right or it should be re-scanned — the user shouldn't type in "55" from memory)
- Reference ranges (these are set by the lab, not the user)

**Fix:** Remove Edit buttons from individual test result rows entirely. Keep Edit buttons only on the meta fields (patient name, date, lab name, doctor). For test name OCR errors, allow inline edit of test names only, not values.

**The current UX implies users have authority over clinical data. This is both usability-damaging (cognitive burden) and potentially medically problematic.**

---

## 5. Reference Range Display — Good but Underused

**Current:** Each row shows the reference range (e.g., "40–50" for PCV). This is correct clinical context.

**What's missing:** The reference range for an abnormal value should be more visually prominent. When PCV is 57.5 and the range is 40–50, the gap between 57.5 and 50 (7.5 points above the upper limit) should be visible at a glance. A simple mini bar chart behind the value would communicate: "this value is this far outside the range" — turning a row of numbers into a scannable visual.

This is not needed for all 20 rows — only for abnormal values. But for those rows, it's a significant UX and comprehension improvement.

---

## 6. "Yes, This Looks Right →" CTA — Sticky But Has Issues

**Current:** The CTA appears to be sticky at the bottom (visible in screenshot as a blue bar). This is correct.

**Issues with the copy:** "Yes, This Looks Right →" is conversational and user-friendly. But for a screen with 20+ test values, it feels like asking the user to confirm something they couldn't possibly have verified. The implicit pressure: "you said it looked right, so the AI will trust these values."

**Better copy:** "Confirm & Get AI Analysis →" — clearer about what happens next. Or "These look correct — Analyse →" — slightly more honest about the confirmation level.

**Disability concern:** Users with motor impairments using touch input may accidentally tap the sticky CTA while scrolling. Ensure there's no accidental trigger: a minimum tap duration or a brief "Confirming..." delay before submitting.

---

## 7. "Upload a Different Document" — Still Buried

**Current:** "Upload a Different Document" text link at the bottom, after the sticky CTA area.

Same problem as Screen 04. The escape path is invisible during the natural review flow. Move it to the top near the page title.

---

## 8. Visual Design

**Current:** Flat white rows with grey border separators. No colour except the High/Normal badges. Minimal visual weight.

**The problem:** This screen is visually identical to a generic data table. There is nothing about the visual design that says "this is a health tool" or "this matters." The design is adequate but has no character.

**Improvements without redesigning the table:**
1. Abnormal rows: left border in warning red/amber (even 3px) transforms the row visually while maintaining table structure
2. Section headers (if implemented — see section 2): gradient background with category icon
3. Summary strip at the top of the test list: "1 of 20 parameters outside range" in a coloured badge — gives users immediate orientation before scrolling

---

## 9. Accessibility

**Table semantics:** The test rows should use proper HTML `<table>` elements with `<th>` scope headers: "Test | Result | Reference Range | Status." Screen readers cannot interpret a list of divs as a table — they need semantic table markup.

**Colour independence:** The High/Normal colour coding cannot be the only differentiation. The badge label itself ("High", "Low", "Normal") is the accessible component — ensure it's always visible text, not just a coloured dot.

**Focus management when editing:** If a user activates edit mode on the patient name field, focus should move to that input immediately. On form submission, focus should return to a meaningful anchor (the first abnormal value, or the confirmation button).

---

## 10. Mobile Issues

**20 rows × 4 columns (name, result, range, badge):** On 375px width, each row needs to be redesigned for mobile. A 4-column table will either overflow or text will truncate. Mobile layout should be a 2-row per item design:
```
[Test Name]                    [High ▲]
57.5        Ref: 40–50
```
This requires a responsive table or a card-based layout for mobile that differs from the desktop table layout.

**Sticky CTA on mobile:** Test that the sticky CTA does not overlap content on small screens. On iPhone SE (375×667), the table content + sticky CTA should leave at least 60% of screen visible for table rows.

---

## 11. CRO — Does This Screen Need to Exist?

For lab reports in the **public** (unauthenticated) flow, the FRD and code indicate the lab report review is skipped — the user goes directly from OCR to AI analysis. The review screen is only shown for authenticated users.

**The argument for removing it for lab reports entirely:** Unlike prescriptions (where the doctor name, date, and diagnosis tag are important metadata the user may want to correct), lab test values are OCR'd from structured forms. The user cannot meaningfully verify 20 numeric values from memory. The only genuine edits they'd make are to the patient name and date — which could be shown in a much lighter confirmation step.

**Recommendation:** Replace the 20-row review screen with a lightweight confirmation: "We found 20 test results for Nath M. Patel from 02 Dec 2019. Look correct? [Confirm] [Change name/date]" — then go directly to AI analysis. This removes a high-friction step without losing meaningful user control.
