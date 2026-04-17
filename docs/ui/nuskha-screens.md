# Vitae  Screen Specifications

_14 screens · Mobile-first · Buildathon April 6–15 2026_
_Reference: nuskha-wireframes.html_

---

## Flow Map

```
S01 Landing
  → S02 Upload Picker
    → S03 OCR Loading
      → S04 Confirm & Review
        → S05 AI Explanation
          → S06 Save Prompt [AUTH GATE]
            → S07 OTP Entry
              → S08 Family Hub (Empty)
                → S09 Add Family Profile
                  → S10 Family Hub (Populated)
                    → S11 Prescription Detail
                      ↳ S12 Medical History Timeline
                      ↳ S13 Share + Doctor PDF
                            → S14 Read-Only View (no login)
```

---

## Stage 1  Discovery

### S01 · Landing / Homepage

**Purpose:** First impression. Communicate the value proposition in one sentence. Get the user to upload without requiring a login.

**Key elements:**

- Logo: "Vitae" + subtitle "नुस्खा · prescription · remedy"
- Hero headline: _"Your parents' prescriptions, explained in plain English"_
- Sub-headline: _"And shared with your family in one tap. No medical knowledge needed."_
- Primary CTA: **[Upload a Prescription]**  full-width, prominent
- Micro-copy below CTA: _"No account needed to try"_
- Feature list (3 items below the fold):
  - Photograph any prescription  handwritten, printed, PDF
  - Plain-language explanation  what each drug does, how to take it, what to avoid
  - Family history, one place  manage Papa, Mummy and yourself under one account

**User action:** Tap "Upload a Prescription" → goes to S02.

**Design notes:**

- No nav bar, no login link above the fold  remove all friction before first value moment
- Feature list is secondary; the CTA is the only job of this screen
- Marketing lead: Persona B (adult child managing aging parent)  the headline speaks to them directly

---

## Stage 2  Upload

### S02 · Upload Picker

**Purpose:** Let the user choose how to add the prescription. Camera is primary because most Indian prescriptions arrive as WhatsApp photos.

**Key elements:**

- Back arrow + screen title: "Upload Prescription"
- Helper text: _"Choose how to add the prescription"_
- Three upload options (card style):
  1. **Take a Photo** _(PRIMARY  highlighted border)_  use camera or pick from gallery · "PRIMARY" badge
  2. **Upload PDF**  digital hospital prescriptions
  3. **Type Manually**  fallback if OCR fails completely
- Tip banner: _"If your prescription arrived on WhatsApp, screenshot it and upload the image."_
- Footer note: _"For best results, ensure the prescription is flat and well-lit"_

**User action:** Tap any card → triggers the relevant system picker → goes to S03.

**Design notes:**

- Camera card must be visually dominant  it is the primary path for handwritten prescriptions
- Manual entry is a last resort, not a promoted feature; keep it visually de-emphasised
- PDF upload is secondary but important for digital hospital prescriptions

---

### S03 · OCR Processing (Loading)

**Purpose:** Show the user that work is happening. 3–5 seconds of processing. Sets quality expectations  don't skip this screen.

**Key elements:**

- Prescription image preview at top (thumbnail of what was uploaded)
- Loading headline: _"Reading your prescription..."_
- Progress bar (animated, ~65% filled on render)
- Current step label: _"Identifying medications..."_
- Step-by-step status list (4 items):
  1. ✓ Detecting text in image _(done)_
  2. ● Identifying medications & dosages _(active)_
  3. ○ Structuring prescription data _(pending)_
  4. ○ Generating explanation _(pending)_
- Footer note: _"Google Vision AI + Claude · Usually takes 3–5 seconds"_

**User action:** No action  auto-advances to S04 on completion.

**Design notes:**

- Short loading time gives a sense of quality, not slowness
- Step list builds trust  user understands what the AI is actually doing
- If OCR fails entirely, redirect to S02 Manual entry with an error message

---

### S04 · Confirm & Review

**Purpose:** Always shown regardless of OCR confidence. User verifies extracted data before it saves. Natural home for the medical disclaimer.

