'use client'

import { useActionState, Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { signIn, signUp, signInWithGoogle } from '@/app/actions'
import './auth.css'

type AuthState = { error: string } | { info: string } | null

function stateError(s: AuthState): string | null {
  return s && 'error' in s ? s.error : null
}
function stateInfo(s: AuthState): string | null {
  return s && 'info' in s ? s.info : null
}

function AuthForm() {
  const searchParams = useSearchParams()
  const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') === 'signup')
  const [signInState, signInAction, signInPending] = useActionState<AuthState, FormData>(signIn, null)
  const [signUpState, signUpAction, signUpPending] = useActionState<AuthState, FormData>(signUp, null)

  const returnTo = searchParams.get('return') ?? '/dashboard'
  const pending  = signInPending || signUpPending
  const error    = isSignUp ? stateError(signUpState) : stateError(signInState)
  const info     = stateInfo(signUpState)

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
        <p className="ap-subtitle fi2">Your health records, finally understood.</p>

        {/* Tabs */}
        <div className="ap-tabs fi3" role="tablist">
          <button
            type="button"
            className="ap-tab"
            role="tab"
            aria-selected={!isSignUp}
            data-active={String(!isSignUp)}
            onClick={() => setIsSignUp(false)}
          >
            Sign In
          </button>
          <button
            type="button"
            className="ap-tab"
            role="tab"
            aria-selected={isSignUp}
            data-active={String(isSignUp)}
            onClick={() => setIsSignUp(true)}
          >
            Sign Up
          </button>
        </div>

        {/* Google OAuth */}
        <form action={signInWithGoogle} className="fi4">
          <input type="hidden" name="returnTo" value={returnTo} />
          <button type="submit" className="ap-btn-google">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </form>

        {/* Divider */}
        <div className="ap-divider fi4"><span>or continue with email</span></div>

        {/* Sign In Form */}
        {!isSignUp && (
          <form action={signInAction} className="ap-form fi5">
            <input type="hidden" name="returnTo" value={returnTo} />
            <div className="ap-field">
              <label htmlFor="signin-email" className="ap-field-label">Email</label>
              <input
                id="signin-email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                autoComplete="email"
                className="ap-input"
              />
            </div>
            <div className="ap-field">
              <div className="ap-field-row">
                <label htmlFor="signin-password" className="ap-field-label">Password</label>
              </div>
              <input
                id="signin-password"
                name="password"
                type="password"
                required
                placeholder="Your password"
                autoComplete="current-password"
                className="ap-input"
              />
            </div>
            {error && <p className="ap-msg-error">{error}</p>}
            <button type="submit" disabled={pending} className="ap-btn-submit">
              {signInPending ? 'Signing in\u2026' : 'Sign In'}
            </button>
          </form>
        )}

        {/* Sign Up Form */}
        {isSignUp && (
          <form action={signUpAction} className="ap-form fi5">
            <input type="hidden" name="returnTo" value={returnTo} />
            <div className="ap-field">
              <label htmlFor="signup-name" className="ap-field-label">Full Name</label>
              <input
                id="signup-name"
                name="full_name"
                type="text"
                required
                placeholder="Your name"
                autoComplete="name"
                className="ap-input"
              />
            </div>
            <div className="ap-field">
              <label htmlFor="signup-email" className="ap-field-label">Email</label>
              <input
                id="signup-email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                autoComplete="email"
                className="ap-input"
              />
            </div>
            <div className="ap-field">
              <label htmlFor="signup-password" className="ap-field-label">Password</label>
              <input
                id="signup-password"
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="Min. 6 characters"
                autoComplete="new-password"
                className="ap-input"
              />
            </div>
            {info && <p className="ap-msg-info">{info}</p>}
            {error && <p className="ap-msg-error">{error}</p>}
            {!info && (
              <button type="submit" disabled={pending} className="ap-btn-submit">
                {signUpPending ? 'Creating account\u2026' : 'Create Account'}
              </button>
            )}
          </form>
        )}

        {/* Footer toggle */}
        <p className="ap-footer-toggle fi6">
          {isSignUp ? 'Already have an account?' : "Don\u2019t have an account?"}{' '}
          <button type="button" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>

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

        {/* Terms */}
        <p className="ap-terms fi6">
          By continuing, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
        </p>

      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="ap">
        <div className="ap-card" style={{ height: 480, opacity: 0.5 }} />
      </div>
    }>
      <AuthForm />
    </Suspense>
  )
}
