// Stage 5  Family Hub types

export type ProfileRelationship =
  | 'self'
  | 'parent'
  | 'spouse'
  | 'child'
  | 'sibling'
  | 'other'

export const RELATIONSHIP_LABELS: Record<ProfileRelationship, string> = {
  self: 'You',
  parent: 'Parent (Father/Mother)',
  spouse: 'Spouse',
  child: 'Child',
  sibling: 'Sibling',
  other: 'Other',
}

// Short display label shown in profile pill / avatar caption
export const RELATIONSHIP_SHORT: Record<ProfileRelationship, string> = {
  self: 'You',
  parent: 'Parent',
  spouse: 'Spouse',
  child: 'Child',
  sibling: 'Sibling',
  other: 'Other',
}

export interface FamilyProfile {
  id: string
  family_group_id: string
  full_name: string
  email: string | null   // used for account claiming
  relationship: ProfileRelationship   // from the logged-in user's perspective (via membership)
  date_of_birth: string | null   // ISO date string YYYY-MM-DD
  avatar_url?: string | null
  is_self: boolean
  created_at: string | null
  updated_at: string | null
}

// Lightweight prescription row shown in hub lists
export interface HubPrescription {
  id: string
  profile_id: string
  doctor_name: string | null
  prescription_date: string | null   // ISO date string
  condition_tags: string[]
  medication_count: number | null
  created_at: string
  /** Linked documents.id  null for prescriptions created before the F2-B fix */
  document_id: string | null

}

export interface CreateProfileInput {
  name: string   // maps to full_name in DB
  relationship: ProfileRelationship
  dob?: string   // YYYY-MM-DD  maps to date_of_birth in DB
  email?: string   // optional  enables later account claiming
  avatar_url?: string
}
