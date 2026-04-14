# 08 — Lab Report Analysis Result — Auth Upload Step 3 — UI/UX & CRO Critique

**Screenshot:** `08-auth-upload-s3-lab-report-analysis.png`
**Route:** `/dashboard/upload/[profileId]` (authenticated, lab report result)
**Goal:** Show the AI analysis of the lab report — abnormal markers with plain-language explanations — and get the user to save it.
**Stakes:** For a user who just got blood test results, this is an emotionally high-stakes screen. Clarity, reassurance, and accuracy are paramount. A confusing or anxiety-inducing result screen will damage trust irreparably.

---

## 1. Title — Still Says "Upload Prescription"

**Current:** Top-left of the screen, prominently: "Upload Prescription."

This is the lab report analysis results screen. The document type has been confirmed, analysed, and results are being displayed. The title is factually wrong for the second screen in a row.

This is not a minor cosmetic issue. For a user who uploaded their blood test and is now reading their results, a page that says "Upload Prescription" while showing blood test data creates:
- Confusion: "Is this about my prescription? Did the system mix up my documents?"
- Distrust: "If it can't label the screen correctly, how reliable are the numbers it's showing?"

The fact that this error persists through both the review step (Screen 07) and the results step (Screen 08) suggests the title is hardcoded rather than derived from `document_type`. This is a one-line code fix with significant trust impact.

---

## 2. Screen Layout — Correct Hierarchy, Wrong Emphasis

**Current top-to-bottom order:**
1. Nav + title
2. "Your Lab Report" sub-header with back arrow
3. "Referred by Dr. Hiran Shah. For Nath M. Patel" in small muted teal text
4. Yellow disclaimer banner
5. "Parameters Outside Normal Range (2)" section header
6. AbnormalMarkerCard × 2 (PCV and Haemoglobin)
7. "Things to follow" bullet list
8. "Save Lab Report" button

**What's wrong with the order:** The disclaimer (4) appears before the results (5–7). The patient attribution (3) appears in a visual style that looks like a link. The structure is broadly correct but each element has the wrong weight.

**Better order:**
1. Nav
2. Patient context strip: "For Nath M. Patel · 02 Dec 2019 · Dr. Hiran Shah" (prominent, card-like)
3. Summary badge: "2 of 20 parameters outside normal range" (orientation before detail)
4. AbnormalMarkerCard × 2
5. Disclaimer (compact, after the cards)
6. "Things to follow"
7. "Save Lab Report" CTA

---

## 3. "Referred by Dr. Hiran Shah. For Nath M. Patel" — Looks Like a Hyperlink

**Current:** Rendered in small muted teal/blue text below the page title.

**The Prägnanz problem:** In any web context, teal/blue text means "this is a link — tap me." This attribution line is not a link. Users will tap it expecting something to happen. When nothing happens, they will feel the interface is broken.

**Severity:** Medium — taps on non-interactive "link" text are a documented source of user frustration in usability testing.

