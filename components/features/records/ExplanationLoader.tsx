'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { generateRecordExplanation } from '@/app/(app)/records/actions'
import { Spinner } from '@/components/ui'

interface ExplanationLoaderProps {
  documentId: string
}

export function ExplanationLoader({ documentId }: ExplanationLoaderProps) {
  const router = useRouter()
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true

    generateRecordExplanation(documentId).then(() => {
      router.refresh()
    })
  }, [documentId, router])

  return (
    <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-primary-subtle border border-border mb-4">
      <Spinner size="sm" />
      <p className="font-body text-xs font-medium text-primary">
        Generating AI explanation…
      </p>
    </div>
  )
}
