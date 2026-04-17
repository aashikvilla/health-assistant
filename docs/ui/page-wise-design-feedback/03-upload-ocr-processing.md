# 03  Upload  OCR Processing State (`/upload`)  UI/UX & CRO Critique

**Screenshot:** `03-pub-upload-s2a-ocr-processing.png`
**Route:** `/upload` (processing state, no user interaction required)
**Goal:** Keep users engaged and confident during a non-interactive wait. Prevent abandonment.
**Stakes:** If a user navigates away during OCR, the upload is lost. This screen's only job is to hold attention.

---

## 1. The Core Problem  Waiting Without Engagement

This screen asks users to wait while doing nothing. The human brain disengages after ~8–10 seconds of inactivity. OCR processing can take 5–15 seconds. The gap between those numbers is your abandonment window.

The screen currently has: a spinner, a headline, 4 progress steps, and a small "please keep this page open" notice. That's the right list of elements. The execution of almost all of them is wrong.

---

## 2. The Spinner  Identity and Feedback

**Current:** Blue circle spinner with a white checkmark icon inside. Appears to pulse or rotate.

**What works:** Differentiated from a generic grey browser spinner. Blue is consistent with the brand.

**What fails:**
- A single spinner conveys no progress. Is the system 10% done? 90% done? Stuck? The user has no information beyond "it's doing something."
- The spinner is the visual centrepiece of the screen but communicates nothing beyond "running." The progress steps below do all the real work.
- Doherty Threshold (400ms): The spinner is binary  it either spins or it doesn't. There's no gradation that tells the user the system is alive and making forward progress. A determinate progress arc (even if approximate) would communicate movement.

**Better approach:** Replace the generic spinner with an animated representation of the actual process: a document icon that gets "scanned" by a horizontal light beam, with text characters appearing as they're recognised. Even a simple CSS animation of this would be more engaging and informative than a spinning circle.

---

## 3. Progress Steps  Right Concept, Wrong Visual Weight

**Current:** 4 steps listed vertically:
1. ✓ "Detecting text in your document" (green check)
2. ✓ "Identifying medicines and dosages" (green check)
3. ✓ "Organising prescription details" (green check)
4. ⟳ "Preparing your summary" (blue loading dot)

**What works:**
- Named steps tell the user what the system is actually doing. This is honest, transparent, and reduces uncertainty.
- Visual differentiation between completed (✓) and in-progress (⟳) is correct.
- The sequential reveal as steps complete is the right interaction pattern.

**What fails:**

