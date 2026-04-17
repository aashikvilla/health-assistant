# Unified Layout System

## How It Works

All pages automatically get a consistent header, responsive padding, and footer through Next.js route group layouts.

### Public Pages (`/`, `/auth`, `/upload`)
- Header: Logo + app name
- Footer: Links + company info
- Padding: Responsive (mobile → tablet → desktop)

### Authenticated Pages (`/dashboard`, `/settings`, `/timeline`, etc.)
- Header: Logo + app name + logout button
- Footer: None (BottomNav on mobile)
- Padding: Responsive
- Auth: Required (redirects to /auth if not logged in)

## For Developers

### Pages inherit layout automatically
No component imports or setup needed in pages. Just write your page content - the header, padding, and footer are applied by the layout.

### If you need an inner header/title on a sub-page
Add it as part of your page content:

```tsx
// app/(app)/dashboard/add-member/page.tsx
export default function AddMemberPage() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Add Family Member</h1>
      {/* form content */}
    </>
  )
}
```

The main header (with logo + logout) stays at the top. Your page content goes below it.

## Layout Files

- `app/(public)/layout.tsx`  Wraps public pages
- `app/(app)/layout.tsx`  Wraps authenticated pages
- `components/layout/PageLayout.tsx`  Main wrapper (responsive padding)
- `components/layout/PageHeader.tsx`  Header with logo
- `components/layout/PageFooter.tsx`  Footer

## Color & Styling

All components use semantic color tokens from `app/globals.css`. Edit there to change colors globally - all pages update automatically.

---

**That's it!** No per-page changes needed. All pages use the unified layout.
