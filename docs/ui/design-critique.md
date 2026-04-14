# Vitae — UI/UX Critique

Grounded in established UX laws. Every issue has a named law, a severity, and a specific fix.
Severity: **[P0]** breaks the flow / causes task failure · **[P1]** measurable usability damage · **[P2]** polish / missed opportunity.

**Laws referenced throughout:**
- **Hick's Law** — decision time grows with number of choices
- **Fitts's Law** — time to hit a target ∝ distance / size
- **Jakob's Law** — users expect your product to behave like every other product they use
- **Miller's Law** — working memory holds ~7 chunks; beyond that, performance degrades
- **Law of Proximity** — nearby elements are perceived as related
- **Law of Prägnanz** — users perceive the simplest plausible interpretation
- **Doherty Threshold** — system must respond in <400 ms or the user's flow breaks
- **Peak-End Rule** — users judge an experience by its most intense moment and its last moment
- **Serial Position Effect** — users remember first and last items in a list; middle items disappear
- **Von Restorff Effect** — a distinct element is remembered; undistinguished items are forgotten
- **Goal-Gradient Effect** — motivation increases as users get closer to completing a task
- **Progressive Disclosure** — show only what's needed now; reveal complexity on demand
- **Aesthetic-Usability Effect** — visually polished UI is perceived as more reliable
- **Tesler's Law** — complexity cannot be eliminated, only shifted (to the system, away from the user)
- **Law of Common Region** — elements sharing a visual boundary are perceived as one group

---

## 01 — Landing Homepage (`01-landing-home.png`)

### Strengths
- Headline is benefit-led: "Understand Your Health Records Instantly" — correct.
- Blue CTA contrast is sufficient. The bottom blue section has strong visual punch.

### Issues

**[P1] Hick's Law — two equal-weight hero CTAs slow the decision**
"Try Free Upload" and "Create Account" are presented at identical size, colour, and weight. When two options compete equally, users pause and compare rather than act. One must dominate. "Try Free Upload" is the riskier path (no commitment) and should be primary; "Create Account" should be a ghost/text link beside it. Right now neither wins.

**[P1] Miller's Law — feature grid dumps 6 undifferentiated items**
Six cards with emoji icons and equal visual weight. None are scannable at a glance. Users in the 2–5 second landing-page window will hit cognitive overload and pattern-match to "generic SaaS." The cards need a hierarchy: one dominant claim, two supporting, three optional. Or reduce to three with real, specific claims. "Instant Results" says nothing. "Extracts medications from a photo in ~8 seconds" is concrete.

**[P1] Von Restorff Effect — "How It Works" steps are invisible**
The 4-step process ("Upload Document → Extract Details → …") uses thin grey connecting lines and tiny body text. Nothing differentiates step 1 from step 4. The step number circles should be large and boldly coloured; the step title should be 18px+. The connecting line should be a solid, visible progress path. Currently none of the steps are memorable.

**[P1] Aesthetic-Usability Effect — mock UI card is clearly fake**
The right-side hero card shows hardcoded text ("5 medications found", "Tab. Ultrafen plus"…). Real product screenshots, even cropped and masked, would signal authenticity. A fake mock creates a subtle trust gap — especially critical for a health app where credibility is everything.

**[P2] Law of Proximity — nav items are equal weight, hierarchy is lost**
"Features | How it works" and "Sign in | Try Free" sit in the same nav bar at similar font weight. "Sign in" and "Try Free" are secondary to the hero CTAs but visually compete with them. "Sign in" should be tertiary — no button, just a link. "Try Free" in the nav duplicates the hero CTA for no gain.

**[P2] No trust signals above the fold**
Health data apps require trust. There is no patient count, no privacy badge, no "built by doctors" signal, no testimonial — nothing. The "Your Data, Your Privacy" card exists but is buried in the feature grid. A single line in the hero subtext — "Used by X families · Data never sold · Encrypted" — would address this with zero space cost.

---

## 02 — File Picker — Upload Step 1 (`02-pub-upload-s1-file-picker.png`)

### Strengths
- Three input methods with clear visual hierarchy (photo = primary blue, PDF = secondary, manual = tertiary) is textbook correct.
- Step indicator "Step 1 of 3" is present.

### Issues

