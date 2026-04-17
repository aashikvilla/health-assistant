# HealthDecoded  Lab Report Analysis Framework
# Complete Technical & Product Specification for Development
# Version 1.0

---

## PART 1: SYSTEM OVERVIEW

### What the system does

When a user uploads a lab report (PDF or photo), the system:
1. Extracts raw text and table data using OCR / document parsing
2. Passes the structured text to Claude with a carefully designed system prompt
3. Claude returns a structured JSON object containing interpreted markers, status flags, plain-English explanations, tips, and a health score
4. The JSON is saved to the database and rendered as the analysis UI
5. All family members with access can view the decoded report

---

## PART 2: EXTRACTION PIPELINE

### Step 1  File ingestion

Accepted input types:
- PDF (text-based or scanned)
- JPG / PNG (photo of paper report)
- Multi-page PDFs (up to 50 pages)

**PDF text extraction:**
Use `pdf-parse` (Node.js) or `PyMuPDF` (Python) to extract raw text from text-layer PDFs. This is fast and accurate  no OCR needed.

```
Raw PDF → pdf-parse → Plain text string → Send to Claude
```

**Scanned PDF or photo:**
Use Claude's vision API (passing image as base64). Claude reads the image directly  no separate OCR step needed. This handles:
- Blurry or slightly rotated photos
- Printed lab report tables
- Handwritten doctor annotations (basic)

```
Image file → Base64 encode → Claude Vision API → Structured JSON
```

**Multi-page handling:**
Extract all pages into a single concatenated text string. Include page break markers so Claude knows where pages end. Cap at ~40,000 tokens (~30 pages). If longer, split into logical sections (e.g., blood panel + hormones separately).

### Step 2  Pre-processing (before sending to Claude)

Before sending to the AI, do a quick clean-up pass:

1. Remove repeated header/footer text (lab name, patient info repeating on every page)
2. Normalize whitespace  multiple spaces → single space, remove form feed characters
3. Detect report type heuristically:
   - Contains "mg/dL", "g/dL", "IU/L", "ng/mL" → likely lab report
   - Contains "Tablet", "Capsule", "twice daily", "mg" doses → likely prescription
   - Contains "Impression", "Finding" → likely radiology/scan report
4. Tag the detected type and pass it to Claude as context

### Step 3  Claude API call

**Model:** claude-sonnet-4-20250514 (best balance of speed, cost, accuracy)
**Max tokens output:** 4000 (enough for a full 20-marker panel with explanations)
**Temperature:** 0 (deterministic  critical for medical accuracy)
**Mode:** JSON mode (system prompt instructs Claude to return only valid JSON)

**What to send:**
```
system_prompt: [Full medical analysis prompt  see Part 3]
user_message: "Analyse this lab report:\n\n{extracted_text}"
```

For image uploads:
```
user_message: [
  { type: "image", source: { type: "base64", data: "{base64_string}" } },
  { type: "text", text: "Analyse this lab report and return the JSON analysis." }
]
```

### Step 4  Response handling

Claude returns a JSON object. Parse it, validate the schema (check all required fields exist), and save to `reports.analysis` (JSONB column in PostgreSQL).

If parsing fails (malformed JSON), retry once with: "Your last response was not valid JSON. Return only the JSON object, no other text."

If it fails again, set `analysis_status = "failed"` and notify the user that analysis couldn't be completed.

### Step 5  Storage

Save to database:
- `reports.file_url` → Supabase storage path to original file
- `reports.analysis` → Full JSON object from Claude
- `reports.analysis_status` → "complete" | "processing" | "failed"
- `reports.type` → "lab_report" | "prescription" | "scan" | "other"
- `reports.processed_at` → Timestamp

Trigger a push notification to all family members: "Preeti's report is ready  2 markers need attention."

---

## PART 3: THE CLAUDE SYSTEM PROMPT

This is the most critical part of the system. The quality of the prompt determines the quality of every analysis.

