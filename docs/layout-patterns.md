# Layout Patterns — Unified Header, Footer, Responsive Padding

> **Last updated:** April 2026
> **Status:** New standard for all pages (public, authenticated, special routes)

This document explains the unified layout system introduced to provide consistent headers, footers, and responsive side padding across all pages.

---

## Overview

The layout system consists of three core components:

1. **`PageLayout`** — Main wrapper providing structure (header, content, footer)
2. **`PageHeader`** — Sticky, glassmorphic header with multiple variants
3. **`PageFooter`** — Responsive footer with optional navigation links

### Key Features

- ✅ **Mobile-first design** — Base styles for 375px phones, responsive up
- ✅ **Semantic colors** — Uses design system tokens (`bg-surface`, `text-text-primary`, etc.)
- ✅ **Responsive padding** — Side padding adjusts per breakpoint:
  - Mobile: `px-4` (16px each side)
  - Tablet (sm): `px-6` (24px each side)
  - Desktop (lg): `px-8` (32px each side)
- ✅ **Flexible auth buttons** — Login/logout button can be different per page
- ✅ **Safe area support** — Respects notched phones (iPhone X+, Android with cutouts)
- ✅ **Glassmorphic header** — Sticky header with frosted-glass effect

---

## Components

### PageLayout

Main layout wrapper. Should wrap the entire page content.

**Props:**
- `header: React.ReactNode` — Header component (typically `<PageHeader />`)
- `children: React.ReactNode` — Page content
- `footer?: React.ReactNode` — Optional footer (typically `<PageFooter />`)
- `className?: string` — Optional class for main content area

**Usage:**

```tsx
import { PageLayout, PageHeader, PageFooter } from '@/components/layout'

export default function MyPage() {
  return (
    <PageLayout
      header={<PageHeader variant="brand" />}
      footer={<PageFooter />}
    >
      {/* Page content here — padding handled automatically */}
      <h1>Welcome</h1>
      <p>This content has automatic responsive side padding.</p>
    </PageLayout>
  )
}
```

---

### PageHeader

Sticky header with three variants.

**Props:**
- `variant?: 'brand' | 'page' | 'minimal'` — Header style (default: `'brand'`)
- `title?: string` — Page title (required when `variant === 'page'`)
- `backHref?: string` — Back button destination (default: `/dashboard`)
- `rightSlot?: React.ReactNode` — Right-aligned content (login, logout, notifications, etc.)

**Variants:**

#### 1. Brand Variant — Home/Hub Pages

Shows app name/logo. Use on home page, dashboard hub, etc.

```tsx
<PageHeader
  variant="brand"
  rightSlot={<LogoutButton />}
/>
```

Renders:
```
[Nuskha]                           [Sign Out]
```

#### 2. Page Variant — Sub-pages with Back Button

Shows back arrow + page title. Use on detail pages, forms, etc.

```tsx
<PageHeader
  variant="page"
  title="Add Family Member"
  backHref="/dashboard"
  rightSlot={<SaveButton />}
/>
```

Renders:
```
[←] Add Family Member              [Save]
```

#### 3. Minimal Variant — Auth/Focused Pages

Empty left side, only right slot. Use on login, auth pages, focused flows.

```tsx
<PageHeader
  variant="minimal"
  rightSlot={<SignUpLink />}
/>
```

Renders:
```
                                   [Create Account]
```

---

### PageFooter

Responsive footer with optional link sections.

**Props:**
- `showLinks?: boolean` — Show full footer with product/company/legal links (default: `true`)

**With links (default):**

```tsx
<PageFooter />
```

Renders a 4-column footer (1 column on mobile, 2 on tablet, 4 on desktop) with:
- Brand section
- Product links (Upload, Features, Sign In)
- Company links (About, Blog, Contact)
- Legal links (Privacy, Terms, Security)

**Minimal footer (no links):**

```tsx
<PageFooter showLinks={false} />
```

Just shows copyright line.

---

## Patterns

### Pattern 1: Public Marketing Page

```tsx
// app/(public)/pricing/page.tsx

import { PageLayout, PageHeader, PageFooter } from '@/components/layout'

export const metadata = {
  title: 'Pricing — Nuskha',
}

export default function PricingPage() {
  return (
    <PageLayout
      header={
        <PageHeader
          variant="brand"
          rightSlot={
            <a href="/auth" className="text-sm font-medium text-primary">
              Sign In
            </a>
          }
        />
      }
      footer={<PageFooter />}
    >
      <h1 className="text-3xl font-bold text-text-primary mb-6">Pricing</h1>
      {/* Your pricing content here — side padding is automatic */}
    </PageLayout>
  )
}
```

### Pattern 2: Authenticated Hub/Home

```tsx
// app/(app)/dashboard/page.tsx

import { PageLayout, PageHeader } from '@/components/layout'
import { LogoutButton } from '@/components/layout'

export const metadata = {
  title: 'Family Hub — Nuskha',
}

export default function DashboardPage() {
  return (
    <PageLayout
      header={
        <PageHeader
          variant="brand"
          rightSlot={<LogoutButton />}
        />
      }
      footer={null} // No footer on authenticated routes (BottomNav handles nav)
    >
      <h1 className="text-2xl font-bold mb-6">Family Health Hub</h1>
      {/* Dashboard content */}
    </PageLayout>
  )
}
```

