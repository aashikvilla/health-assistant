'use client'

/**
 * PendingUploadBanner
 *
 * Runs on the dashboard after the user authenticates from the public /upload page.
 * Reads localStorage for a pending upload, auto-saves it immediately, then
 * redirects the user to the saved record's detail page.
 *
 * No manual click required  the save is transparent and the user lands
 * directly in the read-only document view.
 */

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { PrescriptionData, PrescriptionExplanation } from '@/types/prescription'
import type { LabReportData, LabReportExplanation }     from '@/types/lab-report'
import { savePendingUpload }      from '@/app/(app)/dashboard/upload/[profileId]/actions'

const PENDING_KEY = 'nuskha_pending_upload'
const MAX_AGE_MS  = 24 * 60 * 60 * 1000   // 24 hours

type Status = 'saving' | 'error'

interface PendingUpload {
  type:            'prescription' | 'lab_report'
  data:            PrescriptionData | LabReportData
  explanation?:    PrescriptionExplanation | null
  labExplanation?: LabReportExplanation | null
  timestamp:       number
}

export function PendingUploadBanner() {
  const router = useRouter()
  const [pending,  setPending]  = useState<PendingUpload | null>(null)
  const [status,   setStatus]   = useState<Status>('saving')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [, startTransition]     = useTransition()

  function doSave(upload: PendingUpload) {
    setStatus('saving')
    setErrorMsg(null)
    startTransition(() => {
      savePendingUpload(upload.type, upload.data, upload.explanation ?? undefined, upload.labExplanation ?? undefined).then((result) => {
        if (!result.success) {
          setStatus('error')
          setErrorMsg(result.error)
          return
        }
        localStorage.removeItem(PENDING_KEY)
        router.push(`/records/${result.documentId}`)
      })
    })
  }

  // On mount: read localStorage and auto-save immediately
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PENDING_KEY)
      if (!raw) return

      const parsed: PendingUpload = JSON.parse(raw)

      if (Date.now() - parsed.timestamp > MAX_AGE_MS) {
        localStorage.removeItem(PENDING_KEY)
        return
      }

      setPending(parsed)
      doSave(parsed)
    } catch {
      localStorage.removeItem(PENDING_KEY)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!pending) return null

  const label = pending.type === 'prescription' ? 'prescription' : 'lab report'

  if (status === 'saving') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="mx-4 mb-2 rounded-2xl border border-primary/20 bg-primary-subtle px-4 py-3 flex items-center gap-3"
      >
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
          <svg className="w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary">Saving your {label}…</p>
          <p className="text-xs text-text-secondary mt-0.5">Just a moment</p>
        </div>
      </div>
    )
  }

  // status === 'error'
  return (
    <div
      role="alert"
      className="mx-4 mb-2 rounded-2xl border border-error/20 bg-error-subtle px-4 py-3 flex items-start gap-3"
    >
      <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-error flex items-center justify-center">
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-error">Couldn&apos;t save your {label}</p>
        <p className="text-xs text-error/80 mt-0.5">{errorMsg}</p>
        <div className="flex gap-3 mt-2">
          <button
            onClick={() => pending && doSave(pending)}
            className="text-xs font-semibold text-primary hover:underline underline-offset-2"
          >
            Try again
          </button>
          <button
            onClick={() => { localStorage.removeItem(PENDING_KEY); setPending(null) }}
            className="text-xs text-text-muted hover:text-text-secondary"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}
