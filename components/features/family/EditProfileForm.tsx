'use client'

import { useActionState } from 'react'
import { updateProfile } from '@/app/(app)/dashboard/actions'
import type { FamilyProfile } from '@/types/family'

interface EditProfileFormProps {
  profile: FamilyProfile
  onClose: () => void
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export function EditProfileForm({ profile, onClose }: EditProfileFormProps) {
  const [state, action, pending] = useActionState(updateProfile, { error: null })

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4">
      <div className="w-full sm:max-w-md bg-surface-container-lowest rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border-subtle">
          <h2 className="text-lg font-semibold text-text-primary">Edit profile</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:bg-surface-muted transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form action={action} className="flex flex-col gap-4 px-5 py-5">
          <input type="hidden" name="profile_id" value={profile.id} />

          {/* Full name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ep-full_name" className="text-sm font-medium text-text-primary">Full name</label>
            <input
              id="ep-full_name"
              name="full_name"
              type="text"
              required
              defaultValue={profile.full_name}
              className="w-full px-4 py-2.5 text-base rounded-xl border border-border bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Date of birth */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ep-dob" className="text-sm font-medium text-text-primary">Date of birth</label>
            <input
              id="ep-dob"
              name="date_of_birth"
              type="date"
              defaultValue={profile.date_of_birth ?? ''}
              className="w-full px-4 py-2.5 text-base rounded-xl border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Blood group */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ep-blood" className="text-sm font-medium text-text-primary">Blood group</label>
            <select
              id="ep-blood"
              name="blood_group"
              className="w-full px-4 py-2.5 text-base rounded-xl border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">— Not set —</option>
              {BLOOD_GROUPS.map((g) => (
                <option key={g} value={g} selected={g === (profile as unknown as { blood_group?: string }).blood_group}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Height / Weight */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ep-height" className="text-sm font-medium text-text-primary">Height (cm)</label>
              <input
                id="ep-height"
                name="height_cm"
                type="number"
                min="50"
                max="250"
                defaultValue={(profile as unknown as { height_cm?: number }).height_cm ?? ''}
                className="w-full px-4 py-2.5 text-base rounded-xl border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ep-weight" className="text-sm font-medium text-text-primary">Weight (kg)</label>
              <input
                id="ep-weight"
                name="weight_kg"
                type="number"
                min="1"
                max="300"
                defaultValue={(profile as unknown as { weight_kg?: number }).weight_kg ?? ''}
                className="w-full px-4 py-2.5 text-base rounded-xl border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Known conditions */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ep-conditions" className="text-sm font-medium text-text-primary">
              Known conditions
              <span className="font-normal text-text-muted ml-1">(comma-separated)</span>
            </label>
            <input
              id="ep-conditions"
              name="known_conditions"
              type="text"
              placeholder="e.g. Diabetes, Hypertension"
              defaultValue={((profile as unknown as { known_conditions?: string[] }).known_conditions ?? []).join(', ')}
              className="w-full px-4 py-2.5 text-base rounded-xl border border-border bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Allergies */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ep-allergies" className="text-sm font-medium text-text-primary">
              Allergies
              <span className="font-normal text-text-muted ml-1">(comma-separated)</span>
            </label>
            <input
              id="ep-allergies"
              name="allergies"
              type="text"
              placeholder="e.g. Penicillin, Sulfa drugs"
              defaultValue={((profile as unknown as { allergies?: string[] }).allergies ?? []).join(', ')}
              className="w-full px-4 py-2.5 text-base rounded-xl border border-border bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {state.error && (
            <p className="text-sm text-error">{state.error}</p>
          )}
          {state.success && (
            <p className="text-sm text-success">Profile updated.</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-border text-text-secondary font-medium text-sm hover:bg-surface-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-60 transition-opacity"
            >
              {pending ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
