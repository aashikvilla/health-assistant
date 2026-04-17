# 05  Upload Step 3a  AI Explanation Loading  UI/UX & CRO Critique

**Screenshot:** `05-pub-upload-s3a-ai-explanation-loading.png`
**Route:** `/upload` (AI loading state, Step 3 of 3)
**Goal:** Keep user engaged and confident during the longest wait in the flow (5–15s LLM call). Deliver the sense that something special is about to happen.
**Stakes:** This is the Peak-End Rule's setup moment. The explanation result is the peak. This loading screen is the anticipation. Make it build excitement, not anxiety.

---

## 1. The Core Failure  Regression From Screen 03

Screen 03 (OCR processing) had 4 named progress steps with checkmarks and a pulsing dot. It was informative.

Screen 05 (AI loading) has: one spinner, one headline, one subheadline. Zero progress indicators.

**This is a direct regression.** The user experienced a richer, more communicative loading state at step 2, then arrives at step 3 (the most important step) and sees less. The signal this sends: "the simpler loading state is for the less important operation." This is the opposite of what the moment calls for.

The AI explanation is the product's core value proposition. The loading screen for it should be the most impressive, most communicative, most exciting loading screen in the entire app  not the barest.

---

## 2. The Spinner  Wrong Tool for This Moment

**Current:** A circle with a lightbulb icon inside it, centred on the page.

**What works:** The lightbulb differentiates this from the OCR spinner (which had a checkmark circle). Good differentiation.

**What fails:**

The lightbulb is a generic "idea/AI" metaphor that every tech product uses. It's the SVG equivalent of a stock photo of a lightbulb. It communicates "AI is thinking" but nothing specific about what Vitae's AI is doing that makes it special.

**More specific alternatives:**
- A prescription / document icon that gets "parsed"  lines of text appearing on it while a translation appears alongside it
- A medical document on the left, a plain-language card assembling itself on the right  showing the transformation that's actually happening
- An abstract neural network briefly animating (tasteful, not overdone)
- A stethoscope/pill/molecular motif that's unique to health

The goal is to show the VALUE being created during the wait, not just "AI is running."

---

## 3. Headline Copy  Functional but Uninspiring

**Current:** "Preparing your explanation..."

**What works:** Clear, accurate, no jargon.

**What misses:** This is the moment of highest anticipation in the entire user journey. The user has uploaded their prescription, waited for OCR, confirmed details, and is now about to receive something they've never had before: a plain-language explanation of their medical record. The copy should match the magnitude of that moment.

Alternatives that build anticipation:
- "Reading every medication to explain it in plain English..." (specific, reassuring)
- "Our AI is translating your prescription right now..." (process-visible, personal)
- "Almost there  writing your personal medication guide..." (emotional + personal)
- "Turning medical jargon into clear answers..." (highlights the transformation)

**Sub-headline problem:** "Our AI is writing a plain-language summary of each medicine" is good copy  it's specific about what's happening. But it should be the headline, not the subheadline. The headline should be the emotional hook; the subheadline should be the functional detail. Currently they're reversed.

---

## 4. Progress Steps  Completely Absent

The OCR screen showed 4 steps. The AI screen shows zero.

**The minimum set of AI-specific steps (with honest names):**
1. ✓ Reading your prescription details
2. ⟳ Looking up each medication
3. ○ Writing your plain-English guide
4. ○ Almost ready...

These steps exist in the actual process:
- Step 1: The prescription data (already confirmed) is sent to the LLM
- Step 2: The LLM processes each medication individually
- Step 3: The LLM generates plain-language explanations
- Step 4: The response is parsed and prepared for display

Even if these happen in milliseconds, showing the steps sequentially (with staggered completion) maintains user engagement during the wait. This is honest  these are real steps  and it's effective  perceived wait time decreases when users see named progress.

---

## 5. Visual Layout  Empty Page Creates the Wrong Emotion

**Current:** Spinner + 2 lines of text centred in a vast empty page. ~400px empty below the text. Footer visible.

**What the empty space communicates:** "This page is broken, incomplete, or the content didn't load." This is Prägnanz  the user's brain fills the empty space with the simplest explanation: failure.

**What the empty space should communicate:** Anticipation, building toward something. The space should be used to:

1. **Animated skeleton cards:** Show 3 greyed-out MedicationCard skeletons below the spinner. They have no content  just the structural shape of the cards that are about to appear. This tells users exactly what they're waiting for and reduces perceived wait time.

