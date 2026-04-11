// Stage 5 — Family Hub types

export type ProfileRelationship =
  | 'self'
  | 'father'
  | 'mother'
  | 'spouse'
  | 'sibling'
  | 'other'

export const RELATIONSHIP_LABELS: Record<ProfileRelationship, string> = {
  self:    'You',
  father:  'Father',
  mother:  'Mother',
  spouse:  'Spouse',
  sibling: 'Sibling',
  other:   'Other',
}

export interface FamilyProfile {
  id:            string
  user_id:       string
  full_name:     string
  relationship:  ProfileRelationship
  date_of_birth: string | null   // ISO date string YYYY-MM-DD
  avatar_url:    string | null
  is_self:       boolean
  created_at:    string | null
  updated_at:    string | null
}

// Lightweight prescription row shown in hub lists
// Full schema owned by Stage 2 (upload) and Stage 6 (records) teams
export interface HubPrescription {
  id:                string
  profile_id:        string
  doctor_name:       string | null
  prescription_date: string | null   // ISO date string
  condition_tags:    string[]
  medication_count:  number
  created_at:        string
}

export interface CreateProfileInput {
  name:          string   // maps to full_name in DB
  relationship:  ProfileRelationship
  dob?:          string   // YYYY-MM-DD — maps to date_of_birth in DB
  avatar_url?:   string
}
