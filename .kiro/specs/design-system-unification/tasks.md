# Implementation Plan: Design System Unification

## Overview

Migrate Vitae from two divergent color palettes to a single source of truth in `globals.css`. The Digital Health palette (`#1d4ed8` blue, `#a855f7` violet, `#ec4899` pink) becomes canonical. Work proceeds in dependency order: tokens first, gradient utilities second, CSS file cleanup third, new shared components fourth, feature component token migration fifth, page-level migrations sixth, UI primitive adoption seventh, and dead code removal last.

## Tasks

- [x] 1. Update `globals.css` token foundation
  - In the `:root` block, update primary tokens to the Digital Health palette: `--color-primary` → `#1d4ed8`, `--color-primary-hover` → `#1e40af`, `--color-primary-subtle` → `#dbeafe`
  - Add new tokens to `:root`: `--color-accent` (`#9333ea`), `--color-accent-hover` (`#7c3aed`), `--color-accent-subtle` (`#f3e8ff`), `--color-accent-foreground` (`#ffffff`), `--color-violet` (`#a855f7`), `--color-violet-subtle` (`#f3e8ff`), `--color-pink` (`#ec4899`), `--color-pink-subtle` (`#fce7f3`)
  - Update surface tokens: `--color-surface` → `#f8f9ff`, `--color-surface-subtle` → `#f2f3ff`
  - Update typography tokens: `--color-text-primary` → `#07071a`, `--color-text-secondary` → `#16163a`, `--color-text-muted` → `#3b3b62`
  - Update border tokens to violet-tinted values: `--color-border` → `rgba(168,85,247,0.13)`, `--color-border-subtle` → `rgba(168,85,247,0.08)`, `--color-border-strong` → `rgba(168,85,247,0.25)`
  - Mirror every new and updated token in the `@theme inline` block using the `--color-X: var(--color-X)` pattern
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [x] 2. Add gradient utility classes to `globals.css`
  - Append four CSS utility classes after the `@theme inline` block: `.gradient-brand`, `.gradient-brand-full`, `.gradient-hero`, `.gradient-cta-box`
  - `.gradient-brand`: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-violet) 100%)`
  - `.gradient-brand-full`: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-violet) 55%, var(--color-pink) 100%)`
  - `.gradient-hero`: `linear-gradient(135deg, #0f0f2d 0%, var(--color-primary) 45%, var(--color-accent-hover) 80%, #c026d3 100%)`
  - `.gradient-cta-box`: `linear-gradient(135deg, #060a1f 0%, #1a1068 40%, #5b21b6 72%, #7c3aed 100%)`
  - _Requirements: 2.1, 2.2_

- [x] 3. Strip color variable definitions from `homepage.css` and `auth.css`
  - [x] 3.1 Strip `.hp {}` color variable block from `app/homepage.css`
    - Remove all `--bg`, `--surface`, `--white`, `--blue`, `--blue-h`, `--blue-s`, `--accent`, `--accent-s`, `--violet`, `--violet-s`, `--pink`, `--pink-s`, `--grad`, `--grad-pk`, `--grad-full`, `--text`, `--text-2`, `--text-m`, `--border`, `--sh-sm`, `--sh-md`, `--sh-lg`, `--r-*`, `--fd`, `--fb` declarations from the `.hp {}` block
    - Update all `var(--blue)`, `var(--violet)`, `var(--pink)`, etc. references throughout `homepage.css` to use the corresponding `globals.css` tokens (e.g. `var(--color-primary)`, `var(--color-violet)`, `var(--color-pink)`, `var(--color-surface)`, `var(--color-text-primary)`, `var(--color-border)`)
    - Retain all `@keyframes` definitions and all layout/component-specific style rules unchanged
    - _Requirements: 3.1, 3.3, 3.4_

  - [x] 3.2 Strip `.ap {}` color variable block from `app/(auth)/auth/auth.css`
    - Remove all `--*` color variable declarations from the `.ap {}` block
    - Update all `var(--X)` references in `auth.css` to resolve to `globals.css` tokens
    - Retain all `@keyframes` definitions and component-specific style rules unchanged
    - _Requirements: 3.2, 3.3, 3.5_

