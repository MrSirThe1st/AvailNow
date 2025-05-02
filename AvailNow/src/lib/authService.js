// src/lib/authService.js
import { supabase } from "./supabase";

// Helper to generate random string for code verifier
function generateRandomString(length) {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// Helper to create code challenge from verifier
async function generateCodeChallenge(codeVerifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);

  // Convert digest to base64url format
  return btoa(String.fromCharCode.apply(null, new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Save auth state before redirect
export async function saveAuthState() {
  const { data } = await supabase.auth.getSession();
  if (data?.session?.access_token) {
    localStorage.setItem("temp_auth_session", data.session.access_token);
    return true;
  }
  return false;
}

// Restore auth state after redirect
export async function restoreAuthState() {
  const savedToken = localStorage.getItem("temp_auth_session");
  if (savedToken) {
    try {
      await supabase.auth.setSession({
        access_token: savedToken,
        refresh_token: null,
      });
      localStorage.removeItem("temp_auth_session");
      return true;
    } catch (err) {
      console.error("Failed to restore session:", err);
      return false;
    }
  }
  return false;
}

export default {
  generateRandomString,
  generateCodeChallenge,
  saveAuthState,
  restoreAuthState,
};
