import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente para uso em Server Components e Route Handlers.
// Cada chamada cria uma nova instância (sem singleton) para evitar
// compartilhamento de estado entre requisições no servidor.
export function getSupabaseServerClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}
