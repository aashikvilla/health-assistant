# Requirements Document

## Introduction

Vitae currently has two divergent color palettes living side-by-side: the "Clinical Curator" palette (`#0058bd` primary blue) defined in `app/globals.css`, and the "Digital Health" palette (`#1d4ed8` blue, `#a855f7` violet, `#ec4899` pink) duplicated across `app/homepage.css` (`.hp {}` block) and `app/(auth)/auth/auth.css` (`.ap {}` block). Feature components add a third divergence point through 60+ hardcoded hex values in inline `style={{}}` props. Additionally, several reusable UI patterns are duplicated across pages rather than extracted into shared components, and existing `components/ui/` primitives (Button, Badge, Input, Card) are bypassed in favor of raw HTML elements.

This feature unifies the design system by: (1) making `globals.css` the single source of truth for all color tokens, (2) adding gradient utility classes, (3) migrating all feature components to semantic Tailwind tokens, (4) extracting five repeated UI patterns into reusable components, (5) replacing raw HTML elements with existing UI primitives, and (6) removing dead layout components.

---

## Glossary

- **Token_System**: The CSS custom property and Tailwind `@theme inline` configuration defined in `app/globals.css`
- **Digital_Health_Palette**: The canonical color palette with primary `#1d4ed8`, violet `#a855f7`, and pink `#ec4899`
- **Gradient_Utilities**: Named CSS utility classes (`.gradient-brand`, `.gradient-brand-full`, `.gradient-hero`, `.gradient-cta-box`) defined in `globals.css`
- **Feature_Component**: Any file under `components/features/` or an `app/(app)/` page file
- **UI_Primitive**: Any component exported from `components/ui/` (Button, Badge, Card, Input, Heading, etc.)
- **Dead_Code**: Layout component files that are imported in `components/layout/index.ts` but never rendered in any page or layout
- **GradientHeroHeader**: A new shared component rendering the full-bleed gradient hero section with nav bar, greeting, and stat pills — currently duplicated across dashboard, timeline, settings, and add-member pages
- **PageHeader**: A new shared component rendering a sticky back-nav bar with title and optional action — currently duplicated across records/[id], explanation/[id], upload/[profileId], and add-member pages
- **EmptyState**: A new shared component rendering an icon + heading + description + CTA — currently duplicated across timeline, dashboard, and EmptyPrescriptions
- **SectionHeader**: A new shared component rendering an uppercase label with optional count and optional action link — currently duplicated 6+ times across pages
- **ListItem**: A new shared component rendering an icon container + title + subtitle + right badge/action — currently duplicated across PrescriptionListItem, settings, and LabAlertCard rows

---

## Requirements

### Requirement 1: Token Unification — globals.css as Single Source of Truth

**User Story:** As a developer, I want all color tokens defined once in `globals.css`, so that changing a color value propagates everywhere without hunting through multiple CSS files.

#### Acceptance Criteria

1. THE Token_System SHALL define every color value exactly once in the `globals.css :root` block — no color hex value SHALL appear in more than one CSS file's variable block.
2. WHEN a Tailwind utility class `bg-X`, `text-X`, or `border-X` is used in any component, THE Token_System SHALL have a corresponding `--color-X` entry in both `:root` and `@theme inline`.
3. WHEN globals.css is updated with new tokens, THE Token_System SHALL mirror every `:root` token in the `@theme inline` block with the pattern `--color-X: var(--color-X)`.
4. THE Token_System SHALL add the following new tokens to both `:root` and `@theme inline`: `--color-accent` (`#9333ea`), `--color-accent-hover` (`#7c3aed`), `--color-accent-subtle` (`#f3e8ff`), `--color-accent-foreground` (`#ffffff`), `--color-violet` (`#a855f7`), `--color-violet-subtle` (`#f3e8ff`), `--color-pink` (`#ec4899`), `--color-pink-subtle` (`#fce7f3`).
5. THE Token_System SHALL update the existing primary token values to the Digital Health palette: `--color-primary` to `#1d4ed8`, `--color-primary-hover` to `#1e40af`, `--color-primary-subtle` to `#dbeafe`.
6. THE Token_System SHALL update surface and typography tokens to match the Digital Health palette: `--color-surface` to `#f8f9ff`, `--color-surface-subtle` to `#f2f3ff`, `--color-text-primary` to `#07071a`, `--color-text-secondary` to `#16163a`, `--color-text-muted` to `#3b3b62`.
7. THE Token_System SHALL update border tokens to violet-tinted values: `--color-border` to `rgba(168,85,247,0.13)`, `--color-border-subtle` to `rgba(168,85,247,0.08)`, `--color-border-strong` to `rgba(168,85,247,0.25)`.

---

### Requirement 2: Gradient Utility Classes

**User Story:** As a developer, I want named CSS gradient classes defined in `globals.css`, so that multi-stop gradients are defined once and applied via `className` rather than repeated inline `style={{}}` strings.

#### Acceptance Criteria

