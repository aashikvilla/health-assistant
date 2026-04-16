# Add Member Form Polish Bugfix Design

## Overview

This design addresses four UI and data-quality bugs in the Add Family Member form that degrade user experience and introduce inconsistent data. The bugs involve: (1) a native OS `<select>` element that breaks visual cohesion across devices, (2) misleading helper text for the Date of Birth field, (3) incorrect button labeling that implies a mandatory flow, and (4) lack of name normalization causing mixed-case names throughout the app. The fix approach involves replacing the native select with custom chip selectors, updating helper text to reflect actual functionality, changing button labels to match user intent, and implementing title-case normalization with mobile keyboard guidance.

## Glossary

- **Bug_Condition (C)**: The conditions that trigger each of the four identified bugs in the Add Member Form
- **Property (P)**: The desired behavior when the bug conditions are met - custom UI components, accurate helper text, appropriate button labels, and normalized name storage
- **Preservation**: Existing form functionality, data handling, and navigation that must remain unchanged by the fixes
- **AddMemberForm**: The React component in `components/features/family/AddMemberForm.tsx` that renders the family member creation form
- **createProfile**: The server action in `app/(app)/dashboard/actions.ts` that processes form submissions and creates family profiles
- **RELATIONSHIPS**: The array of valid relationship types used in the form selector
- **RELATIONSHIP_LABELS**: The mapping from relationship keys to display labels used throughout the app

## Bug Details

### Bug Condition

The bugs manifest in four distinct scenarios within the Add Family Member form. Each represents a different aspect of the user experience that degrades usability or data quality.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type FormInteractionEvent
  OUTPUT: boolean
  
  RETURN (
    // Bug 1: Native select breaks visual cohesion
    (input.elementType == 'select' AND input.fieldName == 'relationship') OR
    
    // Bug 2: Misleading helper text
    (input.elementType == 'helper-text' AND input.fieldName == 'dob' AND 
     input.textContent.includes('coming soon')) OR
    
    // Bug 3: Wrong button affordance
    (input.elementType == 'button' AND input.textContent == 'Skip for now') OR
    
    // Bug 4: Name not normalized
    (input.elementType == 'form-submit' AND input.nameValue != titleCase(input.nameValue))
  )
