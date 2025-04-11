/**
 * AvailNow Widget Embed Script
 * This script is designed to be embedded on external websites to display
 * the AvailNow availability widget.
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
    fetchAvailability(settings.userId, settings.showDays)
      .then((availabilityData) => {
        // Render the widget with the data
        renderWidget(container, availabilityData, settings);
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
    `;

    document.head.appendChild(styleElement);
  }

  /**
   * Fetch availability data from the API
   * @param {string} userId - User ID to fetch availability for
   * @param {number} days - Number of days to show
   * @returns {Promise<Array>} - Promise resolving to availability data
   */
  function fetchAvailability(userId, days) {
    // In production, this would be a real API call
    // For demonstration, we'll use mock data with a delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateMockAvailability(days));
      }, 800);
    });
  }

  /**
   * Generate mock availability data
   * @param {number} days - Number of days to generate data for
   * @returns {Array} - Array of day objects with availability slots
   */
  function generateMockAvailability(days) {
    const result = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Skip weekends in the mock data
      if (date.getDay() === 0 || date.getDay() === 6) {
        continue;
      }

      const slots = [];
      // Generate 2-3 random slots per day
      const numSlots = Math.floor(Math.random() * 2) + 2;

      for (let j = 0; j < numSlots; j++) {
        // Random time between 9am and 5pm
        const hour = 9 + Math.floor(Math.random() * 8);
        slots.push({
          id: `slot-${i}-${j}`,
          time: `${hour}:00 ${hour >= 12 ? "PM" : "AM"}`,
          available: Math.random() > 0.3, // 70% chance of being available
        });
      }

      result.push({
        date,
        dateString: date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        slots: slots.sort((a, b) => {
          // Sort by hour
          const hourA = parseInt(a.time.split(":")[0]);
          const hourB = parseInt(b.time.split(":")[0]);
          return hourA - hourB;
        }),
      });
    }

    return result;
  }

  /**
   * Render the widget with availability data
   * @param {HTMLElement} container - The container element to render the widget in
   * @param {Array} availabilityData - Availability data to render
   * @param {Object} settings - Widget settings
   */
  function renderWidget(container, availabilityData, settings) {
    // Create widget elements
    const widget = document.createElement("div");
    widget.className = "availnow-widget";
    widget.style.fontFamily = "'Inter', system-ui, sans-serif";
    widget.style.backgroundColor =
      settings.theme === "light" ? "#ffffff" : "#1f2937";
    widget.style.color =
      settings.theme === "light" ? settings.textColor : "#f3f4f6";
    widget.style.borderRadius = "8px";
    widget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
    widget.style.border = `1px solid ${settings.theme === "light" ? "#e5e7eb" : "#374151"}`;
    widget.style.overflow = "hidden";
    widget.style.maxWidth = settings.compact ? "320px" : "400px";
    widget.style.margin = "0 auto";

    // Widget header
    const header = document.createElement("div");
    header.className = "availnow-widget-header";
    header.style.backgroundColor = settings.accentColor;
    header.style.color = "#ffffff";
    header.style.padding = settings.compact ? "10px 16px" : "16px 20px";
    header.style.display = "flex";
    header.style.alignItems = "center";
    header.style.justifyContent = "space-between";
    header.style.borderBottom = `1px solid ${settings.theme === "light" ? "#e5e7eb" : "#374151"}`;

    const headerTitle = document.createElement("div");
    headerTitle.style.display = "flex";
    headerTitle.style.alignItems = "center";

    const headerIcon = document.createElement("div");
    headerIcon.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>';
    headerIcon.style.marginRight = "8px";

    const headerText = document.createElement("h3");
    headerText.textContent = settings.buttonText;
    headerText.style.margin = "0";
    headerText.style.fontSize = settings.compact ? "16px" : "18px";
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
    content.style.padding = settings.compact ? "12px" : "20px";
    content.style.maxHeight = "0";
    content.style.overflow = "hidden";
    content.style.transition = "max-height 0.3s ease-in-out";

    // Widget footer
    const footer = document.createElement("div");
    footer.style.padding = "12px";
    footer.style.textAlign = "center";
    footer.style.borderTop = `1px solid ${settings.theme === "light" ? "#e5e7eb" : "#374151"}`;
    footer.style.fontSize = "12px";
    footer.style.color = settings.theme === "light" ? "#6b7280" : "#9ca3af";
    footer.innerHTML =
      'Powered by <a href="https://availnow.com" target="_blank" rel="noopener noreferrer" style="color: ' +
      settings.accentColor +
      '; text-decoration: none;">AvailNow</a>';

    // Populate content with availability data
    if (availabilityData.length === 0) {
      content.innerHTML =
        '<div style="text-align: center; padding: 20px;">No availability found</div>';
    } else {
      availabilityData.forEach((day) => {
        const dayElement = document.createElement("div");
        dayElement.style.padding = "8px 12px";
        dayElement.style.marginBottom = "8px";
        dayElement.style.borderRadius = "6px";
        dayElement.style.backgroundColor =
          settings.theme === "light" ? "#f9fafb" : "#374151";
        dayElement.style.border = `1px solid ${settings.theme === "light" ? "#e5e7eb" : "#4b5563"}`;

        const dayTitle = document.createElement("div");
        dayTitle.textContent = day.dateString;
        dayTitle.style.fontWeight = "bold";
        dayTitle.style.marginBottom = "6px";

        dayElement.appendChild(dayTitle);

        day.slots.forEach((slot) => {
          const slotElement = document.createElement("div");
          slotElement.style.display = "flex";
          slotElement.style.alignItems = "center";
          slotElement.style.justifyContent = "space-between";
          slotElement.style.padding = "6px 12px";
          slotElement.style.margin = "6px 0";
          slotElement.style.borderRadius = "4px";
          slotElement.style.backgroundColor =
            settings.theme === "light" ? "#ffffff" : "#1f2937";
          slotElement.style.border = `1px solid ${settings.theme === "light" ? "#e5e7eb" : "#4b5563"}`;

          const slotInfo = document.createElement("div");
          slotInfo.style.display = "flex";
          slotInfo.style.alignItems = "center";

          const slotTime = document.createElement("span");
          slotTime.textContent = slot.time;
          slotTime.style.marginRight = "8px";

          const slotStatus = document.createElement("span");
          slotStatus.textContent = slot.available ? "Available" : "Unavailable";
          slotStatus.style.display = "inline-block";
          slotStatus.style.padding = "2px 8px";
          slotStatus.style.fontSize = "12px";
          slotStatus.style.borderRadius = "12px";

          if (slot.available) {
            slotStatus.style.backgroundColor =
              settings.theme === "light" ? "#dcfce7" : "#065f46";
            slotStatus.style.color =
              settings.theme === "light" ? "#166534" : "#a7f3d0";
          } else {
            slotStatus.style.backgroundColor =
              settings.theme === "light" ? "#fee2e2" : "#7f1d1d";
            slotStatus.style.color =
              settings.theme === "light" ? "#b91c1c" : "#fecaca";
          }

          slotInfo.appendChild(slotTime);
          slotInfo.appendChild(slotStatus);

          slotElement.appendChild(slotInfo);

          if (slot.available) {
            const bookButton = document.createElement("button");
            bookButton.textContent = "Book";
            bookButton.style.backgroundColor = settings.accentColor;
            bookButton.style.color = "#ffffff";
            bookButton.style.border = "none";
            bookButton.style.borderRadius = "4px";
            bookButton.style.padding = "6px 12px";
            bookButton.style.fontSize = "14px";
            bookButton.style.cursor = "pointer";
            bookButton.style.transition = "background-color 0.2s";

            bookButton.addEventListener("click", () => {
              window.open(
                `https://booking.availnow.com/${settings.userId}?date=${day.dateString}&time=${slot.time}`,
                "_blank"
              );
            });

            slotElement.appendChild(bookButton);
          }

          dayElement.appendChild(slotElement);
        });

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
        content.style.maxHeight = settings.compact ? "300px" : "400px";
        toggleButton.innerHTML = "▲";
        toggleButton.setAttribute("aria-label", "Collapse availability");
      }
    });
  }
})(window, document);
