import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Named `supabase` so any cached import of `{ supabase }` still resolves.
export const supabase: SupabaseClient | undefined = supabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : undefined;

export const getSupabaseClient = () => {
  if (!supabaseConfigured || !supabase) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.',
    );
  }
  return supabase;
};
