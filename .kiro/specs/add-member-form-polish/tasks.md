# Implementation Plan

## 1. Fix Relationship Selector UI

- [x] 1.1 Replace native select with custom chip selector
  - Remove the native `<select>` element for relationship selection
  - Implement custom chip-based selector with 5 relationship options
  - Create 2-row grid layout: [Parent] [Spouse] [Child] on top row, [Sibling] [Other] on bottom row
  - Each chip as button with `role="radio"`, group with `role="radiogroup"`
  - Selected chip gets blue background with white text; unselected chips get border with transparent background
  - Add hidden `<input type="hidden" name="relationship">` to carry value for form submission
  - Ensure keyboard navigation and accessibility compliance
  - _Bug_Condition: Native select breaks visual cohesion across devices_
  - _Expected_Behavior: Custom chip selector with consistent styling and accessibility_
  - _Preservation: Form submission and relationship value handling must work exactly as before_
  - _Requirements: 2.1, 3.2_

## 2. Fix Date of Birth Helper Text

- [x] 2.1 Update DOB field helper text
  - Change helper text from "Used for medication reminders (coming soon)" 
  - Update to "Helps with age-appropriate lab test reference ranges."
  - Maintain existing styling and positioning
  - _Bug_Condition: Misleading helper text references unbuilt functionality_
  - _Expected_Behavior: Accurate helper text explaining actual DOB field purpose_
  - _Preservation: DOB field functionality and form submission must remain unchanged_
  - _Requirements: 2.2, 3.3_

## 3. Fix Cancel Button Label

- [x] 3.1 Update cancel button text
  - Change button text from "Skip for now" to "Cancel"
  - Maintain existing styling, size, and navigation behavior
  - Ensure button continues to navigate to `/dashboard` without saving data
  - _Bug_Condition: Wrong button affordance implies mandatory flow_
  - _Expected_Behavior: Appropriate button label matching user intent_
  - _Preservation: Navigation behavior and form cancellation must work exactly as before_
  - _Requirements: 2.3, 3.4_

## 4. Implement Name Normalization

- [x] 4.1 Add mobile keyboard guidance for name input
  - Add `autocapitalize="words"` attribute to Full Name input field
  - Maintain existing input styling and validation
  - _Bug_Condition: No mobile keyboard guidance for proper name casing_
  - _Expected_Behavior: Mobile keyboards suggest title case for name input_
  - _Preservation: Name input validation and form submission must work exactly as before_
  - _Requirements: 2.4, 3.1_

- [x] 4.2 Implement server-side name normalization
  - Create `toTitleCase` utility function in `app/(app)/dashboard/actions.ts`
  - Handle edge cases: preserve hyphens ("Mary-Jane"), apostrophes ("O'Brien"), and existing correct casing
  - Apply normalization to name before passing to `familyService.createProfile`
  - Ensure names like "lavanya sharma" become "Lavanya Sharma"
  - Ensure names like "Ramesh Gupta" remain unchanged
  - _Bug_Condition: Names stored without title-case normalization causing inconsistent display_
  - _Expected_Behavior: All names normalized to title case before storage_
  - _Preservation: Profile creation flow and data handling must work exactly as before_
  - _Requirements: 2.4, 3.1, 3.6_

## 5. Verification and Testing

- [x] 5.1 Verify form functionality
  - Test chip selector works with form submission
  - Verify hidden input carries relationship value correctly
  - Test name normalization with various inputs
  - Confirm all existing form behaviors are preserved
  - Test accessibility with keyboard navigation and screen readers
  - _Requirements: All preservation requirements 3.1-3.6_

- [x] 5.2 Cross-device testing
  - Test chip selector renders consistently across iOS, Android, and desktop
  - Verify mobile keyboard shows word capitalization with `autocapitalize="words"`
  - Confirm visual cohesion with rest of form styling
  - _Requirements: 2.1, 2.4_

## 6. Checkpoint

- [x] 6.1 Final verification
  - Ensure all 4 bugs are resolved
  - Confirm no regressions in existing functionality
  - Verify accessibility compliance
  - Test complete form flow from entry to profile creation