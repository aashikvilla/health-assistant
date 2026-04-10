# Design System

> **Status: PLACEHOLDER**
> This file will be populated once design.md is finalised.
> When ready: sync values here → update CSS variables in `app/globals.css` → done.

---

## Current Placeholder Palette (emerald/teal)

Used until design.md is delivered. Do not build permanent UI around these values — use semantic tokens (`bg-primary`, not `bg-emerald-600`).

| Token | Current Value | Purpose |
|---|---|---|
| `--color-primary` | `#059669` (emerald-600) | Primary actions, links |
| `--color-primary-hover` | `#047857` (emerald-700) | Hover state |
| `--color-surface` | `#ffffff` | Page background |
| `--color-surface-subtle` | `#f9fafb` | Card/section backgrounds |
| `--color-text-primary` | `#111827` | Body text |
| `--color-text-secondary` | `#4b5563` | Secondary text |
| `--color-text-muted` | `#9ca3af` | Placeholders, labels |
| `--color-border` | `#e5e7eb` | Dividers, input borders |
| `--color-error` | `#ef4444` | Error states |
| `--color-success` | `#10b981` | Success states |
| `--color-warning` | `#f59e0b` | Warning states |
| `--color-info` | `#3b82f6` | Info states |

---

## When design.md Arrives

1. Open `app/globals.css`
2. Update CSS variable values under `:root` — **only the hex values, not the variable names**
3. Dark mode tokens under `@media (prefers-color-scheme: dark)` if applicable
4. Update this file with final values
5. No component changes needed if semantic tokens were used correctly

---

## Typography (TBD)

- Font family: `var(--font-sans)` → Geist Sans (placeholder)
- Mono: `var(--font-mono)` → Geist Mono
- Scale: defined by Tailwind defaults

## Spacing (TBD)

Using Tailwind defaults (4px grid).

## Radius (TBD)

| Token | Value |
|---|---|
| `--radius-sm` | 6px |
| `--radius-md` | 8px |
| `--radius-lg` | 12px |
| `--radius-xl` | 16px |
| `--radius-2xl` | 20px |
