"use client";

import { useEffect, useState } from "react";

type Platform = "android" | "ios" | null;

function detectPlatform(): Platform {
  if (typeof window === "undefined") return null;
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return "android";
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  return null;
}

function isInStandaloneMode(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      (navigator as { standalone?: boolean }).standalone === true)
  );
}

export function PWAInstallBanner() {
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<Platform>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (isInStandaloneMode()) return;
    if (localStorage.getItem("pwa-installed")) return;

    // Track visits once per browser session
    if (!sessionStorage.getItem("pwa-session-started")) {
      sessionStorage.setItem("pwa-session-started", "1");
      const prev = parseInt(localStorage.getItem("pwa-visit-count") ?? "0", 10);
      localStorage.setItem("pwa-visit-count", String(prev + 1));
    }

    const visitCount = parseInt(localStorage.getItem("pwa-visit-count") ?? "0", 10);
    const showCount  = parseInt(localStorage.getItem("pwa-show-count")  ?? "0", 10);

    // Show only from 2nd visit onwards, stop after 3 impressions, respect session dismissal
    if (visitCount < 2 || showCount >= 3 || sessionStorage.getItem("pwa-dismissed-session")) return;

    const detected = detectPlatform();
    if (!detected) return;
    setPlatform(detected);

    if (detected === "android") {
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        localStorage.setItem("pwa-show-count", String(showCount + 1));
        setShow(true);
      };
      window.addEventListener("beforeinstallprompt", handler);
      return () => window.removeEventListener("beforeinstallprompt", handler);
    }

    if (detected === "ios") {
      const timer = setTimeout(() => {
        localStorage.setItem("pwa-show-count", String(showCount + 1));
        setShow(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  function dismiss() {
    sessionStorage.setItem("pwa-dismissed-session", "1");
    setShow(false);
  }

  async function install() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      localStorage.setItem("pwa-installed", "1");
      localStorage.removeItem("pwa-visit-count");
      localStorage.removeItem("pwa-show-count");
    }
    setShow(false);
    setDeferredPrompt(null);
  }

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={dismiss}
        aria-hidden="true"
      />

      {/* Bottom sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Install Vitae"
        className="fixed bottom-0 left-0 right-0 z-50 bg-surface rounded-t-3xl shadow-xl px-6 pt-5 pb-8 pb-safe"
      >
        {/* Handle */}
        <div className="mx-auto w-10 h-1 rounded-full bg-border mb-5" />

        <div className="flex items-start gap-4 mb-5">
          {/* App icon */}
          <svg width="56" height="56" viewBox="0 0 30 30" fill="none" className="shrink-0 rounded-2xl" aria-hidden="true">
            <rect width="30" height="30" rx="8.5" style={{ fill: 'var(--color-primary)' }} />
            <path d="M4 15 L8.5 15 L10.5 10 L15 21 L19.5 10 L21.5 15 L26 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          <div>
            <p className="font-semibold text-text-primary text-base">
              Install Vitae
            </p>
            <p className="text-sm text-text-secondary mt-0.5">
              Add to your home screen for the best experience  works offline
              too.
            </p>
          </div>
        </div>

        {platform === "ios" ? (
          <div className="bg-surface-subtle rounded-2xl p-4 mb-5 space-y-3">
            <Step
              n={1}
              text={
                <>
                  Tap the <strong>Share</strong> button <ShareIcon /> in Safari
                </>
              }
            />
            <Step
              n={2}
              text={
                <>
                  Scroll down and tap <strong>"Add to Home Screen"</strong>
                </>
              }
            />
            <Step
              n={3}
              text={
                <>
                  Tap <strong>Add</strong> in the top right
                </>
              }
            />
          </div>
        ) : null}

        <div className="flex gap-3">
          {platform === "android" ? (
            <button
              onClick={install}
              className="flex-1 h-12 bg-primary text-text-inverse font-semibold rounded-xl text-sm"
            >
              Install
            </button>
          ) : null}
          <button
            onClick={dismiss}
            className="flex-1 h-12 bg-surface-muted text-text-secondary font-semibold rounded-xl text-sm"
          >
            {platform === "ios" ? "Got it" : "Not now"}
          </button>
        </div>
      </div>
    </>
  );
}

function Step({ n, text }: { n: number; text: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-6 h-6 rounded-full bg-primary text-text-inverse text-xs font-bold flex items-center justify-center flex-shrink-0">
        {n}
      </span>
      <span className="text-sm text-text-secondary">{text}</span>
    </div>
  );
}

function ShareIcon() {
  return (
    <svg
      className="inline w-4 h-4 mx-0.5 text-primary"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
      />
    </svg>
  );
}
