'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'

interface ShareModalProps {
  documentId: string
  profileId: string
  doctorName: string | null
  patientName: string
  isOpen: boolean
  onClose: () => void
}

type ShareStep = 'options' | 'loading' | 'ready'

export function ShareModal({
  documentId,
  profileId,
  doctorName,
  patientName,
  isOpen,
  onClose,
}: ShareModalProps) {
  const [step, setStep] = useState<ShareStep>('options')
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  async function generateLink() {
    setStep('loading')
    setError(null)

    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId,
          documentIds: [documentId],
          includeMedications: true,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'Failed to create share link')
        setStep('options')
        return
      }

      const token = json.data.shareToken
      const url = `${window.location.origin}/share/${token}`
      setShareUrl(url)
      setStep('ready')
    } catch {
      setError('Network error. Please try again.')
      setStep('options')
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input')
      input.value = shareUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function shareViaWhatsApp() {
    const message = encodeURIComponent(
      `Here's ${patientName}'s prescription from ${doctorName ?? 'the doctor'} — explained in plain English by Nuskha:\n\n${shareUrl}`
    )
    window.open(`https://wa.me/?text=${message}`, '_blank')
  }

  function shareViaEmail() {
    const subject = encodeURIComponent(
      `${patientName}'s Prescription — ${doctorName ?? 'Doctor'}`
    )
    const body = encodeURIComponent(
      `Hi,\n\nHere's ${patientName}'s prescription explained in plain English:\n${shareUrl}\n\nShared via Nuskha`
    )
    window.open(`mailto:?subject=${subject}&body=${body}`, '_self')
  }

  function handleClose() {
    setStep('options')
    setShareUrl('')
    setCopied(false)
    setError(null)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Bottom sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 animate-slide-up">
        <div className="bg-surface-container-lowest rounded-t-3xl px-5 pt-6 pb-safe shadow-2xl">
          {/* Drag handle */}
          <div className="flex justify-center mb-4">
            <div className="w-10 h-1 rounded-full bg-border-strong" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-semibold text-text-primary">
              Share Prescription
            </h2>
            <button
              onClick={handleClose}
              className="touch-target p-2 -mr-2 rounded-xl text-text-muted hover:bg-surface-subtle transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-tertiary-subtle text-sm text-tertiary">
              {error}
            </div>
          )}

          {/* Step: Options */}
          {step === 'options' && (
            <div className="space-y-4">
              <p className="text-sm text-text-secondary">
                Create a read-only link anyone can view without logging in. Expires in 3 days.
              </p>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={generateLink}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Generate Share Link
              </Button>
            </div>
          )}

          {/* Step: Loading */}
          {step === 'loading' && (
            <div className="flex flex-col items-center py-8 gap-3">
              <svg
                className="animate-spin h-8 w-8 text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm text-text-muted">Creating your share link...</p>
            </div>
          )}

          {/* Step: Ready — share options */}
          {step === 'ready' && (
            <div className="space-y-4">
              {/* Link display */}
              <div className="flex items-center gap-2 bg-surface-subtle rounded-xl px-4 py-3">
                <p className="flex-1 text-sm text-text-secondary truncate font-mono">
                  {shareUrl}
                </p>
                <button
                  onClick={copyLink}
                  className="shrink-0 touch-target px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold transition-all"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <p className="text-xs text-text-muted">
                Anyone with this link can view the prescription without logging in.
              </p>

              {/* Share buttons */}
              <div className="grid grid-cols-2 gap-3">
                {/* WhatsApp */}
                <button
                  onClick={shareViaWhatsApp}
                  className="touch-target flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#25D366]/10 text-[#25D366] font-semibold text-sm transition-all hover:bg-[#25D366]/20 active:scale-[0.98]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </button>

                {/* Email */}
                <button
                  onClick={shareViaEmail}
                  className="touch-target flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-primary/10 text-primary font-semibold text-sm transition-all hover:bg-primary/20 active:scale-[0.98]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email
                </button>
              </div>

              {/* Native share (if available) */}
              <Button
                variant="secondary"
                size="md"
                fullWidth
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `${patientName}'s Prescription`,
                      text: `Prescription from ${doctorName ?? 'the doctor'} — explained by Nuskha`,
                      url: shareUrl,
                    })
                  }
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                More sharing options
              </Button>
            </div>
          )}

          {/* Bottom spacing */}
          <div className="h-4" />
        </div>
      </div>
    </>
  )
}
