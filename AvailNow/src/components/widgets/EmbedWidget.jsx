import React, { useState, useEffect } from "react";
import { Calendar } from "lucide-react";

/**
 * Embeddable widget component that displays availability slots
 * This component will be compiled into a standalone script that can be embedded in other websites
 */

const EmbedWidget = ({
  userId,
  theme = "light",
  accentColor = "#0070f3",
  textColor = "#333333",
  buttonText = "Check Availability",
  showDays = 5,
  compact = false,
}) => {
  const [loading, setLoading] = useState(true);
  const [availabilityData, setAvailabilityData] = useState([]);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  // Fetch availability data for the specified user
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoading(true);

        // This would be replaced with an actual API call in production
        // const response = await fetch(`${API_URL}/availability/${userId}`);
        // const data = await response.json();

        // Using mock data for demonstration
        const mockData = generateMockAvailability(showDays);

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        setAvailabilityData(mockData);
        setError(null);
      } catch (err) {
        console.error("Error fetching availability:", err);
        setError("Unable to load availability data");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [userId, showDays]);

  // Generate mock availability data
  const generateMockAvailability = (days) => {
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
  };

  // Handle booking click
  const handleBookingClick = (date, slot) => {
    // In a real implementation, this would redirect to a booking page or show a form
    window.open(
      `https://booking.availnow.com/${userId}?date=${date}&time=${slot.time}`,
      "_blank"
    );
  };

  // Apply custom styles
  const customStyles = {
    widget: {
      fontFamily: "'Inter', system-ui, sans-serif",
      backgroundColor: theme === "light" ? "#ffffff" : "#1f2937",
      color: theme === "light" ? textColor : "#f3f4f6",
      borderRadius: "8px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
      overflow: "hidden",
      maxWidth: compact ? "320px" : "400px",
    },
    header: {
      backgroundColor: accentColor,
      color: "#ffffff",
      padding: compact ? "10px 16px" : "16px 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
    },
    content: {
      padding: compact ? "12px" : "20px",
      maxHeight: expanded ? "400px" : "0",
      overflow: "hidden",
      transition: "max-height 0.3s ease-in-out",
    },
    dateItem: {
      padding: "8px 12px",
      marginBottom: "8px",
      borderRadius: "6px",
      backgroundColor: theme === "light" ? "#f9fafb" : "#374151",
      border: `1px solid ${theme === "light" ? "#e5e7eb" : "#4b5563"}`,
    },
    slotItem: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "6px 12px",
      margin: "6px 0",
      borderRadius: "4px",
      backgroundColor: theme === "light" ? "#ffffff" : "#1f2937",
      border: `1px solid ${theme === "light" ? "#e5e7eb" : "#4b5563"}`,
    },
    button: {
      backgroundColor: accentColor,
      color: "#ffffff",
      border: "none",
      borderRadius: "4px",
      padding: "6px 12px",
      fontSize: "14px",
      cursor: "pointer",
      transition: "background-color 0.2s",
    },
    toggleButton: {
      backgroundColor: "transparent",
      color: "#ffffff",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      padding: "0",
    },
    availableBadge: {
      display: "inline-block",
      padding: "2px 8px",
      fontSize: "12px",
      borderRadius: "12px",
      backgroundColor: theme === "light" ? "#dcfce7" : "#065f46",
      color: theme === "light" ? "#166534" : "#a7f3d0",
    },
    unavailableBadge: {
      display: "inline-block",
      padding: "2px 8px",
      fontSize: "12px",
      borderRadius: "12px",
      backgroundColor: theme === "light" ? "#fee2e2" : "#7f1d1d",
      color: theme === "light" ? "#b91c1c" : "#fecaca",
    },
    footer: {
      padding: "12px",
      textAlign: "center",
      borderTop: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
      fontSize: "12px",
      color: theme === "light" ? "#6b7280" : "#9ca3af",
    },
  };

  return (
    <div style={customStyles.widget}>
      {/* Widget Header */}
      <div style={customStyles.header}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Calendar size={20} style={{ marginRight: "8px" }} />
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: compact ? "16px" : "18px",
                fontWeight: "bold",
              }}
            >
              {buttonText}
            </h3>
          </div>
        </div>
        <button
          style={customStyles.toggleButton}
          onClick={() => setExpanded(!expanded)}
          aria-label={
            expanded ? "Collapse availability" : "Expand availability"
          }
        >
          {expanded ? "▲" : "▼"}
        </button>
      </div>

      {/* Widget Content */}
      <div
        style={{
          ...customStyles.content,
          maxHeight: expanded ? (compact ? "300px" : "400px") : "0",
        }}
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            Loading availability...
          </div>
        ) : error ? (
          <div
            style={{ textAlign: "center", padding: "20px", color: "#ef4444" }}
          >
            {error}
          </div>
        ) : (
          <div style={{ maxHeight: "100%", overflowY: "auto" }}>
            {availabilityData.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                No availability found
              </div>
            ) : (
              availabilityData.map((day) => (
                <div key={day.dateString} style={customStyles.dateItem}>
                  <div style={{ fontWeight: "bold", marginBottom: "6px" }}>
                    {day.dateString}
                  </div>
                  <div>
                    {day.slots.map((slot) => (
                      <div key={slot.id} style={customStyles.slotItem}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <span style={{ marginRight: "8px" }}>
                            {slot.time}
                          </span>
                          <span
                            style={
                              slot.available
                                ? customStyles.availableBadge
                                : customStyles.unavailableBadge
                            }
                          >
                            {slot.available ? "Available" : "Unavailable"}
                          </span>
                        </div>
                        {slot.available && (
                          <button
                            style={customStyles.button}
                            onClick={() =>
                              handleBookingClick(day.dateString, slot)
                            }
                          >
                            Book
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Widget Footer */}
      <div style={customStyles.footer}>
        Powered by{" "}
        <a
          href="https://availnow.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: accentColor, textDecoration: "none" }}
        >
          AvailNow
        </a>
      </div>
    </div>
  );
};

export default EmbedWidget;