END FUNCTION
```

### Examples

- **Bug 1**: User opens form on iOS → sees drum-roll picker instead of cohesive chip selector
- **Bug 2**: User reads DOB helper text → sees "coming soon" instead of actual purpose (lab reference ranges)
- **Bug 3**: User wants to leave form → sees "Skip for now" implying mandatory flow instead of "Cancel"
- **Bug 4**: User enters "lavanya sharma" → system stores "lavanya sharma" instead of "Lavanya Sharma"

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Form submission flow and server action processing must continue to work exactly as before
- Navigation back to `/dashboard` on form completion or cancellation must remain unchanged
- Data validation and error handling for required fields must continue to function
- Profile creation with DOB, email, and relationship association must remain unchanged
- Back arrow navigation, progress bar, and subtitle display must remain unchanged
- Names with hyphens and apostrophes must preserve those characters correctly after normalization

**Scope:**
All form interactions that do NOT involve the four specific bug conditions should be completely unaffected by this fix. This includes:
- Form validation and error display
- Server-side profile creation logic
- Database storage patterns
- Navigation and routing behavior
- Other form fields (email, DOB input mechanics)

## Hypothesized Root Cause

Based on the bug description, the most likely issues are:

1. **Native Select Usage**: The form uses a native HTML `<select>` element which renders differently across platforms
   - iOS shows drum-roll picker that breaks visual flow
   - Android shows bottom sheet that doesn't match app design
   - Desktop shows plain dropdown that lacks visual cohesion

2. **Outdated Helper Text**: The DOB field helper text references unbuilt medication reminder functionality
   - Text says "coming soon" for a feature that may never be built
   - Actual purpose (lab reference ranges) is not communicated to users

3. **Incorrect Button Semantics**: The cancel button uses "Skip for now" language
   - Implies user is in a mandatory onboarding flow they can defer
   - Users voluntarily navigate to this page, so "Cancel" is more appropriate

4. **Missing Name Normalization**: The form lacks client-side input guidance and server-side normalization
   - No `autocapitalize="words"` attribute on mobile keyboards
   - Server action stores names exactly as entered without title-case conversion
   - Results in inconsistent casing throughout the app display

## Correctness Properties

Property 1: Bug Condition - Custom UI Components and Data Normalization

_For any_ form interaction where a bug condition holds (native select usage, misleading helper text, wrong button label, or unnormalized name input), the fixed form SHALL render custom chip selectors for relationships, display accurate helper text for DOB fields, show appropriate button labels, and normalize names to title case before storage.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

Property 2: Preservation - Existing Form Functionality

_For any_ form interaction that does NOT involve the four bug conditions (form validation, navigation, data submission, other field interactions), the fixed form SHALL produce exactly the same behavior as the original form, preserving all existing functionality for non-buggy interactions.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `components/features/family/AddMemberForm.tsx`

**Function**: `AddMemberForm` component

**Specific Changes**:
1. **Replace Native Select with Chip Selector**: Remove the `<select>` element and implement custom chip-based relationship selector
   - Create 5 chips in a 2-row grid: [Parent] [Spouse] [Child] on top row, [Sibling] [Other] on bottom row
   - Each chip as button with `role="radio"`, group with `role="radiogroup"`
   - Selected chip gets blue background, white text; unselected chips get border + transparent background
   - Hidden `<input type="hidden" name="relationship">` carries value for form submission

2. **Update DOB Helper Text**: Change helper text from "Used for medication reminders (coming soon)" to "Helps with age-appropriate lab test reference ranges."

3. **Fix Button Label**: Change button text from "Skip for now" to "Cancel"

4. **Add Name Input Guidance**: Add `autocapitalize="words"` attribute to the Full Name input field

**File**: `app/(app)/dashboard/actions.ts`

**Function**: `createProfile` server action

**Specific Changes**:
5. **Implement Name Normalization**: Add title-case conversion before saving names
   - Create `toTitleCase` utility function that handles edge cases
   - Apply normalization to name before passing to `familyService.createProfile`
   - Preserve hyphens and apostrophes correctly ("Mary-Jane", "O'Brien")

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bugs on unfixed code, then verify the fixes work correctly and preserve existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bugs BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that simulate user interactions with each problematic UI element and assert the expected behavior. Run these tests on the UNFIXED code to observe failures and understand the root cause.

**Test Cases**:
1. **Native Select Test**: Render form and check if relationship selector is a native `<select>` element (will fail on unfixed code)
2. **Helper Text Test**: Check if DOB helper text contains "coming soon" (will fail on unfixed code)
3. **Button Label Test**: Check if cancel button shows "Skip for now" (will fail on unfixed code)
4. **Name Normalization Test**: Submit form with "lavanya sharma" and verify storage (will fail on unfixed code)

**Expected Counterexamples**:
- Native select element renders instead of custom chips
- Helper text shows outdated "coming soon" message
- Button shows "Skip for now" instead of "Cancel"
- Names stored without title-case normalization

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := AddMemberForm_fixed(input)
  ASSERT expectedBehavior(result)
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT AddMemberForm_original(input) = AddMemberForm_fixed(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for form validation, navigation, and data submission, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Form Validation Preservation**: Verify required field validation continues to work correctly
2. **Navigation Preservation**: Verify form submission redirects to `/dashboard` as before
3. **Data Submission Preservation**: Verify profile creation with all fields works correctly
4. **Error Handling Preservation**: Verify error states display and function correctly

### Unit Tests

- Test chip selector renders with correct accessibility attributes and visual states
- Test helper text displays accurate information about DOB field purpose
- Test button label shows appropriate text for user context
- Test name normalization handles edge cases (hyphens, apostrophes, mixed case)
- Test form submission continues to work with hidden input for relationship value

### Property-Based Tests

- Generate random form inputs and verify chip selector behavior across all relationship types
- Generate random name inputs and verify title-case normalization preserves special characters
- Generate random form states and verify all non-buggy interactions continue working
- Test that form validation and error handling work across many input combinations

### Integration Tests

- Test full form flow with chip selector in browser environment
- Test form submission with normalized names creates profiles correctly
- Test navigation and cancellation behavior works as expected
- Test accessibility compliance with screen readers and keyboard navigation