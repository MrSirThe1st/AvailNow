// src/lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Basic client for unauthenticated operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Create a Supabase client that uses Clerk session tokens
 * @param {function} getToken - Function to get the Clerk session token
 * @returns {Object} Supabase client
 */
export function createClerkSupabaseClient(session) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${session}`
      }
    }
  });
}
