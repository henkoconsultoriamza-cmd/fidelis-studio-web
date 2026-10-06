import { createMiddleware } from '@tanstack/react-start'
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

export const requireSupabaseAuth = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    // Dynamic import keeps @tanstack/react-start/server out of the client bundle.
    const { getWebRequest } = await import('@tanstack/react-start/server')
    const request = getWebRequest()
    const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')

    if (!token) throw new Error('Unauthorized')

    const supabase = createClient<Database>(
      process.env['SUPABASE_URL']!,
      process.env['SUPABASE_PUBLISHABLE_KEY']!,
    )
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data.user) throw new Error('Unauthorized')

    return next({
      context: { userId: data.user.id, supabase },
    })
  },
)
