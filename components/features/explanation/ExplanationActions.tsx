'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui'

interface ExplanationActionsProps {
  prescriptionId: string
  className?: string
}

function ExplanationActions({ prescriptionId, className = '' }: ExplanationActionsProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = useCallback(async () => {
    const shareUrl = `${window.location.origin}/share/${prescriptionId}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = shareUrl
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [prescriptionId])

  return (
    <div className={['space-y-3', className].filter(Boolean).join(' ')}>
      <Button variant="primary" size="lg" fullWidth>
        Save to My Records
      </Button>
      <Button variant="ghost" size="lg" fullWidth onClick={handleCopyLink}>
        {copied ? 'Link copied!' : 'Copy share link (no account needed)'}
      </Button>

      {/* Toast feedback */}
      {copied && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-surface-inverse text-text-inverse font-body text-sm px-4 py-2.5 rounded-xl shadow-ambient animate-fade-in">
          Share link copied to clipboard
        </div>
      )}
    </div>
  )
}

export { ExplanationActions }
export type { ExplanationActionsProps }
