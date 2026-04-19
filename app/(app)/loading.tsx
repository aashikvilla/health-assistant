/**
 * Global loading state for authenticated app routes
 * Fallback for any route without a specific loading.tsx
 */

export default function AppLoading() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Logo */}
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center animate-pulse">
          <svg width="32" height="32" viewBox="0 0 30 30" fill="none">
            <rect width="30" height="30" rx="8.5" fill="#1d4ed8"/>
            <path d="M4 15 L8.5 15 L10.5 10 L15 21 L19.5 10 L21.5 15 L26 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </div>
        
        {/* Spinner */}
        <div className="w-8 h-8 border-3 border-surface-subtle border-t-primary rounded-full animate-spin" />
        
        {/* Text */}
        <p className="text-sm text-text-muted font-medium">Loading...</p>
      </div>
    </div>
  )
}