### Pattern 3: Authenticated Sub-page with Form

```tsx
// app/(app)/dashboard/add-member/page.tsx

import { PageLayout, PageHeader } from '@/components/layout'

export default function AddMemberPage() {
  return (
    <PageLayout
      header={
        <PageHeader
          variant="page"
          title="Add Family Member"
          backHref="/dashboard"
        />
      }
    >
      <form className="max-w-2xl space-y-6">
        {/* Form fields — all inherit the page padding */}
      </form>
    </PageLayout>
  )
}
```

### Pattern 4: Auth Page (Login/Signup)

```tsx
// app/(public)/auth/page.tsx

import { PageLayout, PageHeader } from '@/components/layout'

export default function AuthPage() {
  return (
    <PageLayout
      header={<PageHeader variant="minimal" />}
      footer={<PageFooter showLinks={false} />}
    >
      <div className="max-w-md mx-auto py-12">
        {/* Login form */}
      </div>
    </PageLayout>
  )
}
```

---

## Responsive Behavior

### Mobile (375px–639px)

- Header height: 56px (h-14)
- Side padding: `px-4` (16px each side)
- Content width: 343px
- Bottom nav visible (primary routes only)

### Tablet (640px–1023px)

- Header height: 56px (same)
- Side padding: `px-6` (24px each side)
- Bottom nav hidden (hidden by `sm:hidden` class)

### Desktop (1024px+)

- Header height: 56px (same)
- Side padding: `px-8` (32px each side)
- No bottom nav
- Content may be centered with max-width

---

## Customization

### Custom Right Slot (Login/Logout)

The `rightSlot` prop accepts any React node. Examples:

```tsx
// Simple link
rightSlot={<a href="/auth" className="text-primary">Sign In</a>}

// Button component
rightSlot={<LogoutButton />}

// Multiple items
rightSlot={
  <div className="flex items-center gap-2">
    <NotificationBell />
    <LogoutButton />
  </div>
}

// Nothing (omit prop)
// Header will just show the left side
```

### Custom Content Container

If you need max-width constraints beyond the standard padding:

```tsx
<PageLayout header={<PageHeader ... />} footer={<PageFooter />}>
  <div className="max-w-4xl mx-auto">
    {/* Centered content with max-width */}
  </div>
</PageLayout>
```

### Custom Styling

The main content area can accept custom classes:

```tsx
<PageLayout
  header={<PageHeader ... />}
  className="py-12 sm:py-20" // Custom vertical padding
>
  {/* Content */}
</PageLayout>
```

---

## Safe Area Support

The header automatically respects safe areas (notches, home indicators):

```tsx
// Automatically handled
<PageHeader variant="brand" />

// Renders:
// <header className="pt-safe">
//   ...
// </header>
```

This applies `padding-top: var(--safe-area-inset-top)` on devices with notches, so the header doesn't hide behind the cutout.

---

## Color Tokens

All layout components use semantic color tokens (from `design-system.md`):

| Element | Token |
|---------|-------|
| Background | `bg-surface` |
| Text | `text-text-primary` |
| Header border | `border-border-subtle` |
| Footer background | `bg-surface-subtle` |
| Footer text | `text-text-secondary` |

**To change colors globally:**
1. Edit `app/globals.css` — update the CSS variable value
2. No component changes needed
3. All pages update automatically

---

## Migration Checklist

To migrate a page to use the new layout system:

- [ ] Import `PageLayout`, `PageHeader`, `PageFooter` from `@/components/layout`
- [ ] Wrap page content with `<PageLayout>`
- [ ] Add `<PageHeader>` with appropriate variant
- [ ] Choose header variant: `brand` (home), `page` (sub-page), `minimal` (auth)
- [ ] Add `rightSlot` if page needs login/logout/actions
- [ ] Add `<PageFooter />` for public pages (omit for authenticated)
- [ ] Remove old custom header/footer code
- [ ] Test on mobile (375px), tablet (640px), desktop (1024px+)
- [ ] Verify footer doesn't overlap BottomNav on authenticated routes

---

## FAQ

**Q: Should I use this for all pages?**

A: Yes. Even pages with custom styling can benefit from the structure. You can override the header or footer if needed, but the `PageLayout` structure ensures consistency.

**Q: Do authenticated pages need a footer?**

A: No. Omit the `footer` prop. The BottomNav handles navigation on mobile, and a footer would compete for space.

**Q: Can I have a different header style per page?**

A: Yes. Each page can use any variant (`brand`, `page`, `minimal`) with different `rightSlot` content.

**Q: How do I add a custom navigation bar?**

A: You can still use custom headers as the `header` prop, or customize `PageHeader` with `rightSlot` for most cases.

**Q: Does this work with dynamic routing?**

A: Yes. Import `PageLayout` in any layout or page file (server or client). The structure is flexible.

---

## See Also

- `design-system.md` — Color tokens, typography, spacing
- `app/globals.css` — CSS variables and Tailwind theme
- `components/layout/` — Source code for all layout components
