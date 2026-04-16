# Auth Layout Isolation Bugfix Design

## Overview

The authentication page currently inherits the full marketing layout (`PublicLayout`) which creates cognitive friction at the moment of highest user commitment. The fix isolates the auth page into its own route group with a minimal layout containing only the Vitae logo, auth card, and copyright line. This eliminates 12+ navigation exit paths while preserving all authentication functionality. The approach follows industry best practices where major products (Google, Notion, Stripe, GitHub) use distraction-free auth pages.

## Glossary

- **Bug_Condition (C)**: The condition where the auth page renders with marketing navigation and footer elements that provide exit paths during authentication
- **Property (P)**: The desired behavior where the auth page renders with only essential elements (logo, auth card, copyright) and no navigation distractions
- **Preservation**: Existing authentication functionality, OAuth flows, and other public page layouts that must remain unchanged
- **PublicLayout**: The marketing layout in `app/(public)/layout.tsx` that renders sticky header with nav links and full footer
- **Route Group**: Next.js feature using `(name)` folders to organize routes with shared layouts without affecting URL structure
- **Layout Compensation**: CSS hacks in `auth.css` that counteract `PublicLayout`'s padding and height calculations

## Bug Details

### Bug Condition

The bug manifests when a user navigates to `/auth` and the system renders the full marketing layout around the authentication form. The `PublicLayout` component adds navigation links ("How it works", "For Families", "Privacy", "Sign in" CTA) and a complete `PageFooter`, creating cognitive friction and exit opportunities during the authentication flow.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type NavigationEvent
  OUTPUT: boolean
  
  RETURN input.route == '/auth'
         AND currentLayout == 'PublicLayout'
         AND navigationLinksVisible == true
         AND pageFooterVisible == true
