import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Named `supabase` so any cached import of `{ supabase }` still resolves.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Convenience helper kept for compatibility with newer imports.
export const getSupabaseClient = () => supabase;

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
