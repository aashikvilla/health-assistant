# Bugfix Requirements Document

## Introduction

The Add Family Member page (`/dashboard/add-member`) has four UI and data-quality issues that degrade the experience across devices and introduce inconsistent data into the system. These bugs affect the relationship selector (native OS `<select>` breaks visual cohesion on mobile), the Date of Birth helper text (misleading "coming soon" copy), the cancel button label (wrong affordance implying a mandatory flow), and name storage (no normalisation means mixed-case names like "LAVanya" are stored and displayed verbatim throughout the app).

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user opens the Add Family Member form on any device THEN the system renders a native OS `<select>` element for relationship selection, which displays as a drum-roll picker on iOS, a bottom sheet on Android, and a plain dropdown on desktop, breaking visual cohesion with the rest of the custom-styled form.

1.2 WHEN a user views the Date of Birth field THEN the system displays the helper text "Used for medication reminders (coming soon)", which is inaccurate because medication reminders are not built and the real purpose of the field is age-appropriate lab test reference ranges.

1.3 WHEN a user decides not to add a family member and looks for a way to leave the form THEN the system shows a button labelled "Skip for now", implying the user is in a mandatory flow they can defer, when in fact they voluntarily navigated to this page.

1.4 WHEN a user submits the Add Family Member form with a name that is not in title case (e.g. "lavanya" or "LAVanya") THEN the system stores and displays the name exactly as entered, causing inconsistent casing throughout the app.

### Expected Behavior (Correct)

2.1 WHEN a user opens the Add Family Member form THEN the system SHALL render a custom chip/button selector for relationship with five options (Parent, Spouse, Child, Sibling, Other) displayed as tappable chips in a 2-row grid, each chip having `role="radio"`, the group having `role="radiogroup"`, a hidden `<input type="hidden" name="relationship">` carrying the value for form submission, and the selected chip showing a highlighted/filled visual state.

2.2 WHEN a user views the Date of Birth field THEN the system SHALL display the helper text "Helps with age-appropriate lab test reference ranges."

2.3 WHEN a user decides not to add a family member and looks for a way to leave the form THEN the system SHALL show a button labelled "Cancel".

2.4 WHEN a user submits the Add Family Member form THEN the system SHALL normalise the name to title case before saving (e.g. "lavanya sharma" → "Lavanya Sharma"), AND the Full Name input SHALL carry `autocapitalize="words"` to guide correct casing on mobile keyboards.

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user submits the form with a correctly cased name (e.g. "Ramesh Gupta") THEN the system SHALL CONTINUE TO store and display the name unchanged.

3.2 WHEN a user selects a relationship chip and submits the form THEN the system SHALL CONTINUE TO pass the relationship value to the `createProfile` server action exactly as before.

3.3 WHEN a user submits the form with a Date of Birth THEN the system SHALL CONTINUE TO store the DOB value and associate it with the created profile.

3.4 WHEN a user clicks Cancel THEN the system SHALL CONTINUE TO navigate back to `/dashboard` without saving any data.

3.5 WHEN a user views the Add Family Member page THEN the system SHALL CONTINUE TO show the back arrow navigation, profile slot progress bar, and "You manage their records — they don't need to sign up." subtitle unchanged.

3.6 WHEN a user submits the form with a name containing a hyphen or apostrophe (e.g. "Mary-Jane" or "O'Brien") THEN the system SHALL CONTINUE TO preserve those characters correctly after title-case normalisation.
