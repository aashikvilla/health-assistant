# Folder Structure

```
health-assistant/
│
├── app/                          # Next.js App Router — routing only
│   ├── (auth)/                   # Route group: public auth pages (no layout)
│   │   └── auth/
│   │       ├── page.tsx          # Sign in / Sign up
│   │       └── callback/
│   │           └── route.ts      # OAuth callback handler
│   ├── (dashboard)/              # Route group: protected pages (shared layout)
│   │   └── dashboard/
│   │       └── page.tsx
│   ├── api/                      # Route handlers (REST endpoints)
│   │   └── health/
│   │       └── route.ts
│   ├── actions.ts                # Server Actions (auth, mutations)
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home /
│   └── globals.css               # Design tokens + Tailwind base
│
├── components/                   # All React components
│   ├── ui/                       # ✦ Primitive UI library (theme-aware)
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Heading.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Section.tsx
│   │   ├── Accordion.tsx
│   │   ├── Spinner.tsx
│   │   └── index.ts              # Barrel export
│   ├── layout/                   # Structural layout components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   └── PageContainer.tsx
│   └── features/                 # Feature-specific compound components
│       └── <feature>/            # e.g. health/, appointments/, profile/
│
├── services/                     # Business logic — NO React, NO UI
│   └── <feature>.service.ts      # e.g. health.service.ts
│
├── hooks/                        # Custom React hooks
│   └── use<Name>.ts              # e.g. useCurrentUser.ts
│
├── lib/                          # Infrastructure & utilities
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   ├── server.ts             # Server Supabase client
│   │   └── middleware.ts         # Session refresh helper
│   └── utils/                    # Pure utility functions
│       └── format.ts             # Date, number, string formatters
│
├── types/                        # TypeScript types & interfaces
│   ├── index.ts                  # Barrel export
│   ├── user.ts
│   └── api.ts
│
├── constants/                    # App-wide constants — no magic strings
│   └── index.ts
│
├── docs/                         # Project documentation
│   ├── folder-structure.md       # This file
│   ├── coding-patterns.md        # Patterns & conventions
│   ├── architecture.md           # System architecture
│   └── design-system.md          # Colors, fonts, spacing (sync with design.md)
│
├── public/                       # Static assets
│
├── proxy.ts                      # Next.js proxy (route protection, session)
├── CLAUDE.md                     # AI assistant context (primary)
└── AGENTS.md                     # Agent-specific overrides
```

## Rules

- `app/` contains only routing, layouts, and server actions — no business logic
- `components/ui/` are purely presentational — no data fetching, no services
- `components/features/` may call hooks or receive server data via props
- `services/` are plain async functions — framework-agnostic
- `hooks/` wrap service calls with React state/lifecycle
- `lib/` is pure utility — no components, no services
- `types/` only exports types — no runtime code
- `constants/` only exports `const` values — no functions