**[P0] Jakob's Law — full 4-column marketing footer on a task screen**
The footer (Vitae · Product · Company · Legal, four columns) occupies ~30% of the visible page on this task screen. No established product — Gmail, Google Drive, Dropbox, Apple Health — shows a marketing footer during an active upload task. Users expect task screens to be focused. This footer signals "you are on a marketing page", which is wrong. It must be removed from all `/upload` steps, replaced at most with `© 2025 Vitae`.

**[P0] Hick's Law — marketing nav present during focused task**
"Features | How it works | Sign in | Try Free" sits at the top of a 3-step task flow. The user has already decided to upload. These links offer six navigation targets that all lead away from the task. Any click on them abandons the upload. Remove the nav entirely on all upload steps — keep only the Vitae logo.

**[P1] Page title "Add Your Prescription/Blood Report" uses non-standard terminology**
"Blood Report" is not what users call it. They say "lab report", "blood test", "CBC". The slash construction also forces users to parse two names. Use "Add Your Medical Record" or detect document type at selection and rename accordingly.

**[P1] Law of Proximity — warning banner is detached from its subject**
"Please make sure the image is not blurry…" sits in a yellow bar 200px below the photo option card it describes. Users reading the three cards will never associate the warning with the photo option. It belongs as a subtitle directly under "Upload a Photo" — "Works best with clear, well-lit images."

**[P2] Progressive Disclosure — manual entry hides behind an unexplained accordion**
"Enter your prescription manually" has a chevron but no explanation of what's inside. The subtitle "If the photo isn't clear enough" is a use-case hint, not a description. Users don't know if this opens a quick 2-field form or a 20-row spreadsheet. Add: "Type in doctor name and medicine names yourself — takes ~2 minutes."

---

## 03 — OCR Processing (`03-pub-upload-s2a-ocr-processing.png`)

### Strengths
- Named progress steps with checkmarks (Detecting text → Identifying medicines → Organising details → Preparing summary) is the right pattern. Users know the system is working, what it is doing, and approximately where it is.
- "This usually takes just a few seconds" — good time expectation.

### Issues

**[P0] Same footer and nav problem as screen 02**
Full marketing footer and nav on a loading screen. The user is waiting; they cannot act on these links; they serve no purpose here. Every loading screen in the upload flow must strip to logo-only.

**[P1] Fitts's Law + Serial Position — "Please keep this page open" is the last, smallest element**
This is the most actionable instruction on the screen — if the user navigates away, their upload is lost. Yet it is rendered in 12px muted text at the bottom, after all the progress steps. It will be missed. Move it above the step list, in 14px with a subtle background box. Or show it as a non-dismissable sticky bar at the top.

**[P2] Doherty Threshold — no elapsed time or ETA shown**
The spinner gives no sense of progress within the current step. A "Processing… 3s" counter, or a thin progress bar under the active step, would keep users connected to the system. Without it, after ~5 seconds users start wondering if the page is frozen.

---

## 04 — Prescription Review (`04-pub-upload-s2b-prescription-review.png`)

### Strengths
- PRESCRIPTION INFO and MEDICINES FOUND section headers give clear structure.
- "Tap to add…" placeholders communicate editability.

### Issues

**[P0] Fitts's Law + Goal-Gradient Effect — confirm CTA is buried ~2000px below fold**
Seven medicines × 3–4 rows each = 28+ rows before "Yes, This Looks Right →" button. On a phone the CTA is completely unreachable without heavy scrolling. Most users won't scroll — they'll assume the task is broken or that they've already confirmed it. The CTA must be sticky at the bottom of the viewport, always visible, always reachable regardless of scroll position.

This is the single most damaging UX issue in the entire product. An upload that reaches the review step but never gets confirmed is a complete loss.

**[P0] Same footer and nav problem**
Footer and full marketing nav on a critical task step. Same fix as above.

**[P1] Von Restorff Effect — "MEDICINE 1 / MEDICINE 2 / …" labels add noise without distinction**
These numbered headers are meaningless. The user can see there are multiple medicines. The section label should be the medicine name at h3 weight — that's the actual content worth scanning. "Tab. Ultrafen Plus" as a bold section header is 10x more useful than "MEDICINE 1."