1. THE Gradient_Utilities SHALL define the following four CSS classes in `globals.css`: `.gradient-brand`, `.gradient-brand-full`, `.gradient-hero`, and `.gradient-cta-box`.
2. WHEN a gradient utility class is defined, THE Gradient_Utilities SHALL reference CSS custom properties (`var(--color-*)`) rather than hardcoded hex values, except for the dark base stop `#0f0f2d` in `.gradient-hero` and the dark stops in `.gradient-cta-box` which have no token equivalent.
3. WHEN a page renders a gradient hero section, THE page SHALL apply the `gradient-hero` CSS class to the hero container element rather than an inline `style` prop containing a `linear-gradient` value.

---

### Requirement 3: Strip Color Variables from homepage.css and auth.css

**User Story:** As a developer, I want `homepage.css` and `auth.css` to contain only animations and layout rules, so that color definitions are not duplicated outside `globals.css`.

#### Acceptance Criteria

1. WHEN homepage.css is migrated, THE homepage.css SHALL contain zero CSS custom property definitions (lines matching `--[a-z]`) inside the `.hp {}` block.
2. WHEN auth.css is migrated, THE auth.css SHALL contain zero CSS custom property definitions inside the `.ap {}` block.
3. WHEN a `var(--X)` reference appears in homepage.css or auth.css after migration, THE reference SHALL resolve to a token defined in `globals.css :root` — no `var()` reference SHALL point to a locally-defined variable.
4. WHEN homepage.css is migrated, THE homepage.css SHALL retain all `@keyframes` animation definitions and layout/component-specific style rules unchanged.
5. WHEN auth.css is migrated, THE auth.css SHALL retain all `@keyframes` animation definitions and component-specific style rules unchanged.

---

### Requirement 4: Feature Component Token Migration

**User Story:** As a developer, I want all feature components to use Tailwind utility classes for colors, so that no component has hardcoded hex values in `style={{}}` props.

#### Acceptance Criteria

1. WHEN a feature component renders a color, THE component SHALL express it via a Tailwind utility class rather than a hardcoded hex value in a `style` prop — the only permitted exceptions are intentional brand gradient endpoints used inside `.gradient-*` class definitions.
2. THE ProfileChip_Component SHALL use `text-primary` and `gradient-brand` for the active state ring and label, and `bg-surface-subtle` and `text-text-muted` for the inactive state — replacing all inline `#1d4ed8`, `#7c3aed`, `#c026d3`, `#64748b`, and `#f1f4fb` values.
3. THE RecordCard_Component SHALL use `text-primary` and `text-teal` for prescription and lab report type indicators respectively, and `bg-primary-subtle` and `bg-teal-subtle` for icon backgrounds — replacing all inline `#1d4ed8`, `#7c3aed`, `#0d9488`, and `#0891b2` values.
4. THE LabAlertCard_Component SHALL use `bg-error-subtle`, `text-error`, `bg-warning-subtle`, and `text-warning` for status indicator badges — the gradient header backgrounds for critical and warning states MAY remain as inline styles as intentional brand moments.
5. THE MedicationCard_Component SHALL replace the hardcoded `PALETTES` array with token-based values using `--color-primary-subtle`, `--color-teal-subtle`, `--color-warning-subtle`, `--color-pink-subtle`, `--color-accent-subtle`, and their corresponding text tokens.
6. THE ReviewScreen_Component SHALL replace the hardcoded `MED_ACCENTS` array with token-based values using `var(--color-primary)`, `var(--color-teal)`, `var(--color-accent-hover)`, `var(--color-warning)`, `var(--color-tertiary)`, and `var(--color-success)`.
7. THE dashboard_page SHALL replace the inline `linear-gradient(135deg, #0f0f2d 0%, #1d4ed8 45%, #7c3aed 80%, #c026d3 100%)` style prop with the `gradient-hero` CSS class.
8. THE add_member_page SHALL replace all inline gradient and color style props with Tailwind utility classes or Gradient_Utilities classes.
9. THE timeline_page SHALL replace all inline gradient and color style props with Tailwind utility classes or Gradient_Utilities classes.
10. THE settings_page SHALL replace all inline gradient and color style props with Tailwind utility classes or Gradient_Utilities classes.

---

### Requirement 5: New Reusable Components

**User Story:** As a developer, I want shared components for repeated UI patterns, so that the same gradient hero, page header, empty state, section header, and list item are not re-implemented on every page.

#### Acceptance Criteria