```
SYSTEM PROMPT (send as system message):

You are a medical report interpreter for HealthDecoded, a family health platform. Your job is to read uploaded lab reports and prescriptions and return a structured JSON analysis that explains the findings in plain, reassuring language that a non-medical person can fully understand.

CRITICAL RULES:
1. Return ONLY valid JSON. No preamble, no explanation, no markdown code blocks. Just the raw JSON object.
2. Never diagnose. Never say "you have X condition." Say "this marker suggests..." or "this may indicate..."
3. Always be reassuring in tone. Most markers will be normal  celebrate that.
4. Plain English only. No medical jargon without immediate explanation.
5. Be specific with tips  give real, actionable Indian-context advice (e.g., specific Indian foods, sunlight patterns in India).
6. If a value is within range but close to the boundary, note it as "watch" status.
7. For markers you cannot interpret (due to missing reference range or unusual units), set status as "unclassified" with a note.
8. Health score: Calculate 0–100 based on: (number of normal markers / total markers) × 100, then subtract 5 for each "monitor" marker and 15 for each "action_needed" marker. Floor at 0.

OUTPUT JSON SCHEMA (follow exactly):

{
  "report_meta": {
    "patient_name": "string (anonymise if needed)",
    "age": "number or null",
    "sex": "string or null",
    "lab_name": "string or null",
    "test_date": "YYYY-MM-DD or null",
    "report_type": "lab_report | prescription | scan | other",
    "total_markers": "number",
    "processing_notes": "string  any caveats about the extraction"
  },
  "health_score": {
    "score": "number 0–100",
    "grade": "A | B | C | D | F",
    "headline": "short encouraging sentence about overall health",
    "summary": "2–3 sentence plain-English summary of the whole report"
  },
  "markers": [
    {
      "id": "unique_slug e.g. vitamin_d_total",
      "name": "display name e.g. Vitamin D",
      "nickname": "plain-English nickname e.g. The Sunshine Vitamin",
      "category": "vitamins | blood | metabolic | liver | kidney | lipids | hormones | thyroid | electrolytes | urine | other",
      "value": "number or string",
      "unit": "string e.g. ng/mL",
      "reference_min": "number or null",
      "reference_max": "number or null",
      "reference_label": "string e.g. Optimal: 30–70 ng/mL",
      "status": "normal | monitor | action_needed | unclassified",
      "status_label": "string e.g. Severely Deficient | Normal | Monitor",
      "percent_from_optimal": "number (negative = below, positive = above) or null",
      "range_position": "number 0–100 representing where value falls on the full range bar",
      "explanation": "2–3 sentence plain-English explanation of what this marker does and what the result means for this person specifically",
      "body_impact": "one sentence on how this affects daily life",
      "tips": [
        {
          "type": "diet | exercise | supplement | lifestyle | doctor",
          "icon_hint": "sun | fish | pill | walk | leaf | hospital",
          "text": "specific, actionable tip"
        }
      ],
      "requires_doctor": "boolean  true if this marker alone warrants a doctor visit"
    }
  ],
  "sections": {
    "action_needed": ["marker_id_1", "marker_id_2"],
    "monitor": ["marker_id_3"],
    "normal": ["marker_id_4", "...all others"]
  },
  "flagged_summary": [
    {
      "marker_id": "string",
      "marker_name": "string",
      "one_liner": "one sentence max  the key thing to know about this marker"
    }
  ],
  "lifestyle_plan": {
    "diet": ["string  specific food recommendations relevant to flagged markers"],
    "exercise": ["string  specific exercise recommendations"],
    "supplements": ["string  supplement recommendations with dosage context"],
    "follow_up": "string  when to retest and what to watch"
  },
  "prescription_items": [
    {
      "medicine_name": "string",
      "generic_name": "string or null",
      "category": "antibiotic | supplement | painkiller | hormone | other",
      "dose": "string e.g. 1 tablet",
      "frequency": "string e.g. twice daily",
      "duration": "string e.g. 10 days",
      "purpose": "plain-English sentence on what this medicine is doing",
      "take_with": "string e.g. after food with water",
      "warnings": ["string"],
      "course_must_complete": "boolean"
    }
  ]
}

Note: If report_type is "lab_report", populate "markers" and leave "prescription_items" as [].
If report_type is "prescription", populate "prescription_items" and leave "markers" as [].
If report_type is "scan", put findings in health_score.summary and markers as [].
```