**[P1] Progressive Disclosure — up to 21 empty "Tap to add…" rows**
Seven medicines × 3 fields (Name, Dosage, Duration) = many empty placeholder rows where OCR found nothing. An empty form field labelled "Dosage — Tap to add…" looks like a broken extraction, not a helpful affordance. If OCR didn't find it, collapse the row by default. Show a compact "+ Add duration" inline link. This applies particularly to Duration where OCR miss rate is high.

**[P1] Miller's Law — 7 medicines × 3 fields is 21 items in working memory**
Users asked to "verify" 21 fields will skim-confirm everything and trust the OCR. The review screen is doing too much. Consider collapsing each medicine to a single-line "pill" (Name + Dosage) and only expanding the one currently being edited. Reduces cognitive load from 21 items to 7.

**[P2] "Upload a different prescription" escape is at the bottom of a 2000px page**
This link is effectively unreachable. It must be accessible near the page title — a small "← Change file" link next to "Check the Details", or a back button in the nav header.

---

## 05 — AI Explanation Loading (`05-pub-upload-s3a-ai-explanation-loading.png`)

### Strengths
- The lightbulb icon differentiates this loading state from the OCR spinner (which used a checkmark circle).

### Issues

**[P0] Regression from screen 03 — no step progress list**
Screen 03 (OCR) showed 4 named steps with live checkmarks. Screen 05 shows a single spinner with one sentence. Users moving from a rich progress indicator to a bare spinner will assume something went wrong. Apply the same named-step pattern: "Reading your prescription → Looking up each medicine → Writing plain-language summaries."

**[P0] Same footer and nav problem**

**[P1] Law of Prägnanz — bare spinner + vast empty page looks broken**
A spinner centred in a 500px empty field below a footer reads as "the page didn't load fully." The loading state should fill the viewport intentionally — full-screen blur overlay, or a card-size loading skeleton where the medication cards will appear. The empty page creates anxiety.

**[P2] Doherty Threshold — no elapsed time, this step is noticeably slower than OCR**
AI explanation takes 5–15 seconds. That is above the cognitive threshold where users disengage. A progress bar, a "~10 seconds remaining" estimate, or even animated placeholder cards (skeleton screen) would maintain engagement.

---

## 06 — Prescription Explanation Result (`06-pub-upload-s3b-prescription-explanation.png`)

### Strengths
- MedicationCards with coloured medicine-packet illustrations are the best visual element in the product. Distinctive, memorable, non-generic. This is where the product looks like itself.
- Progressive disclosure "View details →" revealing Treats / How to take / Side effects / Avoid is correct information architecture.
- "Things to tell your doctor" in a dashed-border box is visually distinct from medication content — correct.
- Sticky "Save to My Account — Free" CTA is exactly right.

### Issues

**[P0] Same footer visible below the save CTA**
A marketing footer below a conversion action on the most important screen in the entire flow. If a user clicks a footer link here, they abandon the results they just waited for. Remove it.

**[P1] Peak-End Rule — disclaimer banner is the first thing users see**
The yellow "AI-generated summary. Do not adjust medication based on this. Consult Dr. M. M. Joynal Abedin before making any changes." banner is the first full-width element below the nav. Users who have just waited for their results see a warning before they see any content. The peak experience starts with anxiety. Medical disclaimers are legally necessary but should be visually subordinate — a slim 1-line banner at the bottom of the results, or a small pill badge next to the doctor name. Not a dominant yellow block.

**[P1] Zeigarnik Effect — "Step 3 of 3" with all dots filled is wrong here**
The step indicator shows three filled dots above the disclaimer. The user has completed the task — there is no next step in the indicator. Showing a completed step counter at the results screen suggests the user is still mid-flow. Remove it. The results page is not a "step" — it is the destination.

**[P1] Von Restorff Effect — value props above save CTA are visually cluttered**
The row of emoji + short phrases above the save button ("💊 Save this · 👨‍👩‍👧 Add your family · 🔒 Stay private") is three competing micro-messages. None of them land. Von Restorff says one distinctive element is remembered; three equal elements are all forgotten. Pick one: "Your explanation is ready — save it before you close this tab." Or remove the row entirely. The button speaks for itself.

**[P2] Back button (←) in nav would destroy the user's results**
Pressing ← at this step goes back to the prescription review form. The user's AI-generated explanation would be lost. After seeing results, the user's mental model of "back" is "home" — not "back to the form." At the results step, the back button should either go to the dashboard (if logged in) or go home (if public). Do not navigate back to the review form.