1. THE GradientHeroHeader_Component SHALL accept `title`, `subtitle`, `stats` (array of `{ num, label }`), and `navAction` (optional back button or sign-out button) props, and SHALL render a full-bleed gradient hero section using the `gradient-hero` CSS class.
2. THE GradientHeroHeader_Component SHALL render the `stats` array as pill-shaped stat cards with a frosted-glass background (`rgba(255,255,255,.13)`) inside the hero.
3. THE PageHeader_Component SHALL accept `title`, `backHref`, and optional `action` (label + onClick or href) props, and SHALL render a sticky navigation bar with a back-chevron button and the title.
4. THE EmptyState_Component SHALL accept `icon` (ReactNode), `heading`, `description`, and `ctaLabel` with `ctaHref` or `ctaOnClick` props, and SHALL render all four elements in a centered column layout.
5. THE SectionHeader_Component SHALL accept `label`, optional `count`, and optional `action` (`{ label, href }`) props, and SHALL render the label in uppercase with `tracking-widest` styling, the count inline, and the action as a right-aligned link.
6. THE ListItem_Component SHALL accept `icon` (ReactNode), `title`, `subtitle`, and optional `badge` (ReactNode) props, and SHALL render them in a horizontal row with the icon on the left and the badge on the right.
7. WHEN GradientHeroHeader is rendered with any valid props, THE component SHALL apply the `gradient-hero` CSS class to its root container element.
8. WHEN EmptyState is rendered with all four required props, THE rendered output SHALL contain the heading text, description text, and a CTA element.
9. WHEN SectionHeader is rendered with only a label, THE rendered output SHALL contain the label text and SHALL NOT render a count or action element.
10. WHEN SectionHeader is rendered with a label and count, THE rendered output SHALL contain both the label text and the count value.
11. THE dashboard_page, timeline_page, settings_page, and add_member_page SHALL each replace their manually-built gradient hero sections with the GradientHeroHeader component.
12. THE records_detail_page, explanation_detail_page, upload_page, and add_member_page SHALL each replace their manually-built sticky nav bars with the PageHeader component.

---

### Requirement 6: Replace Raw HTML Elements with UI Primitives

**User Story:** As a developer, I want all interactive elements and form controls to use the existing `components/ui/` primitives, so that styling, accessibility, and behavior are consistent across the app.

#### Acceptance Criteria

1. WHEN a `<button>` element is used in `add-member/page.tsx` or `ReviewScreen.tsx` for a primary or secondary action, THE page SHALL replace it with the `Button` component from `components/ui`, passing the appropriate `variant` and `size` props.
2. WHEN a `<input type="text">` element is used in `AddMemberForm.tsx` or `EditProfileForm.tsx`, THE form SHALL replace it with the `Input` component from `components/ui`.
3. WHEN a badge is manually constructed with inline `px-2 py-0.5 rounded-full` styling in `PrescriptionListItem.tsx` or `LabAlertCard.tsx`, THE component SHALL replace it with the `Badge` component from `components/ui`, passing the appropriate `variant` prop.
4. WHEN a card container is manually constructed with `rounded-2xl bg-white` and a `boxShadow` style prop in a page file, THE page SHALL replace it with the `Card` component from `components/ui`, passing the appropriate `variant` prop.
5. WHEN the `Button` component is used as a replacement, THE component SHALL preserve all existing `aria-label`, `disabled`, and `onClick` attributes from the replaced `<button>` element.
6. WHEN the `Input` component is used as a replacement, THE component SHALL preserve all existing `placeholder`, `value`, `onChange`, and `type` attributes from the replaced `<input>` element.

---

### Requirement 7: Remove Dead Layout Components

**User Story:** As a developer, I want unused layout components removed from the codebase, so that the `components/layout/` directory contains only components that are actually rendered.

#### Acceptance Criteria

1. THE Dead_Code_Removal SHALL delete the following files from `components/layout/`: `PageHeader.tsx`, `PageFooter.tsx`, `AppHeader.tsx`, and `AppFooter.tsx`.
2. WHEN `components/layout/index.ts` is updated, THE index SHALL not export `PageHeader`, `PageFooter`, `AppHeader`, or `AppFooter`.
3. WHEN `app/(app)/layout.tsx` imports from `@/components/layout`, THE import SHALL not include `PageHeader` or `LogoutButton` (which are currently imported but unused per TypeScript diagnostics).
4. IF any file outside `components/layout/index.ts` imports a deleted component, THEN THE import SHALL be removed or replaced before the file is deleted.

---

### Requirement 8: Visual Continuity

**User Story:** As a user, I want the app to look identical after the design system migration, so that the refactor does not introduce any visible regressions.

#### Acceptance Criteria

1. WHEN the homepage (`app/page.tsx`) is rendered after migration, THE page SHALL appear visually identical to its pre-migration state — the `.hp` scoped styles SHALL continue to apply, with color variables now resolved from `globals.css` tokens.
2. WHEN the auth page is rendered after migration, THE page SHALL appear visually identical to its pre-migration state — the `.ap` scoped styles SHALL continue to apply, with color variables now resolved from `globals.css` tokens.
3. WHEN the dashboard page is rendered after migration, THE gradient hero SHALL display the Digital Health palette (dark navy → blue → violet → pink) matching the pre-migration inline gradient.
4. WHEN any feature component is rendered after token migration, THE component SHALL display colors that are perceptually equivalent to the pre-migration hardcoded hex values.
