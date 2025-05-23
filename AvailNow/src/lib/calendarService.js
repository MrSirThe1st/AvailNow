import { supabase } from "./supabase";
import * as googleCalendar from "./calendarProviders/googleCalendar";
import * as outlookCalendar from "./calendarProviders/outlookCalendar";
// import * as appleCalendar from "./calendarProviders/appleCalendar";

// Supported calendar providers
export const CALENDAR_PROVIDERS = {
  GOOGLE: "google",
  OUTLOOK: "outlook",
  APPLE: "apple",
  CALENDLY: "calendly",
};
/**
 * Initiate OAuth flow for a calendar provider
 * @param {string} provider - Calendar provider (e.g., "google", "outlook")
 * @returns {string} Authorization URL to redirect the user to
 */
export const initiateCalendarAuth = (provider) => {
  console.log("Initiating auth for provider:", provider);

  // Store the provider in localStorage to handle callbacks
  localStorage.setItem("calendarAuthProvider", provider);

  // Also store a flag in sessionStorage to indicate this is a calendar callback
  sessionStorage.setItem("oauth_callback_type", "calendar");

  // Save current session to restore after redirect
  supabase.auth.getSession().then(({ data }) => {
    if (data?.session?.access_token) {
      localStorage.setItem("temp_auth_session", data.session.access_token);
    }
  });

  switch (provider) {
    case CALENDAR_PROVIDERS.GOOGLE:
      return googleCalendar.initiateGoogleAuth();

    case CALENDAR_PROVIDERS.OUTLOOK:
      return outlookCalendar.initiateOutlookAuth();

    case CALENDAR_PROVIDERS.APPLE:
      // return appleCalendar.initiateAppleAuth();
      throw new Error("Apple Calendar integration not yet implemented");

    case CALENDAR_PROVIDERS.CALENDLY:
      // return calendlyCalendar.initiateCalendlyAuth();
      throw new Error("Calendly integration not yet implemented");

    default:
      throw new Error(`Unsupported calendar provider: ${provider}`);
  }
};

/**
 * Handle OAuth callback for a calendar provider
 * @param {string} provider - Calendar provider
 * @param {Object} params - URL parameters from OAuth callback
 * @param {string} userId - User ID to associate with this integration
 * @returns {Promise<Object>} Connection response with tokens and calendars
 */
export const handleCalendarCallback = async (provider, params, userId) => {
  switch (provider) {
    case CALENDAR_PROVIDERS.GOOGLE:
      return googleCalendar.handleGoogleCallback(
        params.code,
        params.state,
        userId
      );

    case CALENDAR_PROVIDERS.OUTLOOK:
      return outlookCalendar.handleOutlookCallback(
        params.code,
        params.state,
        userId
      );

    case CALENDAR_PROVIDERS.APPLE:
      // return appleCalendar.handleAppleCallback(params.code, params.state, userId);
      throw new Error("Apple Calendar integration not yet implemented");

    case CALENDAR_PROVIDERS.CALENDLY:
      // return calendlyCalendar.handleCalendlyCallback(params.code, params.state, userId);
      throw new Error("Calendly integration not yet implemented");

    default:
      throw new Error(`Unsupported calendar provider: ${provider}`);
  }
};

/**
 * Get all connected calendars for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} List of connected calendars
 */
export const getConnectedCalendars = async (userId) => {
  // Get all calendar integrations
  const { data: integrations, error } = await supabase
    .from("calendar_integrations")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to fetch calendar integrations:", error);
    throw new Error("Failed to fetch calendar integrations");
  }

  if (!integrations || integrations.length === 0) {
    return [];
  }

  // Fetch calendars for each integration
  const calendarsPromises = integrations.map(async (integration) => {
    try {
      return await fetchCalendars(userId, integration.provider);
    } catch (err) {
      console.error(
        `Failed to fetch calendars for ${integration.provider}:`,
        err
      );
      return [];
    }
  });

  const calendarsArrays = await Promise.all(calendarsPromises);

  // Flatten the array of arrays
  return calendarsArrays.flat();
};