- [x] 4. Create new reusable shared components
  - [x] 4.1 Create `components/ui/GradientHeroHeader.tsx`
    - Accept props: `title: string`, `subtitle?: string`, `stats?: Array<{ num: number | string; label: string }>`, `navAction?: React.ReactNode`
    - Apply `gradient-hero` CSS class to the root container element (not an inline `style` prop)
    - Render `navAction` in a top nav bar row at `h-14 pt-safe`
    - Render `title` as an `h1` with `font-display text-[28px] font-extrabold text-white`
    - Render `subtitle` as a `p` with `font-body text-sm text-white/70` when provided
    - Render each `stats` entry as a frosted-glass pill: `bg-[rgba(255,255,255,.13)] border border-[rgba(255,255,255,.2)] backdrop-blur-[10px] rounded-xl px-3 py-3`
    - Export from `components/ui/index.ts`
    - _Requirements: 5.1, 5.2, 5.7_

  - [ ]* 4.2 Write property test for `GradientHeroHeader` rendering completeness
    - **Property 6: New Component Rendering Completeness**
    - For any valid `title`, `subtitle`, `stats` array, and `navAction`, the rendered output must contain the title text, subtitle text (when provided), and all stat labels and numbers
    - Use `@testing-library/react` with fast-check or vitest property testing
    - **Validates: Requirements 5.1, 5.2, 5.7**

  - [x] 4.3 Create `components/ui/PageHeader.tsx`
    - Accept props: `title: string`, `backHref: string`, `action?: { label: string; href?: string; onClick?: () => void }`
    - Render a sticky nav bar (`sticky top-0 z-10`) with a back-chevron `<Link>` pointing to `backHref` and the `title` as a `span`
    - Render `action` as a right-aligned `<Link>` or `<button>` when provided
    - Export from `components/ui/index.ts`
    - _Requirements: 5.3_

  - [x] 4.4 Create `components/ui/EmptyState.tsx`
    - Accept props: `icon: React.ReactNode`, `heading: string`, `description: string`, `ctaLabel: string`, and either `ctaHref: string` or `ctaOnClick: () => void`
    - Render all four elements in a centered column layout (`flex flex-col items-center text-center gap-4`)
    - Render CTA as `<Button href={ctaHref}>` or `<Button onClick={ctaOnClick}>` from `components/ui`
    - Export from `components/ui/index.ts`
    - _Requirements: 5.4, 5.8_

  - [ ]* 4.5 Write property test for `EmptyState` rendering completeness
    - **Property 6: New Component Rendering Completeness**
    - For any valid `heading`, `description`, `ctaLabel`, and `icon`, the rendered output must contain the heading text, description text, and a CTA element — no required prop is silently dropped
    - **Validates: Requirements 5.4, 5.8**

  - [x] 4.6 Create `components/ui/SectionHeader.tsx`
    - Accept props: `label: string`, `count?: number`, `action?: { label: string; href: string }`
    - Render `label` in uppercase with `font-display text-[11px] font-bold text-text-muted uppercase tracking-widest`
    - Render `count` inline after the label when provided; omit the count element entirely when not provided
    - Render `action` as a right-aligned `<Link>` with `text-xs font-semibold text-primary` when provided; omit when not provided
    - Export from `components/ui/index.ts`
    - _Requirements: 5.5, 5.9, 5.10_

  - [ ]* 4.7 Write property test for `SectionHeader` conditional rendering
    - **Property 6: New Component Rendering Completeness**
    - When rendered with only `label`: output contains label text and does NOT render a count or action element
    - When rendered with `label` and `count`: output contains both label text and the count value
    - **Validates: Requirements 5.5, 5.9, 5.10**

  - [x] 4.8 Create `components/ui/ListItem.tsx`
    - Accept props: `icon: React.ReactNode`, `title: string`, `subtitle?: string`, `badge?: React.ReactNode`
    - Render in a horizontal row: icon on the left, title + subtitle stacked in the middle, badge on the right
    - Use `flex items-center gap-3` layout; icon in a `w-9 h-9 rounded-[10px]` container
    - Export from `components/ui/index.ts`
    - _Requirements: 5.6_

- [x] 5. Checkpoint — verify new components build and export correctly
  - Ensure all five new components (`GradientHeroHeader`, `PageHeader`, `EmptyState`, `SectionHeader`, `ListItem`) are exported from `components/ui/index.ts`
  - Run `tsc --noEmit` to confirm no TypeScript errors in the new components
  - Ask the user if any questions arise before proceeding to migrations.

