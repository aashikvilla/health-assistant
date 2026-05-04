/**
 * (public) Route Group Layout  public / marketing pages
 *
 * Provides for all pages under /public:
 * - Sticky branded header with centred nav links + Sign In CTA
 * - Responsive side padding
 * - Full footer with links
 * - No authentication required
 */

import Link                        from 'next/link'
import { PageLayout, PageHeader } from '@/components/layout'

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
            <Link
              href="/auth"
              className="text-sm font-semibold text-text-primary hover:text-primary transition-colors px-3.5 py-2"
            >
              Sign in
            </Link>
          }
        />
      }
      footer={null}
    >
      {children}
    </PageLayout>
  )
}
