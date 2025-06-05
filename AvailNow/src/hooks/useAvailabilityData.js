// src/hooks/useAvailabilityData.js
import { useState, useEffect } from "react";
import { formatDate, doTimesOverlap } from "../lib/calendarUtils";
import {
  trackWidgetEvent,
  getAvailabilityForDateRange,
  generateTimeSlots,
  isWithinBusinessHours,
  isWorkingDay,
} from "../lib/widgetService";
import { fetchCalendarEvents } from "../lib/calendarService";
import { supabase } from "../lib/supabase";

/**
 * Custom hook for managing availability data with business hours support
 * @param {string} userId - User ID
 * @param {Date} currentMonth - Current month being viewed
 * @param {Object} businessHours - Business hours configuration
 * @param {number} timeInterval - Time slot interval in minutes
 * @returns {Object} - Availability data and related functions
 */
export const useAvailabilityData = (
  userId,
  currentMonth,
  businessHours,
  timeInterval = 30
) => {
  const [loading, setLoading] = useState(true);
  const [availabilityData, setAvailabilityData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState({ morning: [], afternoon: [] });
  const [nextAvailable, setNextAvailable] = useState(null);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
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

  // Generate availability pattern for a date using business hours
  const generateAvailabilityPattern = (date, events, availabilitySlots) => {
    // Check if it's a working day
    if (!isWorkingDay(date, businessHours.workingDays)) {
      return Array(8).fill(false); // Return empty pattern for non-working days
    }

    // If it's in the past, return all unavailable
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      return Array(8).fill(false);
    }

    const pattern = [];

    // Generate time slots based on business hours and interval
    const timeSlotOptions = generateTimeSlots(
      businessHours.startTime,
      businessHours.endTime,
      timeInterval
    );

    // For each potential time slot, check availability
    timeSlotOptions.forEach((timeSlot) => {
      const [hour, minute] = timeSlot.value.split(":").map(Number);
      const slotStart = new Date(date);
      slotStart.setHours(hour, minute, 0, 0);

      const slotEnd = new Date(date);
      slotEnd.setHours(hour, minute + timeInterval, 0, 0);

      // Check if this slot overlaps with any event
      const hasEventOverlap = events.some((event) => {
        const eventStart = new Date(event.start_time || event.startTime);
        const eventEnd = new Date(event.end_time || event.endTime);

        // Apply buffer times
        if (businessHours.bufferBefore) {
          eventStart.setMinutes(
            eventStart.getMinutes() - businessHours.bufferBefore
          );
        }
        if (businessHours.bufferAfter) {
          eventEnd.setMinutes(
            eventEnd.getMinutes() + businessHours.bufferAfter
          );
        }

        return doTimesOverlap(slotStart, slotEnd, eventStart, eventEnd);
      });

      // Check if this slot is marked as available in availability slots
      const hasAvailabilitySlot = availabilitySlots.some((slot) => {
        const slotSlotStart = new Date(slot.start_time);
        const slotSlotEnd = new Date(slot.end_time);
        return (
          doTimesOverlap(slotStart, slotEnd, slotSlotStart, slotSlotEnd) &&
          slot.available
        );
      });

      // Slot is available if it's not overlapping with an event AND
      // either there's no availability slot for this time OR there is one that's marked as available
      const isAvailable =
        !hasEventOverlap &&
        (availabilitySlots.length === 0 || hasAvailabilitySlot);

      pattern.push(isAvailable);
    });

    return pattern;
  };

  // Generate time slots for a specific date using business hours
  const generateTimeSlotsForDate = (date, events, availabilitySlots) => {
    // Check if it's a working day
    if (!isWorkingDay(date, businessHours.workingDays)) {
      return { morning: [], afternoon: [] };
    }

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

    // Generate time slots based on business hours
    const timeSlotOptions = generateTimeSlots(
      businessHours.startTime,
      businessHours.endTime,
      timeInterval
    );

    const morningSlots = [];
    const afternoonSlots = [];

    timeSlotOptions.forEach((timeSlot) => {
      const [hour, minute] = timeSlot.value.split(":").map(Number);
      const slotStart = new Date(date);
      slotStart.setHours(hour, minute, 0, 0);

      const slotEnd = new Date(date);
      slotEnd.setHours(hour, minute + timeInterval, 0, 0);

      // Check if this slot overlaps with any event
      const hasEventOverlap = dayEvents.some((event) => {
        const eventStart = new Date(event.start_time);
        const eventEnd = new Date(event.end_time);

        // Apply buffer times
        if (businessHours.bufferBefore) {
          eventStart.setMinutes(
            eventStart.getMinutes() - businessHours.bufferBefore
          );
        }
        if (businessHours.bufferAfter) {
          eventEnd.setMinutes(
            eventEnd.getMinutes() + businessHours.bufferAfter
          );
        }

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

      const slot = {
        time: timeSlot.label,
        available: isAvailable,
        start: slotStart,
        end: slotEnd,
      };

      // Sort into morning and afternoon (before/after noon)
      if (hour < 12) {
        morningSlots.push(slot);
      } else {
        afternoonSlots.push(slot);
      }
    });

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
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const startDate = new Date(year, month, 1);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(year, month + 1, 0);
        endDate.setHours(23, 59, 59, 999);

        // Track widget view
        await trackWidgetEvent(userId, "view");

        // Fetch calendar events using the active calendar
        let events = [];
        if (calendarSettings?.active_calendar) {
          try {
            events = await fetchCalendarEvents(
              userId,
              calendarSettings.active_calendar,
              "primary",
              startDate,
              endDate
            );
          } catch (err) {
            console.warn("Error fetching calendar events:", err);
          }
        }

        // Fetch availability slots
        let availSlots = [];
        try {
          availSlots = await getAvailabilityForDateRange(
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
            : calendarSettings?.active_calendar
              ? []
              : generateMockEvents(startDate, endDate);

        setCalendarEvents(calendarEvents);
        setAvailabilitySlots(availSlots || []);

        // Generate calendar data
        const calendarDates = getDatesForCalendarView(startDate);

        // Process events into availability patterns
        const processedData = calendarDates.map((dayData) => {
          const dayEvents = calendarEvents.filter((event) => {
            const eventDate = new Date(event.start_time);
            return eventDate.toDateString() === dayData.date.toDateString();
          });

          const dayAvailabilitySlots = availSlots
            ? availSlots.filter((slot) => {
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
              availSlots || []
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
  }, [userId, currentMonth, businessHours, timeInterval, activeCalendar]);

  // Helper function to generate mock events if needed
  const generateMockEvents = (startDate, endDate) => {
    console.log("Using mock data since no active calendar selected");
    const events = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      // Only generate for working days
      if (isWorkingDay(currentDate, businessHours.workingDays)) {
        // Create 2-3 events per working day
        const numEvents = Math.floor(Math.random() * 2) + 2;

        for (let i = 0; i < numEvents; i++) {
          // Generate events within business hours
          const timeSlotOptions = generateTimeSlots(
            businessHours.startTime,
            businessHours.endTime,
            timeInterval
          );

          if (timeSlotOptions.length > 0) {
            const randomSlot =
              timeSlotOptions[
                Math.floor(Math.random() * timeSlotOptions.length)
              ];
            const [hour, minute] = randomSlot.value.split(":").map(Number);

            const start = new Date(currentDate);
            start.setHours(hour, minute, 0, 0);

            const end = new Date(start);
            end.setMinutes(end.getMinutes() + timeInterval);

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
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return events;
  };

  // Handle date selection
  const handleDateClick = (date) => {
    setSelectedDate(date);
    setTimeSlots(
      generateTimeSlotsForDate(date, calendarEvents, availabilitySlots)
    );
  };

  return {
    loading,
    error,
    availabilityData,
    calendarEvents,
    selectedDate,
    timeSlots,
    nextAvailable,
    activeCalendar,
    handleDateClick,
    generateTimeSlotsForDate,
  };
};