/**
 * Fetch calendars for a specific provider
 * @param {string} userId - User ID
 * @param {string} provider - Calendar provider
 * @returns {Promise<Array>} List of calendars
 */
export const fetchCalendars = async (userId, provider) => {
  // Get the access token for this provider
  const { data: integration, error } = await supabase
    .from("calendar_integrations")
    .select("access_token")
    .eq("user_id", userId)
    .eq("provider", provider)
    .single();

  if (error || !integration) {
    throw new Error(`Calendar integration for ${provider} not found`);
  }

  // Fetch calendars based on the provider
  switch (provider) {
    case CALENDAR_PROVIDERS.GOOGLE:
      return googleCalendar.fetchGoogleCalendars(integration.access_token);

    case CALENDAR_PROVIDERS.OUTLOOK:
      return outlookCalendar.fetchOutlookCalendars(integration.access_token);

    case CALENDAR_PROVIDERS.APPLE:
      // return appleCalendar.fetchAppleCalendars(integration.access_token);
      throw new Error("Apple Calendar integration not yet implemented");

    case CALENDAR_PROVIDERS.CALENDLY:
      // return calendlyCalendar.fetchCalendlyCalendars(integration.access_token);
      throw new Error("Calendly integration not yet implemented");

    default:
      throw new Error(`Unsupported calendar provider: ${provider}`);
  }
};

/**
 * Fetch events from a calendar
 * @param {string} userId - User ID
 * @param {string} provider - Calendar provider
 * @param {string} calendarId - Calendar ID
 * @param {Date} startDate - Start date to fetch events from
 * @param {Date} endDate - End date to fetch events to
 * @returns {Promise<Array>} List of calendar events
 */
export const fetchCalendarEvents = async (
  userId,
  provider,
  calendarId,
  startDate,
  endDate
) => {
  try {
    // First get the integration details
    const { data: integration, error: integrationError } = await supabase
      .from("calendar_integrations")
      .select("*")
      .eq("user_id", userId)
      .eq("provider", provider)
      .single();

    if (integrationError || !integration) {
      console.error("Failed to fetch calendar integration:", integrationError);
      throw new Error("Calendar integration not found");
    }

    // Check if token is expired and refresh if needed
    const now = new Date();
    const tokenExpiresAt = new Date(integration.expires_at);

    // If token expires in less than 5 minutes, refresh it
    if (tokenExpiresAt <= new Date(now.getTime() + 5 * 60 * 1000)) {
      console.log("Access token expired or about to expire, refreshing...");

      if (provider === CALENDAR_PROVIDERS.GOOGLE && integration.refresh_token) {
        const newTokenData = await googleCalendar.refreshGoogleToken(
          integration.refresh_token
        );
        integration.access_token = newTokenData.access_token;
      } else if (
        provider === CALENDAR_PROVIDERS.OUTLOOK &&
        integration.refresh_token
      ) {
        const newTokenData = await outlookCalendar.refreshOutlookToken(
          integration.refresh_token
        );
        integration.access_token = newTokenData.access_token;
      } else {
        throw new Error("Unable to refresh token");
      }
    }

    // Now fetch events based on the provider
    switch (provider) {
      case CALENDAR_PROVIDERS.GOOGLE:
        return await googleCalendar.fetchGoogleEvents(
          integration.access_token,
          calendarId,
          startDate,
          endDate
        );

      case CALENDAR_PROVIDERS.OUTLOOK:
        return await outlookCalendar.fetchOutlookEvents(
          integration.access_token,
          calendarId,
          startDate,
          endDate
        );

      case CALENDAR_PROVIDERS.APPLE:
        throw new Error("Apple Calendar integration not yet implemented");

      case CALENDAR_PROVIDERS.CALENDLY:
        throw new Error("Calendly integration not yet implemented");

      default:
        throw new Error(`Unsupported calendar provider: ${provider}`);
    }
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    throw error;
  }
};

