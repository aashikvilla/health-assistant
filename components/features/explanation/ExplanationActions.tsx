import { Button } from '@/components/ui'

interface ExplanationActionsProps {
  prescriptionId: string
  className?: string
  onSave?: () => void
  loading?: boolean
}

function ExplanationActions({ className = '', onSave, loading }: ExplanationActionsProps) {
  return (
    <div className={className}>
      <Button variant="primary" size="lg" fullWidth onClick={onSave} loading={loading}>
        Save to My Records
      </Button>
    </div>
  )
}

export { ExplanationActions }
export type { ExplanationActionsProps }
