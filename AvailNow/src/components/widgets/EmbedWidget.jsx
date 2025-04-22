import React, { useState, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Embeddable widget component that displays availability slots
 * This component will be compiled into a standalone script that can be embedded in other websites
 */

const EmbedWidget = ({
  userId,
  theme = "light",
  accentColor = "#0070f3",
  textColor = "#333333",
  buttonText = "South Bay Dental",
  showDays = 7,
  compact = false,
  providerName = "Dr. Teresa Chevez, MD",
  providerAddress = "1221 2nd Street",
  providerCity = "Santa Monica, CA 90403",
  providerImage = "/api/placeholder/120/120", // Default placeholder image
}) => {
  const [loading, setLoading] = useState(true);
  const [availabilityData, setAvailabilityData] = useState([]);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(true); // Set to true by default to match design
  const [selectedDay, setSelectedDay] = useState(null);
  const [nextAvailable, setNextAvailable] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showMonthSelector, setShowMonthSelector] = useState(false);

  // Months for dropdown
  const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Fetch availability data for the specified user
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoading(true);

        // This would be replaced with an actual API call in production
        // const response = await fetch(`${API_URL}/availability/${userId}`);
        // const data = await response.json();

        // Using mock data for demonstration
        const mockData = generateMockAvailability(showDays, currentMonth);

        // Find next available time slot
        const today = new Date();
        let nextSlot = null;

        for (const day of mockData) {
          const availableSlots = day.slots.filter((slot) => slot.available);
          if (availableSlots.length > 0) {
            const dayDate = new Date(day.date);
            if (dayDate >= today) {
              nextSlot = {
                date: day.dateString,
                time: availableSlots[0].time,
              };
              break;
            }
          }
        }

        setNextAvailable(nextSlot);

        // Set the first day as selected by default
        if (mockData.length > 0) {
          setSelectedDay(mockData[0].date.getDay());
        }

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
  }, [userId, showDays, currentMonth]);

  // Generate mock availability data
  const generateMockAvailability = (days, baseDate) => {
    const result = [];
    const startDate = new Date(baseDate);
    // Set to the first day of the current week (or current date if it's already the first day)
    const currentDay = startDate.getDay();
    startDate.setDate(startDate.getDate() - currentDay);

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      // Skip Sundays in the mock data
      if (date.getDay() === 0) {
        continue;
      }

      const slots = [];
      // Generate 2-5 random slots per day
      const numSlots = Math.floor(Math.random() * 4) + 2;

      for (let j = 0; j < numSlots; j++) {
        // Random time between 9am and 5pm
        const hour = 9 + Math.floor(Math.random() * 8);
        const minutes = [0, 30][Math.floor(Math.random() * 2)];
        const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
        const formattedMinutes = minutes === 0 ? "00" : minutes;

        slots.push({
          id: `slot-${i}-${j}`,
          time: `${formattedHour}:${formattedMinutes}${hour >= 12 ? "pm" : "am"}`,
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
        day: date.getDate(),
        weekday: date
          .toLocaleDateString("en-US", { weekday: "short" })
          .toUpperCase(),
        month: date.toLocaleDateString("en-US", { month: "short" }),
        slots: slots.sort((a, b) => {
          // Sort by hour
          const timeA = a.time.toLowerCase();
          const timeB = b.time.toLowerCase();
          const hourA = parseInt(timeA.split(":")[0]);
          const hourB = parseInt(timeB.split(":")[0]);

          if (hourA !== hourB) return hourA - hourB;

          // If hours are equal, sort by minutes
          const minutesA = parseInt(timeA.split(":")[1]);
          const minutesB = parseInt(timeB.split(":")[1]);
          return minutesA - minutesB;
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

  // Navigate to previous month
  const handlePreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(currentMonth.getMonth() - 1);
    setCurrentMonth(newDate);
    setShowMonthSelector(false);
  };

  // Navigate to next month
  const handleNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(currentMonth.getMonth() + 1);
    setCurrentMonth(newDate);
    setShowMonthSelector(false);
  };

  // Navigate to today
  const handleToday = () => {
    setCurrentMonth(new Date());
    setShowMonthSelector(false);
  };

  // Select a specific month
  const handleMonthSelect = (monthIndex) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(monthIndex);
    setCurrentMonth(newDate);
    setShowMonthSelector(false);
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
      maxWidth: compact ? "320px" : "700px",
      width: "100%",
    },
    header: {
      backgroundColor: "#ffffff",
      color: textColor,
      padding: compact ? "10px 16px" : "16px 20px",
      borderBottom: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
    },
    providerSection: {
      display: "flex",
      alignItems: "center",
      marginBottom: "10px",
    },
    providerImage: {
      width: "48px",
      height: "48px",
      borderRadius: "50%",
      objectFit: "cover",
      marginRight: "15px",
    },
    providerInfo: {
      flex: 1,
    },
    providerName: {
      margin: 0,
      fontSize: "18px",
      fontWeight: "bold",
    },
    providerAddress: {
      margin: "3px 0 0 0",
      fontSize: "14px",
      color: "#666",
    },
    monthSelector: {
      position: "relative",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px 16px",
      borderBottom: "1px solid #eee",
    },
    monthName: {
      fontSize: "16px",
      fontWeight: "bold",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
    },
    monthDropdown: {
      position: "absolute",
      top: "100%",
      left: 0,
      right: 0,
      backgroundColor: "#fff",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      borderRadius: "0 0 8px 8px",
      zIndex: 10,
      maxHeight: "200px",
      overflowY: "auto",
    },
    monthOption: {
      padding: "10px 16px",
      cursor: "pointer",
      transition: "background-color 0.2s",
    },
    navButton: {
      backgroundColor: "transparent",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "5px",
      borderRadius: "4px",
      color: accentColor,
    },
    content: {
      padding: compact ? "12px" : "0",
      maxHeight: expanded ? "600px" : "0",
      overflow: "hidden",
      transition: "max-height 0.3s ease-in-out",
    },
    slotItem: {
      display: "inline-block",
      padding: "8px 12px",
      margin: "4px",
      borderRadius: "4px",
      backgroundColor: theme === "light" ? "#e6f7f3" : "#1f2937",
      border: `1px solid ${theme === "light" ? "#d1e7dd" : "#4b5563"}`,
      color: theme === "light" ? "#0f766e" : "#d1fae5",
      cursor: "pointer",
      fontSize: "14px",
      transition: "all 0.2s",
    },
    dayTab: {
      textAlign: "center",
      padding: "10px 0",
      cursor: "pointer",
      backgroundColor: "transparent",
      borderBottom: "3px solid transparent",
      transition: "all 0.2s",
    },
    activeDayTab: {
      borderBottom: `3px solid ${accentColor}`,
      fontWeight: "bold",
    },
    footer: {
      padding: "12px",
      textAlign: "center",
      borderTop: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
      fontSize: "12px",
      color: theme === "light" ? "#6b7280" : "#9ca3af",
    },
    nextAvailable: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "8px 12px",
      backgroundColor: "#f9f9f9",
      borderRadius: "4px",
      fontSize: "14px",
      marginBottom: "12px",
    },
    selectTimeText: {
      margin: "0 0 10px 0",
      fontSize: "16px",
      fontWeight: "normal",
      padding: "0 16px",
    },
  };

  const handleDaySelect = (dayIndex) => {
    setSelectedDay(dayIndex);
  };

  return (
    <div style={customStyles.widget}>
      {/* Widget Header with Practice and Provider Info */}
      <div style={customStyles.header}>
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: "bold",
              marginBottom: "10px",
            }}
          >
            {buttonText}
          </h2>
        </div>

        <div style={customStyles.providerSection}>
          <img
            src={providerImage}
            alt={providerName}
            style={customStyles.providerImage}
          />
          <div style={customStyles.providerInfo}>
            <h3 style={customStyles.providerName}>{providerName}</h3>
            <p style={customStyles.providerAddress}>
              {providerAddress}
              <br />
              {providerCity}
            </p>
          </div>
        </div>
      </div>

      {/* Month Selector */}
      <div style={customStyles.monthSelector}>
        <button
          style={customStyles.navButton}
          onClick={handlePreviousMonth}
          aria-label="Previous month"
        >
          <ChevronLeft size={20} />
        </button>

        <div
          style={customStyles.monthName}
          onClick={() => setShowMonthSelector(!showMonthSelector)}
        >
          {MONTHS[currentMonth.getMonth()]}
          <span style={{ marginLeft: "5px", fontSize: "14px" }}>▼</span>
        </div>

        <button
          style={customStyles.navButton}
          onClick={handleNextMonth}
          aria-label="Next month"
        >
          <ChevronRight size={20} />
        </button>

        {showMonthSelector && (
          <div style={customStyles.monthDropdown}>
            <div
              style={{
                ...customStyles.monthOption,
                color: accentColor,
                fontWeight: "bold",
              }}
              onClick={handleToday}
            >
              Back to Today
            </div>
            {MONTHS.map((month, index) => (
              <div
                key={month}
                style={{
                  ...customStyles.monthOption,
                  backgroundColor:
                    currentMonth.getMonth() === index
                      ? "#f0f9ff"
                      : "transparent",
                  fontWeight:
                    currentMonth.getMonth() === index ? "bold" : "normal",
                }}
                onClick={() => handleMonthSelect(index)}
              >
                {month}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Widget Content */}
      <div style={customStyles.content}>
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
          <div>
            {nextAvailable && (
              <div style={customStyles.nextAvailable}>
                <span
                  style={{
                    fontWeight: "bold",
                    color: accentColor,
                    marginRight: "8px",
                  }}
                >
                  Next Available:
                </span>
                <span>
                  {nextAvailable.date} at {nextAvailable.time}
                </span>
              </div>
            )}

            <h4 style={customStyles.selectTimeText}>SELECT TIME</h4>

            {/* Day tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid #eee" }}>
              {availabilityData.map((day, index) => (
                <div
                  key={index}
                  style={{
                    ...customStyles.dayTab,
                    ...(day.date.getDay() === selectedDay
                      ? customStyles.activeDayTab
                      : {}),
                    flex: 1,
                  }}
                  onClick={() => handleDaySelect(day.date.getDay())}
                >
                  <div style={{ fontSize: "14px", fontWeight: "bold" }}>
                    {day.weekday}
                  </div>
                  <div style={{ fontSize: "20px" }}>{day.day}</div>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    {day.month}
                  </div>
                </div>
              ))}
            </div>

            {/* Time slots for selected day */}
            <div
              style={{ padding: "16px", maxHeight: "300px", overflowY: "auto" }}
            >
              {availabilityData
                .filter((day) => day.date.getDay() === selectedDay)
                .map((day, dayIndex) => (
                  <div key={dayIndex}>
                    <div style={{ display: "flex", flexWrap: "wrap" }}>
                      {day.slots.map((slot, slotIndex) => (
                        <button
                          key={slotIndex}
                          style={{
                            ...customStyles.slotItem,
                            opacity: slot.available ? 1 : 0.5,
                            backgroundColor: slot.available
                              ? "#e6f7f3"
                              : "#f5f5f5",
                            color: slot.available ? "#0f766e" : "#6b7280",
                          }}
                          disabled={!slot.available}
                          onClick={() =>
                            handleBookingClick(day.dateString, slot)
                          }
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Widget Footer */}
      <div style={customStyles.footer}>
        Powered by{" "}
        <a
          href="https://patientpop.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: accentColor, textDecoration: "none" }}
        >
          PatientPop
        </a>
      </div>
    </div>
  );
};

export default EmbedWidget;
