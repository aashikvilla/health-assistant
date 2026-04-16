# Implementation Plan

## Overview

Isolate the authentication page from the marketing layout by creating a dedicated `(auth)` route group with minimal layout containing only the Vitae logo, auth card, and copyright line. This eliminates navigation distractions while preserving all authentication functionality.

## Implementation Tasks

- [ ] 1. Create auth route group structure
  - [x] 1.1 Create new `app/(auth)/` directory
    - Create the new route group directory to isolate auth routes
    - _Requirements: 2.1, 2.2_
  
  - [x] 1.2 Move auth routes to new group
    - Move `app/(public)/auth/` to `app/(auth)/auth/`
    - Move `app/(public)/auth/callback/` to `app/(auth)/auth/callback/`
    - Preserve all existing files: `page.tsx`, `auth.css`, `route.ts`
    - _Requirements: 2.1, 2.2, 3.2, 3.3, 3.7_

- [ ] 2. Create isolated auth layout
  - [x] 2.1 Implement `app/(auth)/layout.tsx`
    - Create minimal layout with only Vitae logo linking to `/`
    - Provide clean container for auth content without marketing elements
    - Add minimal `© 2025 Vitae` copyright line at bottom
    - No navigation links, no `PageFooter`, no marketing header
    - _Bug_Condition: isBugCondition(input) where input.route == '/auth' AND currentLayout == 'PublicLayout'_
    - _Expected_Behavior: Render only logo, auth content, and copyright with no navigation distractions_
    - _Preservation: Other public routes continue using PublicLayout unchanged_
    - _Requirements: 2.1, 2.2_

- [ ] 3. Remove CSS layout compensation
  - [x] 3.1 Update `auth.css` to remove PublicLayout dependencies
    - Remove `min-height: calc(100dvh - 64px - 60px)` calculation that assumes header/footer heights
    - Update to use full viewport height: `min-height: 100dvh`
    - Remove negative margin overrides (`margin: 0 -16px` and responsive variants) that counteract PageLayout padding
    - Update container to work with isolated layout without full-bleed background hacks
    - _Bug_Condition: CSS contains hardcoded layout-specific calculations and margin overrides_
    - _Expected_Behavior: CSS works correctly with isolated layout without compensation hacks_
    - _Preservation: Visual appearance and responsive behavior of auth page maintained_
    - _Requirements: 2.3, 2.4, 3.8_

- [ ] 4. Verify auth functionality preservation
  - [ ] 4.1 Test authentication flows in new layout
    - Verify Google OAuth sign-in works correctly
    - Verify email sign-in and sign-up functionality
    - Verify tab switching between Sign In / Sign Up modes
    - Verify form validation and error handling
    - _Preservation: All authentication functionality from original system_
    - _Requirements: 3.2, 3.3, 3.6_
  
  - [ ] 4.2 Test routing and parameters
    - Verify `/auth?mode=signup` pre-selects Sign Up tab
    - Verify `/auth?return=/some-path` redirects correctly after auth
    - Verify `/auth/callback` OAuth callback handling works
    - _Preservation: Query parameter processing and OAuth flows_
    - _Requirements: 3.4, 3.5, 3.7_
  
  - [ ] 4.3 Test responsive behavior
    - Verify mobile layout renders correctly
    - Verify iOS zoom prevention on input focus (16px font size)
    - Verify auth card sizing and positioning across screen sizes
    - _Preservation: Mobile responsiveness and accessibility features_
    - _Requirements: 3.8_

- [ ] 5. Verify public layout preservation
  - [ ] 5.1 Test other public routes maintain marketing layout
    - Verify homepage (`/`) continues using PublicLayout with full header and footer
    - Verify upload page (`/upload`) continues using PublicLayout
    - Verify explanation preview (`/explanation-preview`) continues using PublicLayout
    - Ensure marketing navigation and footer remain on all non-auth public pages
    - _Preservation: PublicLayout functionality for all non-auth public routes_
    - _Requirements: 3.1_

- [ ] 6. Final verification and cleanup
  - [ ] 6.1 End-to-end testing
    - Test complete user journey from marketing page to auth to dashboard
    - Verify no broken links or navigation issues
    - Confirm auth page shows only logo, form, and copyright
    - Confirm marketing pages retain full navigation and footer
    - _Requirements: All requirements validated_
  
  - [ ] 6.2 Code cleanup
    - Remove any unused imports or references to old auth location
    - Ensure no dead code or orphaned files remain
    - Verify all file moves completed successfully
    - _Requirements: Clean implementation_

## Success Criteria

✅ **Auth Page Isolation**: `/auth` renders with only Vitae logo, auth card, and copyright line - no marketing navigation or footer

✅ **Functionality Preservation**: All authentication features (OAuth, email auth, form validation, routing) work exactly as before

✅ **Public Layout Preservation**: All other public pages continue using full marketing layout with header and footer

✅ **CSS Cleanup**: No layout compensation hacks remain in `auth.css` - styles work correctly with isolated layout

✅ **Mobile Compatibility**: Responsive behavior and iOS zoom prevention maintained across all screen sizes