**Key elements:**

- Back arrow labelled "Edit" + title: "Does this look right?"
- Helper text: _"We extracted the following. Tap any field to correct it."_
- Extracted data table (rows):
  - Doctor name · Confidence: ✓
  - Date · Confidence: ✓
  - Drug 1 (e.g. Metformin 500mg) · Confidence: ⚠ Review _(yellow highlight)_
  - Dose 1 (e.g. Twice daily after meals) · Confidence: ⚠ Review _(yellow highlight)_
  - Drug 2 (e.g. Atorvastatin 10mg) · Confidence: ✓
  - Duration · Confidence: ✓
- Warning banner: _"⚠️ Highlighted fields have lower confidence. Please verify before continuing. AI-generated  consult your doctor before making any decisions."_
- Primary CTA: **[Looks right, continue →]**
- Secondary action: **[Correct the fields above]** (ghost button)

**User action:** Tap "Looks right, continue →" → goes to S05. Tap "Correct" → inline editing on flagged fields.

**Design notes:**

- Every field is tappable to edit  not just the flagged ones
- ⚠ flagged rows have a subtle yellow background on the full row
- This screen prevents bad data from entering medical history  do not allow skipping it
- The disclaimer lives here and at S05  both locations, not just one

---

## Stage 3  Insight

### S05 · AI Explanation

**Purpose:** Core value moment. Plain-language breakdown of every medication in the prescription. Medium depth  not diagnosis.

**Key elements:**

- Nav bar: back arrow, title "Your Prescription", "Share" action top-right
- Context line: _"Dr. Sharma · 08 Apr 2026 · For Papa"_ (small, muted)
- **Medication cards** (one card per drug):
  - Card header: Drug name + dose (e.g. "Metformin 500mg" · "Twice daily")
  - Card body rows:
    - **Treats**  what condition this drug addresses
    - **How to take**  timing, meals, water
    - **Side effects**  common ones only, plainly worded
    - **Avoid**  food/drink interactions
- **"Things to tell your doctor"** section (dashed border box):
  - Bullet list of follow-up items the user should raise at next visit
  - Examples: muscle pain (statin side effect), stomach discomfort, home monitoring
- Disclaimer banner: _"⚠️ AI-generated summary. Do not adjust medication based on this. Consult [doctor name] before making any changes."_
- Primary CTA: **[Save to My Records]** → triggers S06 (auth gate)
- Secondary action: **[Copy share link (no account needed)]** → generates S14 link immediately

**User action:** "Save to My Records" → S06. "Copy share link" → clipboard + confirmation toast.

**Design notes:**

- Framing is always _"your doctor prescribed X, which typically means..."_  never diagnosis language
- "Things to tell your doctor" lowers liability while surfacing interaction notes  same LLM call, no extra engineering
- The disclaimer must be visible without scrolling on at least one breakpoint
- Depth: drug name + treats + how to take + side effects + avoid  exactly this, no more

---

## Stage 4  Auth Gate

### S06 · Save Prompt (Auth Gate)

**Purpose:** First login wall  triggered only when the user explicitly wants to save. Not shown before value is delivered.

**Key elements:**

- Bottom sheet overlay (AI Explanation screen visible dimmed behind)
- Drag handle at top of sheet
- Sheet headline: _"Save to your records"_
- Explanation copy: _"Create a free account to build your medical history and share with family. No passwords  just your phone or email."_
- Benefit list (3 items with ✓ prefix):
  - Medical history saved across all visits
  - Up to 5 family profiles under one login
  - Shareable link for each prescription
- Primary CTA: **[Continue with Phone Number]**
- Secondary CTA: **[Continue with Email]** (outline button)
- Escape hatch: **[Skip  just copy the share link]** (ghost/underline)

**User action:** Phone → S07 (phone OTP). Email → S07 (email OTP). Skip → copy link toast, stay on S05.

**Design notes:**

