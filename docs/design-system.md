# Design System — Digital Health Palette

> **Status: LIVE** (April 2026)
> **Source of truth:** `app/globals.css` `:root` block — edit only here
> **Theme:** Light-only, glassmorphic, violet-tinted borders

This is the canonical reference for Vitae's visual identity. All colors, radii, shadows, and spacing are semantic tokens defined once in `globals.css` and mapped to Tailwind utility classes via `@theme inline`.

---

## The Rule

```tsx
// ✅ Always use semantic tokens
<div className="bg-surface text-text-primary border border-border">
<button className="bg-primary text-white hover:bg-primary-hover">

// ❌ Never hardcode colors
<div style={{ background: '#1d4ed8' }}>
<div className="bg-[#1d4ed8]">
<div className="bg-blue-600">
```

---

## Color Palette

### Primary — Digital Health Blue

Used for primary CTAs, links, active states, and trust-building elements.

| Token | Value | Tailwind class | Usage |
|-------|-------|----------------|-------|
| `--color-primary` | `#1d4ed8` | `bg-primary` / `text-primary` | Primary buttons, links, active indicators |
| `--color-primary-hover` | `#1e40af` | `bg-primary-hover` | Hover/active state |
| `--color-primary-subtle` | `#dbeafe` | `bg-primary-subtle` | Soft backgrounds, icon containers |
| `--color-primary-container` | `#dbeafe` | `bg-primary-container` | Elevated containers |
| `--color-primary-foreground` | `#ffffff` | `text-primary-foreground` | Text on primary backgrounds |

### Accent / Violet — AI & Intelligence

Used for AI features, accent moments, and secondary interactive elements.

| Token | Value | Tailwind class | Usage |
|-------|-------|----------------|-------|
| `--color-accent` | `#9333ea` | `bg-accent` / `text-accent` | AI indicators, accent highlights |
| `--color-accent-hover` | `#7c3aed` | `bg-accent-hover` / `text-accent-hover` | Hover state, "Soon" badges |
| `--color-accent-subtle` | `#f3e8ff` | `bg-accent-subtle` | Soft violet backgrounds |
| `--color-accent-foreground` | `#ffffff` | `text-accent-foreground` | Text on accent backgrounds |
| `--color-violet` | `#a855f7` | `bg-violet` / `text-violet` | Gradient midpoint, format tags |
| `--color-violet-subtle` | `#f3e8ff` | `bg-violet-subtle` | Violet tinted backgrounds |

### Pink — Gradient Endpoint & Family

Used as the gradient endpoint in brand gradients and family member color coding.

| Token | Value | Tailwind class | Usage |
|-------|-------|----------------|-------|
| `--color-pink` | `#ec4899` | `bg-pink` / `text-pink` | Gradient endpoint, family accents |
| `--color-pink-subtle` | `#fce7f3` | `bg-pink-subtle` | Soft pink backgrounds |

### Teal — Health & Wellness

Used for positive health tracks, lab report indicators, and success states.

| Token | Value | Tailwind class | Usage |
|-------|-------|----------------|-------|
| `--color-teal` | `#006a66` | `bg-teal` / `text-teal` | Lab reports, health metrics, success |
| `--color-teal-subtle` | `#dff4f2` | `bg-teal-subtle` | Health data backgrounds |

### Tertiary — Alerts & Urgent

Used for warnings, side effects, critical flags, and urgent actions.

| Token | Value | Tailwind class | Usage |
|-------|-------|----------------|-------|
| `--color-tertiary` | `#ab2653` | `bg-tertiary` / `text-tertiary` | Urgent warnings, side effects |
| `--color-tertiary-subtle` | `#ffd9e2` | `bg-tertiary-subtle` | Soft alert backgrounds |

### Surface Hierarchy

Stacked "sheets of paper" — multiple depth levels using subtle tint shifts.

