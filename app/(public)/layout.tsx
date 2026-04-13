/**
 * (public) Route Group Layout — public / marketing pages
 *
 * Provides for all pages under /public:
 * - Sticky branded header with centred nav links + Sign In CTA
 * - Responsive side padding
 * - Full footer with links
 * - No authentication required
 */

import Link                                from 'next/link'
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
          middleSlot={
            <nav className="hidden sm:flex items-center gap-8" aria-label="Site navigation">
              <a
                href="/#features"
                className="text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Features
              </a>
              <a
                href="/#how-it-works"
                className="text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                How it works
              </a>
            </nav>
          }
          rightSlot={
            <div className="flex items-center gap-3">
              <Link
                href="/auth"
                className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/upload"
                className="hidden sm:inline-flex items-center h-9 px-5 bg-primary text-white rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Try Free
              </Link>
            </div>
          }
        />
      }
      footer={<PageFooter />}
    >
      {children}
    </PageLayout>
  )
}
