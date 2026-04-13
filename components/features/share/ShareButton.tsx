'use client'

import { useState } from 'react'
import { ShareModal } from './ShareModal'

interface ShareButtonProps {
  documentId: string
  profileId: string
  doctorName: string | null
  patientName: string
  className?: string
}

export function ShareButton({
  documentId,
  profileId,
  doctorName,
  patientName,
  className = '',
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`touch-target flex items-center justify-center p-2 rounded-xl text-text-primary hover:bg-surface-subtle transition-colors ${className}`}
        aria-label="Share prescription"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      </button>

      <ShareModal
        documentId={documentId}
        profileId={profileId}
        doctorName={doctorName}
        patientName={patientName}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}
