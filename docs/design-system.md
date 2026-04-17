# Design System  Clinical Curator Palette

> **Status: LIVE** (April 2026)
> **Source:** Defined in `app/globals.css` `:root` block
> **Theme:** Light-only, glassmorphic, no-line tonal layering

This is the canonical reference for Vitae's visual identity. All colors, radii, shadows, and spacing are semantic tokens that map to Tailwind utilities via `@theme inline`.

---

## Color Palette

The "Clinical Curator" palette is a professional, healthcare-grade color system built on **primary (clinical blue)**, **secondary (health teal)**, and **tertiary (alert red-pink)** axes.

### Brand Colors

```css
--color-brand-50: #dce8ff /* Lightest tint */ --color-brand-100: #b6d0ff
  --color-brand-200: #8cb7ff --color-brand-300: #5b9cf6
  --color-brand-400: #3b82f6 --color-brand-500: #1e6fe8
  --color-brand-600: #0058bd ← Primary in use --color-brand-700: #004494
  --color-brand-800: #003170 --color-brand-900: #001f4d /* Darkest shade */;
```

### Semantic Tokens

#### Primary (Clinical Blue)

Used for primary CTAs, links, and trust-building.

| Token                        | Value     | Usage                         |
| ---------------------------- | --------- | ----------------------------- |
| `--color-primary`            | `#0058bd` | Primary action buttons, links |
| `--color-primary-hover`      | `#004494` | Hover state, active focus     |
| `--color-primary-subtle`     | `#dce8ff` | Soft background / accent      |
| `--color-primary-container`  | `#d1e4ff` | Elevated container            |
| `--color-primary-foreground` | `#ffffff` | Text on primary background    |

#### Health / Wellness (Teal)

Used for positive health tracks, success states, and "all good" signals.

| Token                 | Value     | Usage                      |
| --------------------- | --------- | -------------------------- |
| `--color-teal`        | `#006a66` | Health metrics, success    |
| `--color-teal-subtle` | `#dff4f2` | Background for health data |

#### Alert / Urgent (Red-Pink)

Used for warnings, side effects, critical flags, and urgent actions. In a family/pet context, differentiates urgent medical signals.

| Token                     | Value     | Usage                          |
| ------------------------- | --------- | ------------------------------ |
| `--color-tertiary`        | `#ab2653` | Warnings, side effects, urgent |
| `--color-tertiary-subtle` | `#ffd9e2` | Soft alert background          |

#### Surface Hierarchy

Stacked "sheets of paper"  multiple levels of depth using subtle tint shifts.

| Token                              | Value     | CSS Var                   | Usage                                                      |
| ---------------------------------- | --------- | ------------------------- | ---------------------------------------------------------- |
| `--color-surface`                  | `#f7f9ff` | Base page background      | `bg-surface`                                               |
| `--color-surface-subtle`           | `#f1f4fa` | surface-container-low     | Slight card lift                                           |
| `--color-surface-muted`            | `#e8edf5` | surface-container         | Interactive hover states                                   |
| `--color-surface-container-lowest` | `#ffffff` | Pure white                | Highest interactive layer (buttons, form fields, top card) |
| `--color-surface-inverse`          | `#181c21` | Dark mode stub (not used) | For future dark mode                                       |

#### Borders & Dividers (Ghost rule  no lines)

Per design brief, no hard borders. Use subtle tints at 12–20% opacity only.

| Token                   | Value     | Usage                                |
| ----------------------- | --------- | ------------------------------------ |
| `--color-border`        | `#dde2ec` | Default dividers (12% opacity)       |
| `--color-border-subtle` | `#edf0f7` | Very faint separator                 |
| `--color-border-strong` | `#c8cdd6` | Stronger visual weight (20% opacity) |

#### Typography

All on-surface, no flipping in dark mode.

| Token                    | Value     | Usage                          |
| ------------------------ | --------- | ------------------------------ |
| `--color-text-primary`   | `#181c21` | Body text, headings            |
| `--color-text-secondary` | `#43474e` | Supporting text                |
| `--color-text-muted`     | `#74777f` | Labels, placeholders, hints    |
| `--color-text-inverse`   | `#ffffff` | Text on colored backgrounds    |
| `--color-text-link`      | `#0058bd` | Inline links (same as primary) |

#### Status Colors

| Token                    | Value     | Usage                           |
| ------------------------ | --------- | ------------------------------- |
| `--color-success`        | `#006a66` | ✓ Success states (same as teal) |
| `--color-success-subtle` | `#dff4f2` | Success backgrounds             |
| `--color-warning`        | `#7b5800` | ⚠ Warning (neutral amber)       |
| `--color-warning-subtle` | `#ffefd6` | Warning backgrounds             |
| `--color-error`          | `#ab2653` | ✕ Error (same as tertiary)      |
| `--color-error-subtle`   | `#ffd9e2` | Error backgrounds               |
| `--color-info`           | `#0058bd` | ℹ Info (same as primary)        |
| `--color-info-subtle`    | `#dce8ff` | Info backgrounds                |

---

## Spacing

Using Tailwind's 4px default grid.

| Token                        | Value          |
| ---------------------------- | -------------- |
| `--spacing-1`                | 0.25rem (4px)  |
| `--spacing-2`                | 0.5rem (8px)   |
| `--spacing-3`                | 0.75rem (12px) |
| `--spacing-4`                | 1rem (16px)    |
| (... and so on via Tailwind) |