- Never block the share link behind auth  the escape hatch must always exist
- Bottom sheet (not full-screen takeover)  user can see what they're saving, reducing drop-off
- No social login (Google/Apple) for MVP  OTP only keeps the stack simple

---

### S07 · OTP Entry

**Purpose:** Sign up or log in via OTP. No passwords ever.

**Key elements:**

- Back arrow (returns to S06)
- Headline: _"Enter your phone number"_
- Sub-copy: _"We'll send a 6-digit code. No passwords, ever."_
- **Input row:** Country code selector (+91) + phone number field
- CTA: **[Send OTP]**
- After send  OTP entry state appears below:
  - Helper: _"Enter the 6-digit code sent to +91 98XXXXX890"_
  - 6 individual digit boxes (OTP grid)
  - CTA: **[Verify & Continue]**
  - Ghost action: **[Resend code (30s)]**
- Footer link: _"Use email instead?"_

**User action:** Enter phone → Send OTP → Enter 6 digits → Verify → goes to S08.

**Design notes:**

- Auto-advance on 6th digit (no need to tap Verify manually)  reduces friction
- Supabase Auth handles OTP delivery  phone and email both supported
- On success: prescription from S05 is saved automatically before navigating to S08

---

## Stage 5  Family Hub

### S08 · Family Hub  Empty State

**Purpose:** Post-signup landing. Welcome moment. Show the prescription was saved. Surface the "add family member" hook clearly.

**Key elements:**

- Nav bar: "Vitae" logo + notification bell
- Welcome line: _"Hi Priya 👋"_
- Sub: _"Your family's prescriptions, all in one place"_
- **Profile wheel** (horizontal row of avatar chips):
  - "You" (Priya)  filled, active avatar
  - "Add Papa"  dashed border, empty
  - "Add Mummy"  dashed border, empty
  - "Add more"  dashed border, empty
- **"Your Prescriptions" section:**
  - "Just saved" label
  - Prescription card: Dr. Sharma · 08 Apr 2026 · Metformin + Atorvastatin
- Primary CTA: **[+ Upload Another Prescription]**
- Secondary CTA: **[Add a family member profile]** (outline)

**User action:** Tap dashed profile chip or "Add a family member" → S09. Tap prescription card → S11. Tap "Upload Another" → S02.

**Design notes:**

- The dashed "Add Papa / Add Mummy" chips are the primary growth hook  they make the family use case obvious without explaining it
- The saved prescription card is a confirmation that the OTP signup worked and data was persisted

---

### S09 · Add Family Profile

**Purpose:** Create a profile for a family member. They never need an account  the child manages everything.

**Key elements:**

- Back arrow + title: "Add Family Member"
- Helper: _"You manage their prescriptions  they don't need to sign up."_
- **Photo area** (dashed border card): optional avatar upload, "Add a photo" label
- **Form fields:**
  - Full Name  text input, placeholder "e.g. Ramesh Gupta"
  - Relationship  dropdown: Father / Mother / Spouse / Sibling / Other
  - Date of Birth  date input DD/MM/YYYY
- Primary CTA: **[Save Profile]**
- Escape: **[Skip for now]** (ghost)

**User action:** Fill form → Save → returns to S10 (hub now has the new profile). Skip → returns to S08.

**Design notes:**

- Photo is optional and must stay optional  don't gate on it
- DOB is used for future medication reminders (post-MVP)  collect now
- 5 profiles max per account enforced at this point; if limit reached, disable the CTA and show an upgrade nudge

---

### S10 · Family Hub  Populated

**Purpose:** Central dashboard once family profiles exist. Switch between profiles to see each person's prescriptions.

**Key elements:**

- Nav bar: "Vitae Family" + notification bell
- **Profile row** (horizontal chips):
  - Priya (You)
  - Papa  active/selected (bold label, darker border)
  - Mummy
  - - Add
- **Active profile's prescriptions list** (below profile row):
  - Label: _"Papa's Prescriptions"_
  - Prescription rows (each with doctor, date, med count, condition tag, chevron):
    - Dr. Mehta · 08 Apr 2026 · 3 medications · [Diabetes]
    - Dr. Singh · 15 Feb 2026 · 2 medications · [BP]
    - Dr. Patel · 10 Nov 2025 · 4 medications · [Seasonal]
