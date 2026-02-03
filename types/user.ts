import { Database } from './database'

export type UserProfile = Database['public']['Tables']['profiles']['Row']
export type UserProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type UserProfileUpdate = Database['public']['Tables']['profiles']['Update']

export interface UpdateProfileInput {
  full_name?: string
  avatar_url?: string
  currency?: string
}
