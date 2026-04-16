import type { Metadata, Viewport } from "next";
import { ServiceWorkerRegistration } from "@/components/layout/ServiceWorkerRegistration";
import { PWAInstallBanner } from "@/components/layout/PWAInstallBanner";
import "./globals.css";

// ─── Viewport (PWA + mobile) ──────────────────────────────────────────────────

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  viewportFit: "cover", // respect safe-area on notched iPhones
  themeColor: "#0058bd",
};

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: "Vitae",
    template: "%s | Vitae",
  },
  description: "Your AI-powered family health record manager",
  applicationName: "Vitae",
  keywords: ["health", "prescription", "medicine", "family", "medical records"],
  manifest: "/manifest.webmanifest",

  // PWA / Apple
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Vitae",
  },

  // Open Graph
  openGraph: {
    type: "website",
    siteName: "Vitae",
    title: "Vitae — Family Health Record Manager",
    description: "Your AI-powered family health record manager",
  },

  // Icons
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [
      { url: "/icons/icon-152.png", sizes: "152x152", type: "image/png" },
    ],
  },
};

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      style={{ colorScheme: "light" }}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,700;1,800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-surface text-text-primary">
        <ServiceWorkerRegistration />
        <PWAInstallBanner />
        {children}
      </body>
    </html>
  );
}