- [x] 6. Migrate feature components to semantic tokens
  - [x] 6.1 Migrate `components/features/family/ProfileChip.tsx`
    - Replace active-state ring `linear-gradient(135deg, #1d4ed8, #7c3aed, #c026d3)` with `gradient-brand` CSS class
    - Replace active-state label `color: '#1d4ed8'` with `text-primary`
    - Replace inactive-state `background: 'rgba(124,58,237,.15)'` with `bg-accent-subtle`
    - Replace inactive-state `background: '#f1f4fb'` with `bg-surface-subtle`
    - Replace inactive-state `color: '#64748b'` with `text-text-muted`
    - _Requirements: 4.1, 4.2_

  - [x] 6.2 Migrate `components/features/records/RecordCard.tsx`
    - Replace prescription stripe `linear-gradient(180deg, #1d4ed8, #7c3aed)` with `gradient-brand` CSS class applied to the stripe `div`
    - Replace lab report stripe `linear-gradient(180deg, #0d9488, #0891b2)` with a teal gradient using `bg-teal` or a two-stop inline gradient referencing `var(--color-teal)`
    - Replace icon background `rgba(29,78,216,.09)` with `bg-primary-subtle`
    - Replace icon background `rgba(13,148,136,.09)` with `bg-teal-subtle`
    - Replace SVG `stroke="#1d4ed8"` with `stroke="currentColor"` + `text-primary` on the parent
    - Replace SVG `stroke="#0d9488"` with `stroke="currentColor"` + `text-teal` on the parent
    - Replace date number `color: isPrescription ? '#1d4ed8' : '#0d9488'` with `text-primary` / `text-teal`
    - Replace tag `background: 'rgba(13,148,136,.1)', color: '#0d9488'` with `bg-teal-subtle text-teal`
    - Replace card border/shadow inline styles with `border-border shadow-sm` Tailwind classes
    - _Requirements: 4.1, 4.3_

  - [x] 6.3 Migrate `components/features/hub/LabAlertCard.tsx`
    - Replace status badge inline `bg`/`text` styles in the value rows with `Badge` component from `components/ui` using `variant="error"` for critical and `variant="warning"` for high/low
    - The gradient header backgrounds for critical (`#be123c → #e11d48`) and warning (`#d97706 → #f59e0b`) states may remain as inline styles (intentional brand moments per design.md)
    - Replace `flex-shrink-0` with `shrink-0` (Tailwind v4 canonical form)
    - _Requirements: 4.1, 4.4, 6.3_

  - [x] 6.4 Migrate `components/features/explanation/MedicationCard.tsx`
    - Replace the `PALETTES` array hardcoded hex values with token-based CSS custom property references
    - Map palette entries to: `--color-primary-subtle`/`--color-primary`, `--color-teal-subtle`/`--color-teal`, `--color-warning-subtle`/`--color-warning`, `--color-pink-subtle`/`--color-pink`, `--color-accent-subtle`/`--color-accent-hover`, `--color-teal-subtle`/`--color-teal`
    - Use `var(--color-X)` in the palette object values so they resolve at runtime
    - Replace `flex-shrink-0` with `shrink-0`
    - _Requirements: 4.1, 4.5_

  - [x] 6.5 Migrate `components/features/upload/ReviewScreen.tsx`
    - Replace `MED_ACCENTS` array entries with token references: `var(--color-primary)`, `var(--color-teal)`, `var(--color-accent-hover)`, `var(--color-warning)`, `var(--color-tertiary)`, `var(--color-success)`, `var(--color-error)`
    - Remove the fallback hex values from the `var()` calls (e.g. `var(--color-primary, #0058bd)` → `var(--color-primary)`)
    - _Requirements: 4.1, 4.6_

