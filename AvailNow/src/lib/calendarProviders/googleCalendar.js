// src/lib/calendarProviders/googleCalendar.js

// Google OAuth configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
const REDIRECT_URI =
  import.meta.env.VITE_GOOGLE_REDIRECT_URI ||
  `${window.location.origin}/calendar`;

/**
 * Initiate Google OAuth flow for calendar access
 * @returns {string} Authorization URL to redirect the user to
 */
export const initiateGoogleAuth = () => {
  // Generate a random state value for security
  const state = Math.random().toString(36).substring(2);
  localStorage.setItem("google_auth_state", state);

  // Define OAuth scope for Google Calendar
  const scope = encodeURIComponent(
    "https://www.googleapis.com/auth/calendar.readonly"
  );

  // Build Google OAuth URL
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${scope}&access_type=offline&state=${state}&prompt=consent`;

  return authUrl;
};

/**
 * Handle Google OAuth callback
 * @param {string} code - Authorization code from OAuth redirect
 * @param {string} state - State parameter for verification
 * @param {string} userId - User ID to associate with this integration
 * @returns {Promise<Object>} Connection response with tokens and calendars
 */
export const handleGoogleCallback = async (code, state, userId) => {
  // Verify state parameter
  const savedState = localStorage.getItem("google_auth_state");
  if (state !== savedState) {
    throw new Error("Invalid state parameter");
  }

  // Clean up state
  localStorage.removeItem("google_auth_state");

  // Exchange code for tokens
  const tokenResponse = await fetchGoogleTokens(code);

  // Store tokens in Supabase
  await storeGoogleTokens(userId, tokenResponse);

  // Fetch user's calendars
  const calendars = await fetchGoogleCalendars(tokenResponse.access_token);

  return {
    success: true,
    provider: "google",
    userId,
    calendars,
  };
};

/**
 * Exchange authorization code for access and refresh tokens
 * @param {string} code - Authorization code from OAuth redirect
 * @returns {Promise<Object>} Token response
 */
const fetchGoogleTokens = async (code) => {
  const params = new URLSearchParams();
  params.append("client_id", GOOGLE_CLIENT_ID);
  params.append("client_secret", GOOGLE_CLIENT_SECRET);
  params.append("code", code);
  params.append("redirect_uri", REDIRECT_URI);
  params.append("grant_type", "authorization_code");

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Failed to get tokens: ${errorData.error_description || "Unknown error"}`
    );
  }

  return await response.json();
};

/**
 * Store Google OAuth tokens in Supabase
 * @param {string} userId - User ID
 * @param {Object} tokenData - Token response from Google
 * @returns {Promise<void>}
 */
const storeGoogleTokens = async (userId, tokenData) => {
  const { access_token, refresh_token, expires_in } = tokenData;

  // Calculate expiration date
  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);

  // Store tokens in Supabase
  const { supabase } = await import("../supabase");

  const { error } = await supabase.from("calendar_integrations").upsert(
    {
      user_id: userId,
      provider: "google",
      access_token,
      refresh_token,
      expires_at: expiresAt.toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,provider",
    }
  );

  if (error) {
    throw error;
  }
};

/**
 * Fetch user's Google Calendars
 * @param {string} accessToken - Google OAuth access token
 * @returns {Promise<Array>} List of calendars
 */
export const fetchGoogleCalendars = async (accessToken) => {
  const response = await fetch(
    "https://www.googleapis.com/calendar/v3/users/me/calendarList",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Failed to fetch calendars: ${errorData.error?.message || "Unknown error"}`
    );
  }

  const data = await response.json();

  // Transform to standard format
  return data.items.map((calendar) => ({
    id: calendar.id,
    name: calendar.summary,
    description: calendar.description,
    primary: calendar.primary || false,
    email: calendar.id.includes("@") ? calendar.id : null,
    provider: "google",
  }));
};

/**
 * Fetch events from a Google Calendar
 * @param {string} userId - User ID
 * @param {string} calendarId - Calendar ID
 * @param {Date} startDate - Start date to fetch events from
 * @param {Date} endDate - End date to fetch events to
 * @returns {Promise<Array>} List of calendar events
 */
export const fetchGoogleEvents = async (
  userId,
  calendarId,
  startDate,
  endDate
) => {
  // Get the user's access token
  const { supabase } = await import("../supabase");

  const { data: integration, error } = await supabase
    .from("calendar_integrations")
    .select("access_token, refresh_token, expires_at")
    .eq("user_id", userId)
    .eq("provider", "google")
    .single();

  if (error) {
    throw error;
  }

  if (!integration) {
    throw new Error("Google Calendar integration not found");
  }

  // Check if token is expired and refresh if needed
  const now = new Date();
  const expiresAt = new Date(integration.expires_at);

  let accessToken = integration.access_token;

  if (now >= expiresAt) {
    // Token is expired, refresh it
    const newTokens = await refreshGoogleToken(integration.refresh_token);
    accessToken = newTokens.access_token;
  }

  // Format dates for Google API
  const timeMin = startDate.toISOString();
  const timeMax = endDate.toISOString();

  // Fetch events from Google Calendar
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Failed to fetch events: ${errorData.error?.message || "Unknown error"}`
    );
  }

  const data = await response.json();

  // Transform to standard format
  return data.items.map((event) => ({
    id: event.id,
    title: event.summary || "Busy",
    description: event.description,
    start: new Date(event.start.dateTime || event.start.date),
    end: new Date(event.end.dateTime || event.end.date),
    allDay: !event.start.dateTime,
    location: event.location,
    calendarId: calendarId,
    provider: "google",
  }));
};

/**
 * Refresh Google OAuth token
 * @param {string} refreshToken - Google OAuth refresh token
 * @returns {Promise<Object>} New token data
 */
const refreshGoogleToken = async (refreshToken) => {
  const params = new URLSearchParams();
  params.append("client_id", GOOGLE_CLIENT_ID);
  params.append("client_secret", GOOGLE_CLIENT_SECRET);
  params.append("refresh_token", refreshToken);
  params.append("grant_type", "refresh_token");

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Failed to refresh token: ${errorData.error_description || "Unknown error"}`
    );
  }

  const tokenData = await response.json();

  // Calculate expiration date
  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

  // Update token in database
  const { supabase } = await import("../supabase");

  await supabase
    .from("calendar_integrations")
    .update({
      access_token: tokenData.access_token,
      expires_at: expiresAt.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("provider", "google")
    .eq("refresh_token", refreshToken);

  return tokenData;
};

/**
 * Disconnect Google Calendar integration
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const disconnectGoogleCalendar = async (userId) => {
  const { supabase } = await import("../supabase");

  // Get the integration to revoke access token
  const { data: integration, error } = await supabase
    .from("calendar_integrations")
    .select("access_token")
    .eq("user_id", userId)
    .eq("provider", "google")
    .single();

  if (error && error.code !== "PGRST116") {
    // Not found
    throw error;
  }

  if (integration?.access_token) {
    // Revoke access token with Google
    await fetch(
      `https://oauth2.googleapis.com/revoke?token=${integration.access_token}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
  }

  // Delete integration from database
  const { error: deleteError } = await supabase
    .from("calendar_integrations")
    .delete()
    .eq("user_id", userId)
    .eq("provider", "google");

  if (deleteError) {
    throw deleteError;
  }
};
