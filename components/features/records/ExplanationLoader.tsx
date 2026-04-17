'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { generateRecordExplanation } from '@/app/(app)/records/actions'
import { Spinner } from '@/components/ui'

interface ExplanationLoaderProps {
  documentId: string
}

export function ExplanationLoader({ documentId }: ExplanationLoaderProps) {
  const router = useRouter()
  const fired = useRef(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true

    generateRecordExplanation(documentId).then((result) => {
      if (result.success) {
        router.refresh()
      } else {
        setFailed(true)
      }
    })
  }, [documentId, router])

  if (failed) {
    return (
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-surface-subtle border border-border mb-4">
        <p className="font-body text-xs font-medium text-text-muted">
          Could not generate AI explanation. Try refreshing the page.
        </p>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-primary-subtle border border-border mb-4">
      <Spinner size="sm" />
      <p className="font-body text-xs font-medium text-primary">
        Generating AI explanation…
      </p>
    </div>
  )
}
