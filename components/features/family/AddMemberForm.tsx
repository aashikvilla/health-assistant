'use client'

import { useActionState } from 'react'
import { Button, Input }  from '@/components/ui'
import { createProfile }  from '@/app/(app)/dashboard/actions'
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
  const [selectedRelationship, setSelectedRelationship] = useState<ProfileRelationship | ''>('')

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
        autoCapitalize="words"
        className="text-base"
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text-primary">
          Relationship
        </label>
        <div role="radiogroup" aria-label="Select relationship" className="flex flex-col gap-2">
          {/* Top row: Parent, Spouse, Child */}
          <div className="flex gap-2">
            {['parent', 'spouse', 'child'].map((rel) => (
              <button
                key={rel}
                type="button"
                role="radio"
                aria-checked={selectedRelationship === rel}
                onClick={() => setSelectedRelationship(rel as ProfileRelationship)}
                className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  selectedRelationship === rel
                    ? 'bg-primary text-white'
                    : 'bg-surface-subtle border border-border text-text-primary hover:bg-surface-container-lowest'
                }`}
              >
                {RELATIONSHIP_LABELS[rel as ProfileRelationship]}
              </button>
            ))}
          </div>
          {/* Bottom row: Sibling, Other */}
          <div className="flex gap-2">
            {['sibling', 'other'].map((rel) => (
              <button
                key={rel}
                type="button"
                role="radio"
                aria-checked={selectedRelationship === rel}
                onClick={() => setSelectedRelationship(rel as ProfileRelationship)}
                className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  selectedRelationship === rel
                    ? 'bg-primary text-white'
                    : 'bg-surface-subtle border border-border text-text-primary hover:bg-surface-container-lowest'
                }`}
              >
                {RELATIONSHIP_LABELS[rel as ProfileRelationship]}
              </button>
            ))}
          </div>
        </div>
        {/* Hidden input for form submission */}
        <input type="hidden" name="relationship" value={selectedRelationship} />
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
        <p className="text-xs text-text-muted">Helps with age-appropriate lab test reference ranges.</p>
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
        <Button variant="ghost" fullWidth size="md" href="/dashboard">
          Cancel
        </Button>
      </div>
    </form>
  )
}
