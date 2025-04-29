import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { fetchCalendarEvents } from "../lib/calendarService";

/**
 * Custom hook to fetch and manage calendar events
 * @param {string} userId - User ID to fetch calendar data for
 * @param {Date} viewDate - Current date for calendar view
 * @param {string} viewType - Calendar view type ("day", "week", "month")
 * @returns {Object} - Calendar data and related methods
 */
const useCalendar = (userId, viewDate = new Date(), viewType = "week") => {
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [connectedCalendars, setConnectedCalendars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get date range for current view
  const getDateRange = useCallback(() => {
    const startDate = new Date(viewDate);
    const endDate = new Date(viewDate);

    if (viewType === "day") {
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (viewType === "week") {
      const day = startDate.getDay();
      startDate.setDate(startDate.getDate() - day);
      startDate.setHours(0, 0, 0, 0);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (viewType === "month") {
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setMonth(endDate.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    }

    return { startDate, endDate };
  }, [viewDate, viewType]);

  // Fetch connected calendars and events
  useEffect(() => {
    const fetchCalendarData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // 1. Fetch connected calendars
        const { data: calendarIntegrations, error: calendarError } = await supabase
          .from("calendar_integrations")
          .select("*")
          .eq("user_id", userId);

        if (calendarError) {
          console.error("Error fetching calendar integrations:", calendarError);
          throw new Error("Failed to fetch calendar integrations");
        }

        setConnectedCalendars(calendarIntegrations || []);

        // 2. Get date range for current view
        const { startDate, endDate } = getDateRange();

        // 3. Fetch events from Supabase and external calendars
        let allEvents = [];

        // 3a. Fetch from Supabase
        const { data: dbEvents, error: dbEventsError } = await supabase
          .from("calendar_events")
          .select("*")
          .eq("user_id", userId)
          .gte("start_time", startDate.toISOString())
          .lte("end_time", endDate.toISOString());

        if (dbEventsError) {
          console.error("Error fetching calendar events:", dbEventsError);
          throw new Error("Failed to fetch calendar events");
        }

        if (dbEvents && dbEvents.length > 0) {
          allEvents = [...dbEvents];
        }

        // 3b. Fetch from connected calendars if any
        if (calendarIntegrations && calendarIntegrations.length > 0) {
          try {
            for (const integration of calendarIntegrations) {
              const { provider } = integration;
              
              // Only use external calendars flagged as "primary" for simplicity
              const externalEvents = await fetchCalendarEvents(
                userId,
                provider,
                "primary", // Calendar ID
                startDate,
                endDate
              );
              
              if (externalEvents && externalEvents.length > 0) {
                allEvents = [...allEvents, ...externalEvents];
              }
            }
          } catch (err) {
            console.error("Error fetching external calendar events:", err);
            // Don't fail completely, just log the error
          }
        }

        // 4. If no events found or insufficient data, generate mock data
        if (allEvents.length === 0) {
          allEvents = generateMockEvents(userId, startDate, endDate);
        }

        setCalendarEvents(allEvents);
      } catch (err) {
        console.error("Error in useCalendar:", err);
        setError(err.message || "Failed to load calendar data");
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarData();
  }, [userId, viewDate, viewType, getDateRange]);

  // Generate mock events for testing purposes
  const generateMockEvents = (userId, startDate, endDate) => {
    console.log("Generating mock calendar events");
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
            provider: "google",
          });
        }
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return events;
  };

  // Get events for a specific date and hour
  const getEventsForTimeSlot = (date, hour) => {
    return calendarEvents.filter((event) => {
      const eventStart = new Date(event.start_time);
      const eventEnd = new Date(event.end_time);
      const timeToCheck = new Date(date);
      timeToCheck.setHours(hour, 0, 0, 0);
      const timeEnd = new Date(timeToCheck);
      timeEnd.setHours(hour + 1, 0, 0, 0);

      return (
        (timeToCheck >= eventStart && timeToCheck < eventEnd) || // Event starts before or at this hour
        (timeEnd > eventStart && timeEnd <= eventEnd) || // Event ends during this hour
        (eventStart >= timeToCheck && eventEnd <= timeEnd) // Event is fully contained in this hour
      );
    });
  };

  // Get events for a specific date
  const getEventsForDate = (date) => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return calendarEvents.filter((event) => {
      const eventStart = new Date(event.start_time);
      const eventEnd = new Date(event.end_time);
      return eventStart <= dayEnd && eventEnd >= dayStart;
    });
  };

  // Add a new event
  const addEvent = async (event) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("calendar_events")
        .insert([{
          user_id: userId,
          ...event
        }])
        .select();

      if (error) throw error;
      
      setCalendarEvents([...calendarEvents, data[0]]);
      return data[0];
    } catch (err) {
      console.error("Error adding event:", err);
      setError("Failed to add event");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing event
  const updateEvent = async (eventId, updates) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("calendar_events")
        .update(updates)
        .eq("id", eventId)
        .eq("user_id", userId)
        .select();

      if (error) throw error;
      
      setCalendarEvents(
        calendarEvents.map(event => 
          event.id === eventId ? { ...event, ...updates } : event
        )
      );
      
      return data[0];
    } catch (err) {
      console.error("Error updating event:", err);
      setError("Failed to update event");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete an event
  const deleteEvent = async (eventId) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from("calendar_events")
        .delete()
        .eq("id", eventId)
        .eq("user_id", userId);

      if (error) throw error;
      
      setCalendarEvents(
        calendarEvents.filter(event => event.id !== eventId)
      );
      
      return true;
    } catch (err) {
      console.error("Error deleting event:", err);
      setError("Failed to delete event");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    calendarEvents,
    connectedCalendars,
    getEventsForTimeSlot,
    getEventsForDate,
    addEvent,
    updateEvent,
    deleteEvent,
    getDateRange
  };
};

export default useCalendar;