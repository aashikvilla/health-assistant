'use client'

/**
 * PendingUploadBanner
 *
 * Runs on the Hub page after the user authenticates. Checks localStorage for
 * a pending upload that was captured on the public /upload page before signup.
 *
 * If a pending upload is found it shows a dismissible banner. The user can:
 *  - Save it now → calls savePendingUpload server action → saves to DB
 *  - Dismiss → clears localStorage, hides banner
 *
 * The banner auto-dismisses if the pending data is > 24 hours old.
 */

import { useEffect, useState, useTransition } from 'react'
import type { PrescriptionData }  from '@/types/prescription'
import type { LabReportData }     from '@/types/lab-report'
import { savePendingUpload }      from '@/app/(app)/hub/upload/[profileId]/actions'

const PENDING_KEY  = 'nuskha_pending_upload'
const MAX_AGE_MS   = 24 * 60 * 60 * 1000   // 24 hours

type Status = 'idle' | 'saving' | 'saved' | 'error'

interface PendingUpload {
  type:      'prescription' | 'lab_report'
  data:      PrescriptionData | LabReportData
  timestamp: number
}

function formatAge(timestamp: number): string {
  const mins = Math.round((Date.now() - timestamp) / 60_000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.round(mins / 60)
  return `${hrs} hr ago`
}

export function PendingUploadBanner() {
  const [pending, setPending]   = useState<PendingUpload | null>(null)
  const [status, setStatus]     = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PENDING_KEY)
      if (!raw) return

      const parsed: PendingUpload = JSON.parse(raw)

      // Expire data older than 24 hours
      if (Date.now() - parsed.timestamp > MAX_AGE_MS) {
        localStorage.removeItem(PENDING_KEY)
        return
      }

      setPending(parsed)
    } catch {
      localStorage.removeItem(PENDING_KEY)
    }
  }, [])

  function dismiss() {
    localStorage.removeItem(PENDING_KEY)
    setPending(null)
  }

  function save() {
    if (!pending) return
    setErrorMsg(null)
    setStatus('saving')

    startTransition(async () => {
      const result = await savePendingUpload(pending.type, pending.data)
      if (!result.success) {
        setStatus('error')
        setErrorMsg(result.error)
        return
      }
      localStorage.removeItem(PENDING_KEY)
      setStatus('saved')
      // Hide after a brief "saved" confirmation
      setTimeout(() => setPending(null), 2500)
    })
  }

  if (!pending) return null

  const label = pending.type === 'prescription' ? 'prescription' : 'lab report'
  const medCount = pending.type === 'prescription'
    ? (pending.data as PrescriptionData).medications?.length ?? 0
    : (pending.data as LabReportData).tests?.length ?? 0

  return (
    <div
      role="alert"
      className="mx-4 mb-2 rounded-2xl border border-primary/20 bg-primary-subtle px-4 py-3 flex items-start gap-3"
    >
      {/* Icon */}
      <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
        <svg className="w-4 h-4 text-text-inverse" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {status === 'saved' ? (
          <p className="text-sm font-semibold text-teal">Saved successfully!</p>
        ) : status === 'error' ? (
          <>
            <p className="text-sm font-semibold text-error">Couldn&apos;t save</p>
            <p className="text-xs text-error/80 mt-0.5">{errorMsg}</p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-text-primary">
              You have an unsaved {label}
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              {medCount} {pending.type === 'prescription' ? 'medication' : 'test'}{medCount !== 1 ? 's' : ''} · captured {formatAge(pending.timestamp)}
            </p>
          </>
        )}

        {status === 'idle' && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={save}
              disabled={isPending}
              className="text-xs font-semibold text-primary hover:underline disabled:opacity-50"
            >
              Save to my account
            </button>
            <span className="text-xs text-text-muted">·</span>
            <button
              onClick={dismiss}
              className="text-xs text-text-muted hover:text-text-secondary"
            >
              Dismiss
            </button>
          </div>
        )}

        {status === 'saving' && (
          <p className="text-xs text-primary mt-1">Saving…</p>
        )}
      </div>

      {/* Close button */}
      {(status === 'idle' || status === 'error') && (
        <button
          onClick={dismiss}
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:bg-primary-subtle transition-colors"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
