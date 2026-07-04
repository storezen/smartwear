import { createClient } from '@supabase/supabase-js'
import { env } from './env'

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// We only initialize the client if the keys are actually provided.
// This allows the app to fallback to the local JSON DB if Supabase isn't configured yet.
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null

// Server-side admin client using the service key (bypasses 1000-row limit).
// Only import this on the server (API routes, server components).
export const supabaseAdmin = supabaseUrl && env.SUPABASE_SERVICE_KEY
  ? createClient(supabaseUrl, env.SUPABASE_SERVICE_KEY)
  : null

export const isSupabaseConfigured = () => {
  return supabase !== null
}