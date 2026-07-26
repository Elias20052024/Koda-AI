import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Lazily created so a missing var during HMR doesn't crash the whole app.
let _client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (_client) return _client;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    );
  }
  _client = createClient(supabaseUrl, supabaseAnonKey);
  return _client;
}

/** True when Supabase env vars are present — use to conditionally show social buttons. */
export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
