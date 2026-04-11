import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Plus_Jakarta_Sans, Manrope } from 'next/font/google'
import { ServiceWorkerRegistration } from '@/components/layout/ServiceWorkerRegistration'
import { PWAInstallBanner } from '@/components/layout/PWAInstallBanner'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

const jakartaSans = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  display: 'swap',
})

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  display: 'swap',
})

// ─── Viewport (PWA + mobile) ──────────────────────────────────────────────────

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  viewportFit: 'cover',       // respect safe-area on notched iPhones
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0058bd' },
    { media: '(prefers-color-scheme: dark)',  color: '#002d60' },
  ],
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default:  'Health Assistant',
    template: '%s | Health Assistant',
  },
  description: 'Your personal health companion. Track, monitor, and improve your wellbeing.',
  applicationName: 'Health Assistant',
  keywords: ['health', 'wellness', 'fitness', 'medical', 'tracker'],
  manifest: '/manifest.webmanifest',

  // PWA / Apple
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HealthAI',
  },

  // Open Graph
  openGraph: {
    type: 'website',
    siteName: 'Health Assistant',
    title: 'Health Assistant',
    description: 'Your personal health companion',
  },

  // Icons
  icons: {
    icon:  [{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/icons/icon-152.png', sizes: '152x152', type: 'image/png' }],
  },
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${jakartaSans.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-surface text-text-primary">
        <ServiceWorkerRegistration />
        <PWAInstallBanner />
        {children}
      </body>
    </html>
  )
}