/**
 * Fetch events from multiple calendars
 * @param {string} userId - User ID
 * @param {Array} calendarIds - Array of objects with provider and calendarId
 * @param {Date} startDate - Start date to fetch events from
 * @param {Date} endDate - End date to fetch events to
 * @returns {Promise<Array>} List of calendar events
 */
export const fetchEventsFromMultipleCalendars = async (
  userId,
  calendarIds,
  startDate,
  endDate
) => {
  const eventsPromises = calendarIds.map(async ({ provider, calendarId }) => {
    try {
      return await fetchCalendarEvents(
        userId,
        provider,
        calendarId,
        startDate,
        endDate
      );
    } catch (err) {
      console.error(`Failed to fetch events for calendar ${calendarId}:`, err);
      return [];
    }
  });

  const eventsArrays = await Promise.all(eventsPromises);

  // Flatten the array of arrays and sort by start time
  return eventsArrays.flat().sort((a, b) => a.start - b.start);
};

/**
 * Disconnect a calendar integration
 * @param {string} userId - User ID
 * @param {string} provider - Calendar provider
 * @returns {Promise<void>}
 */
export const disconnectCalendar = async (userId, provider) => {
  switch (provider) {
    case CALENDAR_PROVIDERS.GOOGLE:
      return googleCalendar.disconnectGoogleCalendar(userId);

    case CALENDAR_PROVIDERS.OUTLOOK:
      return outlookCalendar.disconnectOutlookCalendar(userId);

    case CALENDAR_PROVIDERS.APPLE:
      // return appleCalendar.disconnectAppleCalendar(userId);
      throw new Error("Apple Calendar integration not yet implemented");

    case CALENDAR_PROVIDERS.CALENDLY:
      // return calendlyCalendar.disconnectCalendlyCalendar(userId);
      throw new Error("Calendly integration not yet implemented");

    default:
      throw new Error(`Unsupported calendar provider: ${provider}`);
  }
};

/**
 * Store user's selected calendars for availability checking
 * @param {string} userId - User ID
 * @param {Array} selectedCalendars - Array of selected calendar IDs with providers
 * @returns {Promise<void>}
 */
export const saveSelectedCalendars = async (userId, selectedCalendars) => {
  try {
    console.log("Starting saveSelectedCalendars for user:", userId);
    console.log("Calendars to save:", selectedCalendars);

    // Delete existing selections
    console.log("Deleting existing calendar selections");
    const { error: deleteError } = await supabase
      .from("selected_calendars")
      .delete()
      .eq("user_id", userId);

    if (deleteError) {
      console.error(
        "Failed to clear existing calendar selections:",
        deleteError
      );
      console.error("Full delete error:", JSON.stringify(deleteError, null, 2));
      throw new Error("Failed to save calendar selections");
    }

    // Insert new selections
    if (selectedCalendars && selectedCalendars.length > 0) {
      const calendarRecords = selectedCalendars.map((calendar) => ({
        user_id: userId,
        calendar_id: calendar.id,
        provider: calendar.provider || "google", // Default to google if not specified
        created_at: new Date().toISOString(),
      }));

      console.log("Inserting calendar records:", calendarRecords);

      const { data, error: insertError } = await supabase
        .from("selected_calendars")
        .insert(calendarRecords)
        .select();

      if (insertError) {
        console.error("Failed to save selected calendars:", insertError);
        console.error(
          "Full insert error:",
          JSON.stringify(insertError, null, 2)
        );
        throw new Error("Failed to save calendar selections");
      }

      console.log("Successfully saved calendars, response:", data);
      return data;
    } else {
      console.log("No calendars to save");
    }

    return [];
  } catch (error) {
    console.error("Error in saveSelectedCalendars:", error);
    throw error;
  }
};

/**
 * Get the user's selected calendars for availability checking
 * @param {string} userId - User ID
 * @returns {Promise<Array>} List of selected calendar IDs with providers
 */
export const getSelectedCalendars = async (userId) => {
  const { data, error } = await supabase
    .from("selected_calendars")
    .select("calendar_id, provider")
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to fetch selected calendars:", error);
    throw new Error("Failed to fetch selected calendars");
  }

  return data || [];
};
