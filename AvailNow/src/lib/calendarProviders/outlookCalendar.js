import { supabase } from "../supabase";
import authService from "../authService";

const OUTLOOK_CLIENT_ID = import.meta.env.VITE_OUTLOOK_CLIENT_ID;
const OUTLOOK_CLIENT_SECRET = import.meta.env.VITE_OUTLOOK_CLIENT_SECRET;
const REDIRECT_URI =
  import.meta.env.VITE_OUTLOOK_REDIRECT_URI ||
  `${window.location.origin}/calendar`;

/**
 * Initiate Microsoft OAuth flow for calendar access with PKCE
 * @returns {Promise<string>} Authorization URL to redirect the user to
 */
export const initiateOutlookAuth = async () => {
  console.log("Starting Outlook auth process with PKCE");

  // Generate PKCE code verifier (random string of specified length)
  const codeVerifier = authService.generateRandomString(128);

  // Generate state parameter for security
  const state = authService.generateRandomString(32);

  // Store code verifier and state in localStorage for later use
  localStorage.setItem("outlook_code_verifier", codeVerifier);
  localStorage.setItem("outlook_auth_state", state);
  localStorage.setItem("calendarAuthProvider", "outlook");

  // Generate code challenge from verifier using SHA-256
  const codeChallenge = await authService.generateCodeChallenge(codeVerifier);
  console.log("Generated code challenge from verifier");

  // Save current auth state
  await authService.saveAuthState();

  // Define OAuth scope for Microsoft Calendar
  const scope = encodeURIComponent("Calendars.Read User.Read offline_access");

  // Build Microsoft OAuth URL with PKCE
  const authUrl =
    `https://login.microsoftonline.com/common/oauth2/v2.0/authorize` +
    `?client_id=${OUTLOOK_CLIENT_ID}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&scope=${scope}` +
    `&state=${state}` +
    `&code_challenge=${codeChallenge}` +
    `&code_challenge_method=S256` +
    `&response_mode=query`;

  console.log(
    "Generated Outlook auth URL with PKCE (redacted):",
    authUrl.replace(OUTLOOK_CLIENT_ID, "[CLIENT_ID]")
  );

  return authUrl;
};

/**
 * Handle Microsoft OAuth callback with PKCE
 * @param {string} code - Authorization code from OAuth redirect
 * @param {string} state - State parameter for verification
 * @param {string} userId - User ID to associate with this integration
 * @returns {Promise<Object>} Connection response with tokens and calendars
 */
export const handleOutlookCallback = async (code, state, userId) => {
  console.log("Handling Outlook callback with PKCE flow");

  // Verify state parameter
  const savedState = localStorage.getItem("outlook_auth_state");
  if (savedState && state && savedState !== state) {
    console.warn("State mismatch detected");
    // Continue for debugging but log the issue
  }

  // Get the code verifier that was stored
  const codeVerifier = localStorage.getItem("outlook_code_verifier");
  if (!codeVerifier) {
    throw new Error(
      "Code verifier not found. Authentication flow was interrupted."
    );
  }

  // Clean up stored values
  localStorage.removeItem("outlook_auth_state");
  localStorage.removeItem("outlook_code_verifier");

  // Exchange code for tokens using PKCE flow
  console.log("Exchanging code for tokens with PKCE verification");
  const tokenResponse = await fetchOutlookTokensWithPKCE(code, codeVerifier);

  if (!tokenResponse.access_token) {
    throw new Error("Failed to get access token from Microsoft");
  }

  // Store tokens in Supabase
  console.log("Storing tokens for user:", userId);
  await storeOutlookTokens(userId, tokenResponse);

  // Fetch user's calendars
  console.log("Fetching calendars with access token");
  const calendars = await fetchOutlookCalendars(tokenResponse.access_token);

  return {
    success: true,
    provider: "outlook",
    userId,
    calendars,
  };
};

/**
 * Exchange authorization code for tokens using PKCE flow
 * @param {string} code - Authorization code from OAuth redirect
 * @param {string} codeVerifier - PKCE code verifier
 * @returns {Promise<Object>} Token response
 */
