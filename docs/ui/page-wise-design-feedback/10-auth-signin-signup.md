# 10 — Sign In / Sign Up (`/auth`) — UI/UX & CRO Critique

**Screenshot:** `10-auth-signin-signup.png`
**Route:** `/auth`
**Goal:** Convert visitors to registered users. Minimise friction. Maintain trust. Handle both new (Sign Up) and returning (Sign In) users.
**Stakes:** The auth page is the gate between free trial value and retained users. Every percentage point of drop-off here is a user lost permanently.

---

## 1. Layout — Correct Pattern, Wrong Context

**Current:** Centred card (400px wide, white, raised shadow) with Vitae logo, tab switcher, Google OAuth button, email/password form, CTA, and footer link.

**What works:**
- Centred card pattern matches every major auth screen (Google, Notion, Linear, Stripe) — Jakob's Law compliance
- Tab-based Sign In / Sign Up switching is the right pattern
- Google OAuth as the primary option (above email) is correct hierarchy

**What's catastrophically wrong:** Full 4-column marketing footer below the auth card. This is present on a focused conversion screen where the user should have exactly one mental task: sign in or sign up.

The footer (Vitae · Product · Company · Legal) offers 12+ links to different parts of the site. This is Hick's Law applied disastrously — every footer link is a potential distraction from the conversion goal.

**No major product does this:** Google's sign-in, Apple's sign-in, Notion's, Stripe's, GitHub's — none show a marketing footer on the auth page. The auth page belongs to a different layout than the marketing pages.

**Fix:** Auth pages should use an isolated `AuthLayout` that renders: just the Vitae logo (linking to homepage), the auth card, and a minimal `© 2025 Vitae` at the bottom. No nav. No footer.

---

## 2. Marketing Nav — Still Present

**Current:** "Features | How it works" nav links visible above the auth card.

A user who navigates to `/auth` is ready to authenticate. Showing them "Features" and "How it works" links offers exit paths at the moment of highest commitment. These users don't need to be convinced — they're already here.

**Fix:** Same as above. Auth layout = logo only. Strip the full nav.

---

## 3. No "Forgot Password?" — A Known Failure

**Current:** Email field + Password field + "Sign In" button. No password recovery link.

This is a known, documented, standard UX failure. The Baymard Institute reports that missing password recovery is the #1 reported auth friction point in usability testing. Users who signed up months ago, return to the app, can't remember their password, and find no recovery path will churn.

**WCAG 3.3.4** (Error Prevention) requires that reversible actions be confirmed and that users have ways to recover from errors. A missing "Forgot password?" link is an accessibility violation as much as a CRO failure.

**Placement:** "Forgot password?" should appear:
- As a small text link to the right of or below the Password label/field — immediately visible when the user's eye is on the password input
- NOT below the sign-in button — users who fail to sign in and are looking for help must find the link before frustration peaks, not after

**Copy note:** "Forgot password?" is the universal standard phrasing. Do not change it. Users expect exactly this phrase in exactly this position.

---

## 4. OAuth Priority — Right Pattern, Wrong Copy

**Current:** "Continue with Google" as a full-width button with Google logo, above the email form.

**What works:** Placing OAuth above email is correct. Google OAuth is 3x less friction than email+password (no typing, no password to remember, no verification email). Primary path should be friction-lowest path.

**Copy analysis:** "Continue with Google" is correct Jakob's Law phrasing — this is the Google-recommended copy. Keep it.

**What's missing:** Apple Sign In. For mobile users on iOS, Apple Sign In is the lowest-friction OAuth option (one Face ID tap). The FRD mentions email + Google OAuth but for a health app targeting Indian families (who use iPhones significantly), Apple Sign In could materially improve mobile conversion.

**Divider copy:** "or continue with email" below the Google button. This is correct. It frames email as a secondary option, which it is.

---

## 5. Form — Minimal but Missing Key Elements

**Current:** Two fields (Email, Password) and a "Sign In" button. "Don't have an account? Sign up" text link below.

**Sign In tab — what's missing:**
- "Forgot password?" (covered above)
- Remember me / "Stay signed in" checkbox — not strictly necessary for a health app (session management can default to long-lived), but users expect to not have to sign in repeatedly
- Clear error states: "Incorrect email or password" when either is wrong — don't specify which one (security best practice)

**Sign Up tab — what's likely missing (not shown):**
- Name field (required for onboarding) — or is this collected in a post-auth onboarding step?
- Password requirements — if there are any (8 chars, special char), they must be shown as helper text before the user types, not as an error after
- Confirmation password field — standard for sign up
- Terms of service agreement — legally required before collecting health data. "By signing up, you agree to our Terms of Service and Privacy Policy." as a small text below the button, with links. FRD mentions HIPAA/data compliance — this is non-negotiable.

---

## 6. No Product Context — Bounce Risk

**Current:** Vitae logo + heart icon + "Vitae" text. No product description.

A user who arrives at `/auth` from:
- A WhatsApp share link
- A Google search result (not the homepage)
- A bookmarked link
- A referral from a family member

...sees "Vitae" with a heart icon and a sign-in form. They have no idea what Vitae is or why they should sign up.

**Fix:** One line of subtext below the Vitae logo: "Your family's health records, understood." (10 words, the subheadline from the homepage). Zero implementation effort. Prevents bounce from confused arrivals.