**Fix:** Render in standard grey text (#6B7280 or similar), same weight as other metadata. Remove any teal/blue colour from non-interactive text. If you want to draw attention to it, use a card container with a slight background (like the prescription meta block in Screen 14).

**Content improvement:** "Referred by Dr. Hiran Shah. For Nath M. Patel." is grammatically passive and reads like a footer line. Reframe as a patient context header: "Nath M. Patel · CBC · 02 Dec 2019 · Dr. Hiran Shah." — this reads as identity, not provenance.

---

## 4. Disclaimer Banner — Same Peak-End Rule Violation

**Current:** Full-width yellow banner: "AI-generated summary. Do not adjust medication based on this. Consult Dr. Hiran Shah before making any changes."

Same issue as Screen 06. Worse here, because lab results carry more anxiety than prescriptions. A user seeing abnormal blood test results is already anxious. The first thing they read should be their results, not a warning that pre-frames the results as potentially wrong.

Additionally, the disclaimer says "Do not adjust medication based on this" — for a lab report, the relevant caution is about test interpretation, not medication adjustment. The disclaimer is copied from the prescription flow and doesn't even apply accurately to lab results.

**Fix:**
1. Move the disclaimer below the AbnormalMarkerCards
2. Rewrite it for lab context: "These are AI-generated explanations to help you understand your results. Interpretation and treatment decisions should always be made by your doctor."
3. Reduce to compact one-liner or collapsible "i" info icon

---

## 5. AbnormalMarkerCard Design — Strong but Needs Refinement

**Current:** Each abnormal marker card shows:
- Test name (e.g., "Packed Cell Volume (PCV)")
- Value (57.5%) in large text
- Reference range (Range: 42–50)
- "High" badge in red
- Plain-language explanation paragraph

**What works:**
- Large value display is scannable — users can see their number immediately
- Plain-language explanation paragraph is the core product value — well-executed
- "High" badge in red is correctly alarming
- Coloured accent bar/border differentiates from normal results

**What needs improvement:**

1. **The value display lacks context:** "57.5 %" tells you the number but not the gap. Show a mini visual scale: `[====|====>]` where the arrow shows how far above the range the value is. A value at 51 (just over 50) needs different treatment than a value at 70 (critically over). The current display treats both identically.

2. **Missing severity grading:** The FRD defines three levels: `normal / attention / critical`. "High" covers a wide range. PCV at 57.5 (vs. max 50) is mild elevation. PCV at 70 is potentially serious. The card should differentiate: "Mildly elevated" vs. "Significantly elevated" — this is what the plain-language explanation paragraph does (it says "mild dehydration or living at high altitude"), but the badge should match.

3. **Explanation length:** The explanation paragraphs are appropriately detailed. But on mobile, 3–4 sentences per card means the page gets long quickly. Consider a collapsed state: first 1 sentence visible, "Read more →" for the full explanation. Progressive disclosure.

4. **"All Clear" state:** When all values are normal, this section should show a prominent "All Clear" card with a green checkmark and celebratory micro-animation. This positive state is the most emotionally resonant moment in the product for users with normal results — it must be designed as a reward, not just an absence of warning cards.

---

## 6. "Things to Follow" Section — High Value, Low Visibility

**Current:** 4 bullet points with specific actionable advice:
- Ask doctor whether to repeat PCV and Hb test after hydration
- Check iron/ferritin/TBC to evaluate if iron deficiency is contributing
- If you live at high altitude, mention this
- Consider a follow-up CBC in 4–6 weeks if you start dietary changes

**This content is excellent.** It's specific, actionable, non-generic, and appropriate to the specific findings. This is the product's AI working well.

**The visual treatment is wrong:** Four bullet points in regular-weight text with no visual container. This section blends into the page. Given that it contains the most actionable advice in the entire result, it needs more visual prominence.

**Fix:**
- Wrap in a card with a subtle background (pale blue or amber depending on severity)
- Section header with an icon: "📋 Your Next Steps" or "💬 Talk to Your Doctor About"
- Make bullet points into distinct "action chips" that can be tapped to share individually (e.g., share just the follow-up reminder via WhatsApp)
- Bold the key action word in each bullet: **Ask** your doctor... · **Check** iron/ferritin... · **Consider** a follow-up...

---

## 7. "Save Lab Report" Button — Terminal CTA Analysis

**Current:** Full-width blue "Save Lab Report" button at the bottom of the page.

**What works:** Full-width is correct. Blue matches brand. Clear action.

**What needs improvement:**

1. **"Save Lab Report" is transactional copy.** After reading about abnormal blood values and receiving personalised advice, the user's emotional state is: concerned, informed, motivated to act. The CTA should match that state: "Save & Track Over Time →" (suggests longitudinal value), or "Keep This Report" (possessive, lower friction than "save"), or "Done — Save Report →" (completion framing).

2. **No confirmation of where they'll go:** After saving, the user lands on `/records/[id]`. Telling them this in the CTA: "Save & View Full Report →" sets expectation and reduces post-save confusion.

3. **No share option here:** Unlike the prescription explanation screen, there's no WhatsApp share button on the lab result screen. The FRD (F6) specifies sharing lab results. If the user wants to share their lab results with a family member or bring them to a doctor, there's no path from this screen. Add "Share via WhatsApp" as a secondary action.

---

## 8. Missing Features vs. FRD

The FRD specifies several features for lab report analysis that are not visible in this screen:

**F2 outputs not shown:**
- `summary` field: 2–3 sentence plain-language summary of the report as a whole — not present. The AbnormalMarkerCards provide per-marker explanations but no overall summary.
- `risk_flags`: Anything requiring immediate attention with severity flags — if PCV is critically elevated, this should be prominently flagged, not just shown as a "High" badge in a card.
- `terms_explained`: Medical jargon translations — not present. "Packed Cell Volume" is jargon. The app explains it in the card, but a dedicated "Terms explained" section would be valuable for literacy.

**Lab trending (F5):** If this user has uploaded a previous CBC, the current results should be compared to the previous ones: "Your Haemoglobin was 11.8 last month (▲ 0.7 improvement)" or "Your PCV has been above range in both reports (▲ trend to watch)." This trending is described in the FRD as "a KEY differentiator" — it's not visible in any current screen.

---

## 9. Accessibility

**Colour for severity:** The AbnormalMarkerCard uses red for "High" and presumably yellow/amber for "Low." Users with red-green colour blindness (8% of males) cannot distinguish red warning states from normal states by colour alone. The "High" text badge is the accessible fallback — ensure it's always rendered as text, never just a coloured indicator.

**Screen reader card structure:** Each AbnormalMarkerCard should be an `<article>` element with a heading (`<h3>`) for the test name. Screen readers should be able to navigate between cards using heading navigation.

**Numeric values:** "57.5 %" should be read by screen readers as "57.5 percent" — ensure the percentage symbol is either a `<span aria-label="percent">` or the value is followed by an explicit unit label in the DOM.

---

## 10. Mobile Issues

**Two long explanation cards:** On mobile (375px), each AbnormalMarkerCard with a 3-sentence explanation is roughly 160px tall. Two cards = 320px. Add the header, disclaimer, things-to-follow, and CTA, and the page is approximately 900–1000px — about 1.5 phone screens. This is manageable but needs:
- No footer of any kind
- No marketing nav
- Clean, focused layout
- Safe area padding for iPhone home indicator

**The "Things to follow" section may be cut off:** On smaller phones, users may save and leave without reading the actionable advice. Consider showing a teaser: "4 things to discuss with your doctor ↓" as a sticky prompt above the save button.
