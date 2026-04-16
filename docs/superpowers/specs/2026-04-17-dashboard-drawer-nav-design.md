# Dashboard Drawer Nav — Design Spec
**Date:** 2026-04-17
**Status:** Approved

---

## Problem

The dashboard has a bottom tab bar on mobile (Home, Timeline, Profile) but no equivalent navigation on desktop. At `sm:` and above the BottomNav is hidden via `sm:hidden`, leaving desktop users with no way to navigate between primary sections except typing URLs. The sign-out button is also awkwardly isolated in the gradient hero.

## Goal

Add desktop navigation that mirrors the mobile tab bar's scope, without disrupting the full-bleed gradient hero or the existing family section layout.

---

## Solution: Hamburger Drawer (Option A)

### Breakpoint split

| Breakpoint | Nav | Sign-out |
|---|---|---|
| `< sm (640px)` | Bottom tab bar (unchanged) | Icon in hero top-right (unchanged) |
| `≥ sm (640px)` | Hamburger in hero top-right → opens drawer | Inside drawer footer |

### Hamburger button (desktop only)

- Replaces the sign-out icon in the gradient hero top-right at `sm:` and above
- Same visual style as current sign-out button: `rgba(255,255,255,.15)` background, white border, `w-9 h-9` rounded
- Three white lines (standard hamburger)
- Sign-out icon gets `sm:hidden`; hamburger gets `hidden sm:flex`

### Drawer panel

- **Position:** Fixed, slides in from the right, full viewport height
- **Width:** `w-64` (256px)
- **Background:** White (`bg-surface-container-lowest`)
- **Shadow:** `shadow-2xl` + left border `border-l border-border`
- **Backdrop:** Semi-transparent dark overlay (`bg-black/40 backdrop-blur-sm`) covering the rest of the screen
- **Dismiss:** Click backdrop OR press `Escape`
- **Animation:** `translate-x-full` → `translate-x-0` with `transition-transform duration-200`

### Drawer contents (top to bottom)

1. **Header strip** — "Menu" label in muted uppercase, close `×` button top-right
2. **Nav items** — same 3 as BottomNav, in order:
   - Home → `/dashboard`
   - Timeline → `/timeline`
   - Profile → `/settings`
   - Each item: icon (matching BottomNav icons) + label, active state uses `text-primary bg-primary-subtle border-l-2 border-primary`
3. **Divider**
4. **Sign out** — red text, sign-out icon, triggers existing `signOut` server action

### Active state detection

Uses `usePathname()` (already used in BottomNav) — exact match on `/dashboard`, `/timeline`, `/settings`.

---

## Component

**File:** `components/layout/DashboardDrawerNav.tsx`
- `'use client'` — needs `useState`, `usePathname`, `useEffect` (Escape listener)
- Props: none (self-contained; calls `signOut` action directly)
- Exports: `DashboardDrawerNav` (named)
- Barrel: add to `components/layout/index.ts`

---

## Dashboard page change

**File:** `app/(app)/dashboard/page.tsx`

In the hero top nav bar (`<div className="relative flex items-center justify-between px-5 pt-safe h-14">`):

- Wrap existing sign-out `<form>` in `<div className="sm:hidden">` 
- Add `<DashboardDrawerNav />` wrapped in `<div className="hidden sm:flex">`

No other changes to the dashboard page. Family section, content sheet, stat pills — all untouched.

---

## What is NOT changing

- `BottomNav` component — zero changes
- `(app)/layout.tsx` — zero changes
- Family section in the dashboard content sheet
- Mobile layout and behaviour

---

## Verification

1. At `< 640px`: sign-out icon visible in hero, hamburger absent, bottom tab bar present — all unchanged
2. At `≥ 640px`: hamburger visible in hero, sign-out icon hidden, bottom tab bar hidden
3. Click hamburger → drawer slides in from right with backdrop
4. Click backdrop or press Escape → drawer closes
5. Each nav item navigates correctly and shows active highlight on current route
6. Sign out in drawer footer works
7. Sub-routes (`/dashboard/upload/...`, `/dashboard/add-member`) — drawer still accessible from any page that renders the dashboard hero (it's only on `dashboard/page.tsx` so only on `/dashboard`)