| Token | Value | Tailwind class | Usage |
|-------|-------|----------------|-------|
| `--color-surface` | `#f8f9ff` | `bg-surface` | Base page background |
| `--color-surface-subtle` | `#f2f3ff` | `bg-surface-subtle` | Slight card lift, inactive states |
| `--color-surface-muted` | `#e8edf5` | `bg-surface-muted` | Interactive hover states, disabled |
| `--color-surface-container-lowest` | `#ffffff` | `bg-surface-container-lowest` | Top interactive layer (cards, inputs) |
| `--color-surface-inverse` | `#181c21` | `bg-surface-inverse` | Dark mode stub (not active) |

### Borders — Violet-Tinted Ghost Rule

No hard borders. Use subtle violet-tinted rgba values at low opacity only.

| Token | Value | Tailwind class | Usage |
|-------|-------|----------------|-------|
| `--color-border` | `rgba(168,85,247,0.13)` | `border-border` | Default dividers |
| `--color-border-subtle` | `rgba(168,85,247,0.08)` | `border-border-subtle` | Very faint separators |
| `--color-border-strong` | `rgba(168,85,247,0.25)` | `border-border-strong` | Stronger visual weight |

### Typography

| Token | Value | Tailwind class | Usage |
|-------|-------|----------------|-------|
| `--color-text-primary` | `#07071a` | `text-text-primary` | Body text, headings |
| `--color-text-secondary` | `#16163a` | `text-text-secondary` | Supporting text |
| `--color-text-muted` | `#3b3b62` | `text-text-muted` | Labels, placeholders, hints |
| `--color-text-inverse` | `#ffffff` | `text-text-inverse` | Text on colored backgrounds |
| `--color-text-link` | `#0058bd` | `text-text-link` | Inline links |

### Status Colors

| Token | Value | Tailwind class | Usage |
|-------|-------|----------------|-------|
| `--color-success` | `#006a66` | `text-success` / `bg-success` | ✓ Success (same as teal) |
| `--color-success-subtle` | `#dff4f2` | `bg-success-subtle` | Success backgrounds |
| `--color-warning` | `#7b5800` | `text-warning` / `bg-warning` | ⚠ Warning (amber) |
| `--color-warning-subtle` | `#ffefd6` | `bg-warning-subtle` | Warning backgrounds |
| `--color-error` | `#ab2653` | `text-error` / `bg-error` | ✕ Error (same as tertiary) |
| `--color-error-subtle` | `#ffd9e2` | `bg-error-subtle` | Error backgrounds |
| `--color-info` | `#0058bd` | `text-info` / `bg-info` | ℹ Info |
| `--color-info-subtle` | `#dce8ff` | `bg-info-subtle` | Info backgrounds |

---

## Gradient Utilities

Multi-stop gradients cannot be expressed as single CSS custom properties. They are defined as named CSS classes in `globals.css` and applied via `className` — never via inline `style` props.

```css
/* Defined in app/globals.css */
.gradient-brand      { background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-violet) 100%) }
.gradient-brand-full { background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-violet) 55%, var(--color-pink) 100%) }
.gradient-hero       { background: linear-gradient(135deg, #0f0f2d 0%, var(--color-primary) 45%, var(--color-accent-hover) 80%, #c026d3 100%) }
.gradient-cta-box    { background: linear-gradient(135deg, #060a1f 0%, #1a1068 40%, #5b21b6 72%, #7c3aed 100%) }
```

| Class | Use for |
|-------|---------|
| `gradient-brand` | Avatar rings, active indicators, progress bars |
| `gradient-brand-full` | Avatar backgrounds, full-spectrum brand moments |
| `gradient-hero` | Full-bleed page hero sections (dashboard, timeline, settings) |
| `gradient-cta-box` | Dark CTA sections on marketing pages |

```tsx
// ✅ Use gradient classes
<div className="-mx-4 gradient-hero">
<div className="w-14 h-14 rounded-full gradient-brand">
<div className="h-1.5 rounded-full gradient-brand" style={{ width: `${pct}%` }} />

// ❌ Never inline
<div style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)' }}>
```

**Permitted inline gradient exceptions** (intentional brand moments, not design system):
- `LabAlertCard` critical header: `linear-gradient(135deg, #be123c, #e11d48)`
- `LabAlertCard` warning header: `linear-gradient(135deg, #d97706, #f59e0b)`
- WhatsApp button: `#25D366` (third-party brand color)

