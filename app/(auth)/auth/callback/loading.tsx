/**
 * Loading state for OAuth callback
 * Shown during Google sign-in redirect processing
 */

import '../auth.css'

export default function CallbackLoading() {
  return (
    <div className="ap">
      {/* Blobs */}
      <div className="ap-blob ap-blob-1" />
      <div className="ap-blob ap-blob-2" />
      <div className="ap-blob ap-blob-3" />

      <div className="ap-card">
        {/* Logo */}
        <div className="ap-logo fi1">
          <span className="ap-logo-mark">
            <svg width="36" height="36" viewBox="0 0 30 30" fill="none">
              <rect width="30" height="30" rx="8.5" fill="#1d4ed8"/>
              <path d="M4 15 L8.5 15 L10.5 10 L15 21 L19.5 10 L21.5 15 L26 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </span>
        </div>
        <div className="ap-brand fi1">Vitae</div>
        <p className="ap-subtitle fi2">Completing sign in...</p>

        {/* Loading spinner */}
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="ap-spinner" />
          <p className="text-sm text-text-muted">Setting up your account</p>
        </div>

        {/* Trust badges */}
        <div className="ap-trust fi6">
          <div className="ap-trust-badge">
            <svg width="13" height="13" fill="none" stroke="#a855f7" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            End-to-end encrypted
          </div>
          <div className="ap-trust-badge">
            <svg width="13" height="13" fill="none" stroke="#a855f7" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            Data never sold
          </div>
        </div>
      </div>
    </div>
  )
}