2. **Or: reassurance micro-content:** Rotating factoids while waiting:
   - "🔬 Our AI has analysed 12,000+ medications"
   - "💊 Each explanation is written specifically for your prescription"
   - "🔒 Your document is encrypted and private"
   These rotate every 2.5 seconds. They build trust AND fill the wait.

3. **Or: animation of the transformation:** The prescription data (medicine names from the review step) appears as handwritten text, and below each name, typed text (the explanation) appears character by character  showing the work in progress. This is the most engaging but highest implementation effort.

---

## 6. Footer and Nav  Same Issue, Now Even More Damaging

On this screen, the user has done everything asked of them. They uploaded, they reviewed, they confirmed. They are now waiting for the result. This is the moment of maximum emotional investment.

If they accidentally click "Features" in the nav or "Blog" in the footer, they lose everything.

The footer and nav being present here is not just a UX issue  it is a revenue issue. Every user who abandons at this stage represents a lost conversion at the most expensive point in the funnel (they've already spent 30–60 seconds getting here).

**Fix:** The same as all upload screens. Strip to logo only. No footer. No nav. No links.

---

## 7. Transition Design  The Before and After

**The entry transition (from review screen → loading screen):** Currently appears to be a hard cut or a simple fade. This is a missed opportunity. When the user taps "Yes, This Looks Right →," the confirm button should animate: it expands, fills the screen, and transitions into the loading state  a morphing CTA into loading screen. This is a 500ms CSS animation that makes the flow feel seamless and intentional.

**The exit transition (loading → results):** When the AI response arrives, the loading state should not hard-cut to the results. The spinner should complete (spin to checkmark), the skeleton cards should fill with content from top to bottom (one card at a time, 100ms stagger), and the full page should slide up into place. This transition  the prescription explanation revealing itself  is the most emotionally important moment in the product. It deserves 800ms of intentional animation.

---

## 8. Error State  What Happens When the LLM Fails?

The screenshot shows happy path. The LLM will fail. OpenRouter will rate-limit. The API will time out.

**What the error state must include:**
- Clear, non-technical message: "We couldn't generate your explanation right now  the AI is busy."
- Recovery: "Try again" button that retries without re-uploading or re-reviewing
- Alternative: "Go back to your details" (returns to review step)
- Retry count: After 3 failures, offer: "This is taking longer than usual. We'll send it to your email when ready." (FRD F6 mentions email sharing  this is a natural extension.)

**What the error state must NOT include:**
- Technical error codes (LLM_ERROR_503, timeout, etc.)
- Generic "Something went wrong" messages
- A dead end with only a back button

---

## 9. Accessibility

**`prefers-reduced-motion`:** The spinning animation must be suppressed for users who have enabled reduced motion in their system preferences. Provide a non-animated fallback: static checkmark + "Processing…" text.

**Timing:** The AI call can take up to 15 seconds. WCAG 2.2.1 (Timing Adjustable) requires that time limits be adjustable or at least that users be warned. For a loading screen there's no user time limit, but the system should have an explicit timeout with a user-facing message after 20 seconds: "This is taking longer than usual..."

**Screen reader:** An `aria-live="polite"` region should announce each step completion: "Step 1 complete: prescription read. Step 2 in progress: looking up medications." This provides equivalent information to sighted users without motion dependency.

---

## 10. Mobile-Specific

**Background tab timeout (iOS):** iOS Safari throttles JavaScript in background tabs after ~30 seconds. If the LLM call takes longer and the user switches apps, the call may fail silently. The app should detect this on tab re-focus and offer to retry.

**Network interruption during AI call:** Mobile networks drop connections. The AI call should be retried automatically (up to 3x) before showing an error. If the connection drops mid-response, attempt to use the partial response  a partial explanation is better than an error state.

**Spinner visibility on OLED screens (dark background):** White spinner on pure white background = invisible on OLED in high-ambient-light scenarios. Ensure the spinner has sufficient contrast regardless of ambient light.

---

## 11. CRO Angle

This screen is a bridge between "effort invested" and "value received." Every second of this loading screen is emotional amortisation of the effort the user just expended. If this screen is generic and barren, the effort feels wasted before the reward arrives.

**The anticipation principle:** Marketing research consistently shows that positive anticipation increases perceived value of the eventual reward. A loading screen that builds excitement ("Almost there  your personalised medication guide is being written...") measurably increases satisfaction with the result, even if the result is identical.

**Specifically:** Add a countdown estimation. "Writing your guide  about 8 more seconds." When the countdown ends and the results appear, the feeling is satisfying completion  not an unexpected surprise. Predictable reward > variable reward for trust-building in health contexts.
