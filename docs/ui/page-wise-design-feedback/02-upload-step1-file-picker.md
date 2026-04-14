# 02 — Upload Step 1 — File Picker (`/upload`) — UI/UX & CRO Critique

**Screenshot:** `02-pub-upload-s1-file-picker.png`
**Route:** `/upload` (public, no auth required)
**Goal:** User selects an input method (photo / PDF / manual) and commits to uploading — the first irreversible micro-commitment in the funnel.
**Stakes:** This is the highest-friction step for cold traffic. A confused user here = immediate bounce, no second chance.

---

## 1. Above-the-Fold First Impression

On a 13" laptop screen (1280×800, the most common desktop viewport), what does the user see?

- Full nav with "Features | How it works | Sign in | Try Free"
- Page title and step indicator
- Three input method cards
- Warning banner
- The start of the footer already visible

That's a marketing nav + task content + footer start all competing on one screen. The user came here to upload something. They are being shown 12+ navigation targets (footer included) before they can even focus on the task.

**Fix:** Strip everything except logo + the three cards on this screen. This is a task flow, not a marketing page.

---

## 2. Page Title — Wrong Terminology

**Current:** "Add Your Prescription/Blood Report"

**Problems:**
1. "Blood Report" is not standard. Users say "blood test," "lab report," "CBC," "pathology report." Nobody says "blood report" — it sounds translated.
2. The slash construction "Prescription/Blood Report" forces two parses. Users pause to understand the OR relationship.
3. The title anchors on document types before the user has decided. Why not let the system detect the type?

**Better options:**
- "Upload a Medical Document" (inclusive, no anchoring)
- "What would you like to analyse?" (question framing, lower friction)
- "Add a Health Record" (consistent with "records" terminology used elsewhere)

**Mobile copy note:** "Add Your Prescription/Blood Report" is 34 characters and wraps to 3 lines on a 375px screen at 24px. The line breaks at arbitrary words. Test heading wrap at 320px, 375px, 390px minimum.

---

## 3. Step Indicator — Good Idea, Wrong Implementation

**Current:** "Step 1 of 3" in small grey text with three dots (one filled, two empty) at the top.

**What works:** Progress indicators reduce abandonment (Goal-Gradient Effect) — showing users where they are increases completion rates by up to 28% (Baymard Institute checkout studies).

**What fails:**
- The dots are 8px circles in grey/blue. At that size they are nearly invisible, especially on non-retina screens.
- "Step 1 of 3" label is in muted grey, 11px, in the top-left. Users who entered from the homepage have no idea what the 3 steps are. They can't plan their time.
- On mobile, the dots are a touch target fail — 8px is 5.5x below the 44px minimum.

**Better pattern:**
- Larger dots (16px minimum) with step labels on hover/tap: "1. Choose file — 2. Review — 3. Get explanation"
- Or a named step bar: `[● Pick File] ——— [○ Review] ——— [○ Explain]` with step names visible always
- Or numbered bubbles with a progress line: bolder, more informative, not just decorative dots

---

## 4. Input Method Cards — Hierarchy Is Right, Execution Is Not

**What works:**
- Three distinct cards for Photo, PDF, Manual — correct progressive disclosure
- Photo card has blue background = primary action = correct visual hierarchy
- Each card has an icon and a short description

**What fails:**

**Card 1 — "Upload a Photo / From Gallery"**
- Subtitle "From Gallery" is confusing. Does this mean only existing photos, or can I take a new one? On mobile "From Gallery" means you go to your camera roll — but users at a pharmacy or clinic want to take a photo NOW. The CTA should be "Take Photo or Upload" not "From Gallery."
- No "or drag & drop" hint on desktop. Desktop users expect to drag a file. The card gives no indication that drag-and-drop works if it does. If it doesn't, it should.
- The blue card looks fine but the icon (camera outline) is thin-stroke at a small size. At 24px, thin-stroke icons become noisy and hard to distinguish.

