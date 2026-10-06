import { createMiddleware } from '@tanstack/react-start'
import { getWebRequest } from '@tanstack/react-start/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

export async function requireSupabaseAuth() {
  const request = getWebRequest()
  const authHeader = request?.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    throw new Error('Unauthorized')
  }

  const supabase = createClient<Database>(
    process.env['SUPABASE_URL']!,
    process.env['SUPABASE_PUBLISHABLE_KEY']!,
  )

  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) {
    throw new Error('Unauthorized')
  }

  return data.user
}
