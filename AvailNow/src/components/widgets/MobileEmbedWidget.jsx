// src/components/widgets/MobileEmbedWidget.jsx
import React, { useState, useEffect } from "react";
import { Clock, User, MapPin, Calendar } from "lucide-react";
import { formatDate, doTimesOverlap } from "../../lib/calendarUtils";
import {
  trackWidgetEvent,
  getAvailabilityForDateRange,
} from "../../lib/widgetService";
import { supabase } from "../../lib/supabase";

/**
 * Mobile-optimized embedded widget component that displays availability slots
 */
const MobileEmbedWidget = ({
  userId,
  theme = "light",
  accentColor = "#0070f3",
  textColor = "#333333",
  buttonText = "Check Availability",
  showDays = 7,
  providerName = "Demo Provider",
  providerAddress = "123 Main Street",
  providerCity = "San Francisco, CA 94103",
  providerImage = "/api/placeholder/120/120",
}) => {
  const [loading, setLoading] = useState(true);
  const [availabilityData, setAvailabilityData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [nextAvailable, setNextAvailable] = useState(null);
  const [error, setError] = useState(null);
  const [activeCalendar, setActiveCalendar] = useState(null);
  const [calendarEvents, setCalendarEvents] = useState([]);

  // Mobile-specific styles
  const styles = {
    container: {
      fontFamily: "'Inter', system-ui, sans-serif",
      backgroundColor: theme === "light" ? "#FFFFFF" : "#1F2937",
      color: theme === "light" ? textColor : "#F3F4F6",
      borderRadius: "12px 12px 0 0", // Rounded top corners only
      overflow: "hidden",
      width: "100%",
      maxWidth: "100%",
      boxShadow: "0 -4px 10px rgba(0, 0, 0, 0.1)",
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      maxHeight: "90vh",
      overflowY: "auto",
    },

    header: {
      backgroundColor: accentColor,
      color: "#FFFFFF",
      padding: "16px",
      position: "relative",
    },

    closeButton: {
      position: "absolute",
      top: "16px",
      right: "16px",
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      border: "none",
      borderRadius: "50%",
      width: "24px",
      height: "24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
    },

    title: {
      margin: 0,
      fontSize: "18px",
      fontWeight: "bold",
      display: "flex",
      alignItems: "center",
    },

    providerInfo: {
      display: "flex",
      alignItems: "center",
      marginTop: "8px",
    },

    providerImage: {
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      marginRight: "8px",
      objectFit: "cover",
    },

    providerDetails: {
      fontSize: "14px",
    },

    providerName: {
      fontWeight: "500",
    },

    providerAddress: {
      fontSize: "12px",
      opacity: 0.8,
      display: "flex",
      alignItems: "center",
    },

    dateSelector: {
      padding: "16px",
      borderBottom: `1px solid ${theme === "light" ? "#E5E7EB" : "#374151"}`,
    },

    dateSelectorHeader: {
      marginBottom: "12px",
      fontWeight: "500",
      display: "flex",
      alignItems: "center",
    },

    datesList: {
      display: "flex",
      overflowX: "auto",
      gap: "8px",
      padding: "4px 0",
    },

    dateItem: (isSelected) => ({
      padding: "8px 0",
      width: "72px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      borderRadius: "8px",
      backgroundColor: isSelected ? `${accentColor}15` : "transparent",
      border: isSelected
        ? `1px solid ${accentColor}`
        : `1px solid ${theme === "light" ? "#E5E7EB" : "#374151"}`,
      cursor: "pointer",
    }),

    dayName: (isSelected) => ({
      fontSize: "12px",
      fontWeight: "500",
      color: isSelected
        ? accentColor
        : theme === "light"
          ? "#6B7280"
          : "#9CA3AF",
    }),

    dayNumber: (isSelected) => ({
      fontSize: "16px",
      fontWeight: isSelected ? "bold" : "normal",
      color: isSelected
        ? accentColor
        : theme === "light"
          ? textColor
          : "#F3F4F6",
    }),

    availability: (isAvailable) => ({
      fontSize: "10px",
      marginTop: "4px",
      padding: "2px 6px",
      borderRadius: "10px",
      backgroundColor: isAvailable
        ? theme === "light"
          ? "#DCFCE7"
          : "#065F46"
        : theme === "light"
          ? "#FEE2E2"
          : "#7F1D1D",
      color: isAvailable
        ? theme === "light"
          ? "#166534"
          : "#A7F3D0"
        : theme === "light"
          ? "#B91C1C"
          : "#FECACA",
    }),

    timeSlots: {
      padding: "16px",
    },

    timeSlotsHeader: {
      marginBottom: "12px",
      fontWeight: "500",
      display: "flex",
      alignItems: "center",
    },

    timeSlotsList: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "8px",
      marginTop: "12px",
    },

    timeSlot: (isAvailable) => ({
      padding: "10px",
      borderRadius: "8px",
      border: `1px solid ${theme === "light" ? "#E5E7EB" : "#374151"}`,
      backgroundColor: isAvailable
        ? theme === "light"
          ? "#F9FAFB"
          : "#1F2937"
        : theme === "light"
          ? "#F3F4F6"
          : "#111827",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      cursor: isAvailable ? "pointer" : "default",
      opacity: isAvailable ? 1 : 0.5,
    }),

    timeText: {
      fontSize: "14px",
      fontWeight: "500",
    },

    availabilityStatus: (isAvailable) => ({
      fontSize: "10px",
      marginTop: "4px",
      color: isAvailable
        ? theme === "light"
          ? "#10B981"
          : "#34D399"
        : theme === "light"
          ? "#EF4444"
          : "#F87171",
    }),

    bookButton: {
      width: "100%",
      padding: "14px",
      backgroundColor: accentColor,
      color: "#FFFFFF",
      border: "none",
      borderRadius: "8px",
      fontWeight: "500",
      fontSize: "16px",
      cursor: "pointer",
      marginTop: "16px",
    },

    footer: {
      padding: "12px",
      textAlign: "center",
      borderTop: `1px solid ${theme === "light" ? "#E5E7EB" : "#374151"}`,
      fontSize: "12px",
      color: theme === "light" ? "#6B7280" : "#9CA3AF",
    },

    footerLink: {
      color: accentColor,
      textDecoration: "none",
    },

    noAvailability: {
      textAlign: "center",
      padding: "24px 16px",
      color: theme === "light" ? "#6B7280" : "#9CA3AF",
    },

    loadingState: {
      textAlign: "center",
      padding: "24px 16px",
    },

    loadingSpinner: {
      width: "30px",
      height: "30px",
      border: `3px solid ${theme === "light" ? "#E5E7EB" : "#374151"}`,
      borderTop: `3px solid ${accentColor}`,
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      margin: "0 auto 12px auto",
    },
  };

  // Fetch availability data
  useEffect(() => {
    const fetchAvailabilityData = async () => {
      if (!userId) {
        setLoading(false);
        setAvailabilityData([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Calculate date range for the current view
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + showDays);

        // Track widget view
        await trackWidgetEvent(userId, "view");

        // First, get the active calendar preference
        const { data: calendarSettings, error: settingsError } = await supabase
          .from("calendar_settings")
          .select("active_calendar")
          .eq("user_id", userId)
          .single();

        if (settingsError && settingsError.code !== "PGRST116") {
          console.warn("Error fetching calendar settings:", settingsError);
        } else if (calendarSettings?.active_calendar) {
          setActiveCalendar(calendarSettings.active_calendar);
        }

        // Fetch calendar events if we have an active calendar
        if (calendarSettings?.active_calendar) {
          const { data: events, error: eventsError } = await supabase
            .from("calendar_events")
            .select("*")
            .eq("user_id", userId)
            .gte("start_time", startDate.toISOString())
            .lte("end_time", endDate.toISOString());

          if (eventsError) {
            console.warn("Error fetching calendar events:", eventsError);
          } else {
            setCalendarEvents(events || []);
          }
        }

        // Fetch availability slots using real data
        const availabilitySlots = await getAvailabilityForDateRange(
          userId,
          startDate,
          endDate
        );

        // Process availability data into daily chunks
        const processedData = processDailyAvailability(
          availabilitySlots,
          calendarEvents,
          startDate,
          endDate
        );

        setAvailabilityData(processedData);

        // Set first available date as selected
        const firstAvailableDate = processedData.find(
          (day) => day.hasAvailability
        )?.date;
        if (firstAvailableDate) {
          setSelectedDate(firstAvailableDate);
          const firstDayTimeSlots =
            processedData.find(
              (day) =>
                day.date.toDateString() === firstAvailableDate.toDateString()
            )?.timeSlots || [];
          setTimeSlots(firstDayTimeSlots);

          // Set next available info
          setNextAvailable({
            date: formatDate(firstAvailableDate),
            slots: firstDayTimeSlots.length,
          });
        }
      } catch (err) {
        console.error("Error fetching availability data:", err);
        setError("Unable to load availability data");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailabilityData();
  }, [userId, showDays, activeCalendar]);

  // Process availability data into daily chunks with time slots and consider calendar events
  const processDailyAvailability = (slots, events, startDate, endDate) => {
    const result = [];
    const currentDate = new Date(startDate);

    // Ensure we're starting at the beginning of the day
    currentDate.setHours(0, 0, 0, 0);

    // Process each day in the range
    while (currentDate <= endDate) {
      const dateString = currentDate.toDateString();

      // Find all availability slots for this day
      const daySlots = slots.filter((slot) => {
        const slotDate = new Date(slot.start_time);
        return slotDate.toDateString() === dateString;
      });

      // Find all events for this day
      const dayEvents = events.filter((event) => {
        const eventDate = new Date(event.start_time);
        return eventDate.toDateString() === dateString;
      });

      // Generate formatted time slots for this day
      const formattedTimeSlots = [];

      // Business hours from 8am to 6pm with 30-minute intervals
      for (let hour = 8; hour < 18; hour++) {
        for (let minute of [0, 30]) {
          const slotStart = new Date(currentDate);
          slotStart.setHours(hour, minute, 0, 0);

          const slotEnd = new Date(currentDate);
          slotEnd.setHours(hour, minute + 30, 0, 0);

          // Check if this slot overlaps with any event
          const hasEventOverlap = dayEvents.some((event) => {
            const eventStart = new Date(event.start_time);
            const eventEnd = new Date(event.end_time);
            return doTimesOverlap(slotStart, slotEnd, eventStart, eventEnd);
          });

          // Check if this slot is explicitly set in availability slots
          const matchingAvailabilitySlot = daySlots.find((slot) => {
            const availStart = new Date(slot.start_time);
            const availEnd = new Date(slot.end_time);
            return doTimesOverlap(slotStart, slotEnd, availStart, availEnd);
          });

          // Slot is available if no event conflict AND either no availability defined OR marked as available
          const isAvailable =
            !hasEventOverlap &&
            (daySlots.length === 0 ||
              (matchingAvailabilitySlot && matchingAvailabilitySlot.available));

          // Format time for display
          const formatTimeString = (date) => {
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const ampm = hours >= 12 ? "PM" : "AM";
            const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
            const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
            return `${formattedHours}:${formattedMinutes} ${ampm}`;
          };

          formattedTimeSlots.push({
            id: `${currentDate.toISOString()}-${hour}-${minute}`,
            startTime: slotStart,
            endTime: slotEnd,
            time: formatTimeString(slotStart),
            available: isAvailable,
          });
        }
      }

      // Add day info to result
      result.push({
        date: new Date(currentDate),
        dateString: formatDate(currentDate),
        day: currentDate.getDate(),
        dayName: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
          currentDate.getDay()
        ],
        month: currentDate.toLocaleString("default", { month: "short" }),
        timeSlots: formattedTimeSlots,
        hasAvailability: formattedTimeSlots.some((slot) => slot.available),
        availableCount: formattedTimeSlots.filter((slot) => slot.available)
          .length,
      });

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);

    // Find time slots for selected date
    const selectedDayData = availabilityData.find(
      (day) => day.date.toDateString() === date.toDateString()
    );

    if (selectedDayData) {
      setTimeSlots(selectedDayData.timeSlots);
    } else {
      setTimeSlots([]);
    }
  };

  // Handle booking time slot
  const handleBookSlot = (slot) => {
    if (!slot.available) return;

    // Track the booking click
    if (userId) {
      trackWidgetEvent(userId, "booking");
    }

    alert(`Booking for ${selectedDate.toLocaleDateString()} at ${slot.time}`);
    // In a real app, this would open a booking form or redirect to a booking page
  };

  // Format date display
  const formatDateDisplay = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  // Check if a date is today
  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            <Clock size={18} style={{ marginRight: "8px" }} />
            {buttonText}
          </h2>
        </div>
        <div style={styles.loadingState}>
          <div style={styles.loadingSpinner}></div>
          <p>Loading availability data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            <Clock size={18} style={{ marginRight: "8px" }} />
            {buttonText}
          </h2>
        </div>
        <div style={styles.noAvailability}>{error}</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <Clock size={18} style={{ marginRight: "8px" }} />
          {buttonText}
        </h2>
        <button style={styles.closeButton} onClick={() => setIsOpen(false)}>
          ✕
        </button>

        {/* Provider info */}
        <div style={styles.providerInfo}>
          <img
            src={providerImage}
            alt={providerName}
            style={styles.providerImage}
          />
          <div style={styles.providerDetails}>
            <div style={styles.providerName}>{providerName}</div>
            <div style={styles.providerAddress}>
              <MapPin size={12} style={{ marginRight: "4px" }} />
              {providerAddress}
            </div>
          </div>
        </div>
      </div>

      {/* Date selector */}
      <div style={styles.dateSelector}>
        <div style={styles.dateSelectorHeader}>
          <Calendar size={16} style={{ marginRight: "8px" }} />
          Select a Date
        </div>

        <div style={styles.datesList}>
          {availabilityData.map((day, index) => (
            <div
              key={index}
              style={styles.dateItem(
                selectedDate &&
                  day.date.toDateString() === selectedDate.toDateString()
              )}
              onClick={() => day.hasAvailability && handleDateSelect(day.date)}
            >
              <span
                style={styles.dayName(
                  selectedDate &&
                    day.date.toDateString() === selectedDate.toDateString()
                )}
              >
                {day.dayName}
              </span>
              <span
                style={styles.dayNumber(
                  selectedDate &&
                    day.date.toDateString() === selectedDate.toDateString()
                )}
              >
                {day.day}
              </span>
              <span style={styles.availability(day.hasAvailability)}>
                {day.hasAvailability
                  ? `${day.availableCount} slots`
                  : "Unavailable"}
              </span>
              {isToday(day.date) && (
                <span style={{ fontSize: "10px", marginTop: "2px" }}>
                  Today
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Time slots */}
      {selectedDate ? (
        <div style={styles.timeSlots}>
          <div style={styles.timeSlotsHeader}>
            <Clock size={16} style={{ marginRight: "8px" }} />
            Available Times for {formatDateDisplay(selectedDate)}
          </div>

          {timeSlots.length > 0 ? (
            <>
              <div style={styles.timeSlotsList}>
                {timeSlots.map((slot, index) => (
                  <div
                    key={index}
                    style={styles.timeSlot(slot.available)}
                    onClick={() => slot.available && handleBookSlot(slot)}
                  >
                    <span style={styles.timeText}>{slot.time}</span>
                    <span style={styles.availabilityStatus(slot.available)}>
                      {slot.available ? "Available" : "Booked"}
                    </span>
                  </div>
                ))}
              </div>

              <button style={styles.bookButton}>Book Appointment</button>
            </>
          ) : (
            <div style={styles.noAvailability}>
              No available time slots for this day
            </div>
          )}
        </div>
      ) : (
        <div style={styles.noAvailability}>
          Please select a date to view available times
        </div>
      )}

      {/* Footer */}
      <div style={styles.footer}>
        Powered by{" "}
        <a href="https://availnow.com" style={styles.footerLink}>
          AvailNow
        </a>
      </div>
    </div>
  );
};

export default MobileEmbedWidget;