**Card 2 — "Upload a PDF / For digital hospital prescriptions/reports"**
- "For digital hospital prescriptions/reports" — nobody calls them "digital hospital prescriptions." They say "PDF from the hospital," "the file my doctor sent," "the report from the lab." Use user-language: "Tap if you have a PDF file"
- The PDF icon is distinguishable from the camera icon — good. But both Card 2 and Card 3 have the same visual weight (white background, grey border). They both feel secondary. Card 2 should feel "clearly secondary to Photo, clearly primary to Manual."

**Card 3 — "Enter your prescription manually / If the photo isn't clear enough"**
- Accordion chevron (▾) suggests this card expands. It doesn't — it's a navigation affordance. Using a chevron for navigation is a well-documented Jakob's Law violation: users expect chevrons to toggle, not to navigate.
- "If the photo isn't clear enough" is entirely the wrong reason to use manual entry. The real reason: "I don't have a photo and want to type it in myself." The current copy suggests manual entry is a consolation for bad photos, not a legitimate primary path.
- Fix subtitle: "Type in your prescription details yourself — takes about 2 minutes"
- The card has no hint of what "manually" means: a form? How many fields? Is it a paragraph input or structured fields? Zero progressive disclosure. Add: "Doctor name, medication names, dosage — we'll do the rest."

---

## 5. Warning Banner — Misplaced, Wrong Tone

**Current:** Yellow banner at the bottom of the cards: "Please make sure the image is not blurry and will fit for best results."

**Law of Proximity violation:** This warning is 150–200px below the Photo card it describes. The user reads the cards top to bottom. By the time they read the warning, they've already decided which card to tap. The association between "this warning" and "the photo option" is broken.

**Tone problem:** "Please make sure the image is not blurry" is a negative framing (warning). It primes the user for failure. Reframe as a tip that sets expectation for success: "📸 Works best with a steady, well-lit photo — no flash needed." Place it directly under the first card's subtitle, not as a floating banner below all three cards.

**Redundancy:** If you have a photo quality check (auto-blur detection), the warning is redundant because the system will catch it anyway. If you don't have blur detection, this warning is your only quality gate — in which case it needs to be unavoidable before upload confirmation, not a polite footnote.

---

## 6. Marketing Nav During Task Flow — Critical CRO Kill

**Current:** Full nav "Features | How it works | Sign in | Try Free" sits above the task.

**The conversion math:** If a user is on this page, they are already committed to trying. The "Features" and "How it works" links lead them back to the homepage — they would be backing out of a started task. Every link in the nav is a leakage point.

**"Try Free" in nav is ironic:** The user is already trying. Showing "Try Free" in the nav while they are mid-task is confusing — it implies there's an even freer version, or that what they're doing is different from "trying free."

**"Sign in" during upload creates premature friction:** If the user is not signed in (which is valid — this is a public page), "Sign in" in the nav creates a false urgency signal: "Do I need to sign in to upload?" They don't — but the nav suggests they might.

**Fix:** On all `/upload/*` routes, replace the full nav with: `[Vitae logo] ←→ [✕ Cancel]`. Nothing else. The "×" gives the escape hatch without being a visible marketing distraction.

---

## 7. Footer — Catastrophic on a Task Screen

**Current:** Full 4-column marketing footer (Vitae · Product · Company · Legal) occupies roughly 30% of the visible page height when scrolled.

**This is the most damaging single layout bug in the entire product.** No successful conversion-focused product shows a marketing footer on a task-focused flow screen. Google Drive upload, Dropbox upload, DocuSign signing — none of them show footers. This pattern communicates to the user: "you are on a marketing page, not an app." That breaks the mental model.

**Severity:** P0 — this must be the first fix. A user who gets distracted by a footer link (Blog, About, Contact) during an upload loses their place and may not return.

**Fix:** Add `noFooter` or `taskLayout` flag to the public layout. On `/upload/*`, render no footer. At most: a single line `© 2025 Vitae · Privacy` in 10px muted text at the very bottom of the page.

---

## 8. Whitespace — Page Feels Broken

**Current:** Below the warning banner and above the footer there is roughly 300px of empty white space. On a 1440px desktop monitor this gap is even more pronounced.

