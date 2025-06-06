// src/lib/widgetService.jsx - Updated
import { supabase } from "./supabase";

export const getDefaultWidgetSettings = () => {
  return {
    theme: "light",
    accentColor: "#0070f3",
    textColor: "#333333",
    buttonText: "Check Availability",
    showDays: 5,
    compact: false,
    headerStyle: "modern",
    fontFamily: "system",
    borderRadius: "medium",
    providerName: "Your Company",
    providerAddress: "123 Business St, City, State",
    companyLogo: null,
    secondaryColor: "#00a8ff",

    // Business Hours
    businessHours: {
      startTime: "09:00",
      endTime: "17:00",
      workingDays: [1, 2, 3, 4, 5], // Monday to Friday
    },

    // Booking Settings - Default to contact
    bookingType: "contact",
    contactInfo: {
      phone: "+1 (555) 123-4567",
      email: "appointments@yourcompany.com",
      website: "https://yourcompany.com/book",
      message: "Call us to schedule your appointment or visit our website",
    },
    customInstructions: {
      title: "How to Book",
      message: "Contact us to schedule your appointment",
      buttonText: "Contact Us",
      actionUrl: "",
    },
  };
};

export const getWidgetSettings = async (userId) => {
  try {
    if (!userId) {
      return getDefaultWidgetSettings();
    }

    // Get widget settings
    const { data: widgetData, error: widgetError } = await supabase
      .from("widget_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (widgetError) {
      console.warn("Error fetching widget settings:", widgetError);
    }

    // Get calendar settings for business hours
    const { data: calendarData, error: calendarError } = await supabase
      .from("calendar_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (calendarError) {
      console.warn("Error fetching calendar settings:", calendarError);
    }

    const defaultSettings = getDefaultWidgetSettings();

    // Build business hours from calendar settings or defaults
    const businessHours = {
      startTime:
        calendarData?.availability_start_time ||
        defaultSettings.businessHours.startTime,
      endTime:
        calendarData?.availability_end_time ||
        defaultSettings.businessHours.endTime,
      workingDays:
        calendarData?.working_days || defaultSettings.businessHours.workingDays,
    };

    // Parse JSON strings for contact info and custom instructions
    let contactInfo = defaultSettings.contactInfo;
    let customInstructions = defaultSettings.customInstructions;

    if (widgetData?.contactInfo) {
      try {
        contactInfo =
          typeof widgetData.contactInfo === "string"
            ? JSON.parse(widgetData.contactInfo)
            : widgetData.contactInfo;
      } catch (e) {
        console.warn("Failed to parse contactInfo:", e);
      }
    }

    if (widgetData?.customInstructions) {
      try {
        customInstructions =
          typeof widgetData.customInstructions === "string"
            ? JSON.parse(widgetData.customInstructions)
            : widgetData.customInstructions;
      } catch (e) {
        console.warn("Failed to parse customInstructions:", e);
      }
    }

    const mergedSettings = {
      ...defaultSettings,
      ...widgetData,
      businessHours,
      contactInfo,
      customInstructions,
      companyLogo: widgetData?.company_logo || null,
      providerName: widgetData?.providerName || defaultSettings.providerName,
      // Ensure bookingType is never 'direct'
      bookingType:
        widgetData?.bookingType === "direct"
          ? "contact"
          : widgetData?.bookingType || "contact",
    };

    return mergedSettings;
  } catch (error) {
    console.error("Error fetching widget settings:", error);
    return getDefaultWidgetSettings();
  }
};