---

## Typography

### Fonts

Loaded in `app/layout.tsx` via Next.js Google Fonts:

| Font | CSS var | Tailwind class | Usage |
|------|---------|----------------|-------|
| Plus Jakarta Sans | `--font-plus-jakarta` | `font-display` / `font-sans` | Headings, numbers, labels, buttons |
| Manrope | `--font-manrope` | `font-body` / `font-mono` | Body text, descriptions, UI copy |

```tsx
// ✅ Use semantic font classes
<h1 className="font-display text-[28px] font-extrabold text-white">
<p className="font-body text-sm text-text-muted">
<span className="font-display text-[26px] font-extrabold">42</span>

// ❌ Don't use generic font-sans for body text
<p className="font-sans text-sm">
```

### Type Scale

| Class | Size | Usage |
|-------|------|-------|
| `text-[9px]` – `text-[11px]` | 9–11px | Labels, badges, uppercase section headers |
| `text-xs` | 12px | Secondary labels, hints |
| `text-sm` | 14px | Supporting text, descriptions |
| `text-base` | 16px | Body text, inputs (minimum for iOS no-zoom) |
| `text-lg` | 18px | Subheadings |
| `text-xl` | 20px | Section titles |
| `text-2xl` | 24px | Page titles |
| `text-[28px]` – `text-[30px]` | 28–30px | Hero headings |

---

## Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-xs` | 0.25rem (4px) | Small inline elements |
| `--radius-sm` | 0.375rem (6px) | Input focus rings |
| `--radius-md` | 0.5rem (8px) | Small containers |
| `--radius-lg` | 0.75rem (12px) | Cards, buttons |
| `--radius-xl` | 1rem (16px) | Large cards, modals |
| `--radius-2xl` | 1.25rem (20px) | Major UI sections |
| `--radius-3xl` | 1.5rem (24px) | Full-bleed sections |
| `--radius-full` | 9999px | Avatars, badges, pills |

In Tailwind: `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-3xl`, `rounded-full`

---

## Shadows

Ambient, diffused, tinted with on-surface color.

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-xs` | `0 2px 8px rgba(24,28,33,0.04)` | Subtle lift |
| `--shadow-sm` | `0 2px 12px rgba(24,28,33,0.06)` | Cards at rest |
| `--shadow-md` | `0 4px 24px rgba(24,28,33,0.06)` | Floating buttons |
| `--shadow-lg` | `0 8px 32px rgba(24,28,33,0.08)` | Elevated modals |
| `--shadow-xl` | `0 16px 48px rgba(24,28,33,0.10)` | Top-layer sheets |

In Tailwind: `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`

---

## Special Effects

### Glassmorphism

Applied to sticky headers and floating surfaces:

```tsx
<header className="glass-surface sticky top-0 z-10">
```

```css
/* globals.css */
.glass-surface {
  background: rgba(247, 249, 255, 0.82);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}
```

### Safe Areas (PWA / Notched Phones)

```tsx
<nav className="fixed bottom-0 inset-x-0 pb-safe">   // home indicator
<div className="pt-safe h-14">                         // notch
```

---

## UI Component Library

All primitives live in `components/ui/`. Always import from the barrel:

```tsx
import { Button, Card, Badge, Input, Heading, Section, Accordion, Spinner,
         GradientHeroHeader, PageHeader, EmptyState, SectionHeader, ListItem
       } from '@/components/ui'
