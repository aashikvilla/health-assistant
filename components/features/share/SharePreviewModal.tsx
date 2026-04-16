'use client'

import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui'

interface SharePreviewModalProps {
  message:   string
  onConfirm: () => void
  onCancel:  () => void
}

const WhatsAppIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

export function SharePreviewModal({ message, onConfirm, onCancel }: SharePreviewModalProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const titleId = 'share-preview-title'

  // Focus trap — move focus into modal on mount
  useEffect(() => {
    containerRef.current?.focus()
  }, [])

  // Escape key dismissal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      {/* Sheet (mobile) / Modal (desktop) */}
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="
          w-full rounded-t-3xl bg-surface-container-lowest outline-none
          md:rounded-3xl md:max-w-lg md:w-full md:mx-4
        "
        style={{ boxShadow: '0 -4px 32px rgba(0,0,0,0.18)' }}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 md:hidden" aria-hidden="true">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="px-5 pt-4 pb-6 flex flex-col gap-4">
          {/* Header */}
          <div>
            <h2 id={titleId} className="font-display text-base font-semibold text-text-primary">
              Preview your share
            </h2>
            <p className="font-body text-xs text-text-muted mt-0.5">
              This is exactly what will be sent via WhatsApp
            </p>
          </div>

          {/* Message preview */}
          <div
            className="rounded-2xl bg-surface-subtle p-4 max-h-[45vh] overflow-y-auto"
            style={{ border: '1px solid rgba(124,58,237,.10)' }}
          >
            <pre className="whitespace-pre-wrap font-body text-sm text-text-primary leading-relaxed">
              {message}
            </pre>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="md"
              fullWidth
              onClick={onCancel}
            >
              Cancel
            </Button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 flex items-center justify-center gap-2 h-11 px-5 rounded-3xl font-medium text-sm text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: '#25D366' }}
            >
              <WhatsAppIcon />
              Share on WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
