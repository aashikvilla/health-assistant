import { APP_NAME } from '@/constants'

/**
 * Unified page footer for all public pages and marketing routes.
 *
 * 5-column responsive layout:
 *   Brand | Product | Company | Legal | Newsletter
 *
 * Mobile: stacked 1-col → sm: 2-col → lg: full 5-col grid.
 *
 * NOT used inside authenticated routes — BottomNav handles navigation there.
 */

interface PageFooterProps {
  /** Show the full footer with links. Defaults to true. */
  showLinks?: boolean
}

export function PageFooter({ showLinks = true }: PageFooterProps) {
  const year = new Date().getFullYear()

  if (!showLinks) {
    return (
      <footer className="mt-auto border-t border-border-subtle bg-surface">
        <div className="px-4 sm:px-6 lg:px-8 py-6 text-center text-xs text-text-muted">
          <p>&copy; {year} {APP_NAME} — Family prescription manager</p>
        </div>
      </footer>
    )
  }

  return (
    <footer className="mt-auto bg-white" style={{ borderTop: '1px solid var(--hp-border, var(--color-border-subtle))' }}>
      <div className="max-w-[1120px] mx-auto px-4 sm:px-10 pt-12 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1.6fr] gap-8 sm:gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-[7px] mb-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: 'var(--hp-grad, var(--color-primary))', boxShadow: '0 0 12px rgba(168,85,247,.5)' }}
              />
              <span className="font-display font-extrabold text-[1.1rem]" style={{ color: 'var(--hp-text, var(--color-text-primary))' }}>
                {APP_NAME}
              </span>
            </div>
            <p className="text-[.82rem] leading-relaxed" style={{ color: 'var(--hp-text-m, var(--color-text-muted))' }}>
              Built by people who got confused<br />by medical jargon too.
            </p>
          </div>

          {/* Product */}
          <FooterCol title="Product">
            <FooterLink href="/#features">Features</FooterLink>
            <FooterLink href="/#how-it-works">How it works</FooterLink>
            <FooterLink href="/upload">Try Upload</FooterLink>
          </FooterCol>

          {/* Company */}
          <FooterCol title="Company">
            <FooterLink href="#">About</FooterLink>
            <FooterLink href="#">Blog</FooterLink>
            <FooterLink href="#">Contact</FooterLink>
          </FooterCol>

          {/* Legal */}
          <FooterCol title="Legal">
            <FooterLink href="#">Privacy Policy</FooterLink>
            <FooterLink href="#">Terms</FooterLink>
            <FooterLink href="#">Data Protection</FooterLink>
          </FooterCol>

          {/* Newsletter */}
          <div>
            <p className="text-[.73rem] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--hp-text, var(--color-text-primary))' }}>
              Stay Updated
            </p>
            <p className="text-[.78rem] mb-2.5" style={{ color: 'var(--hp-text-m, var(--color-text-muted))' }}>
              Health tips + new features. No spam.
            </p>
            <form className="flex gap-1.5" action="#">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 h-[38px] px-3 rounded-[10px] text-[.8rem] outline-none font-body"
                style={{
                  border: '1px solid var(--hp-border, var(--color-border-subtle))',
                  background: 'var(--hp-surface, var(--color-surface-subtle))',
                }}
              />
              <button
                type="submit"
                className="h-[38px] px-3.5 rounded-[10px] text-[.78rem] font-semibold text-white border-none transition-opacity hover:opacity-85"
                style={{ background: 'var(--hp-grad, var(--color-primary))' }}
              >
                Go
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-[.78rem]"
          style={{ borderTop: '1px solid var(--hp-border, var(--color-border-subtle))', color: 'var(--hp-text-m, var(--color-text-muted))' }}
        >
          <span>&copy; {year} {APP_NAME}. All rights reserved.</span>
          <span>Made by people who got confused by medical jargon too.</span>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-[.73rem] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--hp-text, var(--color-text-primary))' }}>
        {title}
      </h4>
      <div className="flex flex-col gap-2">
        {children}
      </div>
    </div>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="text-[.82rem] text-text-secondary hover:text-primary transition-colors"
    >
      {children}
    </a>
  )
}
