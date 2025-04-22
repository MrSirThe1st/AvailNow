import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { createStyles } from "./EmbedWidgetStyles";
import { fetchCalendarEvents } from "../../lib/calendarService";
import { getConnectedCalendars } from "../../lib/calendarService";
import { formatDate, doTimesOverlap } from "../../lib/calendarUtils";

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
  const [connectedCalendars, setConnectedCalendars] = useState([]);

  // Get styles
  const styles = createStyles(theme, accentColor, textColor, compact);

  const generateDatesForCalendarView = (baseDate) => {
    const result = [];
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();

    // Find first day of month and adjust to start on Monday (0 = Monday, 6 = Sunday)
    const firstDay = new Date(year, month, 1).getDay();
    const daysFromPrevMonth = firstDay === 0 ? 6 : firstDay - 1;

    // Add days from previous month
    for (let i = daysFromPrevMonth; i > 0; i--) {
      const date = new Date(year, month, 1 - i);
      result.push(date);
    }

    // Add days from current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      result.push(date);
    }

    // Add days from next month to complete 6 weeks (42 days)
    const remainingDays = 42 - result.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      result.push(date);
    }

    return result;
  };

  const generateAvailabilityPattern = (date, events) => {
    const pattern = [];

    // Business hours 9am to 5pm (8 hours)
    for (let hour = 9; hour < 17; hour++) {
      const hourStart = new Date(date);
      hourStart.setHours(hour, 0, 0, 0);

      const hourEnd = new Date(date);
      hourEnd.setHours(hour + 1, 0, 0, 0);

      // Check if this hour overlaps with any event
      const isAvailable = !events.some((event) => {
        const eventStart = new Date(event.start_time || event.startTime);
        const eventEnd = new Date(event.end_time || event.endTime);
        return doTimesOverlap(hourStart, hourEnd, eventStart, eventEnd);
      });

      pattern.push(isAvailable);
    }

    return pattern;
  };

  // Constants
  const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  // Fetch availability data for the specified user
  useEffect(() => {
    const fetchAvailability = async () => {
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
        
        console.log("Fetching availability for date range:", startDate, "to", endDate);
        
        let events = [];
        
        // Try to fetch real events if userId is provided
        if (userId) {
          try {
            // First try to get connected calendars
            const calendars = await getConnectedCalendars(userId);
            setConnectedCalendars(calendars);
            
            if (calendars && calendars.length > 0) {
              console.log("Found connected calendars:", calendars.length);
              
              // For each connected calendar, fetch events
              const eventPromises = calendars.map(calendar => 
                fetchCalendarEvents(
                  userId,
                  calendar.provider,
                  calendar.id,
                  startDate,
                  endDate
                ).catch(err => {
                  console.error(`Error fetching events for calendar ${calendar.id}:`, err);
                  return [];
                })
              );
              
              const eventArrays = await Promise.all(eventPromises);
              events = eventArrays.flat();
              console.log("Fetched real calendar events:", events.length);
            } else {
              console.log("No connected calendars found, using mock data");
              // No calendars found, use mock data
              events = generateMockEvents(startDate, endDate);
            }
          } catch (err) {
            console.error("Error fetching calendar events:", err);
            // Fallback to mock data
            events = generateMockEvents(startDate, endDate);
          }
        } else {
          // No userId provided, use mock data
          console.log("No userId provided, using mock data");
          events = generateMockEvents(startDate, endDate);
        }
        
        setCalendarEvents(events);
        
        // Process events into availability data
        const availabilityData = processEventsIntoAvailabilityData(events, startDate, endDate);
        setAvailabilityData(availabilityData);
        
        // Find next available time slot
        const today = new Date();
        const availableDay = availabilityData.find(day => 
          day.available && new Date(day.date) >= today
        );
        
        if (availableDay) {
          setNextAvailable({
            date: formatDate(new Date(availableDay.date))
          });
          
          // Set the first available day as selected by default
          setSelectedDate(availableDay.date);
          setTimeSlots(generateTimeSlotsForDate(availableDay.date, events));
        }
      } catch (err) {
        console.error("Error fetching availability:", err);
        setError("Unable to load availability data");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [userId, currentMonth]);

  // Process events into availability data
  const processEventsIntoAvailabilityData = (events, startDate, endDate) => {
    const result = [];
    
    // Generate all dates for the calendar view (previous month, current month, next month)
    const datesInView = generateDatesForCalendarView(startDate);
    
    for (const date of datesInView) {
      const dateStr = date.toISOString();
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      // Find events for this day
      const dayEvents = events.filter(event => {
        const eventStart = new Date(event.start_time || event.startTime);
        const eventEnd = new Date(event.end_time || event.endTime);
        return eventStart <= dayEnd && eventEnd >= dayStart;
      });
      
      // Is this day in the current month?
      const inMonth = date.getMonth() === startDate.getMonth();
      
      // Is this day a weekend?
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      
      // Is this day in the past?
      const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
      
      // Calculate available hours (working hours minus busy hours)
      const workingHours = isWeekend ? 0 : 8; // No working hours on weekends
      const busyHours = calculateBusyHours(dayEvents);
      const availableHours = Math.max(0, workingHours - busyHours);
      
      // Generate availability pattern (8 segments around the date)
      const pattern = generateAvailabilityPattern(date, dayEvents);
      
      // A day is available if it's not a weekend, not in the past, and has available hours
      const available = !isWeekend && !isPast && availableHours > 0;
      
      result.push({
        date: dateStr,
        day: date.getDate(),
        weekday: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        inMonth: inMonth,
        available: available,
        availableHours: availableHours,
        busyHours: busyHours,
        availabilityPattern: pattern,
        events: dayEvents
      });
    }
    
    return result;
  };

  // Calculate busy hours for a day based on events
  const calculateBusyHours = (events) => {
    if (!events || events.length === 0) return 0;
    
    // Track busy minutes in each hour (9am to 5pm)
    const busyMinutes = Array(9).fill(0); // 9am to 5pm = 9 hours
    
    events.forEach(event => {
      const eventStart = new Date(event.start_time);
      const eventEnd = new Date(event.end_time);
      
      // Only count within business hours (9am to 5pm)
      const startHour = Math.max(9, eventStart.getHours());
      const endHour = Math.min(17, eventEnd.getHours());
      
      // For each hour this event spans
      for (let hour = startHour; hour < endHour; hour++) {
        // How many minutes of this hour are occupied by the event?
        let minutesInHour = 60;
        
        // If this is the first hour of the event, adjust for start time
        if (hour === eventStart.getHours()) {
          minutesInHour = 60 - eventStart.getMinutes();
        }
        
        // If this is the last hour of the event, adjust for end time
        if (hour === endHour - 1 && endHour === eventEnd.getHours()) {
          minutesInHour = eventEnd.getMinutes();
        }
        
        // Add busy minutes to the hour's count (9am = index 0)
        busyMinutes[hour - 9] += minutesInHour;
      }
    });
    
    // Count hours with significant busy time (more than 30 minutes)
    return busyMinutes.filter(minutes => minutes > 30).length;
  };

  // Find next available slot
  const findNextAvailableSlot = (availabilityData, fromDate) => {
    const availableDay = availabilityData.find(day => {
      const dayDate = new Date(day.date);
      return day.available && dayDate >= fromDate;
    });
    
    if (availableDay) {
      return {
        date: formatDate(new Date(availableDay.date))
      };
    }
    
    return null;
  };

  // Generate mock events for testing
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
            id: `mock-${currentDate.toISOString()}-${i}`,
            title: ["Meeting", "Appointment", "Call", "Conference", "Lunch"][Math.floor(Math.random() * 5)],
            start_time: start.toISOString(),
            end_time: end.toISOString(),
            all_day: false,
            calendar_id: "primary",
            provider: "google"
          });
        }
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return events;
  };

  // Generate time slots for a specific date
  const generateTimeSlotsForDate = (dateString, events) => {
    const date = new Date(dateString);
    const day = date.getDay();
    
    // No slots on Sundays
    if (day === 0) return { morning: [], afternoon: [] };
    
    // Filter events for this date
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    const dayEvents = events.filter(event => {
      const eventStart = new Date(event.start_time);
      const eventEnd = new Date(event.end_time);
      return eventStart <= dayEnd && eventEnd >= dayStart;
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
        
        // Check if this slot is available (no overlapping events)
        const isAvailable = !dayEvents.some(event => {
          const eventStart = new Date(event.start_time);
          const eventEnd = new Date(event.end_time);
          return doTimesOverlap(slotStart, slotEnd, eventStart, eventEnd);
        });
        
        // Format time for display
        const ampm = hour >= 12 ? "pm" : "am";
        const displayHour = hour % 12 === 0 ? 12 : hour % 12;
        const displayMinutes = minutes === 0 ? "00" : "30";
        const time = `${displayHour}:${displayMinutes}${ampm}`;
        
        const slot = {
          time,
          available: isAvailable
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
  const renderAvailabilityIndicators = (day) => {
    // Use the availability pattern from the data
    const pattern = day.availabilityPattern || [];
    const totalSegments = pattern.length;
    
    if (totalSegments === 0) {
      return null;
    }
    
    return (
      <>
        {pattern.map((isAvailable, index) => {
          // Each indicator represents an hour of the business day (9am-5pm)
          // Position them in a circle around the date number
          const angle = (index / totalSegments) * 2 * Math.PI;
          
          // Calculate position around the date cell
          const radius = 15; // Distance from center to the indicators
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
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${angle}rad)`,
              }}
            />
          );
        })}
      </>
    );
  };

  // Format date in a readable way
  const formatDateForDisplay = (date) => {
    const options = { weekday: "long", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  // Handle date selection
  const handleDateClick = (dateString) => {
    setSelectedDate(dateString);
    setTimeSlots(generateTimeSlotsForDate(dateString, calendarEvents));
  };

  // Handle booking click
  const handleBookingClick = (slot) => {
    // In a real implementation, this would redirect to a booking page or show a form
    alert(`Booking for ${formatDateForDisplay(new Date(selectedDate))} at ${slot.time}`);
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
            onClick={() =>
              alert(
                `Booking appointment on ${formatDateForDisplay(new Date(selectedDate))}`
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