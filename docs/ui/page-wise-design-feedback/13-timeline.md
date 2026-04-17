# 13  Timeline (`/timeline`)  UI/UX & CRO Critique

**Screenshot:** `13-timeline-all-records.png`
**Route:** `/timeline`
**Goal:** Show a chronological medical history for the family. Enable filtering by person and document type. Surface the right record quickly.
**Stakes:** This is the "health history" view  the feature that creates long-term retention. If users can't find their records here, they lose trust in the product as a persistent health record.

---

## 1. Page Title and Count  Good Start

**Current:** "Timeline" as h1 heading. "1 record across your family" as subtitle.

**What works:** The count ("1 record") immediately orients the user. Clear, factual.

**What could be better:** "1 record across your family"  with only 1 record, this subtitle is slightly redundant. As records grow, this becomes more useful: "23 records across your family" with a link to add records. But the subtitle could also be the user's invitation: "1 record · Add more →"  making it both informational and actionable.

---

## 2. Filter System  Two Unrelated Rows Look Like One

**Current:**
- Row 1: "All" (blue/active) · "aashikvilla99" · "LAvanya" (person filter)
- Row 2: "All types" (blue/active) · "Prescriptions" · "Lab Reports" (type filter)

**Law of Proximity violation:** Both rows use identical chip styling (same border-radius, same font, same blue for active state). Visually they merge into one undifferentiated block of 6 chips. Users have to read each chip's label to understand the two-row structure.

**The differentiation problem:** Row 1 filters by person. Row 2 filters by type. These are orthogonal dimensions  they should feel like different controls. Currently they look identical.

**Fix options:**

Option A  Labels: Add a small prefix to each row:
```
Who:   [All] [aashikvilla99] [LAvanya]
Type:  [All types] [Prescriptions] [Lab Reports]
```
The "Who:" and "Type:" labels in 11px muted text before each row immediately disambiguate the two filter dimensions.

Option B  Visual differentiation: Row 1 chips with round corners (pill shape); Row 2 chips with slight corner radius (more square). Different visual vocabulary for different filter types.

Option C  Collapse to a single filter bar with a "More filters ▾" dropdown for the second dimension.

**Interaction gap:** Are the two filter rows independent? Can I filter by "LAvanya" AND "Prescriptions" simultaneously? If yes, the combined filter state is not visually communicated  the user sees two independent active states (blue chips on both rows) but can't tell if they're ANDed or ORed.

---

## 3. "LAvanya"  Casing Bug Surfaces Again

**Current:** The person filter chip shows "LAvanya" (capital A mid-word).

Third screen where this bug appears (after dashboard empty state and dashboard with records). This is a consistent data-layer problem. The filter chips render the name directly from `family_profiles.full_name` without normalisation.

Confirmed fix required: normalise name display at the component level as a fallback, regardless of database storage value. A simple `toTitleCase()` utility applied at the display boundary would have prevented this across all three screens.

---

## 4. Date Grouping  Correct Pattern, Wrong Data

**Current:** "NOVEMBER 2010" as a month-year group header, above the single record.

**What works:** Month-year grouping is the standard chronological timeline pattern. ✓

**What's wrong:** "November 2010"  this prescription is from 14 years ago. Either:
1. This is test data (the sample prescription used for development is dated 2010)
2. A real user uploaded a 14-year-old prescription

If this is test data, it creates a UX issue: a timeline for a user with 1 record from 2010 and the most recent record date visible to the user is "NOVEMBER 2010"  this looks odd for an app used in 2026. The year should be visually prominent when dates span large ranges: "NOVEMBER 2010 (14 years ago)" might be informative.

**For production use:** When records span multiple years, the year grouping should be primary, month secondary:
```
2024
  December
    [record card]
  November
    [record card]
2023
  March
    [record card]
```
Year as a large, visually prominent marker; month as a sub-grouping. A flat "NOVEMBER 2010" with no year context is confusing when years aren't visible.

---

## 5. Record Card  Insufficient Information Density

**Current card shows:** Document icon · "Prescription" badge (teal) · "aashikvilla99" · "M. M. Joynal Abedin" · "11 Nov 2010" · "R knee pain and difficulty in going up by stairs" tag · ">" chevron

**What's missing:**

1. **Medication count:** The most scannable differentiator for prescriptions. "7 medications" on the card tells the user the prescription's significance at a glance. Currently absent from the timeline card (but present on the dashboard document row).

2. **For lab reports:** There's no sample in the screenshot, but lab report cards should show "2 of 18 values outside range" or "All values normal"  the clinical significance signal.

3. **Profile context:** "aashikvilla99" is shown as the profile owner. Again, this is the username, not the display name. "For Aashik" or the user's actual name should appear here.

4. **Visual distinction between prescriptions and lab reports:** The teal "Prescription" badge works. Lab reports need a visually distinct badge  different colour (orange? purple?) so the two types are identifiable at a glance without reading the badge text.

**The card's missing hierarchy:** Everything on the card has equal visual weight. The doctor name ("M. M. Joynal Abedin") should be the primary text element (largest, darkest), the date secondary, the profile name tertiary. Currently they're all 14px with similar grey weights.

---

