/**
 * AvailNow Widget Embed Script
 * This script is designed to be embedded on external websites to display
 * the AvailNow availability widget with real data from the AvailNow API.
 */

(function (window, document) {
  "use strict";

  // Create the AvailNow global object if it doesn't exist
  window.AvailNow = window.AvailNow || {};

  // Default settings
  const defaultSettings = {
    selector: "#availnow-widget",
    userId: "",
    theme: "light",
    accentColor: "#0070f3",
    textColor: "#333333",
    buttonText: "Check Availability",
    showDays: 5,
    compact: false,
  };

  // API endpoints
  const API_BASE_URL = "https://api.availnow.com/v1";
  const WIDGET_DATA_ENDPOINT = `${API_BASE_URL}/widget`;
  const WIDGET_TRACK_ENDPOINT = `${API_BASE_URL}/track`;

  /**
   * Initialize the AvailNow widget
   * @param {Object} options - Configuration options
   */
  window.AvailNow.initialize = function (options) {
    // Merge user options with defaults
    const settings = Object.assign({}, defaultSettings, options);

    // Ensure a valid selector and userId are provided
    if (!settings.selector) {
      console.error("AvailNow: No selector provided");
      return;
    }

    if (!settings.userId) {
      console.error("AvailNow: No userId provided");
      return;
    }

    // Find the container element
    const container = document.querySelector(settings.selector);
    if (!container) {
      console.error(
        `AvailNow: Element with selector "${settings.selector}" not found`
      );
      return;
    }

    // Set a loading state
    container.innerHTML =
      '<div style="text-align: center; padding: 20px;">Loading AvailNow widget...</div>';

    // Load the widget CSS
    loadStyles();

    // Fetch availability data from the API
    fetchWidgetData(settings.userId)
      .then((widgetData) => {
        // Render the widget with the data
        renderWidget(container, widgetData, settings);
      })
      .catch((error) => {
        console.error("AvailNow: Error fetching availability data", error);
        container.innerHTML =
          '<div style="text-align: center; padding: 20px; color: #ef4444;">Error loading availability data</div>';
      });
  };

  /**
   * Load the widget CSS styles
   */
  function loadStyles() {
    if (document.getElementById("availnow-styles")) {
      return; // Styles already loaded
    }

    const styleElement = document.createElement("style");
    styleElement.id = "availnow-styles";
    styleElement.textContent = `
      .availnow-widget {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        box-sizing: border-box;
      }
      .availnow-widget * {
        box-sizing: border-box;
      }
      .availnow-widget-expanded .availnow-widget-content {
        max-height: 400px;
        overflow-y: auto;
      }
      .availnow-widget-spinner {
        display: inline-block;
        width: 30px;
        height: 30px;
        border: 3px solid rgba(0, 112, 243, 0.2);
        border-radius: 50%;
        border-top-color: #0070f3;
        animation: spin 1s ease-in-out infinite;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;

    document.head.appendChild(styleElement);
  }

  /**
   * Fetch widget data from the AvailNow API
   * @param {string} userId - User ID to fetch availability for
   * @returns {Promise<Object>} - Promise resolving to widget data
   */
  async function fetchWidgetData(userId) {
    try {
      // In a real production environment, this would be a fetch call to the API
      // For now, we'll simulate an API call with a delay to mimic network latency

      // Create the URL with query params
      const url = `${WIDGET_DATA_ENDPOINT}?userId=${encodeURIComponent(userId)}`;

      // Make the API request
      const response = await fetch(url);

      // If the response isn't successful, throw an error
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      // Parse and return the JSON data
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching widget data:", error);

      // If the API isn't available, return a fallback empty data structure
      // This allows the widget to display a placeholder state
      return {
        settings: defaultSettings,
        profile: null,
        availability: [],
        hasCalendarIntegration: false,
        stats: {
          views: 0,
          clicks: 0,
          bookings: 0,
        },
      };
    }
  }

  /**
   * Track widget event (view, click, booking)
   * @param {string} userId - User ID
   * @param {string} eventType - Type of event (view, click, booking)
   */
  async function trackEvent(userId, eventType) {
    try {
      // In a production environment, this would be a real API call
      await fetch(WIDGET_TRACK_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          eventType,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      // Silently fail for analytics events
      console.warn("Failed to track widget event:", error);
    }
  }

  /**
   * Format date for display
   * @param {Date} date - Date object
   * @returns {string} - Formatted date string
   */
  function formatDateString(date) {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  /**
   * Check if a date is today
   * @param {Date} date - Date to check
   * @returns {boolean} - True if date is today
   */
  function isToday(date) {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  /**
   * Process availability data into a calendar format
   * @param {Array} availabilitySlots - Raw availability slots
   * @param {number} days - Number of days to show
   * @returns {Array} - Processed daily availability
   */
  function processAvailability(availabilitySlots, days = 7) {
    const result = [];
    const now = new Date();
    const processedDates = {};

    // Initialize a map of dates to process
    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() + i);
      date.setHours(0, 0, 0, 0);

      const dateString = date.toISOString().split("T")[0];
      processedDates[dateString] = {
        date,
        dateString: formatDateString(date),
        slots: [],
        hasAvailability: false,
      };
    }

    // Process each availability slot
    if (availabilitySlots && availabilitySlots.length > 0) {
      availabilitySlots.forEach((slot) => {
        if (!slot.available) return; // Skip unavailable slots

        const startTime = new Date(slot.start_time);
        const endTime = new Date(slot.end_time);

        // Get just the date part for matching
        const dateString = startTime.toISOString().split("T")[0];

        // Only process if date is in our range
        if (processedDates[dateString]) {
          // Format time for display
          const hour = startTime.getHours();
          const minutes = startTime.getMinutes();
          const ampm = hour >= 12 ? "PM" : "AM";
          const displayHour = hour % 12 === 0 ? 12 : hour % 12;
          const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;

          // Add to slots for this date
          processedDates[dateString].slots.push({
            id: slot.id,
            time: `${displayHour}:${displayMinutes} ${ampm}`,
            available: true,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
          });

          // Mark this date as having availability
          processedDates[dateString].hasAvailability = true;
        }
      });
    }

    // Convert to array and sort slots by time
    Object.values(processedDates).forEach((day) => {
      day.slots.sort((a, b) => {
        return new Date(a.startTime) - new Date(b.startTime);
      });
      result.push(day);
    });

    return result;
  }

  /**
   * Render the widget with availability data
   * @param {HTMLElement} container - The container element to render the widget in
   * @param {Object} widgetData - Widget data from API
   * @param {Object} settings - Widget settings
   */
  function renderWidget(container, widgetData, settings) {
    // Extract data from API response
    const {
      availability = [],
      profile = null,
      hasCalendarIntegration = false,
    } = widgetData;

    // Merge settings from API with passed settings
    const mergedSettings = Object.assign(
      {},
      settings,
      widgetData.settings || {}
    );

    // Process availability data
    const availabilityData = processAvailability(
      availability,
      mergedSettings.showDays
    );

    // Create widget elements
    const widget = document.createElement("div");
    widget.className = "availnow-widget";
    widget.style.fontFamily = "'Inter', system-ui, sans-serif";
    widget.style.backgroundColor =
      mergedSettings.theme === "light" ? "#ffffff" : "#1f2937";
    widget.style.color =
      mergedSettings.theme === "light" ? mergedSettings.textColor : "#f3f4f6";
    widget.style.borderRadius = "8px";
    widget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
    widget.style.border = `1px solid ${mergedSettings.theme === "light" ? "#e5e7eb" : "#374151"}`;
    widget.style.overflow = "hidden";
    widget.style.maxWidth = mergedSettings.compact ? "320px" : "400px";
    widget.style.margin = "0 auto";

    // Widget header
    const header = document.createElement("div");
    header.className = "availnow-widget-header";
    header.style.backgroundColor = mergedSettings.accentColor;
    header.style.color = "#ffffff";
    header.style.padding = mergedSettings.compact ? "10px 16px" : "16px 20px";
    header.style.display = "flex";
    header.style.alignItems = "center";
    header.style.justifyContent = "space-between";
    header.style.borderBottom = `1px solid ${mergedSettings.theme === "light" ? "#e5e7eb" : "#374151"}`;

    const headerTitle = document.createElement("div");
    headerTitle.style.display = "flex";
    headerTitle.style.alignItems = "center";

    const headerIcon = document.createElement("div");
    headerIcon.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>';
    headerIcon.style.marginRight = "8px";

    const headerText = document.createElement("h3");
    headerText.textContent = mergedSettings.buttonText;
    headerText.style.margin = "0";
    headerText.style.fontSize = mergedSettings.compact ? "16px" : "18px";
    headerText.style.fontWeight = "bold";

    headerTitle.appendChild(headerIcon);
    headerTitle.appendChild(headerText);

    const toggleButton = document.createElement("button");
    toggleButton.innerHTML = "▼";
    toggleButton.style.backgroundColor = "transparent";
    toggleButton.style.color = "#ffffff";
    toggleButton.style.border = "none";
    toggleButton.style.cursor = "pointer";
    toggleButton.style.display = "flex";
    toggleButton.style.alignItems = "center";
    toggleButton.style.padding = "0";
    toggleButton.setAttribute("aria-label", "Expand availability");

    header.appendChild(headerTitle);
    header.appendChild(toggleButton);

    // Widget content
    const content = document.createElement("div");
    content.className = "availnow-widget-content";
    content.style.padding = mergedSettings.compact ? "12px" : "20px";
    content.style.maxHeight = "0";
    content.style.overflow = "hidden";
    content.style.transition = "max-height 0.3s ease-in-out";

    // Widget footer
    const footer = document.createElement("div");
    footer.style.padding = "12px";
    footer.style.textAlign = "center";
    footer.style.borderTop = `1px solid ${mergedSettings.theme === "light" ? "#e5e7eb" : "#374151"}`;
    footer.style.fontSize = "12px";
    footer.style.color =
      mergedSettings.theme === "light" ? "#6b7280" : "#9ca3af";
    footer.innerHTML =
      'Powered by <a href="https://availnow.com" target="_blank" rel="noopener noreferrer" style="color: ' +
      mergedSettings.accentColor +
      '; text-decoration: none;">AvailNow</a>';

    // Populate content with availability data
    if (
      availabilityData.length === 0 ||
      !availabilityData.some((day) => day.hasAvailability)
    ) {
      content.innerHTML =
        '<div style="text-align: center; padding: 20px;">No availability found</div>';
    } else {
      // Provider info section if profile exists
      if (profile) {
        const providerSection = document.createElement("div");
        providerSection.style.marginBottom = "16px";
        providerSection.style.display = "flex";
        providerSection.style.alignItems = "center";

        // Profile image if available
        if (profile.avatar_url) {
          const avatar = document.createElement("img");
          avatar.src = profile.avatar_url;
          avatar.alt = profile.display_name || "Provider";
          avatar.style.width = "40px";
          avatar.style.height = "40px";
          avatar.style.borderRadius = "50%";
          avatar.style.marginRight = "12px";
          avatar.style.objectFit = "cover";
          providerSection.appendChild(avatar);
        }

        // Provider info text
        const providerInfo = document.createElement("div");

        // Display name
        if (profile.display_name) {
          const name = document.createElement("div");
          name.textContent = profile.display_name;
          name.style.fontWeight = "600";
          providerInfo.appendChild(name);
        }

        // Location if available
        if (profile.address) {
          const address = document.createElement("div");
          address.textContent = profile.address;
          address.style.fontSize = "12px";
          address.style.color =
            mergedSettings.theme === "light" ? "#6b7280" : "#9ca3af";
          providerInfo.appendChild(address);
        }

        providerSection.appendChild(providerInfo);
        content.appendChild(providerSection);
      }

      // Track this view
      trackEvent(settings.userId, "view");

      // Add each day's availability
      availabilityData.forEach((day) => {
        const dayElement = document.createElement("div");
        dayElement.style.padding = "8px 12px";
        dayElement.style.marginBottom = "8px";
        dayElement.style.borderRadius = "6px";
        dayElement.style.backgroundColor =
          mergedSettings.theme === "light" ? "#f9fafb" : "#374151";
        dayElement.style.border = `1px solid ${mergedSettings.theme === "light" ? "#e5e7eb" : "#4b5563"}`;

        // Add "Today" indicator if applicable
        let dateDisplay = day.dateString;
        if (isToday(day.date)) {
          dateDisplay += " (Today)";
        }

        const dayTitle = document.createElement("div");
        dayTitle.textContent = dateDisplay;
        dayTitle.style.fontWeight = "bold";
        dayTitle.style.marginBottom = "6px";

        dayElement.appendChild(dayTitle);

        // Check if this date has available slots
        if (day.hasAvailability && day.slots.length > 0) {
          day.slots.forEach((slot) => {
            const slotElement = document.createElement("div");
            slotElement.style.display = "flex";
            slotElement.style.alignItems = "center";
            slotElement.style.justifyContent = "space-between";
            slotElement.style.padding = "6px 12px";
            slotElement.style.margin = "6px 0";
            slotElement.style.borderRadius = "4px";
            slotElement.style.backgroundColor =
              mergedSettings.theme === "light" ? "#ffffff" : "#1f2937";
            slotElement.style.border = `1px solid ${mergedSettings.theme === "light" ? "#e5e7eb" : "#4b5563"}`;

            const slotInfo = document.createElement("div");
            slotInfo.style.display = "flex";
            slotInfo.style.alignItems = "center";

            const slotTime = document.createElement("span");
            slotTime.textContent = slot.time;
            slotTime.style.marginRight = "8px";

            const slotStatus = document.createElement("span");
            slotStatus.textContent = "Available";
            slotStatus.style.display = "inline-block";
            slotStatus.style.padding = "2px 8px";
            slotStatus.style.fontSize = "12px";
            slotStatus.style.borderRadius = "12px";
            slotStatus.style.backgroundColor =
              mergedSettings.theme === "light" ? "#dcfce7" : "#065f46";
            slotStatus.style.color =
              mergedSettings.theme === "light" ? "#166534" : "#a7f3d0";

            slotInfo.appendChild(slotTime);
            slotInfo.appendChild(slotStatus);

            slotElement.appendChild(slotInfo);

            // Add book button
            const bookButton = document.createElement("button");
            bookButton.textContent = "Book";
            bookButton.style.backgroundColor = mergedSettings.accentColor;
            bookButton.style.color = "#ffffff";
            bookButton.style.border = "none";
            bookButton.style.borderRadius = "4px";
            bookButton.style.padding = "6px 12px";
            bookButton.style.fontSize = "14px";
            bookButton.style.cursor = "pointer";
            bookButton.style.transition = "background-color 0.2s";

            bookButton.addEventListener("click", () => {
              // Track click event
              trackEvent(settings.userId, "booking");

              // Open booking page
              const bookingUrl = `https://booking.availnow.com/${settings.userId}?slot=${slot.id}&date=${day.date.toISOString().split("T")[0]}&time=${encodeURIComponent(slot.time)}`;
              window.open(bookingUrl, "_blank");
            });

            slotElement.appendChild(bookButton);
            dayElement.appendChild(slotElement);
          });
        } else {
          // No availability
          const noAvailability = document.createElement("div");
          noAvailability.style.padding = "8px";
          noAvailability.style.textAlign = "center";
          noAvailability.style.color =
            mergedSettings.theme === "light" ? "#6b7280" : "#9ca3af";
          noAvailability.textContent = "No availability on this day";
          dayElement.appendChild(noAvailability);
        }

        content.appendChild(dayElement);
      });
    }

    // Add elements to the widget
    widget.appendChild(header);
    widget.appendChild(content);
    widget.appendChild(footer);

    // Clear the container and add the widget
    container.innerHTML = "";
    container.appendChild(widget);

    // Add event listener to toggle button
    toggleButton.addEventListener("click", () => {
      if (widget.classList.contains("availnow-widget-expanded")) {
        widget.classList.remove("availnow-widget-expanded");
        content.style.maxHeight = "0";
        toggleButton.innerHTML = "▼";
        toggleButton.setAttribute("aria-label", "Expand availability");
      } else {
        widget.classList.add("availnow-widget-expanded");
        content.style.maxHeight = mergedSettings.compact ? "300px" : "400px";
        toggleButton.innerHTML = "▲";
        toggleButton.setAttribute("aria-label", "Collapse availability");

        // Track click event
        trackEvent(settings.userId, "click");
      }
    });
  }
})(window, document);