---

## PART 4: STATUS CLASSIFICATION LOGIC

How to classify each marker (Claude uses this logic, but also hardcode it as a validation layer in your app):

```
CLASSIFICATION RULES:

1. NORMAL  value is within reference range AND more than 10% away from boundaries
2. MONITOR  value is within reference range BUT within 10% of the upper or lower boundary
             OR value is slightly outside range (within 15% of boundary)
3. ACTION_NEEDED  value is outside reference range by more than 15%
                   OR lab has explicitly flagged it (often bold or marked H/L in reports)
4. UNCLASSIFIED  no reference range provided, or unusual units, or narrative result
```

**Special cases to handle:**
- "Negative" / "Positive" results (urine tests, blood group, smear): Set value = "Negative" or "Positive", status = "normal" if Negative, "action_needed" if Positive unexpectedly
- Blood Group  status = "normal" (informational only), explanation = their blood type
- Peripheral blood smear impressions  parse the impression text, set status based on whether impression is "Normal" or contains abnormal findings
- ESR, PAP Smear, X-Ray, Ultrasound  these have narrative impressions, not numeric values. Extract the impression sentence as the value.

**Range position calculation (for the range bar UI):**
```
range_position = ((value - absolute_min) / (absolute_max - absolute_min)) × 100

Where absolute_min = reference_min × 0.3 (extend below minimum for visual context)
      absolute_max = reference_max × 1.7 (extend above maximum for visual context)

Cap result between 0 and 100.
```

---

## PART 5: PRESENTATION FRAMEWORK (UI RENDERING LOGIC)

### How to render the JSON into the UI

The app reads `reports.analysis` JSON and renders it into components. Here is the complete rendering logic per section:

**1. Report header block**
```
Display:
- report_meta.patient_name (DM Serif italic)
- report_meta.age + sex + blood_group (if found in markers)
- report_meta.lab_name + report_meta.test_date (DM Mono small)
```

**2. Health score card**
```
Display health_score.score as a large number (DM Serif Display italic, colored by score):
  90–100 → #2A9D6F (teal)
  70–89  → #E07B2A (amber)
  50–69  → #E07B2A (amber, darker)
  0–49   → #C9352A (red)

Display health_score.grade as a letter grade (large, same color)
Display health_score.headline as a short sentence
Display 3 stat chips: count of each status bucket
```

**3. Status bucketing  render order**
```
Always render in this order:
  1. action_needed markers (most urgent  shown first)
  2. monitor markers
  3. normal markers (collapsed by default)
```

**4. Individual marker card rendering**
```
For each marker in action_needed and monitor:

HEADER ROW:
  Left:  icon (mapped from category  see icon map below)
         marker.name (DM Sans 500 16px)
         marker.nickname (italic, small, gray)
  Right: status pill (color from status)

RANGE BAR:
  Full-width track
  3 colored zones: red zone left | amber middle | green optimal
  Zone boundaries set by: reference_min and reference_max
  Dot position: marker.range_position (0–100%)
  Dot color: red if action_needed, amber if monitor, teal if normal
  Labels below: DM Mono 10px  show reference_label

VALUE ROW:
  Left:  marker.value + marker.unit (DM Mono 500 large, colored by status)
  Right: marker.percent_from_optimal + "% from optimal" (colored by status)

PLAIN ENGLISH BOX:
  Cream background #F7F4EF
  3px left border colored by status
  marker.explanation text (DM Sans 400 13px)
  marker.body_impact (DM Sans italic 12px gray)

TIPS (collapsible on mobile, always visible on desktop):
  For each tip in marker.tips:
    Icon (mapped from tip.icon_hint)
    tip.text (DM Sans 13px)
  
  If marker.requires_doctor === true:
    Show doctor banner: navy bg, "Discuss with your doctor at next visit" 
```

