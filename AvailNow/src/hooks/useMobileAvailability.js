// src/hooks/useMobileAvailability.js
import { useState, useEffect } from "react";
import { formatDate, doTimesOverlap } from "../lib/calendarUtils";
import {
  trackWidgetEvent,
  getAvailabilityForDateRange,
} from "../lib/widgetService";
import { supabase } from "../lib/supabase";

export const useMobileAvailability = (userId, showDays) => {
  const [loading, setLoading] = useState(true);
  const [availabilityData, setAvailabilityData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [nextAvailable, setNextAvailable] = useState(null);
  const [error, setError] = useState(null);
  const [activeCalendar, setActiveCalendar] = useState(null);
  const [calendarEvents, setCalendarEvents] = useState([]);

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

  return {
    loading,
    error,
    availabilityData,
    selectedDate,
    timeSlots,
    nextAvailable,
    handleDateSelect,
    handleBookSlot,
  };
};
