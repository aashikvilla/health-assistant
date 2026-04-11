import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Manrope } from 'next/font/google'
import { ServiceWorkerRegistration } from '@/components/layout/ServiceWorkerRegistration'
import { PWAInstallBanner } from '@/components/layout/PWAInstallBanner'
import './globals.css'

// ─── Fonts ────────────────────────────────────────────────────────────────────
// Plus Jakarta Sans — headlines & display (authoritative, open)
// Manrope — body & labels (highly legible at small sizes, great for data)

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0058bd' },
    { media: '(prefers-color-scheme: dark)',  color: '#002d60' },
  ],
}

export const metadata: Metadata = {
  title: {
    default:  'Nuskha',
    template: '%s | Nuskha',
  },
  description: 'Upload, understand, and manage your family\'s prescriptions with AI',
  applicationName: 'Nuskha',
  keywords: ['health', 'prescription', 'medicine', 'family', 'medical records'],
  manifest: '/manifest.webmanifest',

  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Nuskha',
  },

  openGraph: {
    type: 'website',
    siteName: 'Nuskha',
    title: 'Nuskha — Family Prescription Manager',
    description: 'Upload, understand, and manage your family\'s prescriptions with AI',
  },

  icons: {
    icon:  [{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/icons/icon-152.png', sizes: '152x152', type: 'image/png' }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-surface text-text-primary">
        <ServiceWorkerRegistration />
        <PWAInstallBanner />
        {children}
      </body>
    </html>
  )
}
