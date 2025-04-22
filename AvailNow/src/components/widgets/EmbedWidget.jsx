import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { createStyles } from "./EmbedWidgetStyles";

/**
 * Embeddable widget component that displays availability slots
 */
const EmbedWidget = ({
  userId,
  theme = "light",
  accentColor = "#0070f3",
  textColor = "#333333",
  buttonText = "South Bay Dental",
  showDays = 7,
  compact = false,
  providerName = "Dr. Teresa Chevez, DDS",
  providerAddress = "1221 2nd Street",
  providerCity = "Santa Monica, CA 90403",
  providerImage = "/api/placeholder/120/120",
}) => {
  const [loading, setLoading] = useState(true);
  const [availabilityData, setAvailabilityData] = useState([]);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState({ morning: [], afternoon: [] });
  const [nextAvailable, setNextAvailable] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showMonthSelector, setShowMonthSelector] = useState(false);

  // Get styles
  const styles = createStyles(theme, accentColor, textColor, compact);

  // Constants
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
  const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  // Fetch availability data for the specified user
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoading(true);

        // Using mock data for demonstration
        const mockData = generateMockData(currentMonth);
        setAvailabilityData(mockData);

        // Find next available time slot
        const today = new Date();
        let nextSlot = null;

        for (const day of mockData) {
          if (day.available && new Date(day.date) >= today) {
            nextSlot = {
              date: formatDate(new Date(day.date)),
            };
            break;
          }
        }

        setNextAvailable(nextSlot);

        // Set the first available day as selected by default
        const availableDay = mockData.find((day) => day.available);
        if (availableDay) {
          setSelectedDate(availableDay.date);
          setTimeSlots(generateTimeSlotsForDate(availableDay.date));
        }

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 800));
        setError(null);
      } catch (err) {
        console.error("Error fetching availability:", err);
        setError("Unable to load availability data");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [userId, currentMonth]);

  // Generate mock availability data
  const generateMockData = (baseDate) => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const result = [];

    // Get days to show before first day of month for a complete calendar view
    const firstDay = new Date(year, month, 1).getDay();
    const prevMonthDays = firstDay === 0 ? 6 : firstDay - 1; // Adjust for Monday-based week

    // Helper function to create a mock day with all required properties
    const createMockDay = (date, inCurrentMonth) => {
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;

      // Generate availability pattern with 8 positions around the date
      const pattern = [];
      for (let i = 0; i < 8; i++) {
        pattern.push(isWeekend ? Math.random() > 0.8 : Math.random() > 0.4);
      }

      // Generate random number of events (2-10) for each day
      const events = Array.from(
        { length: Math.floor(Math.random() * 8) + 2 },
        (_, i) => ({
          id: `event-${date.toISOString()}-${i}`,
          title: `Event ${i + 1}`,
          time: `${9 + Math.floor(i / 2)}:${i % 2 === 0 ? "00" : "30"}`,
        })
      );

      return {
        date: date.toISOString(),
        day: date.getDate(),
        weekday: date
          .toLocaleDateString("en-US", { weekday: "short" })
          .toUpperCase(),
        month: date.toLocaleDateString("en-US", { month: "short" }),
        inMonth: inCurrentMonth,
        available: !isWeekend && Math.random() > 0.3,
        availableHours: isWeekend ? 0 : Math.floor(Math.random() * 8) + 1,
        availabilityPattern: pattern,
        events: events,
      };
    };

    // Previous month days
    for (let i = prevMonthDays - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      result.push(createMockDay(date, false));
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      result.push(createMockDay(date, true));
    }

    // Next month days (to complete the grid)
    const remainingDays = 42 - result.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      result.push(createMockDay(date, false));
    }

    return result;
  };

  // Generate time slots for a specific date
  const generateTimeSlotsForDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDay();

    // No slots on Sundays
    if (day === 0) return { morning: [], afternoon: [] };

    // Morning and afternoon slots
    const morningSlots = [];
    const afternoonSlots = [];

    // Generate slots from 8AM to 6PM
    for (let hour = 8; hour < 18; hour++) {
      for (let minutes of [0, 30]) {
        const ampm = hour >= 12 ? "pm" : "am";
        const displayHour = hour % 12 === 0 ? 12 : hour % 12;
        const displayMinutes = minutes === 0 ? "00" : "30";

        const time = `${displayHour}:${displayMinutes}${ampm}`;

        // Make availability somewhat deterministic based on the date and time
        const seed = date.getDate() + hour + minutes;
        const isAvailable = (seed * 13) % 10 > 3; // About 70% available

        const slot = {
          time,
          available: isAvailable,
        };

        // Sort into morning and afternoon
        if (hour < 12) {
          morningSlots.push(slot);
        } else {
          afternoonSlots.push(slot);
        }
      }
    }

    return { morning: morningSlots, afternoon: afternoonSlots };
  };

  // Render availability indicators for a day
  // Update the renderAvailabilityIndicators function in EmbedWidget.jsx
  const renderAvailabilityIndicators = (day) => {
    // Number of total events for this day
    const totalEvents = day.events?.length || 8;
    // Number of available slots
    const availableCount = day.availableHours || 0;

    // Create segments around the date number
    return (
      <>
        {Array.from({ length: totalEvents }).map((_, index) => {
          const angle = (index / totalEvents) * 2 * Math.PI;
          const isAvailable = index < availableCount;

          // Calculate position - this is the key change
          // Instead of creating a separate circle, we position segments directly around the date cell
          const radius = 15; // Distance from center of the cell to the indicators
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <div
              key={index}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "4px",
                height: "2px",
                backgroundColor: isAvailable ? "#10B981" : "#D1D5DB",
                borderRadius: "1px",
                // This transform places the segment at the correct position around the date
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${angle}rad)`,
              }}
            />
          );
        })}
      </>
    );
  };

  // Format date in a readable way
  const formatDate = (date) => {
    const options = { weekday: "long", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  // Handle date selection
  const handleDateClick = (dateString) => {
    setSelectedDate(dateString);
    setTimeSlots(generateTimeSlotsForDate(dateString));
  };

  // Handle booking click
  const handleBookingClick = (slot) => {
    // In a real implementation, this would redirect to a booking page or show a form
    alert(`Booking for ${formatDate(new Date(selectedDate))} at ${slot.time}`);
  };

  // Navigate to previous month
  const handlePreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(currentMonth.getMonth() - 1);
    setCurrentMonth(newDate);
  };

  // Navigate to next month
  const handleNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(currentMonth.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  // Render day of week headers
  const renderDayHeaders = () => {
    return (
      <div style={styles.dayHeadersGrid}>
        {DAYS.map((day) => (
          <div key={day} style={styles.dayHeader}>
            {day}
          </div>
        ))}
      </div>
    );
  };

  // Render calendar
  const renderCalendar = () => {
    return (
      <div style={styles.calendarGrid}>
        {availabilityData.map((day, index) => {
          const isSelected = selectedDate === day.date;
          const hasAvailability = day.available && day.availableHours > 0;

          return (
            <div
              key={index}
              onClick={() => hasAvailability && handleDateClick(day.date)}
              style={styles.dateCell(isSelected, hasAvailability, day.inMonth)}
            >
              {hasAvailability && renderAvailabilityIndicators(day)}

              {/* Date number - centered */}
              <div style={styles.dateNumber(isSelected, day.inMonth)}>
                {day.day}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render time slots for selected date
  const renderTimeSlots = () => {
    if (!selectedDate) {
      return (
        <div style={styles.timeSlotsEmpty}>
          Please select a date to view available times
        </div>
      );
    }

    return (
      <div>
        <h3 style={styles.selectedDateTitle}>
          {formatDate(new Date(selectedDate))}
        </h3>

        {/* Morning slots with dots */}
        {timeSlots.morning && timeSlots.morning.length > 0 && (
          <div>
            <h4 style={styles.sectionTitle}>Morning</h4>
            <div style={styles.timeSlotsGrid}>
              {timeSlots.morning.map((slot, index) => (
                <div
                  key={index}
                  onClick={() => slot.available && handleBookingClick(slot)}
                  style={styles.timeSlot(slot.available)}
                >
                  <div style={styles.timeSlotDot(slot.available)}></div>
                  <span style={styles.timeSlotText}>{slot.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Afternoon slots with dots */}
        {timeSlots.afternoon && timeSlots.afternoon.length > 0 && (
          <div>
            <h4 style={styles.sectionTitle}>Afternoon</h4>
            <div style={styles.timeSlotsGrid}>
              {timeSlots.afternoon.map((slot, index) => (
                <div
                  key={index}
                  onClick={() => slot.available && handleBookingClick(slot)}
                  style={styles.timeSlot(slot.available)}
                >
                  <div style={styles.timeSlotDot(slot.available)}></div>
                  <span style={styles.timeSlotText}>{slot.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Book button */}
        <div style={styles.bookButtonContainer}>
          <button
            style={styles.bookButton}
            onClick={() =>
              alert(
                `Booking appointment on ${formatDate(new Date(selectedDate))}`
              )
            }
          >
            BOOK
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Header with business info */}
      <div style={styles.header}>
        <div style={styles.headerTitleContainer}>
          <h2 style={styles.headerTitle}>{buttonText}</h2>
          {nextAvailable && (
            <div style={styles.nextAvailableBadge}>
              <span style={{ marginRight: "4px" }}>✓</span>
              Next Available: {nextAvailable.date}
            </div>
          )}
        </div>

        <div style={styles.providerInfo}>
          <img
            src={providerImage}
            alt={providerName}
            style={styles.providerImage}
          />
          <div>
            <p style={styles.providerName}>{providerName}</p>
            <p style={styles.providerAddress}>
              <span style={{ marginRight: "4px" }}>📍</span>
              {providerAddress}, {providerCity}
            </p>
          </div>
        </div>
      </div>

      {/* Main content - side by side layout */}
      <div style={styles.contentContainer}>
        {/* Calendar section */}
        <div style={styles.calendarSection}>
          <div style={styles.monthNav}>
            <button onClick={handlePreviousMonth} style={styles.monthNavButton}>
              <span>←</span>
            </button>

            <h3 style={styles.monthTitle}>
              {currentMonth.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h3>

            <button onClick={handleNextMonth} style={styles.monthNavButton}>
              <span>→</span>
            </button>
          </div>

          {loading ? (
            <div style={styles.loadingSpinner}>
              <div style={styles.spinner}></div>
            </div>
          ) : (
            <>
              {renderDayHeaders()}
              {renderCalendar()}
            </>
          )}
        </div>

        {/* Time slots section */}
        <div style={styles.timeSlotsSection}>
          {/* <div style={styles.timeSlotsHeader}>
            <span style={styles.timeSlotsIcon}>🕒</span>
            <h3 style={styles.timeSlotsTitle}>Available Times</h3>
          </div> */}

          {renderTimeSlots()}
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        Powered by{" "}
        <a
          href="https://availnow.com"
          target="_blank"
          rel="noopener noreferrer"
          style={styles.footerLink}
        >
          AvailNow
        </a>
      </div>
    </div>
  );
};

export default EmbedWidget;
