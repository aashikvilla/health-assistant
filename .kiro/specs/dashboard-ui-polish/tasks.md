# Implementation Plan

- [x] 1. Fix dashboard UI polish bugs

  - [x] 1.1 Implement Bug 1 fix - Generic frequency strings in ActiveMedicationsStrip
    - Add `isGenericFrequency` helper function with pattern matching for generic strings
    - Add guard condition to frequency badge render: `{med.duration && !isGenericFrequency(med.duration) && (...badge...)}`
    - Patterns to detect: "as directed", "as advised", "as prescribed", "per doctor", "as directed by", "as per doctor", "as recommended"
    - _Bug_Condition: isBugCondition_1(med) where med.duration is non-empty and isGenericFrequency(med.duration) = true_
    - _Expected_Behavior: Badge omitted entirely for generic frequency strings_
    - _Preservation: Informative frequency strings continue to render badges, empty/null duration continues to render no badge_
    - _Requirements: 2.1, 3.1, 3.2_

  - [x] 1.2 Implement Bug 2 fix - Medication list capped in ActiveMedicationsStrip
    - Add `MAX_DISPLAY = 4` constant
    - Slice medications array before mapping: `const displayedMeds = medications.slice(0, MAX_DISPLAY)`
    - Update divider logic to use `displayedMeds.length`
    - Add conditional "View all N →" link when `medications.length > MAX_DISPLAY`
    - Keep total count in header badge unchanged (uses full `medications` prop)
    - _Bug_Condition: isBugCondition_2(medications) where medications.length > 4_
    - _Expected_Behavior: Display exactly 4 rows + "View all N →" link_
    - _Preservation: 4 or fewer medications continue to show all items with no "View all" link_
    - _Requirements: 2.2, 2.3, 3.3_

  - [x] 1.3 Implement Bug 3 fix - Duplicate medications flagged in ReviewScreen
    - Add `removeMedication(index)` handler to remove medication at index
    - Compute `duplicateNames` set from medication names (case-insensitive, trimmed)
    - Add duplicate detection logic in medication card mapping
    - Render warning banner above duplicate medication cards (later occurrences only)
    - Include "Remove duplicate" action in banner that calls `removeMedication`
    - _Bug_Condition: isBugCondition_3(medications, index) where name appears earlier in list_
    - _Expected_Behavior: Warning banner above later duplicate occurrences with remove action_
    - _Preservation: Unique medications continue to render without warning banners, edit/confirm flow unchanged_
    - _Requirements: 2.4, 2.5, 3.4, 3.7, 3.8_

  - [x] 1.4 Implement Bug 4 fix - Prescriptions section capped in dashboard
    - Add `DASHBOARD_RX_LIMIT = 3` constant
    - Slice prescriptions array: `const displayedPrescriptions = prescriptions.slice(0, DASHBOARD_RX_LIMIT)`
    - Update "View all" link condition from `{!isEmpty && (...)}` to `{prescriptions.length > DASHBOARD_RX_LIMIT && (...)}`
    - Map over `displayedPrescriptions` instead of full `prescriptions` array
    - _Bug_Condition: isBugCondition_4(prescriptions) where prescriptions.length > 3_
    - _Expected_Behavior: Display exactly 3 records + "View all →" link_
    - _Preservation: 3 or fewer prescriptions continue to show all records with no "View all" link, empty state unchanged_
    - _Requirements: 2.6, 2.7, 3.5, 3.6_

- [x] 2. Verify fixes work correctly
  - Test the dashboard with various medication counts and frequency strings
  - Test the ReviewScreen with duplicate medications
  - Ensure all UI changes work as expected