**5. Category icon map**
```javascript
const categoryIcons = {
  vitamins: "sun",          // Vitamin D, B12
  blood: "droplet",         // Haemoglobin, RBC, WBC
  metabolic: "activity",    // Glucose, HbA1c, Insulin
  liver: "filter",          // ALT, AST, Bilirubin
  kidney: "kidney",         // Creatinine, Urea, Uric Acid
  lipids: "heart",          // LDL, HDL, Cholesterol
  hormones: "zap",          // Testosterone, FSH, LH
  thyroid: "thermometer",   // TSH, T3, T4
  electrolytes: "battery",  // Sodium, Potassium, Chloride
  urine: "droplets",        // Urine routine
  other: "clipboard"        // Everything else
};
```

**6. All-clear section rendering**
```
Collapsed by default.
Header row: green dot + "X markers all within normal range" + expand chevron

When expanded: 2-column chip grid
Each chip: marker.name + " " + marker.value + " " + marker.unit
Chip style: teal-tinted bg (#EDFAF2), teal text, DM Mono 11px
```

**7. Lifestyle plan section**
```
Only show if there are any action_needed or monitor markers.
lifestyle_plan.diet → list of food tip chips
lifestyle_plan.exercise → list of exercise tip chips
lifestyle_plan.supplements → list of supplement tips
lifestyle_plan.follow_up → "Retest in X months" callout card
```

**8. Prescription rendering (if report_type === "prescription")**
```
For each item in prescription_items:

CARD:
  medicine_name (DM Serif 18px)
  generic_name (DM Sans 400 12px gray)
  Category badge (e.g. "Antibiotic" | "Supplement")

  "What it's doing" section: item.purpose

  Schedule row: item.dose + item.frequency + item.duration
  Displayed as morning/evening/night slots based on frequency parsing:
    "twice daily" → show morning slot + evening slot
    "once daily" → show morning slot only
    "weekly" → show day of week slot

  "Take with" row: item.take_with

  Warnings: each warning as a row with warning icon
  
  If item.course_must_complete === true:
    Show banner: "Finish the full course even if you feel better"
```

---

## PART 6: VALIDATION LAYER (app-side checks)

After getting Claude's JSON, run these checks before saving:

```javascript
function validateAnalysis(json) {
  const errors = [];
  
  // Required fields
  if (!json.report_meta) errors.push("Missing report_meta");
  if (!json.health_score) errors.push("Missing health_score");
  if (!Array.isArray(json.markers)) errors.push("Markers must be array");
  
  // Score must be 0-100
  if (json.health_score?.score < 0 || json.health_score?.score > 100)
    errors.push("Health score out of range");
  
  // Each marker must have required fields
  json.markers?.forEach((m, i) => {
    if (!m.id) errors.push(`Marker ${i} missing id`);
    if (!m.name) errors.push(`Marker ${i} missing name`);
    if (!["normal","monitor","action_needed","unclassified"].includes(m.status))
      errors.push(`Marker ${i} has invalid status: ${m.status}`);
    if (m.range_position < 0 || m.range_position > 100)
      errors.push(`Marker ${i} range_position out of bounds`);
  });
  
  // Sections must reference existing marker IDs
  const allIds = json.markers?.map(m => m.id) || [];
  [...(json.sections?.action_needed || []),
   ...(json.sections?.monitor || []),
   ...(json.sections?.normal || [])].forEach(id => {
    if (!allIds.includes(id)) errors.push(`Section references unknown marker id: ${id}`);
  });
  
  return { valid: errors.length === 0, errors };
}
```

---

## PART 7: EDGE CASES & ERROR HANDLING