---

## 07 — Lab Report Review — Auth Upload Step 2 (`07-auth-upload-s2-lab-report-review.png`)

### Strengths
- High / Normal / Low status badges on each row give immediate signal.
- Patient name, date, lab name, referring doctor shown at top — correct context.

### Issues

**[P0] Wrong page title — "Upload Prescription" on a lab report screen**
The top-left label says "Upload Prescription." This is a lab report. This is not ambiguous — it is factually wrong. Users who notice it will lose confidence in the system's accuracy (if it can't label its own screen correctly, can it label their test values correctly?). This must be "Upload Lab Report."

**[P0] Fitts's Law — confirm CTA at the bottom of ~3000px of content**
20+ test parameters × 4 rows each (test name, result, reference range, Edit button) = 80+ rows. The sticky "Yes, This Looks Right →" button is the only saving grace. Confirm it is genuinely sticky in the implementation and does not scroll off-screen on any device.

**[P1] Miller's Law — 20 tests as a flat undifferentiated list**
A Complete Blood Count has clinical categories: RBC Indices, WBC Differential, Platelets. Presenting 20 rows with no grouping overwhelms working memory. Users cannot tell if they have reviewed all the values — the list has no landmarks. Group with subtle section headers: "Red Blood Cells · 6 tests", "White Blood Cells · 7 tests", "Platelets · 2 tests." This turns 20 undifferentiated items into 3 scannable groups.

