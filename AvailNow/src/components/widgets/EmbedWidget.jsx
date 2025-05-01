import React, { useState, useEffect } from "react";
import { createStyles } from "./EmbedWidgetStyles";
import { fetchCalendarEvents } from "../../lib/calendarService";
import { getAvailabilityForDateRange } from "../../lib/widgetService";
import { formatDate, doTimesOverlap } from "../../lib/calendarUtils";
import { trackWidgetEvent } from "../../lib/widgetService";

// DateCellWithDotIndicator component for calendar cell display
const DateCellWithDotIndicator = ({
  date,
  availabilityPattern = [],
  isSelected = false,
  isInMonth = true,
  onClick
}) => {
  // Calculate availability stats
  const totalSlots = availabilityPattern.length;
  const availableSlots = availabilityPattern.filter(slot => slot).length;
  const hasAvailability = availableSlots > 0;
  
  // Today indicator
  const isToday = new Date().toDateString() === date.toDateString();
  
  // Style for date cell
  const cellStyle = {
    position: "relative",
    height: "36px",
    width: "36px",
    padding: "2px",
    textAlign: "center",
    cursor: hasAvailability ? "pointer" : "default",
    opacity: !isInMonth ? 0.5 : 1,
    backgroundColor: isSelected ? "#EBF5FF" : "transparent",
    borderRadius: "4px",
    border: isSelected ? "1px solid #0070f3" : "none"
  };
  
  // Style for date number
  const dateNumberStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "20px",
    fontWeight: isSelected ? "bold" : "normal",
    color: !isInMonth ? "#9CA3AF" : isSelected ? "#0070f3" : "#1F2937"
  };
  
  // Style for dot container
  const dotContainerStyle = {
    display: "flex",
    justifyContent: "center",
    gap: "2px",
    marginTop: "2px"
  };
  
  return (
    <div
      style={cellStyle}
      onClick={() => hasAvailability && onClick && onClick(date)}
    >
      {/* Today indicator */}
      {isToday && (
        <div style={{
          position: "absolute",
          top: "2px",
          right: "2px",
          width: "4px",
          height: "4px",
          backgroundColor: "#0070f3",
          borderRadius: "50%"
        }}></div>
      )}
      
      {/* Date number */}
      <div style={dateNumberStyle}>
        {date.getDate()}
      </div>
      
      {/* Horizontal dot indicator */}
      <div style={dotContainerStyle}>
        {availabilityPattern.slice(0, 5).map((isAvailable, index) => (
          <div
            key={index}
            style={{
              width: "3px",
              height: "3px",
              borderRadius: "50%",
              backgroundColor: isAvailable ? "#10B981" : "#D1D5DB"
            }}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Embeddable widget component that displays availability slots using real calendar data
 */
const EmbedWidget = ({
  userId,
  theme = "light",
  accentColor = "#0070f3",
  textColor = "#333333",
  buttonText = "Check Availability",
  showDays = 7,
  compact = false,
  providerName = "Demo Provider",
  providerAddress = "123 Main Street",
  providerCity = "San Francisco, CA 94103",
  providerImage = "/api/placeholder/120/120",
}) => {
  const [loading, setLoading] = useState(true);
  const [availabilityData, setAvailabilityData] = useState([]);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState({ morning: [], afternoon: [] });
  const [nextAvailable, setNextAvailable] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [availabilitySlots, setAvailabilitySlots] = useState([]);

  // Get styles
  const styles = createStyles(theme, accentColor, textColor, compact);

  // Constants
  const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  // Get dates for calendar view
  const getDatesForCalendarView = (baseDate) => {
    const result = [];
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();

    // Find first day of month and adjust to start on Monday (0 = Monday, 6 = Sunday)
    const firstDay = new Date(year, month, 1).getDay();
    const daysFromPrevMonth = firstDay === 0 ? 6 : firstDay - 1;

    // Add days from previous month
    for (let i = daysFromPrevMonth; i > 0; i--) {
      const date = new Date(year, month, 1 - i);
      result.push({
        date,
        inMonth: false,
        day: date.getDate(),
      });
    }

    // Add days from current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      result.push({
        date,
        inMonth: true,
        day: i,
      });
    }

    // Add days from next month to complete the grid (6 weeks total)
    const remainingDays = 42 - result.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      result.push({
        date,
        inMonth: false,
        day: i,
      });
    }

    return result;
  };

  // Generate availability pattern for a date based on real calendar events and availability slots
  const generateAvailabilityPattern = (date, events, availabilitySlots) => {
    // If it's a weekend, return all unavailable
    if (date.getDay() === 0 || date.getDay() === 6) {
      return Array(8).fill(false);
    }

    // If it's in the past, return all unavailable
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      return Array(8).fill(false);
    }

    const pattern = [];

    // Business hours 9am to 5pm (8 hours)
    for (let hour = 9; hour < 17; hour++) {
      const hourStart = new Date(date);
      hourStart.setHours(hour, 0, 0, 0);

      const hourEnd = new Date(date);
      hourEnd.setHours(hour + 1, 0, 0, 0);

      // Check if this hour overlaps with any event
      const hasEventOverlap = events.some((event) => {
        const eventStart = new Date(event.start_time || event.startTime);
        const eventEnd = new Date(event.end_time || event.endTime);
        return doTimesOverlap(hourStart, hourEnd, eventStart, eventEnd);
      });

      // Check if this hour is marked as available in availability slots
      const hasAvailabilitySlot = availabilitySlots.some((slot) => {
        const slotStart = new Date(slot.start_time);
        const slotEnd = new Date(slot.end_time);
        return (
          doTimesOverlap(hourStart, hourEnd, slotStart, slotEnd) && slot.available
        );
      });

      // Slot is available if it's not overlapping with an event AND
      // either there's no availability slot for this time OR there is one that's marked as available
      const isAvailable = !hasEventOverlap && 
        (availabilitySlots.length === 0 || hasAvailabilitySlot);
      
      pattern.push(isAvailable);
    }

    return pattern;
  };

  // Generate time slots for a specific date using real events and availability data
  const generateTimeSlotsForDate = (dateString, events, availabilitySlots) => {
    const date = new Date(dateString);
    const day = date.getDay();

    // No slots on Sundays
    if (day === 0 || day === 6) return { morning: [], afternoon: [] };

    // Filter events for this date
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const dayEvents = events.filter((event) => {
      const eventStart = new Date(event.start_time);
      const eventEnd = new Date(event.end_time);
      return eventStart <= dayEnd && eventEnd >= dayStart;
    });

    // Filter availability slots for this date
    const dayAvailabilitySlots = availabilitySlots.filter((slot) => {
      const slotStart = new Date(slot.start_time);
      return slotStart.toDateString() === date.toDateString();
    });

    // Morning and afternoon slots
    const morningSlots = [];
    const afternoonSlots = [];

    // Generate slots from 8AM to 6PM
    for (let hour = 8; hour < 18; hour++) {
      for (let minutes of [0, 30]) {
        const slotStart = new Date(date);
        slotStart.setHours(hour, minutes, 0, 0);

        const slotEnd = new Date(date);
        slotEnd.setHours(hour, minutes + 30, 0, 0);

        // Check if this slot overlaps with any event
        const hasEventOverlap = dayEvents.some((event) => {
          const eventStart = new Date(event.start_time);
          const eventEnd = new Date(event.end_time);
          return doTimesOverlap(slotStart, slotEnd, eventStart, eventEnd);
        });

        // Check if this slot is marked as available in availability slots
        const matchingAvailabilitySlot = dayAvailabilitySlots.find((slot) => {
          const availStart = new Date(slot.start_time);
          const availEnd = new Date(slot.end_time);
          return doTimesOverlap(slotStart, slotEnd, availStart, availEnd);
        });

        // Determine if slot is available
        const isAvailable = 
          !hasEventOverlap && 
          (dayAvailabilitySlots.length === 0 || 
            (matchingAvailabilitySlot && matchingAvailabilitySlot.available));

        // Format time for display
        const ampm = hour >= 12 ? "pm" : "am";
        const displayHour = hour % 12 === 0 ? 12 : hour % 12;
        const displayMinutes = minutes === 0 ? "00" : "30";
        const time = `${displayHour}:${displayMinutes}${ampm}`;

        const slot = {
          time,
          available: isAvailable,
          start: slotStart,
          end: slotEnd
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

  // Fetch availability and calendar data for the widget
  useEffect(() => {
    const fetchAvailabilityData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Calculate date range for the current month view
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const startDate = new Date(year, month, 1);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(year, month + 1, 0);
        endDate.setHours(23, 59, 59, 999);

        // Track widget view
        if (userId) {
          await trackWidgetEvent(userId, "view");
        }

        // Fetch calendar events using real data
        let realEvents = [];
        let realAvailabilitySlots = [];

        if (userId) {
          try {
            // Attempt to fetch real calendar events
            const events = await fetchCalendarEvents(
              userId, 
              "google", // Default provider
              "primary", // Default calendar ID
              startDate, 
              endDate
            );
            
            if (events && events.length > 0) {
              realEvents = events;
              console.log("Fetched real calendar events:", events.length);
            }
            
            // Attempt to fetch real availability slots
            const availSlots = await getAvailabilityForDateRange(
              userId,
              startDate,
              endDate
            );
            
            if (availSlots && availSlots.length > 0) {
              realAvailabilitySlots = availSlots;
              console.log("Fetched real availability slots:", availSlots.length);
            } else {
              console.log("No availability slots found, using default available times");
            }
          } catch (err) {
            console.warn("Error fetching real data:", err);
            // Continue with empty arrays (all times available)
          }
        }

        setCalendarEvents(realEvents);
        setAvailabilitySlots(realAvailabilitySlots);

        // Generate calendar data
        const calendarDates = getDatesForCalendarView(startDate);

        // Process events into availability patterns
        const processedData = calendarDates.map((dayData) => {
          const dayEvents = realEvents.filter((event) => {
            const eventDate = new Date(event.start_time);
            return eventDate.toDateString() === dayData.date.toDateString();
          });

          const dayAvailabilitySlots = realAvailabilitySlots 
            ? realAvailabilitySlots.filter((slot) => {
                const slotDate = new Date(slot.start_time);
                return slotDate.toDateString() === dayData.date.toDateString();
              })
            : [];

          // Generate availability pattern for this day
          const pattern = generateAvailabilityPattern(
            dayData.date, 
            dayEvents, 
            dayAvailabilitySlots
          );

          // Count available slots
          const availableSlots = pattern.filter(isAvailable => isAvailable).length;

          return {
            ...dayData,
            availabilityPattern: pattern,
            available: availableSlots > 0,
            availableSlots,
            events: dayEvents,
            availabilitySlots: dayAvailabilitySlots
          };
        });

        setAvailabilityData(processedData);

        // Find next available time slot
        const today = new Date();
        const availableDay = processedData.find(
          (day) => day.available && day.date >= today
        );

        if (availableDay) {
          setNextAvailable({
            date: formatDate(new Date(availableDay.date)),
          });

          // Set the first available day as selected by default
          setSelectedDate(availableDay.date);
          setTimeSlots(generateTimeSlotsForDate(
            availableDay.date, 
            realEvents, 
            realAvailabilitySlots
          ));
        }
      } catch (err) {
        console.error("Error fetching availability:", err);
        setError("Unable to load availability data");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailabilityData();
  }, [currentMonth, userId]);

  // Format date in a readable way
  const formatDateForDisplay = (date) => {
    const options = { weekday: "long", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  // Handle date selection
  const handleDateClick = (date) => {
    setSelectedDate(date);
    setTimeSlots(generateTimeSlotsForDate(date, calendarEvents, availabilitySlots));
  };

  // Handle booking click
  const handleBookingClick = (slot) => {
    // Track booking click
    if (userId) {
      trackWidgetEvent(userId, "booking");
    }
    
    // In a real implementation, this would redirect to a booking page or show a form
    alert(
      `Booking for ${formatDateForDisplay(new Date(selectedDate))} at ${slot.time}`
    );
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
        {availabilityData.map((dateData, index) => (
          <DateCellWithDotIndicator
            key={index}
            date={dateData.date}
            availabilityPattern={dateData.availabilityPattern}
            isSelected={
              selectedDate &&
              selectedDate.toDateString() === dateData.date.toDateString()
            }
            isInMonth={dateData.inMonth}
            onClick={handleDateClick}
          />
        ))}
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
          {formatDateForDisplay(new Date(selectedDate))}
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
            onClick={() => {
              // Track widget click
              if (userId) {
                trackWidgetEvent(userId, "click");
              }
              
              alert(
                `Booking appointment on ${formatDateForDisplay(new Date(selectedDate))}`
              )
            }}
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
        <div style={styles.timeSlotsSection}>{renderTimeSlots()}</div>
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