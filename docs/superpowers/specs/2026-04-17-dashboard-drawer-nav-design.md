# Dashboard Drawer Nav  Design Spec
**Date:** 2026-04-17
**Status:** Approved

---

## Problem

The dashboard has a bottom tab bar on mobile (Home, Timeline, Profile) but no equivalent navigation on desktop. At `sm:` and above the BottomNav is hidden via `sm:hidden`, leaving desktop users with no way to navigate between primary sections except typing URLs. The sign-out button is also awkwardly isolated in the gradient hero.

## Goal

Add desktop navigation that mirrors the mobile tab bar's scope, without disrupting the full-bleed gradient hero or the existing family section layout.

---

## Solution: Hamburger Drawer (Option A)

The drawer is available on **all primary app pages** (dashboard, timeline, settings)  not just dashboard.

### Breakpoint split

| Breakpoint | Nav | Sign-out |
|---|---|---|
| `< sm (640px)` | Bottom tab bar (unchanged) | Icon in each page's hero top-right (unchanged) |
| `≥ sm (640px)` | Fixed hamburger (from layout) → opens drawer | Inside drawer footer |

### Hamburger button (desktop only)

- Rendered by `AppDrawerNav` in `(app)/layout.tsx` as a **fixed** element: `hidden sm:flex fixed top-3 right-5 z-50`
- Same visual style as the current sign-out button: `rgba(255,255,255,.15)` bg, white border, `w-9 h-9` rounded  looks native inside any gradient hero
- Three white lines (standard hamburger)
- Each page's existing sign-out button gets `sm:hidden` so only one appears at a time

### Drawer panel

- **Position:** Fixed, slides in from the right, full viewport height
- **Width:** `w-64` (256px)
- **Background:** White (`bg-surface-container-lowest`)
- **Shadow:** `shadow-2xl` + left border `border-l border-border`
- **Backdrop:** Semi-transparent dark overlay (`bg-black/40 backdrop-blur-sm`) covering the rest of the screen
- **Dismiss:** Click backdrop OR press `Escape`
- **Animation:** `translate-x-full` → `translate-x-0` with `transition-transform duration-200`

### Drawer contents (top to bottom)

1. **Header strip**  "Menu" label in muted uppercase, close `×` button top-right
2. **Nav items**  same 3 as BottomNav, in order:
   - Home → `/dashboard`
   - Timeline → `/timeline`
   - Profile → `/settings`
   - Each item: icon (matching BottomNav icons) + label, active state uses `text-primary bg-primary-subtle border-l-2 border-primary`
3. **Divider**
4. **Sign out**  red text, sign-out icon, triggers existing `signOut` server action

### Active state detection

Uses `usePathname()` (already used in BottomNav)  exact match on `/dashboard`, `/timeline`, `/settings`.

---

## Component

**File:** `components/layout/AppDrawerNav.tsx`
- `'use client'`  needs `useState`, `usePathname`, `useEffect` (Escape listener)
- Props: none (self-contained; calls `signOut` action directly)
- Renders both the fixed hamburger button AND the drawer panel/backdrop
- Exports: `AppDrawerNav` (named)
- Barrel: add to `components/layout/index.ts`

---

## Layout change

**File:** `app/(app)/layout.tsx`

Add `<AppDrawerNav />` alongside `<BottomNav />` inside `PageLayout`. It renders nothing on mobile (`hidden sm:flex` on the button).

---

## Per-page sign-out changes

All three primary pages have a sign-out button in their gradient hero top-right. Each gets wrapped in `sm:hidden`:

- `app/(app)/dashboard/page.tsx`  wrap sign-out `<form>` in `<div className="sm:hidden">`
- `app/(app)/timeline/page.tsx`  wrap sign-out element in `<div className="sm:hidden">`
- `app/(app)/settings/page.tsx`  wrap sign-out element in `<div className="sm:hidden">`

No other changes to any page. Family section, content sheets  all untouched.

---

## What is NOT changing

- `BottomNav` component  zero changes
- Family section in the dashboard content sheet
- Mobile layout and behaviour
- Sub-routes (upload, add-member, records, etc.)  no nav shown there by design

---

## Verification

1. At `< 640px`: sign-out icon visible in each hero, hamburger absent, bottom tab bar present  all unchanged
2. At `≥ 640px` on `/dashboard`, `/timeline`, `/settings`: fixed hamburger visible top-right, sign-out icon hidden, bottom tab bar hidden
3. Click hamburger → drawer slides in from right with blurred backdrop
4. Click backdrop or press Escape → drawer closes
5. Each nav item navigates correctly and shows active highlight on current route
6. Sign out in drawer footer works
7. On sub-routes (`/dashboard/upload/...`): hamburger still renders (it's in the layout) but drawer nav items link back to primary routes correctly
