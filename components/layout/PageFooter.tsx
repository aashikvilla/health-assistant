import { APP_NAME } from '@/constants'

/**
 * Unified page footer for all public pages and marketing routes.
 *
 * Features:
 * - Responsive layout (mobile → desktop)
 * - Semantic color tokens
 * - Mobile-first padding
 *
 * NOT used inside authenticated routes — BottomNav handles navigation there.
 *
 * Usage:
 * ```tsx
 * <PageLayout
 *   header={<PageHeader variant="brand" />}
 *   footer={<PageFooter />}
 * >
 *   {children}
 * </PageLayout>
 * ```
 */

interface PageFooterProps {
  /** Show the full footer with links. Defaults to true. */
  showLinks?: boolean
}

export function PageFooter({ showLinks = true }: PageFooterProps) {
  const year = new Date().getFullYear()

  if (!showLinks) {
    // Slim footer — just copyright
    return (
      <footer className="mt-auto border-t border-border-subtle bg-surface">
        <div className="px-4 sm:px-6 lg:px-8 py-6 text-center text-xs text-text-muted">
          <p>&copy; {year} {APP_NAME} — Family prescription manager</p>
        </div>
      </footer>
    )
  }

  // Full footer with navigation and company info
  return (
    <footer className="mt-auto border-t border-border-subtle bg-surface-subtle">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Footer content with responsive grid */}
        <div className="py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand column */}
          <div>
            <h3 className="font-bold text-text-primary mb-2">{APP_NAME}</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Making health information accessible and understandable for everyone.
            </p>
          </div>

          {/* Product links */}
          <div>
            <h4 className="font-semibold text-text-primary text-sm mb-4 uppercase tracking-wide">
              Product
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/upload"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Try Upload
                </a>
              </li>
              <li>
                <a
                  href="/#features"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="/auth"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Sign In
                </a>
              </li>
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="font-semibold text-text-primary text-sm mb-4 uppercase tracking-wide">
              Company
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h4 className="font-semibold text-text-primary text-sm mb-4 uppercase tracking-wide">
              Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Privacy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Terms
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Security
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="border-t border-border-subtle pt-6 pb-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-text-muted">
            &copy; {year} {APP_NAME}. All rights reserved.
          </p>
          <p className="text-xs text-text-muted">Made with care for your health.</p>
        </div>
      </div>
    </footer>
  )
}
