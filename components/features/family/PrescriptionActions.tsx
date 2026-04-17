'use client'

import { useState, useRef, useEffect, useActionState } from 'react'
import { deleteDocument, reassignDocument } from '@/app/(app)/dashboard/actions'
import type { FamilyProfile } from '@/types/family'
import type { TimelineDocument } from '@/services/records.service'

interface Props {
  document: TimelineDocument
  profiles: FamilyProfile[]
}

export function PrescriptionActions({ document: doc, profiles }: Props) {
  const [open, setOpen]           = useState(false)
  const [mode, setMode]           = useState<'menu' | 'reassign'>('menu')
  const menuRef                   = useRef<HTMLDivElement>(null)

  const [deleteState, deleteAction, deletePending]     = useActionState(deleteDocument, { error: null })
  const [reassignState, reassignAction, reassignPending] = useActionState(reassignDocument, { error: null })

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
        setMode('menu')
      }
    }
    window.document.addEventListener('mousedown', handler)
    return () => window.document.removeEventListener('mousedown', handler)
  }, [open])

  const otherProfiles = profiles.filter((p) => p.id !== doc.profile_id)

  return (
    <div className="relative flex-shrink-0" ref={menuRef}>
      {/* Trigger */}
      <button
        onClick={(e) => { e.preventDefault(); setOpen((v) => !v); setMode('menu') }}
        className="w-9 h-9 flex items-center justify-center rounded-xl text-text-muted hover:bg-surface-muted transition-colors"
        aria-label="Prescription actions"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5"  r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-10 z-50 w-48 bg-surface-container-lowest rounded-2xl shadow-lg border border-border-subtle overflow-hidden">

          {mode === 'menu' && (
            <>
              {/* Move to */}
              {otherProfiles.length > 0 && (
                <button
                  onClick={() => setMode('reassign')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-text-primary hover:bg-surface-subtle transition-colors"
                >
                  <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Move to…
                </button>
              )}

              {/* Delete */}
              <form action={deleteAction}>
                <input type="hidden" name="document_id" value={doc.id} />
                <button
                  type="submit"
                  disabled={deletePending}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-error hover:bg-error-subtle transition-colors disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {deletePending ? 'Deleting…' : 'Delete'}
                </button>
              </form>

              {deleteState.error && (
                <p className="px-4 py-2 text-xs text-error">{deleteState.error}</p>
              )}
            </>
          )}

          {mode === 'reassign' && (
            <>
              <div className="px-4 py-3 border-b border-border-subtle flex items-center gap-2">
                <button onClick={() => setMode('menu')} className="text-text-muted hover:text-text-primary">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Move to</p>
              </div>

              {otherProfiles.map((profile) => (
                <form key={profile.id} action={reassignAction}>
                  <input type="hidden" name="document_id"   value={doc.id} />
                  <input type="hidden" name="new_profile_id" value={profile.id} />
                  <button
                    type="submit"
                    disabled={reassignPending}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-text-primary hover:bg-surface-subtle transition-colors disabled:opacity-50"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0">
                      {profile.full_name.charAt(0).toUpperCase()}
                    </div>
                    {profile.is_self ? 'You' : profile.full_name.split(' ')[0]}
                  </button>
                </form>
              ))}

              {reassignState.error && (
                <p className="px-4 py-2 text-xs text-error">{reassignState.error}</p>
              )}
            </>
          )}

        </div>
      )}
    </div>
  )
}
