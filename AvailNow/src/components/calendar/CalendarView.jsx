// src/components/calendar/CalendarView.jsx
import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader,
  AlertTriangle,
} from "lucide-react";
import AvailabilitySlot from "./AvailabilitySlot";
import { mergeAvailabilityWithEvents } from "../../lib/calendarUtils";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
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

const CalendarView = ({ onAddCalendar, supabaseClient, user }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("week"); // 'day', 'week', 'month'
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [connectedCalendars, setConnectedCalendars] = useState([]);
  const [selectedCalendarIds, setSelectedCalendarIds] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [businessHours, setBusinessHours] = useState({
    startTime: "09:00",
    endTime: "17:00",
    workingDays: [1, 2, 3, 4, 5], // Monday to Friday
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Hours to display in the calendar
  const displayHours = Array.from({ length: 12 }, (_, i) => i + 8); // 8am to 7pm

  // Update loadConnectedCalendars in CalendarView.jsx

  const loadConnectedCalendars = async () => {
    if (!supabaseClient) return;

    try {
      setIsLoading(true);
      setError(null);

      console.log("Loading connected calendars for user", user?.id);

      // First try RPC approach
      try {
        const { data: calendars, error: rpcError } = await supabaseClient.rpc(
          "get_user_calendars",
          { p_user_id: user.id }
        );

        if (!rpcError) {
          console.log("Loaded calendars via RPC:", calendars);
          setConnectedCalendars(calendars || []);
          return;
        }
      } catch (rpcErr) {
        console.warn("RPC approach failed, trying direct query:", rpcErr);
      }

      // Fall back to direct query
      const { data, error } = await supabaseClient
        .from("calendar_integrations")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error in direct query:", error);
        throw error;
      }

      console.log("Loaded calendars via direct query:", data);
      setConnectedCalendars(data || []);
    } catch (err) {
      console.error("Error loading connected calendars:", err);
      setError("Failed to load calendar integrations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Load connected calendars and selected calendars
  useEffect(() => {
    if (user && supabaseClient) {
      loadCalendarData();
    }
  }, [user, supabaseClient]);

  // Load calendar events when date, view, or selected calendars change
  useEffect(() => {
    if (user && supabaseClient && selectedCalendarIds.length > 0) {
      loadCalendarEvents();
    }
  }, [user, supabaseClient, currentDate, view, selectedCalendarIds]);

  // Load availability slots when date or view changes
  useEffect(() => {
    if (user && supabaseClient) {
      loadAvailabilitySlots();
    }
  }, [user, supabaseClient, currentDate, view]);

  // Load calendar data (connected calendars and selected calendars)
  const loadCalendarData = async () => {
    if (!user?.id || !supabaseClient) return;

    try {
      setIsLoading(true);
      setError(null);

      // Load calendar integrations for the current user only
      const { data: calendars, error: calendarsError } = await supabaseClient
        .from("calendar_integrations")
        .select("*")
        .eq("user_id", user.id); // <-- Filter by user

      if (calendarsError) throw calendarsError;
      setConnectedCalendars(calendars || []);

      // Load selected calendars for the current user only
      const { data: selected, error: selectedError } = await supabaseClient
        .from("selected_calendars")
        .select("calendar_id")
        .eq("user_id", user.id); // <-- Filter by user

      if (selectedError) throw selectedError;
      setSelectedCalendarIds(selected?.map((s) => s.calendar_id) || []);
    } catch (err) {
      console.error("Error loading calendar data:", err);
      setError("Failed to load calendar data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Load calendar events for the current date range
  const loadCalendarEvents = async () => {
    if (!user?.id || !supabaseClient) return;

    try {
      setIsLoading(true);
      setError(null);

      const { startDate, endDate } = getDateRange();

      console.log("Fetching calendar events for date range:", {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      });

      // First, get connected calendar integrations
      const { data: integrations, error: integrationsError } =
        await supabaseClient.from("calendar_integrations").select("*");

      if (integrationsError) throw integrationsError;

      if (!integrations || integrations.length === 0) {
        console.log("No calendar integrations found");
        setCalendarEvents([]);
        return;
      }

      console.log("Found calendar integrations:", integrations.length);

      // For Google Calendar, we fetch events directly from the API
      const googleIntegration = integrations.find(
        (int) => int.provider === "google"
      );

      if (googleIntegration && googleIntegration.access_token) {
        console.log("Found Google integration, fetching events");

        // Implement a simpler direct Google Calendar API call for now
        try {
          const response = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${startDate.toISOString()}&timeMax=${endDate.toISOString()}&singleEvents=true`,
            {
              headers: {
                Authorization: `Bearer ${googleIntegration.access_token}`,
              },
            }
          );

          if (!response.ok) {
            console.error("Google API response error:", response.status);
            throw new Error(`Google API error: ${response.status}`);
          }

          const data = await response.json();
          console.log("Google events fetched:", data.items?.length || 0);

          if (data.items && data.items.length > 0) {
            // Transform to our standard format
            const googleEvents = data.items.map((event) => ({
              id: event.id,
              title: event.summary || "Busy",
              description: event.description,
              start_time: event.start.dateTime || event.start.date,
              end_time: event.end.dateTime || event.end.date,
              all_day: !event.start.dateTime,
              location: event.location,
              calendar_id: "primary", // Default calendar
              provider: "google",
              color: "#4285F4", // Google blue
            }));

            setCalendarEvents(googleEvents);
            updateAvailabilityWithEvents(googleEvents);
            return;
          }
        } catch (googleErr) {
          console.error("Google Calendar API error:", googleErr);
          // Continue to fallback method
        }
      }

      // Fallback to database events
      console.log("Falling back to database events");
      const { data: events, error } = await supabaseClient
        .from("calendar_events")
        .select("*")
        .gte("start_time", startDate.toISOString())
        .lte("end_time", endDate.toISOString());

      if (error) throw error;

      console.log("Database events loaded:", events?.length || 0);
      setCalendarEvents(events || []);
      updateAvailabilityWithEvents(events || []);
    } catch (err) {
      console.error("Error loading calendar events:", err);
      setError("Failed to load calendar events. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Load availability slots
  const loadAvailabilitySlots = async () => {
    if (!user?.id || !supabaseClient) return;

    try {
      setIsLoading(true);
      setError(null);

      const { startDate, endDate } = getDateRange();

      const { data: slots, error } = await supabaseClient
        .from("availability_slots")
        .select("*")
        .gte("start_time", startDate.toISOString())
        .lte("end_time", endDate.toISOString());

      if (error) throw error;

      setAvailabilitySlots(slots || []);
    } catch (err) {
      console.error("Error loading availability slots:", err);
      setError("Failed to load availability slots. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Get date range for current view
  const getDateRange = () => {
    const startDate = new Date(currentDate);
    const endDate = new Date(currentDate);

    if (view === "day") {
      // Just the current day
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (view === "week") {
      // Current week (Sunday to Saturday)
      const day = startDate.getDay(); // 0 = Sunday, 6 = Saturday
      startDate.setDate(startDate.getDate() - day); // Go to start of week (Sunday)
      startDate.setHours(0, 0, 0, 0);

      endDate.setDate(startDate.getDate() + 6); // Go to end of week (Saturday)
      endDate.setHours(23, 59, 59, 999);
    } else if (view === "month") {
      // Current month
      startDate.setDate(1); // First of the month
      startDate.setHours(0, 0, 0, 0);

      endDate.setMonth(endDate.getMonth() + 1, 0); // Last of the month
      endDate.setHours(23, 59, 59, 999);
    }

    return { startDate, endDate };
  };

  // Update availability slots with calendar events
  const updateAvailabilityWithEvents = (events) => {
    // Merge existing availability slots with calendar events
    const updatedSlots = mergeAvailabilityWithEvents(availabilitySlots, events);
    setAvailabilitySlots(updatedSlots);
  };

  // Generate dates for the current view
  const getDatesForView = () => {
    const dates = [];
    const currentDay = currentDate.getDay();

    if (view === "day") {
      dates.push(new Date(currentDate));
    } else if (view === "week") {
      // Generate days for the week (Sunday to Saturday)
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDay);

      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        dates.push(date);
      }
    } else if (view === "month") {
      // Implementation for month view
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      // Include last days of previous month if needed
      const startPadding = firstDay.getDay();
      for (let i = startPadding - 1; i >= 0; i--) {
        const date = new Date(year, month, -i);
        dates.push(date);
      }

      // Current month days
      for (let day = 1; day <= lastDay.getDate(); day++) {
        dates.push(new Date(year, month, day));
      }

      // Ensure we have a total of 42 days (6 weeks) for consistent UI
      const remainingDays = 42 - dates.length;
      for (let i = 1; i <= remainingDays; i++) {
        dates.push(new Date(year, month + 1, i));
      }
    }

    return dates;
  };

  // Format date header based on view
  const getDateHeader = (date) => {
    if (view === "day" || view === "week") {
      return `${DAYS[date.getDay()].substring(0, 3)}, ${date.getDate()}`;
    }
    return date.getDate().toString();
  };

  // Handle navigation: previous, next, today
  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (view === "day") {
      newDate.setDate(newDate.getDate() - 1);
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else if (view === "month") {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === "day") {
      newDate.setDate(newDate.getDate() + 1);
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else if (view === "month") {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Check if a date is within working days
  const isWorkingDay = (date) => {
    return businessHours.workingDays.includes(date.getDay());
  };

  // Create a new availability slot
  const createAvailabilitySlot = async (date, hour) => {
    if (!user?.id || !supabaseClient) return;

    const startTime = new Date(date);
    startTime.setHours(hour, 0, 0, 0);

    const endTime = new Date(startTime);
    endTime.setHours(hour + 1, 0, 0, 0);

    try {
      const { data, error } = await supabaseClient
        .from("availability_slots")
        .insert({
          user_id: user.id,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          available: true,
        })
        .select();

      if (error) throw error;

      if (data) {
        setAvailabilitySlots([...availabilitySlots, ...data]);
      }
    } catch (err) {
      console.error("Error creating availability slot:", err);
      setError("Failed to create availability slot. Please try again.");
    }
  };

  // Toggle a slot's availability
  const toggleSlotAvailability = async (slotId) => {
    if (!user?.id || !supabaseClient) return;

    // Find the slot to toggle
    const slot = availabilitySlots.find((s) => s.id === slotId);
    if (!slot) return;

    try {
      const { error } = await supabaseClient
        .from("availability_slots")
        .update({ available: !slot.available })
        .eq("id", slotId);

      if (error) throw error;

      // Update local state
      setAvailabilitySlots(
        availabilitySlots.map((s) =>
          s.id === slotId ? { ...s, available: !s.available } : s
        )
      );
    } catch (err) {
      console.error("Error toggling availability:", err);
      setError("Failed to update availability. Please try again.");
    }
  };

  // Delete an availability slot
  const deleteAvailabilitySlot = async (slotId) => {
    if (!supabaseClient) return;

    try {
      const { error } = await supabaseClient
        .from("availability_slots")
        .delete()
        .eq("id", slotId);

      if (error) throw error;

      // Remove from local state
      setAvailabilitySlots(
        availabilitySlots.filter((slot) => slot.id !== slotId)
      );
    } catch (err) {
      console.error("Error deleting availability slot:", err);
      setError("Failed to delete availability slot.");
    }
  };

  // Check if there's a slot at the specified date and hour
  const getSlotAtTime = (date, hour) => {
    return availabilitySlots.find((slot) => {
      const slotStart = new Date(slot.start_time);
      return (
        slotStart.getDate() === date.getDate() &&
        slotStart.getMonth() === date.getMonth() &&
        slotStart.getFullYear() === date.getFullYear() &&
        slotStart.getHours() === hour
      );
    });
  };

  // Check if there's an event at the specified date and hour
  const getEventAtTime = (date, hour) => {
    return calendarEvents.find((event) => {
      const eventStart = new Date(event.start_time);
      const eventEnd = new Date(event.end_time);
      const timeToCheck = new Date(date);
      timeToCheck.setHours(hour, 0, 0, 0);

      return timeToCheck >= eventStart && timeToCheck < eventEnd;
    });
  };

  // Render the calendar based on the current view
  const renderCalendar = () => {
    const dates = getDatesForView();

    if (view === "month") {
      // Monthly view rendering
      return (
        <div className="grid grid-cols-7 gap-1">
          {DAYS.map((day) => (
            <div key={day} className="text-center font-medium py-2">
              {day.substring(0, 3)}
            </div>
          ))}

          {dates.map((date, index) => {
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <div
                key={index}
                className={`h-32 border p-1 ${
                  isCurrentMonth ? "bg-white" : "bg-gray-100"
                } ${isToday ? "border-primary border-2" : "border-gray-200"} ${
                  isWorkingDay(date) ? "" : "bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className={isToday ? "font-bold text-primary" : ""}>
                    {date.getDate()}
                  </span>
                  {isWorkingDay(date) && (
                    <button
                      className="text-gray-500 hover:text-primary"
                      onClick={() => {
                        setView("day");
                        setCurrentDate(new Date(date));
                      }}
                    >
                      <Plus size={16} />
                    </button>
                  )}
                </div>

                {/* Show availability indicators */}
                <div className="mt-1 space-y-1">
                  {availabilitySlots
                    .filter((slot) => {
                      const slotDate = new Date(slot.start_time);
                      return (
                        slotDate.getDate() === date.getDate() &&
                        slotDate.getMonth() === date.getMonth() &&
                        slotDate.getFullYear() === date.getFullYear()
                      );
                    })
                    .map((slot) => (
                      <AvailabilitySlot
                        key={slot.id}
                        slot={slot}
                        onToggle={() => toggleSlotAvailability(slot.id)}
                        onDelete={() => deleteAvailabilitySlot(slot.id)}
                        compact={true}
                      />
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      );
    } else {
      // Day/Week view rendering
      return (
        <div className="flex flex-col">
          {/* Header row with dates */}
          <div className="flex border-b">
            <div className="w-16 p-2"></div> {/* Empty corner cell */}
            {dates.map((date, index) => (
              <div
                key={index}
                className={`flex-1 text-center p-2 font-medium ${
                  date.toDateString() === new Date().toDateString()
                    ? "text-primary"
                    : ""
                } ${isWorkingDay(date) ? "" : "text-gray-400"}`}
              >
                {getDateHeader(date)}
              </div>
            ))}
          </div>

          {/* Time slots grid */}
          <div className="flex-1 overflow-y-auto max-h-[calc(100vh-250px)]">
            {displayHours.map((hour) => (
              <div key={hour} className="flex border-b">
                <div className="w-16 p-2 text-right text-sm text-gray-500">
                  {hour % 12 === 0 ? "12" : hour % 12}:00{" "}
                  {hour >= 12 ? "PM" : "AM"}
                </div>

                {dates.map((date, index) => {
                  const slot = getSlotAtTime(date, hour);
                  const event = getEventAtTime(date, hour);

                  // If there's an event but no slot, create a virtual unavailable slot
                  const displaySlot =
                    slot ||
                    (event
                      ? {
                          id: `event-${event.id}`,
                          start_time: event.start_time,
                          end_time: event.end_time,
                          available: false,
                          title: event.title,
                          isEvent: true,
                        }
                      : null);

                  return (
                    <div
                      key={index}
                      className={`flex-1 border-l p-1 min-h-16 ${
                        isWorkingDay(date) ? "bg-white" : "bg-gray-50"
                      }`}
                      onClick={() => {
                        if (!displaySlot && isWorkingDay(date)) {
                          createAvailabilitySlot(date, hour);
                        }
                      }}
                    >
                      {displaySlot ? (
                        <AvailabilitySlot
                          slot={displaySlot}
                          onToggle={
                            displaySlot.isEvent
                              ? null
                              : () => toggleSlotAvailability(displaySlot.id)
                          }
                          onDelete={
                            displaySlot.isEvent
                              ? null
                              : () => deleteAvailabilitySlot(displaySlot.id)
                          }
                        />
                      ) : isWorkingDay(date) ? (
                        <div className="h-full w-full flex items-center justify-center text-gray-300 cursor-pointer hover:bg-gray-50">
                          <Plus size={20} />
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 rounded-md ${view === "day" ? "bg-primary text-white" : "bg-gray-100"}`}
            onClick={() => setView("day")}
          >
            Day
          </button>
          <button
            className={`px-3 py-1 rounded-md ${view === "week" ? "bg-primary text-white" : "bg-gray-100"}`}
            onClick={() => setView("week")}
          >
            Week
          </button>
          <button
            className={`px-3 py-1 rounded-md ${view === "month" ? "bg-primary text-white" : "bg-gray-100"}`}
            onClick={() => setView("month")}
          >
            Month
          </button>
        </div>

        <div>
          <h2 className="text-xl font-semibold">
            {view === "month"
              ? `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
              : view === "week"
                ? `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                : `${DAYS[currentDate.getDay()]}, ${MONTHS[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`}
          </h2>
        </div>

        <div className="flex space-x-2">
          <button
            className="p-2 rounded-md bg-gray-100"
            onClick={handlePrevious}
          >
            <ChevronLeft size={16} />
          </button>
          <button className="p-2 rounded-md bg-gray-100" onClick={handleToday}>
            Today
          </button>
          <button className="p-2 rounded-md bg-gray-100" onClick={handleNext}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md text-sm flex">
          <AlertTriangle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading ? (
        <div className="text-center py-12">
          <Loader size={24} className="animate-spin mx-auto mb-2" />
          <p>Loading calendar data...</p>
        </div>
      ) : (
        <>
          {/* Calendar grid */}
          <div className="border rounded-md bg-white overflow-hidden">
            {renderCalendar()}
          </div>

          {/* Connected calendars section */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Connected Calendars</h3>
            {connectedCalendars.length > 0 ? (
              <div className="space-y-2">
                {connectedCalendars.map((calendar) => (
                  <div
                    key={calendar.id}
                    className="flex items-center justify-between p-3 border rounded-md hover:border-primary hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
                      <div>
                        <span className="font-medium capitalize">
                          {calendar.provider}
                        </span>
                        <div className="text-xs text-gray-500">
                          {calendar.access_token
                            ? "Active connection"
                            : "Connection needs renewal"}
                          {calendar.provider === "google" && (
                            <span className="ml-2 text-green-600 font-semibold">
                              (Google Calendar)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Connected on{" "}
                      {new Date(calendar.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                <div className="mt-2 text-center">
                  <button
                    className="text-primary hover:underline text-sm"
                    onClick={onAddCalendar}
                  >
                    + Add another calendar
                  </button>
                </div>
              </div>
            ) : (
              <div className="border rounded-md p-4 text-center">
                <p className="text-gray-500 mb-4">No calendars connected</p>
                <button
                  className="bg-primary text-white px-4 py-2 rounded-md"
                  onClick={onAddCalendar}
                >
                  Connect Calendar
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CalendarView;