```

### Component Quick Reference

#### Button
```tsx
<Button variant="primary" size="md">Save</Button>
<Button variant="secondary" size="sm">Cancel</Button>
<Button variant="ghost">Skip</Button>
<Button variant="danger">Delete</Button>
<Button href="/dashboard">Go to Dashboard</Button>  // renders as Link
<Button loading>Saving…</Button>
<Button fullWidth size="lg">Upload</Button>
```

#### Card
```tsx
<Card>Default card</Card>
<Card variant="outlined">Outlined card</Card>
<Card variant="elevated">Elevated card</Card>
```

#### Badge
```tsx
<Badge>Default</Badge>
<Badge variant="primary">Primary</Badge>
<Badge variant="success">Active</Badge>
<Badge variant="warning">High</Badge>
<Badge variant="error">Critical</Badge>
<Badge variant="info">Info</Badge>
<Badge size="sm">Small</Badge>
```

#### Input
```tsx
<Input label="Full Name" name="name" type="text" required />
<Input label="Email" name="email" type="email" hint="We'll never share this" />
<Input label="Password" name="password" type="password" error="Too short" />
```

#### GradientHeroHeader
```tsx
<GradientHeroHeader
  title="Good day, Priya"
  subtitle="Your health at a glance"
  greeting="Good day,"
  stats={[
    { num: 3, label: 'Active Meds' },
    { num: 1, label: 'Alerts' },
    { num: 5, label: 'Records' },
  ]}
  navAction={<SignOutButton />}
/>
```

#### PageHeader
```tsx
<PageHeader title="Record Detail" backHref="/dashboard" />
<PageHeader
  title="Add Member"
  backHref="/dashboard"
  action={{ label: 'Help', href: '/help' }}
/>
```

#### EmptyState
```tsx
<EmptyState
  icon={<svg>...</svg>}
  heading="No records yet"
  description="Upload a prescription or lab report to get started"
  ctaLabel="Upload"
  ctaHref={`/dashboard/upload/${profileId}`}
/>
```

#### SectionHeader
```tsx
<SectionHeader label="Your Records" />
<SectionHeader label="Your Records" count={5} />
<SectionHeader label="Your Records" count={5} action={{ label: 'View all', href: '/timeline' }} />
```

#### ListItem
```tsx
<ListItem
  icon={<svg className="text-primary">...</svg>}
  title="Metformin 500mg"
  subtitle="Twice daily · 30 days"
  badge={<Badge variant="success">Active</Badge>}
/>
```

---

## Page Layout Patterns

### Top-Level Authenticated Pages (Dashboard, Timeline, Settings)

```tsx
// Full-bleed gradient hero + white content sheet
<>
  {/* Hero — full bleed, negative margin to escape page padding */}
  <div className="-mx-4 sm:-mx-6 lg:-mx-8 gradient-hero">
    <GradientHeroHeader title="Timeline" subtitle="..." stats={[...]} />
  </div>

  {/* Content sheet — overlaps hero with rounded top corners */}
  <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-6 relative z-10 bg-surface rounded-[28px_28px_0_0]">
    <div className="px-5 pt-5 pb-6 flex flex-col gap-5">
      {/* page content */}
    </div>
  </div>
</>
```

### Sub-Pages (Records, Explanation, Upload)

```tsx
// Sticky back-nav + scrollable content
<>
  <PageHeader title="Your Prescription" backHref="/dashboard" action={<ShareButton />} />
  <div className="px-4 py-5 flex flex-col gap-4">
    {/* page content */}
  </div>
</>
```

---

## When Tokens Change

1. Open `app/globals.css`
2. Update the hex value in the `:root` block — **never rename variables**
3. The `@theme inline` block mirrors `:root` with `var()` references — update it too if adding new tokens
4. Restart the dev server so Tailwind picks up the change
5. No component code changes needed if semantic tokens are used correctly
6. Update this file with the new values

---

## Accessibility

- All text meets WCAG AA contrast (4.5:1 minimum)
- Never convey status via color alone — always pair with icons or labels
- All interactive elements ≥44×44px touch target
- Focus ring: `outline: 2px solid var(--color-primary)` applied globally via `:focus-visible`

---

## Legacy Aliases

For backward compatibility with upload screens that use raw CSS variables, `globals.css` defines `--nuskha-*` aliases:

```css
--nuskha-surface:   var(--color-surface);
--nuskha-primary:   var(--color-primary);
--nuskha-on-surface: var(--color-text-primary);
/* ... */
```

These should be phased out as those screens migrate to Tailwind classes.
