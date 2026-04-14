'use client'

import { useActionState, Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { signIn, signUp, signInWithGoogle } from '@/app/actions'

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
    <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-md p-8 space-y-6">

      {/* Logo */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-xl shadow-sm">
          <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-text-primary">Vitae</h1>
      </div>

      {/* Tabs — surface-muted track, no borders */}
      <div className="flex bg-surface-muted rounded-xl p-1">
        <button
          type="button"
          onClick={() => setIsSignUp(false)}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
            !isSignUp
              ? 'bg-surface-container-lowest text-text-primary shadow-xs'
              : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setIsSignUp(true)}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
            isSignUp
              ? 'bg-surface-container-lowest text-text-primary shadow-xs'
              : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Google OAuth — secondary button style, no border */}
      <form action={signInWithGoogle}>
        <input type="hidden" name="returnTo" value={returnTo} />
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-3 h-11 px-4 bg-surface-subtle text-text-primary text-sm font-medium rounded-xl hover:bg-surface-muted transition-colors"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
      </form>

      {/* Divider — spacing only, no line */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-surface-muted" />
        <span className="text-xs text-text-muted">or continue with email</span>
        <div className="flex-1 h-px bg-surface-muted" />
      </div>

      {/* Email / Password */}
      {isSignUp ? (
        <form action={signUpAction} className="space-y-4">
          <input type="hidden" name="returnTo" value={returnTo} />
          <div className="space-y-1.5">
            <label htmlFor="signup-email" className="text-sm font-medium text-text-primary">Email</label>
            <input
              id="signup-email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-xl bg-surface-subtle px-3 py-2.5 text-base text-text-primary placeholder:text-text-muted transition-all focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-black/20"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="signup-password" className="text-sm font-medium text-text-primary">Password</label>
            <input
              id="signup-password"
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="Min. 6 characters"
              className="w-full rounded-xl bg-surface-subtle px-3 py-2.5 text-base text-text-primary placeholder:text-text-muted transition-all focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-black/20"
            />
          </div>
          {info && (
            <p className="text-sm text-teal font-medium bg-teal-subtle px-3 py-2 rounded-xl">{info}</p>
          )}
          {error && (
            <p className="text-sm text-error bg-error-subtle px-3 py-2 rounded-xl">{error}</p>
          )}
          {!info && (
            <button
              type="submit"
              disabled={pending}
              className="w-full h-11 bg-primary text-primary-foreground font-semibold rounded-3xl hover:opacity-90 disabled:opacity-60 transition-opacity"
            >
              {signUpPending ? 'Creating account…' : 'Create Account'}
            </button>
          )}
        </form>
      ) : (
        <form action={signInAction} className="space-y-4">
          <input type="hidden" name="returnTo" value={returnTo} />
          <div className="space-y-1.5">
            <label htmlFor="signin-email" className="text-sm font-medium text-text-primary">Email</label>
            <input
              id="signin-email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-xl bg-surface-subtle px-3 py-2.5 text-base text-text-primary placeholder:text-text-muted transition-all focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-black/20"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="signin-password" className="text-sm font-medium text-text-primary">Password</label>
            <input
              id="signin-password"
              name="password"
              type="password"
              required
              placeholder="Your password"
              className="w-full rounded-xl bg-surface-subtle px-3 py-2.5 text-base text-text-primary placeholder:text-text-muted transition-all focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-black/20"
            />
          </div>
          {error && (
            <p className="text-sm text-error bg-error-subtle px-3 py-2 rounded-xl">{error}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="w-full h-11 bg-primary text-primary-foreground font-semibold rounded-3xl hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {signInPending ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      )}

      <p className="text-center text-sm text-text-muted">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-text-link font-medium hover:underline underline-offset-4"
        >
          {isSignUp ? 'Sign in' : 'Sign up'}
        </button>
      </p>
    </div>
  )
}

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <Suspense fallback={
        <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-md p-8 h-96 animate-pulse" />
      }>
        <AuthForm />
      </Suspense>
    </div>
  )
}
