# Bugfix Requirements Document

## Introduction

The dashboard screen (`/dashboard`) has four distinct UI polish bugs that degrade the quality of information shown to users. Two bugs affect `ActiveMedicationsStrip` (generic frequency strings and an uncapped list), one affects `ReviewScreen` (duplicate medications are not flagged before saving), and one affects the prescriptions section in `dashboard/page.tsx` (all records are rendered with no limit). Together these make the dashboard feel noisy and allow bad data to reach the database.

---

## Bug Analysis

### Current Behavior (Defect)

**Bug 1  Generic frequency strings in ActiveMedicationsStrip**

1.1 WHEN a medication's `frequency` field in the database contains a generic instruction string (e.g. "as directed by your doctor", "as advised", "as prescribed") THEN the system displays that string verbatim as the duration/frequency badge on every matching medication row in `ActiveMedicationsStrip`, adding no useful information and cluttering the UI.

**Bug 2  Medication list not capped in ActiveMedicationsStrip**

1.2 WHEN a profile has more than 4 active medications THEN the system renders all of them in `ActiveMedicationsStrip` with no truncation, causing the strip to grow arbitrarily long and defeating its purpose as a quick-glance summary.

**Bug 3  Duplicate medications shown without warning in ReviewScreen**

1.3 WHEN OCR extracts the same medication name more than once from a prescription THEN the system displays all duplicate entries in `ReviewScreen` without any warning, allowing the user to confirm and save duplicate medication records to the database.

**Bug 4  Prescriptions section renders all records with no limit**

1.4 WHEN a profile has more than 3 prescription records THEN the system renders every record in the prescriptions section of `dashboard/page.tsx` with no cap, making the dashboard page excessively long.

---

### Expected Behavior (Correct)

**Bug 1  Generic frequency strings filtered out**

2.1 WHEN a medication's `frequency` value matches a generic instruction pattern (case-insensitive match against strings such as "as directed by your doctor", "as advised", "as prescribed", and similar variants) THEN the system SHALL omit the duration/frequency badge entirely for that medication row in `ActiveMedicationsStrip`, showing nothing in its place.

**Bug 2  Medication list capped at 4**

2.2 WHEN a profile has more than 4 active medications THEN the system SHALL display only the first 4 items in `ActiveMedicationsStrip` and SHALL render a "View all N →" link below the list (where N is the total active medication count), allowing the user to navigate to the full list.

2.3 WHEN a profile has 4 or fewer active medications THEN the system SHALL display all items in `ActiveMedicationsStrip` with no "View all" link.

**Bug 3  Duplicate medications flagged in ReviewScreen**

2.4 WHEN two or more medications in the OCR-extracted list share the same name (compared case-insensitively, ignoring leading/trailing whitespace) THEN the system SHALL display an inline warning banner immediately above the duplicate medication card(s) in `ReviewScreen` identifying the duplicated name and asking the user whether it was prescribed twice, with a "Remove duplicate" action that removes the later occurrence.

2.5 WHEN the user clicks "Remove duplicate" in the warning banner THEN the system SHALL remove the duplicate medication entry from the list and dismiss the banner for that medication name.

**Bug 4  Prescriptions section capped at 3**

2.6 WHEN a profile has more than 3 prescription records THEN the system SHALL display only the 3 most recent records in the prescriptions section of the dashboard and SHALL render a "View all →" link that navigates to the full records list.

2.7 WHEN a profile has 3 or fewer prescription records THEN the system SHALL display all records with no "View all →" link in the prescriptions section.

---

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a medication's `frequency` value is a specific, informative string (e.g. "twice daily", "1-0-1", "after meals") THEN the system SHALL CONTINUE TO display it as the duration/frequency badge in `ActiveMedicationsStrip`.

3.2 WHEN a medication has no `frequency` / `duration` value THEN the system SHALL CONTINUE TO render the medication row without a badge, as it does today.

3.3 WHEN a profile has exactly 4 active medications THEN the system SHALL CONTINUE TO display all 4 in `ActiveMedicationsStrip` without a "View all" link.

3.4 WHEN all medications in the OCR-extracted list have unique names THEN the system SHALL CONTINUE TO display them in `ReviewScreen` without any duplicate warning banners.

3.5 WHEN a profile has exactly 3 prescription records THEN the system SHALL CONTINUE TO display all 3 in the dashboard prescriptions section without a "View all →" link.

3.6 WHEN the prescriptions list is empty THEN the system SHALL CONTINUE TO show the empty state (`EmptyPrescriptions` component) as it does today.

3.7 WHEN the user edits a medication field in `ReviewScreen` THEN the system SHALL CONTINUE TO update that field in local state and reflect the change immediately in the UI.

3.8 WHEN the user clicks "Yes, This Looks Right →" in `ReviewScreen` THEN the system SHALL CONTINUE TO call `onConfirm` with the current prescription data (including any duplicate-removal edits made by the user).
