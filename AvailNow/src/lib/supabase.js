// src/lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Basic client for unauthenticated operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Create a Supabase client that uses Clerk session tokens
 * @param {string} session - Clerk session token
 * @returns {Object} Supabase client
 */
export function createClerkSupabaseClient(session) {
  // Create a headers object with Authorization
  const headers = {};

  if (session) {
    headers.Authorization = `Bearer ${session}`;
  }

  // Create a client with the headers
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: headers,
    },
    auth: {
      persistSession: false,
    },
  });
}

/**
 * Get JWT payload for debugging
 */
export async function getJwtPayload() {
  try {
    const { data, error } = await supabase.rpc("get_jwt_payload");
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error getting JWT payload:", error);
    return null;
  }
}