| Scenario | What to do |
|---|---|
| Blurry/unreadable image | Claude returns processing_notes explaining what it could/couldn't read. Show partial analysis with a banner: "Some markers may be missing due to image quality." |
| Report in Hindi/regional language | Claude handles mixed Hindi/English. Add "Please translate any non-English text before analysing" to the prompt. |
| Duplicate upload | Hash the file on client before upload. If hash exists in DB for this family, show "This report may already be uploaded. View existing?" |
| Reference range missing | Claude sets status = "unclassified" for that marker. Render as gray, with explanation "We couldn't find a reference range for this marker." |
| Markers outside plausible range (data entry error in PDF) | Add a sanity check: if value > 10× reference_max or < reference_min/10, flag as potentially erroneous. Show "This value seems unusually extreme  please verify with the original report." |
| Very large report (50+ pages) | Split into batches of 15 pages each. Process in parallel. Merge results. Show progress bar. |
| Network failure mid-analysis | Save `analysis_status = "processing"` with a timestamp. A background job checks for processing records older than 5 minutes and retries. |
| Prescription with unfamiliar drug name | Claude still describes what category it likely belongs to based on name. Mark with requires_doctor = true. |

---

## PART 8: SAMPLE REFERENCE ANALYSIS OUTPUT JSON

This is what a complete Claude analysis response looks like for a comprehensive blood panel.
See attached reference file: `sample_analysis_output.json`

---

## PART 9: DEVELOPMENT CHECKLIST

### Backend (Next.js API routes)

- [ ] `POST /api/upload`  receives file, stores in Supabase Storage, creates report record with status "processing", triggers /api/analyse asynchronously
- [ ] `POST /api/analyse`  fetches file from storage, extracts text (pdf-parse or passes image directly), calls Claude API, validates JSON, saves to reports.analysis, updates status, sends push notification
- [ ] `GET /api/reports`  returns all reports for current user's family_id (RLS handles filtering)
- [ ] `GET /api/reports/[id]`  returns single report including full analysis JSON
- [ ] `DELETE /api/reports/[id]`  admin only, deletes report + file from storage

### Frontend (React components)

- [ ] `<UploadSheet>`  bottom sheet, file picker, member selector, type selector, handles upload + shows processing state
- [ ] `<ReportCard>`  compact card for lists  name, date, status summary chips
- [ ] `<ReportDetail>`  full analysis view  health score, marker cards, lifestyle plan
- [ ] `<MarkerCard>`  individual marker with range bar, explanation, tips
- [ ] `<RangeBar>`  SVG or CSS range visualization with zone colors and dot pointer
- [ ] `<StatusPill>`  colored pill component for normal/monitor/action_needed
- [ ] `<PrescriptionCard>`  medicine info, schedule, warnings, course progress

### PWA setup

- [ ] `manifest.json`  app name, icons (192px, 512px), theme color #1B3A4B, display standalone
- [ ] `service-worker.js`  cache app shell, cache last 3 reports for offline reading
- [ ] VAPID keys  for Web Push notifications (generate with `web-push` npm package)
- [ ] `<meta name="theme-color">`  #F7F4EF (warm cream, matches app background)

---

## APPENDIX: KEY TECHNICAL DECISIONS

**Why JSON mode / structured output?**
Unstructured Claude responses are unpredictable for rendering. Structured JSON means the app can reliably render the same UI regardless of the report content. It also makes it easy to validate, store, and query.

**Why temperature = 0?**
Medical information must be consistent. Temperature 0 makes Claude deterministic  the same report run twice returns the same analysis. This is critical for trust.

**Why Claude Sonnet over Haiku?**
Haiku is cheaper but misses nuance in borderline markers and sometimes produces less accurate plain-English explanations. Sonnet is worth the cost for healthcare (roughly ₹3–6 per analysis).

**Why Supabase JSONB for analysis storage?**
JSONB lets you query inside the analysis later  e.g., "find all family reports where any marker has status = action_needed" using PostgreSQL's JSON operators. This enables future features like family health dashboards and trend analysis across reports.

**Why not run OCR separately?**
Claude's vision API handles OCR natively and produces better results on lab report tables than standalone OCR tools because it understands the semantic structure of what it's reading  not just the characters.
