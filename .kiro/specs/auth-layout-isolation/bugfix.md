# Bugfix Requirements Document

## Introduction

The `/auth` route currently inherits `PublicLayout` from `app/(public)/layout.tsx`, which renders a sticky branded header (with "How it works", "For Families", "Privacy", and "Sign in" nav links) and a full `PageFooter`. On the authentication page, these elements are distractions  they present 12+ exit paths at the moment of highest user commitment. No major product (Google, Notion, Stripe, GitHub) shows a marketing nav or footer on their auth page.

The fix moves `/auth` into its own route group (`(auth)`) with an isolated layout that renders only the Vitae logo, the auth card, and a minimal copyright line. The auth page component (`page.tsx`) and its styles (`auth.css`) are not changed  only the layout wrapping changes.

Additionally, `auth.css` currently compensates for the marketing header and footer with hardcoded `min-height` offsets (`calc(100dvh - 64px - 60px)`) and negative horizontal margins to counteract `PageLayout`'s padding. These hacks become incorrect once the page is no longer wrapped by `PublicLayout`.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user navigates to `/auth` THEN the system renders the full `PublicLayout` header containing nav links ("How it works", "For Families", "Privacy") and a "Sign in" CTA above the auth card

1.2 WHEN a user navigates to `/auth` THEN the system renders the full `PageFooter` below the auth card, providing additional exit paths away from authentication

1.3 WHEN the auth page is rendered inside `PublicLayout` THEN the system applies `min-height: calc(100dvh - 64px - 60px)` in `auth.css` to subtract the header (64px) and footer (60px) heights, which will produce incorrect vertical sizing if the layout changes

1.4 WHEN the auth page is rendered inside `PublicLayout` THEN the system applies negative horizontal margins (`margin: 0 -16px` and responsive variants) in `auth.css` to counteract `PageLayout`'s padding, creating a layout coupling between the page styles and the parent layout

### Expected Behavior (Correct)

2.1 WHEN a user navigates to `/auth` THEN the system SHALL render only the Vitae logo (linking to `/`) at the top of the page, with no navigation links and no "Sign in" CTA

2.2 WHEN a user navigates to `/auth` THEN the system SHALL render no `PageFooter` below the auth card  only a minimal `© 2025 Vitae` copyright line

2.3 WHEN the auth page is rendered inside the new isolated layout THEN the system SHALL size the auth container to fill the full viewport height without hardcoded header/footer offsets

2.4 WHEN the auth page is rendered inside the new isolated layout THEN the system SHALL NOT require negative horizontal margin hacks to achieve full-bleed background  the layout itself SHALL provide the correct padding context

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user navigates to any page in the `(public)` group other than `/auth` (e.g. homepage, `/upload`, `/explanation-preview`) THEN the system SHALL CONTINUE TO render the full `PublicLayout` with the sticky branded header and `PageFooter`

3.2 WHEN a user interacts with the auth page THEN the system SHALL CONTINUE TO support Google OAuth sign-in via the `signInWithGoogle` action

3.3 WHEN a user interacts with the auth page THEN the system SHALL CONTINUE TO support email sign-in and sign-up via the `signIn` and `signUp` actions

3.4 WHEN a user navigates to `/auth?mode=signup` THEN the system SHALL CONTINUE TO open the auth page with the Sign Up tab pre-selected

3.5 WHEN a user navigates to `/auth?return=/some-path` THEN the system SHALL CONTINUE TO redirect to the specified path after successful authentication

3.6 WHEN a user interacts with the auth page THEN the system SHALL CONTINUE TO display the tab switcher (Sign In / Sign Up), trust badges, and Terms of Service text

3.7 WHEN a user navigates to `/auth/callback` THEN the system SHALL CONTINUE TO handle the OAuth callback route correctly, unaffected by the layout change

3.8 WHEN the auth page is viewed on mobile THEN the system SHALL CONTINUE TO render the auth card correctly with responsive sizing and iOS zoom prevention on input focus
