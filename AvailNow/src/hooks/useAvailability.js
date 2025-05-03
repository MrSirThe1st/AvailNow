import { useState, useEffect } from "react";
import { formatDate, doTimesOverlap } from "../lib/calendarUtils";
import { AvailabilityAPI, CalendarAPI, WidgetAPI } from "../lib/api";
import { supabase } from "../lib/supabase";

/**
 * Custom hook to fetch and manage availability data
 * @param {string} userId - User ID to fetch availability for
 * @param {Date} date - Current date/month to fetch
 * @returns {Object} - Availability data and related methods
 */
const useAvailability = (userId, date = new Date()) => {
  const [availabilityData, setAvailabilityData] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState({ morning: [], afternoon: [] });
  const [nextAvailable, setNextAvailable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCalendar, setActiveCalendar] = useState(null);

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

  // Generate availability pattern for a date
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
          doTimesOverlap(hourStart, hourEnd, slotStart, slotEnd) &&
          slot.available
        );
      });

      // Slot is available if it's not overlapping with an event AND
      // either there's no availability slot for this time OR there is one that's marked as available
      pattern.push(
        !hasEventOverlap &&
          (availabilitySlots.length === 0 || hasAvailabilitySlot)
      );
    }

    return pattern;
  };

  // Generate time slots for a specific date
  const generateTimeSlotsForDate = (dateString, events, availabilitySlots) => {
    const date = new Date(dateString);
    const day = date.getDay();

    // No slots on weekends
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
          end: slotEnd,
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

  // Fetch availability data
  useEffect(() => {
    const fetchAvailabilityData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

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

        // Calculate date range for the current month view
        const year = date.getFullYear();
        const month = date.getMonth();
        const startDate = new Date(year, month, 1);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(year, month + 1, 0);
        endDate.setHours(23, 59, 59, 999);

        // Track widget view for analytics
        await WidgetAPI.trackWidgetEvent(userId, "view");

        // Fetch calendar events using the active calendar
        let events = [];
        if (activeCalendar) {
          try {
            events = await CalendarAPI.getCalendarEvents(
              userId,
              activeCalendar, // Use only the active calendar
              "primary",
              startDate,
              endDate
            );
          } catch (err) {
            console.warn("Error fetching calendar events:", err);
          }
        }

        // Fetch availability slots using the API service
        let availabilitySlots = [];
        try {
          availabilitySlots = await AvailabilityAPI.getAvailabilitySlots(
            userId,
            startDate,
            endDate
          );
        } catch (err) {
          console.warn("Error fetching availability slots:", err);
        }

        // Use the events or generate mock data if none found
        const calendarEvents =
          events && events.length > 0
            ? events
            : activeCalendar
              ? []
              : generateMockEvents(startDate, endDate);

        setCalendarEvents(calendarEvents);

        // Generate calendar data
        const calendarDates = getDatesForCalendarView(startDate);

        // Process events into availability patterns
        const processedData = calendarDates.map((dayData) => {
          const dayEvents = calendarEvents.filter((event) => {
            const eventDate = new Date(event.start_time);
            return eventDate.toDateString() === dayData.date.toDateString();
          });

          const dayAvailabilitySlots = availabilitySlots
            ? availabilitySlots.filter((slot) => {
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
          const availableSlots = pattern.filter(
            (isAvailable) => isAvailable
          ).length;

          return {
            ...dayData,
            availabilityPattern: pattern,
            available: availableSlots > 0,
            availableSlots,
            events: dayEvents,
            availabilitySlots: dayAvailabilitySlots,
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
          setTimeSlots(
            generateTimeSlotsForDate(
              availableDay.date,
              calendarEvents,
              availabilitySlots || []
            )
          );
        }
      } catch (err) {
        console.error("Error fetching availability data:", err);
        setError("Unable to load availability data");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailabilityData();
  }, [userId, date, activeCalendar]);

  // Helper function to generate mock events if needed
  const generateMockEvents = (startDate, endDate) => {
    console.log("Using mock data since no active calendar selected");
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
            user_id: userId,
            title: ["Meeting", "Appointment", "Call", "Conference", "Lunch"][
              Math.floor(Math.random() * 5)
            ],
            start_time: start.toISOString(),
            end_time: end.toISOString(),
            all_day: false,
            calendar_id: "primary",
            provider: "mock",
          });
        }
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return events;
  };

  // Handle date selection
  const handleDateClick = (date) => {
    setSelectedDate(date);
    setTimeSlots(generateTimeSlotsForDate(date, calendarEvents, []));
  };

  return {
    loading,
    error,
    availabilityData,
    calendarEvents,
    selectedDate,
    setSelectedDate: handleDateClick,
    timeSlots,
    nextAvailable,
    generateTimeSlotsForDate,
    activeCalendar,
  };
};

export default useAvailability;