- [x] 7. Migrate page-level gradient heroes and inline colors
  - [x] 7.1 Migrate `app/(app)/dashboard/page.tsx` gradient hero
    - Replace the outer hero `div`'s `style={{ background: 'linear-gradient(135deg, #0f0f2d 0%, #1d4ed8 45%, #7c3aed 80%, #c026d3 100%)' }}` with `className="gradient-hero"`
    - Replace the radial overlay `style={{ background: 'radial-gradient(...)' }}` with an equivalent using `var(--color-primary)` and `var(--color-violet)` references
    - Replace the avatar gradient `linear-gradient(135deg, #c026d3, #7c3aed)` with `gradient-brand` class
    - Replace the app name text gradient inline style with a `gradient-brand` text clip utility or equivalent token-based approach
    - Replace the white content sheet `background: '#f7f9ff'` with `bg-surface`
    - Replace the family card inline border/shadow with `border-border shadow-sm`
    - Replace the progress bar `linear-gradient(90deg, #1d4ed8, #7c3aed)` in add-member with `gradient-brand`
    - _Requirements: 4.7, 2.3, 8.3_

  - [x] 7.2 Migrate `app/(app)/timeline/page.tsx` gradient hero
    - Replace the hero `div`'s inline gradient style with `className="gradient-hero"`
    - Replace the radial overlay inline style with token-based `var()` references
    - Replace the app name text gradient inline style with token-based approach
    - Replace the empty state icon container inline `background`/`border` styles with `bg-accent-subtle border-border`
    - _Requirements: 4.9, 2.3_

  - [x] 7.3 Migrate `app/(app)/settings/page.tsx` gradient hero
    - Replace the hero `div`'s inline gradient style with `className="gradient-hero"`
    - Replace the avatar gradient `linear-gradient(135deg, #c026d3, #7c3aed, #1d4ed8)` with `gradient-brand-full`
    - Replace the radial overlay inline style with token-based `var()` references
    - Replace the app name text gradient inline style with token-based approach
    - Replace all card inline `border`/`boxShadow` styles with `border-border shadow-sm`
    - Replace icon background inline `rgba(29,78,216,.08)` with `bg-primary-subtle`
    - Replace the "Soon" badge inline `background`/`color` with `bg-accent-subtle text-accent-hover`
    - Replace the sign-out icon background `rgba(190,18,60,.08)` with `bg-error-subtle`
    - _Requirements: 4.10, 2.3_

  - [x] 7.4 Migrate `app/(app)/dashboard/add-member/page.tsx` gradient hero
    - Replace the hero `div`'s inline gradient style with `className="gradient-hero"`
    - Replace the back-nav button inline `background`/`border` with `bg-white/[.18] border border-white/25`
    - Replace the photo placeholder gradient ring `linear-gradient(135deg, #1d4ed8, #7c3aed, #c026d3)` with `gradient-brand`
    - Replace the photo placeholder inner `background: '#f1f4fb'` with `bg-surface-subtle`
    - Replace the progress bar `linear-gradient(90deg, #1d4ed8, #7c3aed)` with `gradient-brand`
    - Replace the slot card inline `border`/`boxShadow` with `border-border shadow-sm`
    - Replace the body sheet `bg-[#f7f9ff]` with `bg-surface`
    - _Requirements: 4.8, 2.3_

- [x] 8. Checkpoint — verify visual parity and no TypeScript errors
  - Run `tsc --noEmit` to confirm no type errors across all migrated files
  - Visually verify dashboard, timeline, settings, and add-member pages render the correct Digital Health gradient hero
  - Ask the user if any questions arise before proceeding.

- [x] 9. Replace raw HTML elements with UI primitives
  - [x] 9.1 Replace raw `<input>` elements in `components/features/family/AddMemberForm.tsx`
    - Replace the raw `<input type="date">` (dob field) with the `Input` component from `components/ui`, preserving `id`, `name`, `type`, `max`, and `className` attributes
    - Replace the raw `<input type="email">` (member-email field) with the `Input` component, preserving `id`, `name`, `type`, `placeholder`, and `autoComplete` attributes
    - _Requirements: 6.2, 6.6_

  - [x] 9.2 Replace raw badge markup in `components/features/family/PrescriptionListItem.tsx`
    - Replace the manually-styled `<span className="text-xs px-2.5 py-0.5 bg-teal-subtle text-teal rounded-full font-medium">` tag spans with `<Badge variant="default" size="sm">` from `components/ui`
    - _Requirements: 6.3_

  - [x] 9.3 Replace raw card containers in `app/(app)/settings/page.tsx`
    - Replace the manually-constructed `rounded-2xl bg-white overflow-hidden` card `div`s (Account, Preferences, Legal groups) with `<Card variant="outlined">` from `components/ui`
    - _Requirements: 6.4_

  - [x] 9.4 Replace raw `<button>` in `app/(app)/dashboard/add-member/page.tsx` limit-reached state
    - Replace the disabled `<button>` element in the limit-reached view with `<Button variant="secondary" disabled>` from `components/ui`, preserving the disabled state and label text
    - _Requirements: 6.1, 6.5_

- [x] 10. Remove dead layout components
  - Delete `components/layout/PageHeader.tsx`
  - Delete `components/layout/PageFooter.tsx`
  - Delete `components/layout/AppHeader.tsx`
  - Delete `components/layout/AppFooter.tsx`
  - Remove the exports for `PageHeader`, `PageFooter`, `AppHeader`, and `AppFooter` from `components/layout/index.ts`
  - Remove the unused `PageHeader` and `LogoutButton` imports from `app/(app)/layout.tsx`
  - Verify no other file outside `components/layout/index.ts` imports any of the deleted components before deleting
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 11. Final checkpoint — full build and token audit
  - Run `tsc --noEmit` to confirm zero TypeScript errors across the entire project
  - Search for `#[0-9a-fA-F]{3,6}` in `components/` and `app/` (excluding `globals.css` gradient utility definitions and `homepage.css` animation keyframes) — result should be empty or limited to intentional brand gradient endpoints
  - Search for `--[a-z]` variable declarations inside `.hp {}` and `.ap {}` blocks — result should be zero matches
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints at tasks 5, 8, and 11 ensure incremental validation
- Property tests (4.2, 4.5, 4.7) validate the new shared components' rendering completeness against Property 6 from the design document
- The gradient header backgrounds in `LabAlertCard` (critical red, warning amber) are intentional brand moments and are explicitly permitted to remain as inline styles per Requirements 4.4 and design.md
- `homepage.css` animations (`@keyframes hp-*`) and layout rules must be preserved unchanged — only the `.hp {}` color variable block is removed
