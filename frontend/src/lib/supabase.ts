import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UserRole = 'student' | 'teacher' | 'admin'

export interface Profile {
  id: string
  name: string
  email: string
  role: UserRole
  batch_id: string | null
  avatar_url?: string
  created_at: string
}

export interface Batch {
  id: string
  name: string
  year: number
  created_at: string
}

export interface Capsule {
  id: string
  sender_id: string
  recipient_type: 'teacher' | 'student'
  recipient_id?: string
  content_text: string
  media_urls: string[]
  unlock_date: string
  is_unlocked: boolean
  batch_id: string
  created_at: string
  sender?: Profile
  batch?: Batch
}

export interface Notification {
  id: string
  user_id: string
  message: string
  is_read: boolean
  created_at: string
}
