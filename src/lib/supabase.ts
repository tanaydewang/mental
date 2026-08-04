import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables. Check your .env file.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export type MoodRow = {
  id: string
  user_id: string
  mood: string
  emoji: string
  intensity: number
  note: string
  tags: string[]
  logged_at: string
  created_at: string
}

export type JournalRow = {
  id: string
  user_id: string
  title: string
  content: string
  category: string
  is_pinned: boolean
  created_at: string
  updated_at: string
}

export type SleepRow = {
  id: string
  user_id: string
  hours: number
  quality: number
  bedtime: string | null
  wake_time: string | null
  note: string
  logged_at: string
  created_at: string
}

export type GoalRow = {
  id: string
  user_id: string
  title: string
  description: string
  target_count: number
  current_count: number
  unit: string
  status: "active" | "completed" | "paused"
  due_date: string | null
  created_at: string
  updated_at: string
}

export type PostRow = {
  id: string
  user_id: string
  author_name: string
  author_avatar: string | null
  title: string
  content: string
  mood: string | null
  likes: number
  created_at: string
}

export type ProfileRow = {
  id: string
  full_name: string
  avatar_url: string | null
  bio: string
  theme_preference: string
  notification_enabled: boolean
  privacy_public: boolean
  created_at: string
  updated_at: string
}