END FUNCTION
```

### Examples

- **Navigation Distraction**: User visits `/auth` and sees "How it works", "For Families", "Privacy" links above the auth form, providing 3+ exit paths
- **Footer Distraction**: User scrolls down on `/auth` and encounters the full `PageFooter` with additional links and content, providing 9+ more exit paths  
- **CTA Confusion**: User sees "Sign in" CTA in the header while already on the sign-in page, creating redundant and confusing UI
- **Layout Coupling**: The `auth.css` file contains hardcoded offsets (`calc(100dvh - 64px - 60px)`) and negative margins that will break if the layout changes

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- All authentication functionality (Google OAuth, email sign-in/up, tab switching, form validation) must continue to work exactly as before
- The `/auth/callback` route must continue to handle OAuth callbacks correctly
- Query parameters (`?mode=signup`, `?return=/path`) must continue to work for pre-selecting tabs and post-auth redirects
- All other pages in the `(public)` route group must continue using `PublicLayout` with full marketing header and footer
- Mobile responsiveness and iOS zoom prevention on input focus must be preserved

**Scope:**
All navigation events that do NOT involve the `/auth` route should be completely unaffected by this fix. This includes:
- Homepage (`/`) navigation and layout
- Upload page (`/upload`) navigation and layout  
- Other public pages (`/explanation-preview`) navigation and layout
- All authenticated app routes under `(app)` route group

## Hypothesized Root Cause

Based on the bug description, the root cause is architectural:

1. **Incorrect Route Grouping**: The `/auth` route is placed inside the `(public)` route group, which applies `PublicLayout` designed for marketing pages, not focused authentication flows

2. **Layout Inheritance**: Next.js route groups automatically apply their layout to all child routes, so `/auth` inherits the marketing layout by default

3. **CSS Compensation Hacks**: The `auth.css` file contains layout-specific calculations (`min-height: calc(100dvh - 64px - 60px)`) and negative margins that assume `PublicLayout`'s structure

4. **Missing Isolation**: There's no dedicated layout for authentication flows that provides the minimal, distraction-free experience needed for conversion optimization

## Correctness Properties

Property 1: Bug Condition - Auth Page Isolation

_For any_ navigation to the `/auth` route, the fixed system SHALL render only the Vitae logo (linking to `/`), the auth card content, and a minimal copyright line, with no marketing navigation links or page footer visible.

**Validates: Requirements 2.1, 2.2**

Property 2: Preservation - Public Layout Continuity  

_For any_ navigation to routes other than `/auth` within the `(public)` route group, the fixed system SHALL produce exactly the same layout as the original system, preserving the full `PublicLayout` with marketing header and footer.

**Validates: Requirements 3.1**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `app/(auth)/layout.tsx` (new file)

**Function**: New isolated layout component

**Specific Changes**:
1. **Create Auth Route Group**: Create new `app/(auth)/` directory to isolate auth routes from public marketing routes
   - Move `app/(public)/auth/` to `app/(auth)/auth/`
   - Move `app/(public)/auth/callback/` to `app/(auth)/auth/callback/`

2. **Create Isolated Layout**: Implement `app/(auth)/layout.tsx` with minimal layout
   - Render only Vitae logo linking to `/`
   - Provide container for auth content
   - Add minimal `© 2025 Vitae` copyright line
   - No navigation links, no `PageFooter`

3. **Remove CSS Compensation**: Update `auth.css` to remove layout-specific hacks
   - Remove `min-height: calc(100dvh - 64px - 60px)` calculation
   - Remove negative margin overrides (`margin: 0 -16px` and responsive variants)
   - Update to use full viewport height without header/footer offsets

4. **Preserve Public Routes**: Ensure other `(public)` routes continue using `PublicLayout`
   - Homepage, upload page, explanation-preview remain unchanged
   - `PublicLayout` continues to serve marketing pages

5. **Maintain Auth Functionality**: Ensure all authentication features work in new layout
   - OAuth callback handling
   - Query parameter processing
   - Form submission and validation
   - Mobile responsiveness

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that navigate to `/auth` and inspect the rendered DOM structure. Run these tests on the UNFIXED code to observe the presence of marketing navigation and footer elements.

**Test Cases**:
1. **Marketing Header Test**: Navigate to `/auth` and verify marketing nav links are present (will fail on unfixed code)
2. **Page Footer Test**: Navigate to `/auth` and verify `PageFooter` component is rendered (will fail on unfixed code)  
3. **Sign In CTA Test**: Navigate to `/auth` and verify redundant "Sign in" CTA appears in header (will fail on unfixed code)
4. **CSS Compensation Test**: Inspect computed styles and verify hardcoded height/margin calculations (will fail on unfixed code)

**Expected Counterexamples**:
- Marketing navigation links ("How it works", "For Families", "Privacy") are visible on auth page
- Possible causes: route grouping inheritance, layout component structure, CSS compensation patterns

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := renderAuthPage_fixed(input)
  ASSERT isolatedLayoutBehavior(result)
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT renderPage_original(input) = renderPage_fixed(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-auth routes

**Test Plan**: Observe behavior on UNFIXED code first for public pages and auth functionality, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Public Layout Preservation**: Verify homepage, upload page, and other public routes continue using `PublicLayout` with full header and footer
2. **Auth Functionality Preservation**: Verify Google OAuth, email auth, tab switching, and form validation continue working
3. **Routing Preservation**: Verify query parameters (`?mode=signup`, `?return=/path`) continue working correctly
4. **Mobile Preservation**: Verify responsive behavior and iOS zoom prevention continue working

### Unit Tests

- Test isolated auth layout renders only logo, content area, and copyright
- Test auth functionality (OAuth, forms, validation) works in new layout
- Test CSS no longer contains layout compensation hacks
- Test other public routes continue using `PublicLayout`

### Property-Based Tests

- Generate random navigation events and verify auth routes use isolated layout while public routes use marketing layout
- Generate random auth form interactions and verify all functionality is preserved
- Test that visual elements (navigation, footer) are correctly present/absent across route types

### Integration Tests

- Test full authentication flow from landing page to dashboard in new isolated layout
- Test OAuth callback handling works correctly in new route structure
- Test that marketing pages maintain their full layout and functionality
- Test responsive behavior across different screen sizes and devices