1. **Text size and weight:** Steps are in regular-weight ~14px grey text. These are the most important elements on the screen  they should be the visual focus, not afterthoughts. Step text should be 15–16px, medium weight, darker grey (#374151), with the active step at full black.

2. **The checkmarks are too small:** The green ✓ icons are ~16px. On mobile, they are barely visible. They should be 20–22px with a brief "pop" animation when they appear (scale from 0.5 to 1.1 to 1.0 over 200ms)  the satisfaction of seeing a step complete is a micro-delight that reduces perceived wait time.

3. **Step completion is instant, not animated:** Steps 1–3 appear already completed in the screenshot. This means the user never saw them complete  they appeared completed on load. The value of named progress steps is watching them complete in real time. If steps 1–3 complete faster than the user reads them, stagger the display: show step 1 first, tick after 300ms, then step 2 appears, etc. Create the perception of sequential progress even if it happens fast.

4. **The active step (step 4) blue dot is too similar to a bullet point.** It doesn't clearly signal "this is the active, in-progress step." Use a pulsing animation, a spinner specifically on this item, or a highlighted row background.

5. **Step labels are technical:** "Organising prescription details" is backend-speak. Rewrite from the user's perspective:
   - "Reading your document" (not "Detecting text")
   - "Finding your medications" (not "Identifying medicines and dosages")
   - "Checking all the details" (not "Organising prescription details")
   - "Writing your plain-English explanation" (not "Preparing your summary")

---

## 4. "Please keep this page open"  Critically Underweighted

**Current:** Rendered in 12px muted grey text, positioned below the progress steps, no background, no icon.

**This is the most important instruction on the screen.** If the user navigates away, they lose their upload completely. But this instruction is:
- The smallest text on the screen
- The lowest visual priority element
- Using passive, polite language ("please keep") that doesn't convey urgency
- At the bottom of the content flow, where attention is lowest (Serial Position Effect)

**Fix:** Move this instruction above the progress steps. Give it a warning-coloured background (amber, subtle). Make it 14px minimum. Use an icon (🔒 or a browser-tab illustration). Add urgency: "Keep this tab open  your prescription is being processed."

**Mobile fix:** On mobile, the user's instinct is to switch apps or check notifications while waiting. A full-width sticky banner at the bottom of the viewport: "⚡ Processing  stay on this page" would counter this impulse directly.

---

## 5. Footer and Nav  Same Critical Issue as Screen 02

**Current:** Full 4-column marketing footer visible below the loading content. Full "Features | How it works | Sign in | Try Free" nav above.

**Why it's worse here than on Screen 02:** On Screen 02, the user has agency (they can cancel and go back). On this screen, the user is waiting  they have nothing to do. The nav and footer links are dangerous precisely because they're the only tappable elements available. They fill the user's idle attention at the worst possible moment. A user who clicks "Features" while their prescription is being OCR'd has lost their upload.

**Fix:** Same as Screen 02. Strip to logo only. No nav. No footer.

---

## 6. Visual Layout  Empty Space Creates Anxiety

**Current:** The spinner + title + progress steps occupy roughly 300px in the vertical centre of a ~700px content area. Below them: a small notice. Then ~250px of empty space. Then the footer.

**The Prägnanz problem:** Users interpret large empty white areas as "content didn't load" or "there's a problem." The empty space below the progress steps has no content and no purpose. It creates an anxiety signal at a moment when the user is already anxious (their medical document is being processed by an AI they don't fully trust yet).

**Fix options:**
1. **Full-screen loading layout:** No scrollable content, no footer, just the spinner and steps centred perfectly in the full viewport height. Clean, intentional, focused.
2. **Animated skeleton placeholder:** Show ghosted/skeleton versions of the MedicationCards where results will appear. This reduces perceived wait time by 20–35% (Facebook research on skeleton screens).
3. **Reassurance micro-content:** A rotating set of small reassurance messages below the steps: "Your document is encrypted · We never share your records · Results are private to you" cycling every 2 seconds.

---

## 7. Time Expectation  Too Vague

**Current:** "This usually takes just a few seconds" below the headline.

**What's wrong:** "A few seconds" is vague (2? 10? 30?) and creates a mismatch expectation. If OCR takes 8 seconds and the user expected 2, they feel it's slow. If it takes 3 seconds, they're pleasantly surprised. The framing of expectation determines the experience.

**Better:**
- "Ready in about 10 seconds"  specific, sets expectation
- Or show an actual elapsed timer: "Processing  4s"  honest, prevents "is it frozen?" anxiety
- Or a determinate progress bar with percentage: even if approximated, a progress bar from 0–100% over 10 seconds is psychologically faster than an indeterminate spinner for 10 seconds (Nielsen Norman Group research).

---

## 8. Error State  Not Shown, But Must Exist

The screenshot shows the happy path. But OCR fails. Networks time out. Files are too large or illegible.

**The question is:** What does the user see if OCR fails after 15 seconds? Is there an error state? Does it show a meaningful message? Can the user retry without re-uploading?

**FRD requirement (F1):** "OCR accuracy >85% for printed English text"  which means up to 15% of uploads will produce poor extraction. The OCR processing screen must have a clear, graceful error state:

- "We couldn't read this document clearly" + "Try a better-lit photo" / "Upload a clearer version" / "Enter details manually instead"
- Not just a generic error toast. A full error screen with recovery paths.
- The error state must be navigable  back to the file picker, not a dead end.

---

## 9. Accessibility

**Motion:** The spinner and step-completion animations must respect `prefers-reduced-motion`. Users with vestibular disorders cannot tolerate rotating/spinning elements. Provide a static alternative: a percentage counter "34%... 67%... 100%" that conveys the same information without motion.

**Screen readers:** The progress steps should be in an `aria-live="polite"` region so screen readers announce each step as it completes. "Step 1 complete: text detected. Step 2 in progress: identifying medications." This is essential for visually impaired users.

**Focus trap:** While processing, all interactive elements (nav, footer) should be either removed or visually/functionally suppressed. If a "Cancel" button exists, it should be the only focusable element.

---

## 10. Micro-Interactions Checklist

| Interaction | Current | Should Be |
|---|---|---|
| Step completion | Instant (or unobserved) | Brief tick-pop animation (200ms) |
| Active step indicator | Static blue dot | Pulsing / breathing animation |
| Overall progress | No indicator | Thin progress bar under steps or arc around spinner |
| Time elapsed | Not shown | "5s... 8s... 12s" or progress % |
| Page enter | Hard cut | Slide-up or fade-in from the file picker screen |
| Error state | Unknown | Full error card with recovery CTAs |
| Success transition | Hard cut to next screen | Spinner expands → collapses → results slide up |

---

## 11. Mobile-Specific

**Browser tab minimisation:** iOS Safari pauses JavaScript when a tab is minimised. This means OCR processing may stall if the user switches apps. This is a technical constraint that must be communicated: "Keep this screen open  pausing may interrupt your upload." Test on iOS Safari specifically.

**Screen lock:** If the user's phone auto-locks during a 10-second OCR wait (possible if auto-lock is set to 10 seconds), the upload stalls. No solution to this, but the error recovery must handle it gracefully: on return to the tab, detect stale state and offer to retry.

**Thumb zone for "Cancel":** If a Cancel button exists during processing, it must be in the lower thumb zone (bottom 40% of screen)  not in the nav at the top. Users with large phones cannot comfortably reach a top-left cancel button while holding the phone one-handed.