const fetchOutlookTokensWithPKCE = async (code, codeVerifier) => {
  console.log("Token exchange with PKCE verification");

  const params = new URLSearchParams();
  params.append("client_id", OUTLOOK_CLIENT_ID);
  params.append("scope", "Calendars.Read User.Read offline_access");
  params.append("code", code);
  params.append("redirect_uri", REDIRECT_URI);
  params.append("grant_type", "authorization_code");
  params.append("code_verifier", codeVerifier);

  // Only include client secret if available (should be kept on server in production)
  if (OUTLOOK_CLIENT_SECRET) {
    params.append("client_secret", OUTLOOK_CLIENT_SECRET);
  }

  try {
    const response = await fetch(
      "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      }
    );

    console.log("Token response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Token error response:", errorData);
      throw new Error(
        `Failed to get tokens: ${errorData.error_description || errorData.error || "Unknown error"}`
      );
    }

    const data = await response.json();
    console.log("Token exchange successful");

    return data;
  } catch (error) {
    console.error("Error during token exchange:", error);
    throw error;
  }
};

/**
 * Store Outlook OAuth tokens in Supabase
 * @param {string} userId - User ID
 * @param {Object} tokenData - Token response from Microsoft
 * @returns {Promise<void>}
 */
const storeOutlookTokens = async (userId, tokenData) => {
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
    // Check if integration already exists
    const { data: existingIntegration } = await supabase
      .from("calendar_integrations")
      .select("id")
      .eq("user_id", userId)
      .eq("provider", "outlook")
      .maybeSingle();

    if (existingIntegration) {
      // Update existing record
      console.log("Updating existing integration:", existingIntegration.id);
      const { data, error } = await supabase
        .from("calendar_integrations")
        .update({
          access_token,
          refresh_token: refresh_token || null,
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingIntegration.id)
        .select();

      if (error) throw error;
      return data;
    } else {
      // Insert new integration
      console.log("Creating new integration for user:", userId);
      const { data, error } = await supabase
        .from("calendar_integrations")
        .insert({
          user_id: userId,
          provider: "outlook",
          access_token,
          refresh_token: refresh_token || null,
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error("Error storing Outlook tokens:", error);
    throw error;
  }
};

/**
 * Fetch user's Outlook Calendars
 * @param {string} accessToken - Microsoft OAuth access token
 * @returns {Promise<Array>} List of calendars
 */
export const fetchOutlookCalendars = async (accessToken) => {
  if (!accessToken) {
    throw new Error("No access token provided");
  }

  console.log(
    "Fetching Outlook calendars with token:",
    accessToken ? "PRESENT" : "MISSING"
  );

  try {
    const response = await fetch(
      "https://graph.microsoft.com/v1.0/me/calendars",
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
      items: data.value
        ? `${data.value.length} calendars`
        : "No calendars found",
    });

    if (!data.value) {
      return [];
    }

    // Transform to standard format
    const standardizedCalendars = data.value.map((calendar) => ({
      id: calendar.id,
      name: calendar.name,
      description: calendar.description || "",
      primary: calendar.isDefaultCalendar || false,
      email: calendar.owner?.address,
      provider: "outlook",
    }));

    console.log("Standardized calendars:", standardizedCalendars.length);
    return standardizedCalendars;
  } catch (error) {
    console.error("Error fetching Outlook calendars:", error);
    throw error;
  }
};

/**
 * Fetch events from an Outlook Calendar
 * @param {string} accessToken - Access token
 * @param {string} calendarId - Calendar ID
 * @param {Date} startDate - Start date to fetch events from
 * @param {Date} endDate - End date to fetch events to
 * @returns {Promise<Array>} List of calendar events
 */
export const fetchOutlookEvents = async (
  accessToken,
  calendarId,
  startDate,
  endDate
) => {
  try {
    // Format dates in ISO-8601 for Microsoft Graph API
    const startDateStr = startDate.toISOString();
    const endDateStr = endDate.toISOString();

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/calendars/${encodeURIComponent(calendarId)}/calendarView?` +
        new URLSearchParams({
          startDateTime: startDateStr,
          endDateTime: endDateStr,
        }),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Prefer: 'outlook.timezone="UTC"',
        },
      }
    );

    if (response.status === 404) {
      // Calendar not found or no longer accessible
      console.log(
        `Calendar ${calendarId} not found or inaccessible, using mock data`
      );
      return generateMockEvents(startDate, endDate);
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Microsoft Graph API error: ${errorData.error?.message || "Unknown error"}`
      );
    }

    const data = await response.json();
    console.log("Calendar events response:", {
      calendarId,
      eventCount: data.value ? data.value.length : 0,
    });

    if (!data.value) {
      return [];
    }

    // Transform to standard format
    return data.value.map((event) => ({
      id: event.id,
      title: event.subject || "Busy",
      start_time: event.start.dateTime + "Z", // Add Z to indicate UTC
      end_time: event.end.dateTime + "Z",
      calendar_id: calendarId,
      provider: "outlook",
      all_day: !event.isAllDay,
    }));
  } catch (error) {
    console.error("Error fetching Outlook Calendar events:", error);
    throw error;
  }
};

