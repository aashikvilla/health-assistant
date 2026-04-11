'use client'

import { useActionState } from 'react'
import { Button, Input }  from '@/components/ui'
import { createProfile }  from '@/app/(app)/hub/actions'
import { RELATIONSHIP_LABELS } from '@/types/family'
import type { ProfileRelationship } from '@/types/family'

const RELATIONSHIPS: ProfileRelationship[] = [
  'parent',
  'spouse',
  'child',
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
          className="w-full rounded-xl bg-surface-subtle px-3 py-2.5 text-base text-text-primary focus:outline-none focus:ring-1 focus:ring-border-strong focus:bg-surface-container-lowest transition-colors"
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
          className="w-full rounded-xl bg-surface-subtle px-3 py-2.5 text-base text-text-primary focus:outline-none focus:ring-1 focus:ring-border-strong focus:bg-surface-container-lowest transition-colors"
        />
        <p className="text-xs text-text-muted">Used for medication reminders (coming soon)</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="member-email" className="text-sm font-medium text-text-primary">
          Their Email
          <span className="ml-1 text-text-muted font-normal">(optional)</span>
        </label>
        <input
          id="member-email"
          name="email"
          type="email"
          placeholder="e.g. ramesh@gmail.com"
          autoComplete="off"
          className="w-full rounded-xl bg-surface-subtle px-3 py-2.5 text-base text-text-primary focus:outline-none focus:ring-1 focus:ring-border-strong focus:bg-surface-container-lowest transition-colors"
        />
        <p className="text-xs text-text-muted">
          If they create an account with this email, they&apos;ll automatically get access to their profile.
        </p>
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
