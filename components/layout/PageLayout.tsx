import React from 'react'

/**
 * Unified page layout wrapper for all pages (public & authenticated).
 *
 * Provides:
 * - Consistent header with glassmorphism and safe-area support
 * - Main content area with responsive side padding
 * - Optional footer
 * - Mobile-first responsive design (375px → desktop)
 *
 * Usage:
 * ```tsx
 * <PageLayout
 *   header={<PageHeader variant="brand" rightSlot={<LogoutButton />} />}
 *   footer={<PageFooter />}
 * >
 *   {children}
 * </PageLayout>
 * ```
 */

interface PageLayoutProps {
  /** Header component (required)  typically <PageHeader /> */
  header: React.ReactNode
  /** Main content  wrapped with proper padding */
  children: React.ReactNode
  /** Optional footer component */
  footer?: React.ReactNode
  /** Optional class name for the main content area */
  className?: string
}

export function PageLayout({
  header,
  children,
  footer,
  className = '',
}: PageLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-surface text-text-primary">
      {/* Header */}
      {header}

      {/* Main content  responsive side padding */}
      {/*
        Mobile: px-4 (16px sides) on 375px phone = 343px content width
        Tablet (sm: 640px): px-6 (24px sides)
        Desktop (lg: 1024px): max-w-5xl + mx-auto centers content
      */}
      <main className={`flex-1 w-full ${className}`}>
        <div className="px-4 sm:px-6 lg:px-8 w-full">
          {children}
        </div>
      </main>

      {/* Footer */}
      {footer}
    </div>
  )
}