**The Prägnanz problem:** The simplest interpretation of 300px of empty space is "this page didn't finish loading." Users who see a gap that large will scroll or wait before interacting, introducing unnecessary friction.

**Fix:** Either:
1. Use a full-height-minus-header layout for the card area, vertically centered in the viewport
2. Or add content that fills the space productively (FAQ accordion: "What documents can I upload?", "Is my data private?", "How accurate is the OCR?")

The FAQ option has the additional benefit of pre-answering objections that prevent upload.

---

## 9. Accessibility Audit

**Touch targets:** The three cards appear to be ~340px × 64px. Touch target size is fine. But the chevron/arrow on Card 3 is likely <44px — needs explicit padding.

**Focus order:** Tab should move: Logo → Nav links → Card 1 → Card 2 → Card 3 → Warning banner (skipped, it's informational). Test this with keyboard-only navigation.

**Color independence:** The primary card (blue background) communicates primacy through color alone. Users with achromatopsia (total color blindness) cannot distinguish Card 1 from Cards 2 and 3 by color. Add a "Recommended" badge or a bolder border/shadow to communicate priority without relying solely on color. (WCAG 1.4.1)

**Icon alt text:** Camera icon, PDF icon, keyboard icon — these need descriptive aria-labels on the button/card element: "Upload a photo of your prescription" not just "Photo."

**Screen reader label:** The step indicator "Step 1 of 3" needs an `aria-live="polite"` region so screen readers announce step changes as the user progresses.

---

## 10. Micro-Interactions — Currently Zero

**What a modern upload screen should feel like:**

1. **Card tap feedback:** On mobile, tapping a card should produce a brief scale-down (0.97) + color flash before navigating. Zero tactile feedback currently.

2. **Drag-and-drop zone:** On desktop, a drag-and-drop zone should activate when a file is dragged over the browser: card border becomes a blue glow, a "Drop your file here" overlay appears. No drag-and-drop affordance exists currently.

3. **File type detection preview:** After selecting a file (before upload confirmation), show a thumbnail preview of the file with a "This looks like a prescription" or "PDF detected" confirmation. This micro-step reduces errors and builds trust in the system.

4. **Loading state transition:** The transition from "card selected" to "OCR processing" (Screen 03) should be an animated page transition, not a hard cut. The selected card should expand/morph into the loading state.

---

## 11. Mobile-Specific Issues

**Portrait phone (375×812 — iPhone SE/13 mini) specific problems:**

1. The three cards stacked vertically take up ~180px each = 540px total. On a 812px screen, with 56px nav and 60px warning banner, the page fits — barely. But if the user has a large system font (accessibility setting), card text reflows and height increases.

2. "Enter manually" card with the chevron: On touch, users expect a tap to do something — the chevron signals expand. If it navigates to a new page, the transition must be immediate and directional (slide right, not fade) to confirm navigation.

3. The warning banner is at the bottom of the content area. On mobile scroll, it gets buried. It should be pinned or move to just below Card 1.

4. File upload from iOS (Safari): When user taps the photo card, they get an iOS action sheet: "Take Photo | Photo Library | Files | Cancel." This is correct native behaviour. The card copy should set this expectation: "Take a photo or pick from your camera roll." Not "From Gallery" — iOS calls it "Photo Library."

---

## 12. CRO & Growth Gaps

**No reassurance at the point of action:** The moment a user is about to upload a medical document is the highest-anxiety moment in the flow. There is zero reassurance at this precise moment. A single line beneath the cards: "🔒 Your document is encrypted and never shared — delete any time" would directly address the #1 reason users abandon: privacy fear.

**No "example" to reduce uncertainty:** First-time users don't know what a "good" prescription upload looks like. A "See an example" link that opens a modal with a sample prescription and its AI output would pre-qualify users and reduce upload abandonment.

**Social proof at step 1:** "Joined 12,000+ families this month" or a small avatar cluster "→ Maria, Ravi, Priya just uploaded their prescriptions" adds real-time social validation at the highest-anxiety moment. Implementation: a single API call to get "total uploads this month," displayed in a small banner below the cards.
