import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Load inside server handlers: const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
export const supabaseAdmin = createClient<Database>(
  process.env['SUPABASE_URL']!,
  process.env['SUPABASE_SERVICE_ROLE_KEY'] ?? process.env['SUPABASE_PUBLISHABLE_KEY']!,
)