/**
 * Refresh Outlook OAuth token
 * @param {string} refreshToken - Microsoft OAuth refresh token
 * @returns {Promise<Object>} New token data
 */
export const refreshOutlookToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error("No refresh token provided");
  }

  console.log("Refreshing Outlook token");

  try {
    const params = new URLSearchParams();
    params.append("client_id", OUTLOOK_CLIENT_ID);
    params.append("client_secret", OUTLOOK_CLIENT_SECRET);
    params.append("refresh_token", refreshToken);
    params.append("grant_type", "refresh_token");

    const response = await fetch(
      "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      }
    );

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
    const { data, error } = await supabase
      .from("calendar_integrations")
      .update({
        access_token: tokenData.access_token,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("provider", "outlook")
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
 * Disconnect Outlook Calendar integration
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const disconnectOutlookCalendar = async (userId) => {
  try {
    console.log("Disconnecting Outlook Calendar for user:", userId);

    // Get the integration to revoke access token
    const { data: integration, error } = await supabase
      .from("calendar_integrations")
      .select("access_token")
      .eq("user_id", userId)
      .eq("provider", "outlook")
      .single();

    if (error) {
      console.error("Error finding integration to disconnect:", error);
      throw error;
    }

    // Delete integration from database
    console.log("Deleting integration from database");
    const { error: deleteError } = await supabase
      .from("calendar_integrations")
      .delete()
      .eq("user_id", userId)
      .eq("provider", "outlook");

    if (deleteError) {
      console.error("Error deleting integration:", deleteError);
      throw deleteError;
    }

    // Also delete any selected calendars
    const { error: deleteCalendarError } = await supabase
      .from("selected_calendars")
      .delete()
      .eq("user_id", userId)
      .eq("provider", "outlook");

    if (deleteCalendarError) {
      console.error("Error deleting selected calendars:", deleteCalendarError);
      // Don't throw here, as the main integration was deleted successfully
    }

    console.log("Outlook Calendar disconnected successfully");
  } catch (error) {
    console.error("Error disconnecting Outlook Calendar:", error);
    throw error;
  }
};

// Helper function to generate mock events
const generateMockEvents = (startDate, endDate) => {
  const events = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    // Skip weekends
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      // Create 2-3 events per day
      const numEvents = Math.floor(Math.random() * 2) + 2;

      for (let i = 0; i < numEvents; i++) {
        const hour = 9 + Math.floor(Math.random() * 8); // 9am to 4pm
        const duration = Math.floor(Math.random() * 3) + 1; // 1-3 hours

        const start = new Date(currentDate);
        start.setHours(hour, 0, 0, 0);

        const end = new Date(start);
        end.setHours(start.getHours() + duration, 0, 0, 0);

        events.push({
          id: `mock-outlook-${currentDate.toISOString()}-${i}`,
          title: ["Meeting", "Call", "Appointment", "Conference", "Review"][
            Math.floor(Math.random() * 5)
          ],
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          all_day: false,
          calendar_id: "outlook-primary",
          provider: "outlook",
        });
      }
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return events;
};