export const saveWidgetSettings = async (userId, settings) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    const { companyLogo, businessHours, ...widgetSettings } = settings;

    // Ensure bookingType is never 'direct'
    if (widgetSettings.bookingType === "direct") {
      widgetSettings.bookingType = "contact";
    }

    // Update widget settings
    const { data: existingSettings, error: checkError } = await supabase
      .from("widget_settings")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (checkError && checkError.code !== "PGRST116") {
      throw checkError;
    }

    const now = new Date().toISOString();

    const dbWidgetSettings = {
      user_id: userId,
      theme: widgetSettings.theme,
      accentColor: widgetSettings.accentColor,
      secondaryColor: widgetSettings.secondaryColor,
      textColor: widgetSettings.textColor,
      buttonText: widgetSettings.buttonText,
      showDays: widgetSettings.showDays,
      compact: widgetSettings.compact,
      headerStyle: widgetSettings.headerStyle,
      fontFamily: widgetSettings.fontFamily,
      borderRadius: widgetSettings.borderRadius,
      providerName: widgetSettings.providerName,
      providerAddress: widgetSettings.providerAddress,
      bookingType: widgetSettings.bookingType,
      contactInfo: JSON.stringify(widgetSettings.contactInfo),
      customInstructions: JSON.stringify(widgetSettings.customInstructions),
      company_logo: companyLogo,
      updated_at: now,
    };

    let widgetResult;

    if (existingSettings) {
      const { data, error } = await supabase
        .from("widget_settings")
        .update(dbWidgetSettings)
        .eq("id", existingSettings.id)
        .select()
        .single();

      if (error) throw error;
      widgetResult = data;
    } else {
      dbWidgetSettings.created_at = now;

      const { data, error } = await supabase
        .from("widget_settings")
        .insert(dbWidgetSettings)
        .select()
        .single();

      if (error) throw error;
      widgetResult = data;
    }

    // Update calendar settings for business hours
    const calendarSettingsData = {
      user_id: userId,
      availability_start_time: businessHours.startTime,
      availability_end_time: businessHours.endTime,
      working_days: businessHours.workingDays,
      updated_at: now,
    };

    const { data: existingCalendarSettings, error: calendarCheckError } =
      await supabase
        .from("calendar_settings")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

    if (calendarCheckError && calendarCheckError.code !== "PGRST116") {
      throw calendarCheckError;
    }

    if (existingCalendarSettings) {
      const { error: calendarUpdateError } = await supabase
        .from("calendar_settings")
        .update(calendarSettingsData)
        .eq("id", existingCalendarSettings.id);

      if (calendarUpdateError) throw calendarUpdateError;
    } else {
      calendarSettingsData.created_at = now;

      const { error: calendarInsertError } = await supabase
        .from("calendar_settings")
        .insert(calendarSettingsData);

      if (calendarInsertError) throw calendarInsertError;
    }

    return {
      ...widgetResult,
      businessHours,
      companyLogo:
        companyLogo !== undefined ? companyLogo : settings.companyLogo,
    };
  } catch (error) {
    console.error("Error saving widget settings:", error);
    throw error;
  }
};

// Generate time slots with 30-minute intervals (simplified)
export const generateTimeSlots = (startTime, endTime, interval = 30) => {
  const slots = [];
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  for (let minutes = startMinutes; minutes < endMinutes; minutes += interval) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;

    const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayTime = `${displayHour}:${minute.toString().padStart(2, "0")} ${ampm}`;

    slots.push({
      value: timeString,
      label: displayTime,
      minutes: minutes,
    });
  }

  return slots;
};

export const isWithinBusinessHours = (timeString, businessHours) => {
  const [hour, minute] = timeString.split(":").map(Number);
  const timeMinutes = hour * 60 + minute;

  const [startHour, startMinute] = businessHours.startTime
    .split(":")
    .map(Number);
  const [endHour, endMinute] = businessHours.endTime.split(":").map(Number);

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  return timeMinutes >= startMinutes && timeMinutes < endMinutes;
};

export const isWorkingDay = (date, workingDays) => {
  const dayOfWeek = date.getDay();
  return workingDays.includes(dayOfWeek);
};

export const generateWidgetEmbedCode = (userId, settings) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const settingsToUse = settings || getDefaultWidgetSettings();

  // Ensure bookingType is never 'direct' in embed code
  const safeBookingType =
    settingsToUse.bookingType === "direct"
      ? "contact"
      : settingsToUse.bookingType;

  return `<!-- AvailNow Widget -->
<script src="https://widget.availnow.com/embed.js"></script>
<script>
  AvailNow.initialize({
    userId: "${userId}",
    theme: "${settingsToUse.theme}",
    accentColor: "${settingsToUse.accentColor}",
    textColor: "${settingsToUse.textColor}",
    buttonText: "${settingsToUse.buttonText}",
    showDays: ${settingsToUse.showDays},
    compact: ${settingsToUse.compact},
    responsive: true,
    providerName: "${settingsToUse.providerName || ""}",
    providerAddress: "${settingsToUse.providerAddress || ""}",
    companyLogo: "${settingsToUse.companyLogo || ""}",
    businessHours: ${JSON.stringify(settingsToUse.businessHours)},
    bookingType: "${safeBookingType}",
    contactInfo: ${JSON.stringify(settingsToUse.contactInfo)},
    customInstructions: ${JSON.stringify(settingsToUse.customInstructions)}
  });
</script>
<!-- End AvailNow Widget -->`;
};

