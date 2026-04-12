/**
 * (public) Route Group Layout — unauthenticated pages
 *
 * Every route under app/(public)/ inherits this layout.
 * Features:
 * - No auth requirement
 * - Consistent header with optional login link
 * - Responsive side padding
 * - Footer
 *
 * Routes in this group:
 * - /               (home/marketing)
 * - /auth           (login)
 * - /upload         (unauthenticated document upload)
 */

import { PageLayout, PageHeader, PageFooter } from '@/components/layout'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PageLayout
      header={
        <PageHeader
          variant="brand"
          rightSlot={
            <a
              href="/auth"
              className="text-sm font-medium text-primary hover:text-primary-hover transition-colors px-3 py-1.5 rounded-lg hover:bg-primary-subtle"
            >
              Sign In
            </a>
          }
        />
      }
      footer={<PageFooter />}
    >
      {children}
    </PageLayout>
  )
}
