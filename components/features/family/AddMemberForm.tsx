'use client'

import { useActionState } from 'react'
import { Button, Input }  from '@/components/ui'
import { createProfile }  from '@/app/hub/actions'
import { RELATIONSHIP_LABELS } from '@/types/family'
import type { ProfileRelationship } from '@/types/family'

const RELATIONSHIPS: ProfileRelationship[] = [
  'father',
  'mother',
  'spouse',
  'sibling',
  'other',
]

type FormState = { error: string | null }
const initialState: FormState = { error: null }

export function AddMemberForm() {
  const [state, formAction, isPending] = useActionState(createProfile, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.error && (
        <div className="rounded-xl bg-error-subtle border border-error/20 px-4 py-3 text-sm text-error">
          {state.error}
        </div>
      )}

      <Input
        label="Full Name"
        name="name"
        type="text"
        placeholder="e.g. Ramesh Gupta"
        required
        autoComplete="name"
        className="text-base"
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="relationship" className="text-sm font-medium text-text-primary">
          Relationship
        </label>
        <select
          id="relationship"
          name="relationship"
          required
          defaultValue=""
          className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent hover:border-border-strong transition-colors"
        >
          <option value="" disabled>Select relationship</option>
          {RELATIONSHIPS.map((rel) => (
            <option key={rel} value={rel}>
              {RELATIONSHIP_LABELS[rel]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="dob" className="text-sm font-medium text-text-primary">
          Date of Birth
          <span className="ml-1 text-text-muted font-normal">(optional)</span>
        </label>
        <input
          id="dob"
          name="dob"
          type="date"
          max={new Date().toISOString().split('T')[0]}
          className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent hover:border-border-strong transition-colors"
        />
        <p className="text-xs text-text-muted">Used for medication reminders (coming soon)</p>
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <Button type="submit" fullWidth size="lg" loading={isPending}>
          Save Profile
        </Button>
        <Button variant="ghost" fullWidth size="md" href="/hub">
          Skip for now
        </Button>
      </div>
    </form>
  )
}
