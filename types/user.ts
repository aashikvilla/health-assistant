// User-related types. Extend as the data model grows.

export interface User {
  id:         string
  email:      string
  created_at: string
  updated_at: string
}

export interface UserProfile extends User {
  full_name?:  string
  avatar_url?: string
  role?:       'user' | 'admin'
}