---

## Radius

Consistent rounded corners  no sharp angles.

| Token           | Value          | Usage                  |
| --------------- | -------------- | ---------------------- |
| `--radius-xs`   | 0.25rem (4px)  | Small inline elements  |
| `--radius-sm`   | 0.375rem (6px) | Input focus rings      |
| `--radius-md`   | 0.5rem (8px)   | Small containers       |
| `--radius-lg`   | 0.75rem (12px) | Cards, buttons         |
| `--radius-xl`   | 1rem (16px)    | Large cards, modals    |
| `--radius-2xl`  | 1.25rem (20px) | Major UI sections      |
| `--radius-3xl`  | 1.5rem (24px)  | Full-bleed sections    |
| `--radius-full` | 9999px         | Avatars, badges, pills |

---

## Shadows

Ambient, layered, tinted with on-surface.

| Token         | Value                             | Usage            |
| ------------- | --------------------------------- | ---------------- |
| `--shadow-xs` | `0 2px 8px rgba(24,28,33,0.04)`   | Subtle lift      |
| `--shadow-sm` | `0 2px 12px rgba(24,28,33,0.06)`  | Cards at rest    |
| `--shadow-md` | `0 4px 24px rgba(24,28,33,0.06)`  | Floating buttons |
| `--shadow-lg` | `0 8px 32px rgba(24,28,33,0.08)`  | Elevated modals  |
| `--shadow-xl` | `0 16px 48px rgba(24,28,33,0.10)` | Top-layer sheets |

---

## Typography

### Fonts

Loaded in `app/layout.tsx` via Next.js Google Fonts:

- **Headline:** Plus Jakarta Sans (400, 500, 600, 700, 800)
  - CSS var: `--font-plus-jakarta`
  - Usage: Headings, display text, buttons
- **Body:** Manrope (400, 500, 600, 700)
  - CSS var: `--font-manrope`
  - Usage: Paragraph text, labels, UI
- **Mono:** Manrope (monospace rendering via CSS)
  - CSS var: `--font-manrope`
  - Usage: Code, IDs, technical snippets

### Scale

No custom scale defined  inherits Tailwind defaults. Use semantic size classes:

- `text-xs`: 12px (labels, small UI)
- `text-sm`: 14px (supporting text)
- `text-base`: 16px (body text, inputs)
- `text-lg`: 18px (subheadings)
- `text-xl`: 20px (section titles)
- `text-2xl`: 24px (page titles)
- `text-3xl`: 30px (hero headings)

---

## Special Effects

### Glassmorphism

Applied to sticky headers and floating surfaces. See `app/globals.css` `.glass-surface` class:

```css
.glass-surface {
  background: rgba(247, 249, 255, 0.82);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}
```

**Usage:** `<header className="glass-surface">...</header>`

### Safe Areas (PWA)

For notched phones (iPhone X+) and Android with cutouts. Applied to fixed bars:

- `pb-safe`  bottom padding (home indicator)
- `pt-safe`  top padding (notch)
- `pl-safe`  left padding
- `pr-safe`  right padding

---

## Theming Pattern

All tokens are CSS variables in `:root` (light mode only). They're registered to Tailwind via `@theme inline` in `globals.css`, so components use semantic utility classes:

```jsx
// ✅ Correct  auto-updates when token changes
<div className="bg-surface text-text-primary border border-border">

// ❌ Wrong  hardcoded, bypasses theme
<div className="bg-white text-gray-900 border-gray-200">
```

---

## Legacy Aliases

For backward compatibility with Stage 2 upload screens (which use raw CSS variables), `globals.css` also defines `--nuskha-*` aliases that map to the semantic tokens above:

```css
--nuskha-surface: var(--color-surface);
--nuskha-primary: var(--color-primary);
--nuskha-on-surface: var(--color-text-primary);
/* ... etc ... */
```

These should be phased out as Stage 2 migrates to Tailwind classes. See `docs/current-state.md` for details.

---

## When Colors Change

1. Open `app/globals.css`
2. Update only the **hex values** in the `:root` block  **never rename variables**
3. Update values in **both** the `:root` block AND the `@theme inline` block if they're both listed
4. Restart dev server so Tailwind picks up the change
5. No component code changes needed if semantic tokens are used correctly
6. Update this file with the new values

---

## Accessibility

- **Contrast ratios:** All text meets WCAG AA (4.5:1 minimum)
- **Color-only:** Never convey status via color alone  always pair with icons or labels
- **Reduced motion:** Transitions respect `prefers-reduced-motion` via Tailwind defaults

---

## Examples

### Primary Action Button

```jsx
<button className="bg-primary text-text-inverse rounded-lg px-4 py-2 font-medium hover:bg-primary-hover transition-colors">
  Save
</button>
```

### Card with Subtle Depth

```jsx
<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-border">
  <h3 className="text-lg font-semibold text-text-primary">Title</h3>
  <p className="text-sm text-text-secondary mt-1">Description</p>
</div>
```

### Alert / Side Effect Warning

```jsx
<div className="bg-tertiary-subtle rounded-xl px-4 py-3 border border-tertiary/20">
  <p className="text-sm font-medium text-tertiary">⚠ Possible side effect</p>
</div>
```

### Health / Success Indicator

```jsx
<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-teal-subtle text-teal text-sm font-medium">
  ✓ Normal
</span>
```
