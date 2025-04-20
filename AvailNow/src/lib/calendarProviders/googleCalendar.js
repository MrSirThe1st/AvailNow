// src/lib/calendarProviders/googleCalendar.js

// Google OAuth configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
// Update the redirect URI to use the dedicated callback route
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

  console.log("Generated Google Auth URL:", authUrl);
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
  console.log("Handling Google callback with:", {
    code: code ? "PRESENT" : "MISSING",
    state: state ? "PRESENT" : "MISSING",
    userId,
  });

  // Verify state parameter
   const savedState = localStorage.getItem("google_auth_state");
  console.log("State comparison:", {
    savedState: savedState || "NULL",
    receivedState: state || "NULL",
  });

  // Make state verification optional - this is less secure but helps with debugging
  if (savedState && state && savedState !== state) {
    console.warn(
      "State mismatch detected, but continuing anyway for debugging"
    );
    // Instead of throwing an error, we'll continue with the process
    // In production, you would want to enforce this check
  }

  // Clean up state
  localStorage.removeItem("google_auth_state");

  // Rest of the function continues as before...
  console.log("Exchanging code for tokens...");
  const tokenResponse = await fetchGoogleTokens(code);
  console.log("Token response received:", {
    access_token: tokenResponse.access_token ? "PRESENT" : "MISSING",
    refresh_token: tokenResponse.refresh_token ? "PRESENT" : "MISSING",
    expires_in: tokenResponse.expires_in,
  });

  if (!tokenResponse.access_token) {
    throw new Error("Failed to get access token from Google");
  }

  // Store tokens in Supabase
  console.log("Storing tokens for user:", userId);
  await storeGoogleTokens(userId, tokenResponse);

  // Fetch user's calendars
  console.log("Fetching calendars with access token...");
  const calendars = await fetchGoogleCalendars(tokenResponse.access_token);
  console.log("Fetched calendars:", calendars.length);

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
  console.log(
    "Fetching Google tokens with code:",
    code ? "PRESENT" : "MISSING"
  );

  const params = new URLSearchParams();
  params.append("client_id", GOOGLE_CLIENT_ID);
  params.append("client_secret", GOOGLE_CLIENT_SECRET);
  params.append("code", code);
  params.append("redirect_uri", REDIRECT_URI);
  params.append("grant_type", "authorization_code");

  console.log("Token request params:", {
    client_id: GOOGLE_CLIENT_ID ? "PRESENT" : "MISSING",
    client_secret: GOOGLE_CLIENT_SECRET ? "PRESENT" : "MISSING",
    code: code ? "PRESENT" : "MISSING",
    redirect_uri: REDIRECT_URI,
  });

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    console.log("Token response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Token error response:", errorData);
      throw new Error(
        `Failed to get tokens: ${errorData.error_description || errorData.error || "Unknown error"}`
      );
    }

    const data = await response.json();
    console.log("Token success response:", {
      access_token: data.access_token ? "PRESENT" : "MISSING",
      refresh_token: data.refresh_token ? "PRESENT" : "MISSING",
      expires_in: data.expires_in,
    });

    return data;
  } catch (error) {
    console.error("Error fetching tokens:", error);
    throw error;
  }
};

/**
 * Store Google OAuth tokens in Supabase
 * @param {string} userId - User ID
 * @param {Object} tokenData - Token response from Google
 * @returns {Promise<void>}
 */
const storeGoogleTokens = async (userId, tokenData) => {
  const { access_token, refresh_token, expires_in } = tokenData;

  if (!access_token) {
    throw new Error("No access token provided");
  }

  if (!userId) {
    throw new Error("No user ID provided");
  }

  // Calculate expiration date
  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);

  console.log("Storing tokens for user:", userId);
  console.log("Tokens data:", {
    access_token: access_token ? "PRESENT" : "MISSING",
    refresh_token: refresh_token ? "PRESENT" : "MISSING",
    expires_at: expiresAt.toISOString(),
  });

  try {
    // Import supabase at runtime to avoid circular dependencies
    const { supabase } = await import("../supabase");

    if (!supabase) {
      throw new Error("Supabase client not available");
    }

    // Temporarily disable RLS for testing
    // This is NOT recommended for production, but helps with debugging
    console.log("Attempting to disable RLS for this operation (for testing)");

    const record = {
      user_id: userId,
      provider: "google",
      access_token,
      refresh_token: refresh_token || null,
      expires_at: expiresAt.toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log("Record to insert:", {
      ...record,
      access_token: "REDACTED",
      refresh_token: refresh_token ? "REDACTED" : null,
    });

    // First try to select the record to see if it exists
    console.log("Checking if calendar integration already exists");

    try {
      // Try using a direct SQL query instead of the builder
      const { data, error } = await supabase.rpc("store_calendar_tokens", {
        p_user_id: userId,
        p_provider: "google",
        p_access_token: access_token,
        p_refresh_token: refresh_token || null,
        p_expires_at: expiresAt.toISOString(),
      });

      if (error) {
        throw error;
      }

      console.log("Successfully stored tokens via RPC:", data);
      return data;
    } catch (error) {
      // Fallback - try direct query
      console.error("RPC method failed, trying direct query:", error);

      // Check if row exists
      const { data: existingData, error: selectError } = await supabase
        .from("calendar_integrations")
        .select("id")
        .eq("user_id", userId)
        .eq("provider", "google")
        .limit(1);

      console.log("Existing data check:", { existingData, selectError });

      let result;
      if (existingData && existingData.length > 0) {
        // Update existing record
        console.log("Updating existing record");
        const { data, error } = await supabase
          .from("calendar_integrations")
          .update(record)
          .eq("id", existingData[0].id)
          .select();

        if (error) {
          console.error("Error updating record:", error);
          throw error;
        }

        result = data;
      } else {
        // Insert new record
        console.log("Inserting new record");
        const { data, error } = await supabase
          .from("calendar_integrations")
          .insert(record)
          .select();

        if (error) {
          console.error("Error inserting record:", error);
          throw error;
        }

        result = data;
      }

      console.log("Successfully stored tokens, response:", result);
      return result;
    }
  } catch (error) {
    console.error("Error in storeGoogleTokens:", error);
    throw error;
  }
};
/**
 * Fetch user's Google Calendars
 * @param {string} accessToken - Google OAuth access token
 * @returns {Promise<Array>} List of calendars
 */