For users arriving from the public upload flow (they've already seen their prescription explanation), a personalised message is even better: "Your prescription explanation is saved. Create a free account to access it anytime." — this is achievable by passing a parameter from the upload flow.

---

## 7. Tab Switching — Confirm it Works for Pre-selected State

**Current:** Sign In tab is shown active by default.

**The issue:** When a user clicks "Create Account" on the homepage, they should arrive at `/auth?mode=signup` with the Sign Up tab pre-selected. If this query parameter is respected by the UI but the tab doesn't visually highlight immediately (before JavaScript hydrates), there's a brief flash of the Sign In tab before switching — this looks broken.

**Test:** Navigate from "Create Account" on homepage to `/auth`. Verify:
1. Sign Up tab is immediately active (no flash of Sign In)
2. The Sign Up form fields (name, password confirm, ToS) are visible immediately
3. The URL parameter is preserved if the user switches between tabs

---

## 8. Visual Design — The "Card in a Grey Box" Problem

**Current:** White auth card, centred, with a grey/white background page around it.

**What works:** The card pattern is familiar and correct.

**What's wrong:** The page background is a flat grey/off-white that makes the page feel unfinished. Compare to Notion's auth page (gradient background), Linear's auth (dark gradient), Stripe's auth (textured background). The grey rectangle around a white card is the most baseline design treatment possible.

**Minor improvement:** A subtle background texture, gradient, or even just a slightly warmer grey (#F5F5F5 instead of #FAFAFA) would make the page feel more designed. The auth page is often the first screen users see after clicking your marketing CTA — it should feel like an entrance, not a corridor.

**Logo treatment:** The Vitae heart logo in a blue circle at the top of the card is fine but not distinctive. Consider making the logo click-back-to-homepage with a hover state — standard auth UX.

---

## 9. Post-Auth Redirect

**Current behavior (inferred from codebase):** After sign-in, user is redirected to `/dashboard`. After sign-up, user goes through `/onboarding` (name entry), then to `/dashboard`.

**What's missing:** The `returnTo` parameter handling. Users who arrived at `/auth` from `/upload` (after seeing their prescription explanation) should return to `/dashboard` which then fires the PendingUploadBanner to claim their saved result.

**The experience gap:** A user who uploaded a prescription, saw their explanation, clicked "Save to My Account," and was redirected to `/auth` expects to see their explanation immediately after signing up. The transition from "sign up complete" to "your explanation is waiting for you" needs to be seamless and fast.

**Recommendation:** After successful sign-up, show a brief interstitial: "✓ Account created — loading your prescription explanation..." (500ms delay) before redirecting to `/dashboard`. This primes the user for the PendingUploadBanner and sets a positive completion state.

---

## 10. Accessibility

**Autocomplete attributes:** Email field should have `autocomplete="email"`. Password field should have `autocomplete="current-password"` on Sign In and `autocomplete="new-password"` on Sign Up. Without these, password managers don't auto-fill correctly.

**Form labels:** Each input field needs a visible `<label>` element. "Email" and "Password" as placeholder-only labels disappear when the user starts typing. The label must remain visible. Use floating labels or static labels above the field.

**Error states:** When sign-in fails, the error message must be:
- In red text with an error icon
- Programmatically associated with the form via `aria-describedby`
- Not just a visual change but also announced to screen readers via `aria-live="assertive"`
- Specific but not security-compromising: "The email or password is incorrect. Try again or reset your password." — never "Email not found" (reveals whether the email exists in the system)

**Touch targets:** The "Sign In" and "Continue with Google" buttons appear full-width — good touch target. The "Don't have an account? Sign up" link must have `min-height: 44px` of interactive area.

---

## 11. Mobile Issues

**Current layout on mobile:** The centred white card will take full width on small screens (375px). The card padding must be sufficient: minimum 20px horizontal padding inside the card.

**Google OAuth button on mobile (iOS Safari):** Tapping "Continue with Google" on iOS should open a native Google sign-in sheet, not a new browser tab. If it opens a tab, the user may get confused by the navigation. Test this specifically.

**Keyboard behaviour:** When the Password field is tapped and the soft keyboard appears (taking ~50% of screen height), the "Sign In" button must remain visible above the keyboard. If it's hidden behind the keyboard, users submit by tapping Return in the keyboard — ensure `type="submit"` is correctly set so the keyboard Return key submits the form.

**Footer on mobile:** The 4-column footer in the screenshot wraps to a 2-column or single-column layout on mobile. This means the footer takes even more vertical space on mobile, pushing it further below the card. On mobile with an auth card and a full footer, users may need to scroll down just to see the footer — an entirely unnecessary interaction.

---

## 12. CRO Summary

| Issue | Conversion Impact | Fix Effort |
|---|---|---|
| Remove footer from auth page | +5–8% conversion | 1h |
| Remove marketing nav | +2–3% | 30min |
| Add "Forgot password?" | Retention critical | 2h |
| Add product context below logo | Reduce bounce from referrals | 30min |
| Add ToS agreement text | Legal compliance | 30min |
| Personalised message for upload-to-auth flow | +10–15% sign-up conversion from upload flow | 4h |
| Apple Sign In (iOS) | Mobile conversion +5% | 1 day |