**[P1] Tesler's Law — edit buttons on individual numeric test values shifts complexity to the user incorrectly**
"Edit" appears on every row including individual numeric values like Haemoglobin: 12.5 g/dL. The user should not be correcting clinical test values — those came from the lab. If the OCR misread a number, the user likely cannot verify the correct value (they don't have the original in front of them at review time, or they would have caught it then). Editable fields should be limited to patient name, date, lab name, and referring doctor — not individual test results. Showing edit affordances on test values implies the user has authority over clinical data, which is medically risky.

**[P2] Law of Proximity — Edit button is far right, disconnected from its field**
The "Edit" text link sits at the far right edge of each row, far from the value it edits. On a wide screen the distance is ~400px. Users looking at "PCV: 57.5" in the centre of the row will not associate it with the Edit button at the right margin. Proximity violation. Put the edit icon immediately adjacent to the value.

---

## 08 — Lab Report Analysis Result (`08-auth-upload-s3-lab-report-analysis.png`)

### Strengths
- AbnormalMarkerCard design: coloured accent bar, large bold value, plain-language explanation paragraph. This is the right output for a lab report. Clear, actionable, not clinical-jargon.
- "Things to follow" with 4 concrete bullet points is excellent — specific and actionable.

### Issues

**[P0] Wrong page title — "Upload Prescription" again**
Same bug as screen 07. This is the results screen for a lab report and it still says "Upload Prescription" top-left. Critical credibility damage.

**[P1] Peak-End Rule — disclaimer banner leads again**
Same problem as screen 06. The yellow "AI-generated summary. Do not adjust medication based on this. Consult Dr. Hiran Shah before making any changes." is the first substantive element below the header. For a lab report where 2 values are abnormal, users arriving at this screen are anxious about their results. Leading with a warning amplifies that anxiety before they understand what's wrong. Show the abnormal markers first, banner last (or inline at reduced size).

**[P1] Missing denominator destroys relative context**
"Parameters Outside Normal Range (2)" — two is alarming or reassuring depending entirely on how many total parameters there are. 2 of 5 is catastrophic. 2 of 22 is mild. Showing only the numerator forces users to scroll the entire page to count the total. Show "2 of 22 parameters outside normal range" in the section header. This is a direct application of Miller's Law — users need context to chunk the information meaningfully.

**[P1] "Referred by Dr. Hiran Shah. For Nath M. Patel" — looks like a link, not metadata**
This line is rendered in small muted blue text that visually reads as a hyperlink. It is not a link. Blue text in a body context means "tap me." This creates a Prägnanz error — the user's simplest interpretation of blue text is "this is interactive." Render it in normal grey body text, same weight as other meta.

**[P2] "Save Lab Report" is a cold, terminal CTA**
After reading about two abnormal markers and receiving advice to see a doctor, the user taps "Save Lab Report." The button tells them nothing about what happens next. "Save & View Full Report" or "Done — Save Report" is warmer and sets expectation of the destination.

---

## 09 — Dashboard — Empty State (`09-dashboard-hub-empty-state.png`)

### Strengths
- Profile wheel pattern (initials + name below chip) is clean and immediately clear.
- "+" chip to add a member is discoverable.

### Issues

**[P0] "Hi aashikvilla99" — username exposed as greeting, not display name**
The user's display name should be their real name, not their username/email handle. "Hi aashikvilla99 👋" is a developer/debug display. Users set a name during onboarding — that name should appear here. Showing a username handle signals that the product doesn't know them as a person.

**[P0] "LAVanya" — character-casing data bug is a trust-breaker**
The profile chip and the section header "LAVANYA'S DOCUMENTS" both show incorrect casing. A product managing someone's family health records cannot misspell a family member's name. This is the user's data, their family member's name, displayed wrongly. Fix at the storage layer: normalise on write using title-case. Add a display-layer fallback: `name.split(' ').map(w => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(' ')`.

**[P0] Empty state CTA "Upload a Prescription" ignores lab reports**
The product accepts both prescriptions and lab reports. The empty state offers only one entry point. A user with a lab report but no prescriptions has no obvious next action. The CTA should be "Upload a Record" with a secondary option below "— prescription or lab report."

**[P1] Hick's Law — "Edit profile" top-right is ambiguous**
"Edit profile" next to "FAMILY PROFILES" could mean "edit my account" or "edit LAVanya's profile." Users will hesitate. If it refers to the selected profile chip, rename to "Edit LAVanya" or show a small pencil icon directly on the active chip. If it refers to the account, move it to Settings.

**[P1] Wasted real estate — bottom 60% of screen is empty**
Below the "Upload a Prescription" button: nothing. This is the first screen after adding a family member. The empty state should teach: show a skeleton of what the dashboard looks like with records (greyed out), with labels "Medications will appear here" and "Your records will appear here." This is an onboarding opportunity that is completely missed.

**[P2] Serial Position Effect — "Add" chip is at the end of the profile wheel**
The "Add" chip is last in the array. This is correct — it should trail active profiles. But it is styled identically (same grey, same circle size) to inactive profiles. The "+" should be visually distinct — smaller, dashed border, lighter — to signal "this is an action, not a person."

---

## 10 — Sign In / Sign Up (`10-auth-signin-signup.png`)

### Strengths
- Tab-based Sign In / Sign Up switching is clear. Correct Jakob's Law pattern.
- "Continue with Google" as a prominent option above the email form is correct hierarchy — most users will take the OAuth path.

### Issues

**[P0] Jakob's Law — 4-column marketing footer on auth page**
Same problem as the upload flow. No major product (Google, Apple, Stripe, Notion) shows a marketing footer on their sign-in page. Auth is a focused interaction. The footer is completely wrong here and undermines the trust-building purpose of a clean sign-in screen.

**[P0] No "Forgot password?" link**
Email + Password with no password recovery is a known failure pattern. A user who set their password months ago, can't log in, and sees no escape will churn. This is not an edge case — forgotten passwords are the most common auth support request. "Forgot password?" must appear below the password field.

**[P1] Marketing nav visible during auth**
"Features | How it works" at the top of a sign-in card. The user is trying to log in. These nav links lead away from completion. Strip to logo-only on the auth page.

**[P2] No product context on the auth page**
Someone arriving at `/auth` from a search result, a share link, or a bookmark sees "Vitae" and a heart icon with no explanation of what they're signing into. A single tagline below the logo — "Your family's health records, understood" — costs zero space and prevents bounce from confused arrivals.

**[P2] "Don't have an account? Sign up" link below the button is redundant**
The Sign Up tab is two taps away. The inline link below the button is redundant and adds visual noise. It can be removed; the tab handles this.

---

## 11 — Add Family Member (`11-dashboard-add-family-member.png`)

### Strengths
- "You manage their prescriptions — they don't need to sign up" is excellent clarifying copy. Directly kills the obvious objection.
- "2 of 5 profiles used" — correct progressive disclosure of limits.
- Optional email explanation ("If they create an account with this email…") is well documented inline.

### Issues

**[P1] "Skip for now" — violates Jakob's Law, creates false task model**
"Skip" implies the user is deferring a required step. They are not — they chose to be on this page. The correct affordance is "Cancel" (returns to dashboard without saving). "Skip for now" reads as "I'll come back and finish this" — but there's nothing to come back to. Rename to "Cancel."

**[P1] Collecting Date of Birth for a non-existent feature**
"Used for medication reminders (coming soon)" — this explicitly tells the user you are collecting their family member's date of birth for a feature that does not exist. Under any reasonable privacy expectation, you should not collect personal data (especially for a named individual) before the feature using it exists. Remove this field until reminders launch. When reminders launch, prompt for it at the point of enabling reminders.

**[P1] Aesthetic-Usability Effect — native browser `<select>` for Relationship is jarring**
The "Select relationship" dropdown uses the OS native select element, which renders completely differently on iOS, Android, Chrome, Safari, and Windows. Every other element on this form is custom-styled. One native select element breaks the visual coherence of the page and makes it look unfinished. Replace with a custom styled select or a set of radio button chips (Parent · Child · Spouse · Sibling · Other).

**[P2] Photo upload area occupies more space than the entire form below it**
The dashed-border photo area takes roughly 25% of the page height. It is optional and has zero functional impact on record management or health tracking. An avatar photo of a family member in a health app is a nice-to-have. Reduce to a small circular avatar placeholder (40px) inline with the Full Name field, as a secondary affordance.

**[P2] No nav back button**
The page has no back arrow / close button in the header. The only way to leave without saving is the "Skip for now" link at the very bottom. Add a "← Back" or "✕ Cancel" in the top-left corner. Fitts's Law: navigation controls belong at predictable, reachable positions, not only at the bottom of a form.

---

## 12 — Dashboard — With Records (`12-dashboard-hub-with-records.png`)

### Strengths
- Profile wheel with active profile highlighted in blue — clear selection state.
- Document row design (doctor name + date + medication count + tag) packs right information at right density.
- "+ Upload for yourself" sticky CTA at bottom is prominent and correctly placed.

### Issues

**[P0] "As directed by your doctor" × 7 in the Active Medications strip**
Every medication in the strip shows "As directed by your doctor" as the frequency. This is the stored OCR value. Seven identical rows of useless text. The medications strip has one job — tell the user what they're currently taking. A strip where every item shows the same non-informative phrase is worse than no strip at all, because it makes the user feel the feature is broken. Fix: show dosage when frequency is non-specific ("50mg"), or show nothing for frequency when it's a generic instruction. "Tab. Ultrafen Plus · 50mg" is more useful than "Tab. Ultrafen Plus · As directed by your doctor."

**[P0] Medication icons are broken grey squares**
Each medication row has a small grey square before the name. These are clearly broken placeholder boxes — the coloured medicine-packet illustration (present in MedicationCard on the detail page) is not rendering here. Broken image states are the most visually damaging aesthetic defect because users interpret them as system failure. Fix or remove entirely.

**[P1] Von Restorff Effect — diagnosis tag overflow destroys scannability**
"R knee pain and difficulty in going up by stairs" truncates mid-word with "…". Tags are the key scannable differentiator between records — they let users distinguish prescriptions at a glance. A truncated tag is useless. Either: truncate at source (max 25 chars), render on two lines if needed, or show the tag as a tooltip on hover/tap.

**[P1] "Active" pill next to the medications section header — unexplained**
There is a small "Active" pill/badge to the right of "YOUR ACTIVE MEDICATIONS." What does this do? Is it a filter? A status? A toggle? If it's a filter (showing only active vs. all), it needs a label. If it's a status indicator, it shouldn't look tappable. The ambiguity of unlabelled controls is a direct Hick's Law violation — users must stop and evaluate every time they see it.

**[P2] Three-dot menu on document row — invisible affordance**
The ⋮ overflow icon is the only action on the document row. If it contains only "Delete" it should be a trash icon with immediate consequence. If it contains more actions, those actions should be surfaced in some form. A three-dot menu with unknown contents is a dead end for most users — they will not tap it.

---

## 13 — Timeline (`13-timeline-all-records.png`)

### Strengths
- Month-based grouping ("NOVEMBER 2010") is the right pattern for medical history.
- Filter chips for person + record type give meaningful control.

### Issues

**[P1] Law of Proximity — two filter rows read as one undifferentiated block**
Row 1: person chips (All | aashikvilla99 | LAvanya)
Row 2: type chips (All types | Prescriptions | Lab Reports)

These two rows sit directly on top of each other with no separator, no label, and identical chip styling. Users cannot tell at a glance which row filters by what. Add minimal labels: a "Who:" muted prefix before the person row and "Type:" before the type row. Or separate them with 16px of vertical space and a hairline rule.

**[P1] "LAvanya" — same casing bug**
Confirmed in the person filter chip. Data-layer bug. Needs the same fix as screen 09.

**[P1] Record card carries insufficient information for differentiation**
The card shows: icon · "Prescription" badge · username · doctor name · date · diagnosis tag.
Missing: medication count for prescriptions, number of abnormal markers for lab reports. Without these, users cannot distinguish "which prescription was this" without tapping in. The differentiation happens at the content level — surface it. "7 medications · R knee pain" > bare "M. M. Joynal Abedin."

**[P2] Serial Position Effect — empty state (70% of screen) after one record**
One record, then 70% blank grey. The empty space reads as "nothing here." An "Upload your next record" prompt at the bottom of the list, or a gentle illustration, converts dead space into onboarding.

**[P2] No sort control**
Timeline is always newest-first. A "Sort ↕" control would take 4 lines of code and serve power users well. Not critical but notably absent for a records history view.

---

## 14 — Record Detail, Prescription Top (`14-record-detail-rx-meta-and-meds.png`)

### Strengths
- WhatsApp icon in nav top-right: correct placement, familiar pattern.
- Meta block (date · doctor · "For aashikvilla99" · diagnosis tag) is compact and readable.
- "MEDICATIONS · 7" section header gives a count upfront.

### Issues

**[P0] "For aashikvilla99" — username exposed instead of display name**
Same issue as the dashboard greeting. The record detail says "For aashikvilla99", not "For Aashik" or the user's real name. For a family health app, displaying a technical username handle where a human name belongs is a significant personalization failure.

**[P1] "As directed by your doctor" × 7 — same issue as dashboard strip**
The medications list on the record detail shows all 7 medications with frequency "As directed by your doctor." This is the pre-AI-enrichment data. On the detail page the user expects richer information than the dashboard strip. If AI explanation is available (screen 15 shows it is), this screen should show the AI-enriched card format — not the raw OCR fallback. The two screenshots suggest the old split (record page vs. explanation page), which should now be merged.

**[P1] "Read plain-language explanation →" as a second navigation step**
This button sends the user to a second page to see the AI content. Two taps to see the key value of the product. This has been fixed in the current codebase (merged into `/records/[id]`), but the screenshot documents the old state. Confirmed fixed.

**[P2] No visual indicator of document type beyond the nav label**
"Prescription" is shown in the nav header text but there's no icon or badge. In a family with mixed prescriptions and lab reports, a small icon (Rx pill for prescriptions, flask for lab reports) would orient the user instantly, especially mid-scroll when the nav title is out of view.

---

## 15 — Record Detail, Prescription AI Cards (`15-record-detail-rx-ai-cards-and-share.png`)

### Strengths
- MedicationCards are the best design work in the product. Coloured medicine-packet illustration, expandable details, distinct treatment/side-effects/avoid sections — clear, memorable, non-generic.
- "Things to tell your doctor" in a dashed-border card is correctly distinguished from the medication content.
- "Share via WhatsApp" full-width green button at the bottom is prominent and clear.

### Issues

**[P0] "Save to My Records" button at the bottom of a saved record page**
The dark "Save to My Records" button appears at the very bottom of `/records/[id]`. This record is already saved — the user is viewing it. This button creates a genuine confusing UX: "Is my record not saved? Did my upload fail?" It is almost certainly `ExplanationActions` leaking onto the detail page. Remove it completely from `/records/[id]`. It belongs only on the public `/upload` flow.

**[P1] Peak-End Rule — yellow disclaimer is still the first content**
"AI generated summary. Do not adjust medication based on this. Consult M. M. Joynal Abedin before making any changes." is full-width yellow at the top. Users viewing a saved record they've already seen come back to check a medication, not to be warned again. The disclaimer can be reduced to a single italic line at the bottom: _AI-generated · Always consult your doctor_. It does not need to be a banner. It definitely should not be the first thing seen.

**[P1] "As directed by your doctor" still appears in AI cards**
Even in the AI-enriched card view, each medication shows "As directed by your doctor" in the teal frequency field. If the AI explanation step resolved the medicine details (Treats, How to take, Side effects), it should also resolve a more specific frequency statement — or hide the frequency field when the value is non-specific. Showing a generic phrase in what is meant to be the "smart" card undermines credibility.

**[P1] Duplicate WhatsApp entry points without clear distinction**
WhatsApp icon in nav top-right AND full-width "Share via WhatsApp" green button at the bottom. Both do the same thing. This is redundant UI. The rule should be: nav icon for quick access (for users who want to share mid-scroll), bottom button for deliberate primary action (for users who reached the end). Both are acceptable — but both should fire identical behaviour. If they do, the duplication is acceptable. If one has different behaviour, it is confusing.

**[P2] "Tab." and "Cap." prefixes in card titles are OCR artefacts**
"Tab. Ultrafen plus", "Cap. Omepraz" — the tablet/capsule prefix is a format artefact from the handwritten prescription, not the drug's display name. It clutters the card illustration and the section heading. Strip these at the extraction or normalisation layer: `"Tab. Ultrafen plus" → "Ultrafen plus"`, with the form (Tablet) shown as a secondary badge if needed.

---

## Cross-Cutting Issues

### Footer on all public task-flow screens
**[P0]** The 4-column marketing footer (Vitae · Product · Company · Legal) appears on screens 02, 03, 04, 05, 06, and the auth page. This is a single layout bug — the public layout wraps all `(public)` routes with the footer. Task screens are not marketing pages. The public layout needs a `showFooter` prop (or a separate layout wrapper for task routes) that suppresses the footer on `/upload/*` and `/auth`.

### Marketing nav during 3-step upload task
**[P0]** "Features | How it works | Sign in | Try Free" is present on every upload step. These links actively compete with the upload task and offer an exit path at every step. Hick's Law: every additional navigation target increases decision time and the probability of abandonment. Hide the nav on `/upload/*` — show only the Vitae logo.

### Username handles shown as human names throughout
**[P0]** `aashikvilla99` appears as the greeting on the dashboard, as the "For [name]" on record details, and in filter chips on the timeline. Display names were collected at onboarding. They must be used. This is a data-binding issue — the greeting and record attribution are pulling from `user.email` or `user.id` instead of the `profiles.full_name` of the authenticated user's own profile.

### "LAVanya" / "LAvanya" incorrect casing — data-layer bug
**[P0]** Appears in screens 09, 12, 13. The casing is a storage artefact. Fix at two levels: (1) normalise on write — when a profile name is saved, apply title-case before storing; (2) add a display-layer normalisation as a fallback. This is someone's family member's name. Getting it wrong on every screen is a failure of basic data hygiene.

### Disclaimer banner placement — anxiety-first UX on result screens
**[P1]** The yellow disclaimer banner appears as the first element after the nav on screens 06, 08, and 15. On all three, it displaces the content the user came to see. Medical AI disclaimers are necessary. But placing them first is a design decision that prioritises legal protection over user experience. They should appear after the substantive content, or as a compact one-line element. The Peak-End Rule says users judge the experience by its most emotionally intense moment — and starting every result screen with "Do not adjust your medication" is a strong, anxiety-inducing peak.

### "Upload Prescription" title on lab report screens
**[P0]** Screens 07 and 08 both display "Upload Prescription" as the page title when the user is handling a lab report. This is a factually wrong label on screens where clinical data is being reviewed. It will cause users to question whether their lab report was correctly identified. Fix: pass document type through the upload flow and render the appropriate title.

### "Prescriptions" used as a synonym for all medical records
**[P1]** Empty state: "No prescriptions yet." Upload CTA: "Upload a Prescription." Record count on dashboard: "7 medications" only visible for prescriptions. Lab reports exist as a first-class feature but are invisible in the copy. Standardise: use "record" or "document" when the type is unknown or mixed; use "prescription" or "lab report" only when the type is confirmed.