- CTA: **[+ Upload for Papa]** (context-aware, uses active profile name)
- **Bottom navigation:** Home (active) · Timeline · Profile

**User action:** Tap profile chip → switches active profile, list reloads. Tap prescription row → S11. Tap "Upload for Papa" → S02 (with Papa's profile pre-selected). Tap Timeline → S12.

**Design notes:**

- Active profile context must persist across screens  if user navigates to S02 from here, the upload should default to Papa's profile
- "Upload for [Name]" button label changes dynamically based on selected profile

---

## Stage 6  Records

### S11 · Prescription Detail

**Purpose:** Per-visit record. All medications from a single doctor visit. Entry point to AI explanation, sharing, and PDF generation.

**Key elements:**

- Nav bar: back arrow to profile name, title "Prescription", "Share" action top-right
- **Prescription header card:**
  - Doctor name (e.g. Dr. Mehta)
  - Date + clinic (e.g. 08 April 2026 · City Hospital, Jaipur)
  - For: [profile name] (e.g. Papa – Ramesh Gupta)
- **Medications section** (label "Medications (3)"):
  - One row per drug:
    - Drug name + dose frequency (right-aligned)
    - Duration and timing below
- **AI Explanation accordion** (collapsed by default):
  - Header: "AI Explanation" + "View full ›" link
  - Preview: first 1–2 sentences of the explanation
  - Tapping "View full" opens full S05 view
- Primary CTA: **[Share This Prescription]** → S13
- Secondary CTA: **[Generate Doctor PDF]** → S13 (Doctor PDF section)
- Pro-locked feature (greyed out, 50% opacity): **[Set Medication Reminders]** + "PRO" badge

**User action:** Tap "Share" → S13. Tap "View full" in accordion → S05. Tap "Generate Doctor PDF" → S13.

**Design notes:**

- The AI explanation is collapsed here because the detail view is a record, not the insight moment  S05 is the insight moment
- Pro teaser must be visible but clearly non-interactive  greyed out with "Coming soon  Pro" label

---

### S12 · Medical History Timeline

**Purpose:** Chronological view of all prescriptions across all profiles. The longitudinal intelligence asset. Reachable from bottom nav.

**Key elements:**

- Nav bar: title "Timeline" + "Filter" action top-right
- **Profile filter pills** (horizontal scrollable row): [All] [Priya] [Papa] [Mummy]
- Summary line: _"Showing all family prescriptions · 6 total"_
- **Timeline list** (chronological, most recent first):
  - Each entry:
    - Date column: Month (3-letter) + Day (large) + Year (small)
    - Content: Profile name (small, muted) · Doctor + clinic · Condition tags
    - Chevron → taps to S11
  - Example entries:
    - APR 08 2026 · Papa · Dr. Mehta – City Hospital · [Diabetes] [Cholesterol] [3 meds]
    - MAR 22 2026 · Priya · Dr. Khanna – Apollo Clinic · [General] [2 meds]
    - FEB 15 2026 · Papa · Dr. Singh – Fortis · [Blood Pressure] [2 meds]
    - NOV 10 2025 · Mummy · Dr. Patel – Max Hospital · [Thyroid] [4 meds]
- **Bottom navigation:** Home · Timeline (active) · Profile

**User action:** Tap filter pill → list filters to that profile. Tap entry row → S11. Tap "Filter" top-right → sort/date range options (post-MVP).

**Design notes:**

- Date display (large day number) makes the timeline scannable at a glance
- Profile name on each row is essential when "All" filter is active  without it, context is lost
- Condition tags are AI-inferred from the prescription  not doctor-entered

---

## Stage 7  Share

### S13 · Share + Doctor PDF

**Purpose:** Two share modes  quick link for family (WhatsApp/email) and a formatted PDF to hand to the next doctor.

**Key elements:**

- Nav bar: back arrow, title "Share Prescription"
- Context: _"Dr. Mehta · 08 Apr 2026 · For Papa"_

**Section 1  Share Link:**

- URL display box: `nuskha.in/rx/a3f9c2e1...` (truncated) + **[Copy]** button
- Share note: _"Anyone with this link can view without logging in"_
- Share buttons row: **[WhatsApp]** · **[Email]** · **[More]**

**Section 2  Doctor PDF:**

- Helper copy: _"Generate a formatted summary to hand to Papa's next doctor. Includes medications, questions to ask, and prescription history."_
- PDF preview box (formatted document look):
  - Header: "Vitae · Patient Summary · [Patient Name]"
  - Date + Doctor row
  - Current medications row
  - Questions for doctor row
  - Italic disclaimer: _"AI-generated. Verify with treating physician."_
- CTA: **[Download / Share PDF]**

**User action:** Tap Copy → clipboard toast. Tap WhatsApp/Email → native share sheet. Tap Download PDF → generates PDF and opens share sheet.

**Design notes:**

- Share link is MVP (~2 hours engineering)  UUID-based, read-only, no login required for recipient
- Doctor PDF is formatted to look professional, not consumer-app-ish  the recipient is a doctor
- These are two distinct sharing intents: family (link) vs. medical handoff (PDF)

---

### S14 · Share Link  Read-Only View

**Purpose:** What the prescription looks like to someone who received the share link. No login, no nav. Fully self-contained. Acquisition hook at the bottom.

**Key elements:**

- **Top banner** (thin, full-width): _"Shared by Priya via Vitae · View only"_
- Prescription context:
  - Doctor name + date (e.g. Dr. Mehta  08 April 2026)
  - For: Ramesh Gupta (Papa)
- **Medication cards** (same structure as S05, read-only):
  - One card per drug with: Treats / How to take / Avoid rows
- **"Things to tell the doctor"** section (dashed border):
  - Bullet list of follow-up items
- **Disclaimer banner:** _"⚠️ AI-generated summary. Consult Dr. Mehta before making any decisions."_
- **Bottom acquisition banner** (dark, full-width):
  _"Want to manage your family's prescriptions?"_
  **[Create a free Vitae account →]**

**User action:** Read-only  no actions except tapping the "Create account" banner → S01 or directly to S07.

**Design notes:**

- No app navigation  recipient is not a user yet; don't confuse them with the app shell
- The acquisition banner is the single call to action  one job for this screen
- If the share link has expired or is invalid, show a simple error state: _"This link is no longer active. Ask [sharer name] to send a new one."_

---

## Quick Reference

| Screen                  | Trigger          | Primary CTA              | Navigates to |
| ----------------------- | ---------------- | ------------------------ | ------------ |
| S01 Landing             | App open / URL   | Upload a Prescription    | S02          |
| S02 Upload Picker       | S01 CTA          | Camera / PDF / Manual    | S03          |
| S03 OCR Loading         | File selected    | Auto                     | S04          |
| S04 Confirm & Review    | OCR complete     | Looks right, continue    | S05          |
| S05 AI Explanation      | Review confirmed | Save to My Records       | S06          |
| S06 Save Prompt         | S05 save tap     | Continue with Phone      | S07          |
| S07 OTP Entry           | S06              | Verify & Continue        | S08          |
| S08 Hub (Empty)         | OTP success      | Add family member        | S09          |
| S09 Add Profile         | S08 chip tap     | Save Profile             | S10          |
| S10 Hub (Populated)     | S09 save         | Upload for [Name]        | S02          |
| S11 Prescription Detail | S10 row tap      | Share / Generate PDF     | S13          |
| S12 Timeline            | Bottom nav       | Row tap                  | S11          |
| S13 Share + PDF         | S11 share        | Copy link / Download PDF | S14          |
| S14 Read-Only View      | Share link open  | Create free account      | S01          |

---

_Stack: Next.js + Supabase + Google Vision API + Claude Haiku (extraction) + Claude Sonnet (explanation)_
_Wireframe reference: nuskha-wireframes.html_