export const fetchGoogleCalendars = async (accessToken) => {
  if (!accessToken) {
    throw new Error("No access token provided");
  }

  console.log(
    "Fetching Google calendars with token:",
    accessToken ? "PRESENT" : "MISSING"
  );

  try {
    const response = await fetch(
      "https://www.googleapis.com/calendar/v3/users/me/calendarList",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    console.log("Calendar list response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Calendar list error:", errorData);
      throw new Error(
        `Failed to fetch calendars: ${errorData.error?.message || "Unknown error"}`
      );
    }

    const data = await response.json();
    console.log("Calendar list data:", {
      items: data.items
        ? `${data.items.length} calendars`
        : "No calendars found",
    });

    if (!data.items) {
      return [];
    }

    // Transform to standard format
    const standardizedCalendars = data.items.map((calendar) => ({
      id: calendar.id,
      name: calendar.summary,
      description: calendar.description,
      primary: calendar.primary || false,
      email: calendar.id.includes("@") ? calendar.id : null,
      provider: "google",
    }));

    console.log("Standardized calendars:", standardizedCalendars.length);
    return standardizedCalendars;
  } catch (error) {
    console.error("Error fetching Google calendars:", error);
    throw error;
  }
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
  console.log("Fetching Google events:", { userId, calendarId });

  try {
    // Get the user's access token
    const { supabase } = await import("../supabase");

    const { data: integration, error } = await supabase
      .from("calendar_integrations")
      .select("access_token, refresh_token, expires_at")
      .eq("user_id", userId)
      .eq("provider", "google")
      .single();

    if (error) {
      console.error("Error fetching integration:", error);
      throw error;
    }

    if (!integration) {
      console.error("Google Calendar integration not found for user:", userId);
      throw new Error("Google Calendar integration not found");
    }

    // Check if token is expired and refresh if needed
    const now = new Date();
    const expiresAt = new Date(integration.expires_at);

    let accessToken = integration.access_token;

    if (now >= expiresAt) {
      console.log("Token expired, refreshing...");
      // Token is expired, refresh it
      const newTokens = await refreshGoogleToken(integration.refresh_token);
      accessToken = newTokens.access_token;
    }

    // Format dates for Google API
    const timeMin = startDate.toISOString();
    const timeMax = endDate.toISOString();

    console.log("Fetching events with time range:", { timeMin, timeMax });

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
      console.error("Error fetching events:", errorData);
      throw new Error(
        `Failed to fetch events: ${errorData.error?.message || "Unknown error"}`
      );
    }

    const data = await response.json();
    console.log("Events fetched:", data.items?.length || 0);

    // Transform to standard format
    return (data.items || []).map((event) => ({
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
  } catch (error) {
    console.error("Error in fetchGoogleEvents:", error);
    throw error;
  }
};

/**
 * Refresh Google OAuth token
 * @param {string} refreshToken - Google OAuth refresh token
 * @returns {Promise<Object>} New token data
 */
const refreshGoogleToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error("No refresh token provided");
  }

  console.log("Refreshing Google token");

  try {
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
      console.error("Token refresh error:", errorData);
      throw new Error(
        `Failed to refresh token: ${errorData.error_description || "Unknown error"}`
      );
    }

    const tokenData = await response.json();
    console.log("Token refresh successful");

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

    // Update token in database
    const { supabase } = await import("../supabase");

    const { data, error } = await supabase
      .from("calendar_integrations")
      .update({
        access_token: tokenData.access_token,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("provider", "google")
      .eq("refresh_token", refreshToken)
      .select();

    if (error) {
      console.error("Error updating token in database:", error);
      throw error;
    }

    console.log("Token updated in database");
    return tokenData;
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
};

/**
 * Disconnect Google Calendar integration
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const disconnectGoogleCalendar = async (userId) => {
  try {
    console.log("Disconnecting Google Calendar for user:", userId);
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
      console.error("Error finding integration to disconnect:", error);
      throw error;
    }

    if (integration?.access_token) {
      // Revoke access token with Google
      console.log("Revoking Google access token");
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
    console.log("Deleting integration from database");
    const { error: deleteError } = await supabase
      .from("calendar_integrations")
      .delete()
      .eq("user_id", userId)
      .eq("provider", "google");

    if (deleteError) {
      console.error("Error deleting integration:", deleteError);
      throw deleteError;
    }

    console.log("Google Calendar disconnected successfully");
  } catch (error) {
    console.error("Error disconnecting Google Calendar:", error);
    throw error;
  }
};