// Rest of the utility functions remain the same...
export const getAvailabilityForDateRange = async (
  userId,
  startDate,
  endDate
) => {
  if (!userId) {
    return [];
  }

  try {
    const settings = await getWidgetSettings(userId);
    const { businessHours } = settings;

    const { data, error } = await supabase
      .from("availability_slots")
      .select("*")
      .eq("user_id", userId)
      .gte("start_time", startDate.toISOString())
      .lte("end_time", endDate.toISOString())
      .order("start_time", { ascending: true });

    if (error) {
      throw error;
    }

    // Filter slots to only include those within business hours and working days
    const filteredSlots = (data || []).filter((slot) => {
      const slotDate = new Date(slot.start_time);
      const slotTime = slotDate.toTimeString().substring(0, 5);

      return (
        isWorkingDay(slotDate, businessHours.workingDays) &&
        isWithinBusinessHours(slotTime, businessHours)
      );
    });

    return filteredSlots;
  } catch (error) {
    console.error("Error fetching availability:", error);
    return [];
  }
};

export const trackWidgetEvent = async (userId, eventType) => {
  if (!userId || !eventType) {
    return;
  }

  try {
    const { data: stats, error: statsError } = await supabase
      .from("widget_stats")
      .select("id, views, clicks, bookings")
      .eq("user_id", userId)
      .single();

    if (statsError && statsError.code !== "PGRST116") {
      throw statsError;
    }

    const now = new Date().toISOString();

    if (stats) {
      const updates = {
        last_updated: now,
      };

      if (eventType === "view") updates.views = (stats.views || 0) + 1;
      if (eventType === "click") updates.clicks = (stats.clicks || 0) + 1;
      if (eventType === "booking") updates.bookings = (stats.bookings || 0) + 1;

      const { error: updateError } = await supabase
        .from("widget_stats")
        .update(updates)
        .eq("id", stats.id);

      if (updateError) throw updateError;
    } else {
      const newStats = {
        user_id: userId,
        views: eventType === "view" ? 1 : 0,
        clicks: eventType === "click" ? 1 : 0,
        bookings: eventType === "booking" ? 1 : 0,
        last_updated: now,
      };

      const { error: insertError } = await supabase
        .from("widget_stats")
        .insert(newStats);

      if (insertError) throw insertError;
    }
  } catch (error) {
    console.error("Error tracking widget event:", error);
  }
};

export const getWidgetStatistics = async (userId) => {
  if (!userId) {
    return {
      views: 0,
      clicks: 0,
      bookings: 0,
      last_updated: new Date().toISOString(),
    };
  }

  try {
    const { data, error } = await supabase
      .from("widget_stats")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return (
      data || {
        views: 0,
        clicks: 0,
        bookings: 0,
        last_updated: new Date().toISOString(),
      }
    );
  } catch (error) {
    console.error("Error fetching widget statistics:", error);
    return {
      views: 0,
      clicks: 0,
      bookings: 0,
      last_updated: new Date().toISOString(),
    };
  }
};

export const getUserProfileForWidget = async (userId) => {
  if (!userId) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getUserProfileForWidget:", error);
    return null;
  }
};

export const getCalendarIntegrations = async (userId) => {
  if (!userId) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("calendar_integrations")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching calendar integrations:", error);
    return [];
  }
};

export const getWidgetData = async (userId) => {
  if (!userId) {
    return {
      settings: getDefaultWidgetSettings(),
      profile: null,
      stats: {
        views: 0,
        clicks: 0,
        bookings: 0,
      },
      availability: [],
      hasCalendarIntegration: false,
    };
  }

  try {
    const [settings, profile, stats, integrations] = await Promise.all([
      getWidgetSettings(userId),
      getUserProfileForWidget(userId),
      getWidgetStatistics(userId),
      getCalendarIntegrations(userId),
    ]);

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    const availability = await getAvailabilityForDateRange(
      userId,
      startDate,
      endDate
    );

    await trackWidgetEvent(userId, "view");

    return {
      settings,
      profile,
      stats,
      availability,
      hasCalendarIntegration: integrations.length > 0,
    };
  } catch (error) {
    console.error("Error getting widget data:", error);
    return {
      settings: getDefaultWidgetSettings(),
      profile: null,
      stats: {
        views: 0,
        clicks: 0,
        bookings: 0,
      },
      availability: [],
      hasCalendarIntegration: false,
    };
  }
};