## 6. The Empty 70% of Screen  Wasted Space

**Current:** One record card, then ~70% of blank white space.

**The opportunity cost:** New users who open the Timeline page and see one record in a vast empty space receive the signal: "this feature has no value yet." The empty space communicates "emptiness" rather than "potential."

**Better options:**

1. **"Add your next record" prompt:** Below the existing records, a dashed-border CTA card: "Add another record to build your health history → [Upload]." This converts dead space into activation.

2. **"What goes here" education:** For users with few records, a gentle illustration of what a rich timeline looks like (multiple records across different months, trending lab values, multiple family members) sets an aspirational picture.

3. **FRD F5 Lab Trending:** The FRD describes trend visualization for repeated tests. Even a one-line teaser in the empty state: "Upload a second CBC to start tracking your blood values over time" seeds the behaviour that makes the feature valuable.

---

## 7. Sort Control  Missing

**Current:** No sort controls. Timeline is always newest-first by document date.

**For most users, newest-first is correct.** But power users (caregivers managing elderly parents' health, people with chronic conditions and many records) will want:
- Oldest-first (chronological history)
- Sort by doctor name
- Sort by document type

A "Sort ↕" button in the timeline header (top-right, next to the page title or in the filter bar) takes 2 hours to implement and serves the 20% of users who generate 80% of the product's value.

---

## 8. Search  Critically Missing

**Current:** No search functionality.

**For a product meant to be a "lifetime health timeline":** A user who uploads 50 records over 2 years cannot find a specific record without scrolling through months of history. The FRD doesn't mention search, but it's essential for the product's stated goal of being a persistent health assistant.

**Minimum viable search:** A search bar at the top of the timeline that filters records by:
- Doctor name (most common query: "find my prescription from Dr. Mehta")
- Diagnosis tag
- Medication name

This is a client-side filter on the already-loaded records  no new API endpoint needed for the first implementation.

---

## 9. Visual Design

**Current:** White background, teal chip badges, grey text throughout. Clean but low energy.

**The timeline is the product's most "powerful" feature**  it's the health history view that no other tool provides in this form. The visual design should communicate significance: this is your family's health story.

**Improvement suggestions:**

1. **Month/year header:** Make "NOVEMBER 2010" a more prominent section divider  a full-width light-grey bar with the month/year in 16px medium weight, not 10px uppercase grey. Make years even more prominent if the timeline spans multiple years.

2. **Record card:** Add a subtle coloured left border to cards  teal for prescriptions, orange for lab reports. This adds the type differentiation at the list level without requiring the badge to carry all the weight.

3. **Chevron (›):** The right-side chevron is the tap affordance for the entire card. The card should be entirely tappable, not just the chevron. The entire card's background should shift subtly on hover/press (activeOpacity change on mobile, background-color change on desktop hover).

---

## 10. Accessibility

**Filter chips:** The filter chip buttons need `role="tab"` or `role="radio"` within `role="tablist"` or `role="radiogroup"`. Screen readers need to understand these are filter/selection controls, not navigation links.

**Active state announcement:** When a filter chip is selected, `aria-selected="true"` should be set and the change should be announced via `aria-live`. "Filtered to show: Prescriptions only" as a live announcement.

**Timeline structure:** Each month group should be a `<section>` with a heading (`<h2>` for the month). Record cards within should be `<article>` elements. This semantic structure allows screen readers to navigate by heading between time periods.

**Chevron as only tap affordance:** If the chevron is the only visual tap indicator, but the whole card is tappable, ensure the card `<a>` or `<button>` wraps the entire card, not just the chevron.

---

## 11. Mobile Issues

**Filter chips on 375px screen:**
Row 1: "All" + "aashikvilla99" (long) + "LAvanya"  these three chips on 375px will either wrap or require horizontal scroll. "aashikvilla99" is 12 characters  the chip will be ~130px wide. "All" + "aashikvilla99" + "LAvanya" = ~280px + 16px gaps = too wide to fit without scrolling.

Fix: Person filter chips should use first name only or truncate to 10 chars. "All · Aashik · Lavanya" fits on 375px.

Row 2: "All types" + "Prescriptions" + "Lab Reports"  "Prescriptions" is 13 chars, ~140px wide. Same overflow risk. Consider abbreviated versions on mobile: "All · Rx · Labs."

**Record card touch area:** The entire card must be a single tappable area. Test that tapping on the diagnosis tag, the badge, the doctor name, and the date all navigate to the record  not just tapping the card's main text area.

---

## 12. CRO

**Timeline is a retention feature, not an acquisition feature.** Users who reach the timeline are already activated (they've uploaded at least 1 record). The goal of the timeline page is to increase depth of engagement:
- More uploads (prompt: "Add another record")
- More profiles (prompt: "View Aashik's records too")
- Habitual return (prompt: "Subscribe to weekly health summary")

None of these prompts exist currently. The timeline is a passive viewer with no active engagement hooks.

**The "health summary" email:** A weekly/monthly digest email: "This week in your family's health: LAVanya's blood test results from 2010 are on file. Time to upload a recent check-up?" drives re-engagement from outside the app. This is a standard CRM/retention tactic that health apps use effectively.
