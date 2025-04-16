// src/lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Basic client for unauthenticated operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create an authenticated client with Clerk native integration
export function createClerkSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
    global: {
      headers: {
        "X-Client-Info": "@supabase/auth-helpers-nextjs",
      },
    },
  });
}
