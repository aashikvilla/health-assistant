/**
 * (public) Route Group Layout  public / marketing pages
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
                href="/#how-it-works"
                className="text-sm font-semibold text-text-primary hover:text-primary transition-colors"
              >
                How it works
              </a>
              <a
                href="/#features"
                className="text-sm font-semibold text-text-primary hover:text-primary transition-colors"
              >
                For Families
              </a>
              <a
                href="#"
                className="text-sm font-semibold text-text-primary hover:text-primary transition-colors"
              >
                Privacy
              </a>
            </nav>
          }
          rightSlot={
            <div className="flex items-center gap-2.5">
              <Link
                href="/auth"
                className="text-sm font-semibold text-text-primary hover:text-primary transition-colors px-3.5 py-2"
              >
                Sign in
              </Link>
              <Link
                href="/upload"
                className="hidden sm:inline-flex items-center h-10 px-[22px] text-white rounded-full font-semibold text-sm hover:opacity-90 transition-all hover:-translate-y-[1px]"
                style={{
                  background: 'var(--hp-grad, var(--color-primary))',
                  boxShadow: '0 4px 16px rgba(168,85,247,.3)',
                }}
              >
                Open App
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
