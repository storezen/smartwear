import { createClient } from '@supabase/supabase-js'
import { env } from './env'

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// We only initialize the client if the keys are actually provided.
// This allows the app to fallback to the local JSON DB if Supabase isn't configured yet.
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null

export const isSupabaseConfigured = () => {
  return supabase !== null
}