import { Button } from '@/components/ui'

interface ExplanationActionsProps {
  prescriptionId: string
  className?: string
}

function ExplanationActions({ className = '' }: ExplanationActionsProps) {
  return (
    <div className={className}>
      <Button variant="primary" size="lg" fullWidth>
        Save to My Records
      </Button>
    </div>
  )
}

export { ExplanationActions }
export type { ExplanationActionsProps }
