// src/components/calendar/CalendarView.jsx
import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Loader, AlertTriangle } from "lucide-react";
import { fetchCalendarEvents } from "../../lib/calendarService";

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

const CalendarView = ({ onAddCalendar, user, connectedCalendars = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("week");
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [businessHours] = useState({
    startTime: "09:00",
    endTime: "17:00",
    workingDays: [1, 2, 3, 4, 5],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentMonthLabel, setCurrentMonthLabel] = useState("");

  // Hours to display in the calendar
  const displayHours = Array.from({ length: 12 }, (_, i) => i + 8); // 8am to 7pm

  // Get date range for current view
  const getDateRange = useCallback(() => {
    const startDate = new Date(currentDate);
    const endDate = new Date(currentDate);

    if (view === "day") {
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (view === "week") {
      const day = startDate.getDay();
      startDate.setDate(startDate.getDate() - day);
      startDate.setHours(0, 0, 0, 0);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (view === "month") {
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setMonth(endDate.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    }

    return { startDate, endDate };
  }, [currentDate, view]);

  // Update month label
  const updateMonthLabel = useCallback(() => {
    setCurrentMonthLabel(
      `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
    );
  }, [currentDate]);

  // Load calendar events for the current date range
  const loadCalendarEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      let events = [];

      // Get date range first
      const { startDate, endDate } = getDateRange();

      if (connectedCalendars && connectedCalendars.length > 0) {
        try {
          console.log("Fetching calendar events for connected calendars");

          // Get connected calendars with actual IDs
          const calendarsToFetch = connectedCalendars.map((integration) => ({
            id: integration.calendar_id || integration.id,
            provider: integration.provider,
          }));

          const eventsPromises = calendarsToFetch.map(async (calendar) => {
            try {
              return await fetchCalendarEvents(
                user.id,
                calendar.provider || "google",
                "primary",
                startDate,
                endDate
              );
            } catch (err) {
              console.error(
                `Failed to fetch events for calendar ${calendar.id}:`,
                err
              );
              return [];
            }
          });

          const eventArrays = await Promise.all(eventsPromises);
          events = eventArrays.flat();
          console.log("Fetched real calendar events:", events.length);
        } catch (err) {
          console.error("Error fetching calendar events:", err);
          events = generateMockEvents(startDate, endDate);
        }
      } else {
        events = generateMockEvents(startDate, endDate);
      }

      setCalendarEvents(events);
      console.log("Calendar events loaded:", events.length);
    } catch (err) {
      console.error("Error loading calendar events:", err);
      setError("Failed to load calendar events. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [connectedCalendars, user, getDateRange]);

  // Update month label whenever the current date changes
  useEffect(() => {
    updateMonthLabel();
  }, [currentDate, updateMonthLabel]);

  // Load calendar events when date, view, or connected calendars change
  useEffect(() => {
    if (connectedCalendars.length > 0) {
      console.log(
        "Loading calendar events with connected calendars:",
        connectedCalendars.length
      );
      loadCalendarEvents();
    }
  }, [currentDate, view, connectedCalendars, loadCalendarEvents]);

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
    if (view === "day") {
      return `${DAYS[date.getDay()]}, ${date.getDate()}`;
    } else if (view === "week") {
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
  // eslint-disable-next-line no-unused-vars
  const isWorkingDay = useCallback(
    (date) => {
      return businessHours.workingDays.includes(date.getDay());
    },
    [businessHours.workingDays]
  );

  // Check if there are events at a specific time
  const getEventsAtTime = (date, hour) => {
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

  // Render table style calendar for week view
  const renderTableCalendar = () => {
    const dates = getDatesForView();

    return (
      <table className="border-collapse w-full">
        <thead>
          <tr>
            <th className="border p-2 w-20"></th>
            {dates.map((date, index) => (
              <th
                key={index}
                className={`border p-2 text-center ${
                  date.toDateString() === new Date().toDateString()
                    ? "font-bold text-primary"
                    : ""
                }`}
              >
                {date.getDay() === 0 || date.getDay() === 6 ? (
                  <span className="text-gray-400">{getDateHeader(date)}</span>
                ) : (
                  getDateHeader(date)
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayHours.map((hour) => (
            <tr key={hour} className="border-b">
              <td className="border p-2 text-right text-sm text-gray-500">
                {hour === 12
                  ? "12:00"
                  : hour > 12
                    ? `${hour - 12}:00`
                    : `${hour}:00`}
                <div className="text-xs">{hour >= 12 ? "PM" : "AM"}</div>
              </td>

              {dates.map((date, index) => {
                const events = getEventsAtTime(date, hour);
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                // Determine cell content
                let cellContent;
                if (events.length > 0) {
                  cellContent = (
                    <div className="text-xs p-1 bg-blue-100 text-blue-800 rounded">
                      {events[0].title}
                      {events.length > 1 && <div>{events.length - 1} more</div>}
                    </div>
                  );
                } else if (isWeekend) {
                  cellContent = (
                    <div className="text-gray-300 text-sm">Off-hours</div>
                  );
                } else {
                  cellContent = (
                    <div className="text-gray-400 text-sm">Available</div>
                  );
                }

                return (
                  <td
                    key={index}
                    className={`border p-2 ${isWeekend ? "bg-gray-50" : ""}`}
                  >
                    {cellContent}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 rounded-md ${view === "day" ? "bg-rose-400 text-white" : "bg-rose-300 text-gray-700"}`}
            onClick={() => setView("day")}
          >
            Day
          </button>
          <button
            className={`px-3 py-1 rounded-md ${view === "week" ? "bg-rose-400 text-white" : "bg-rose-300 text-gray-700"}`}
            onClick={() => setView("week")}
          >
            Week
          </button>
          <button
            className={`px-3 py-1 rounded-md ${view === "month" ? "bg-rose-400 text-white" : "bg-rose-300 text-gray-700"}`}
            onClick={() => setView("month")}
          >
            Month
          </button>
        </div>

        <div>
          <h2 className="text-xl font-semibold">{currentMonthLabel}</h2>
        </div>

        <div className="flex space-x-2">
          <button
            className="p-2 rounded-md bg-rose-300 text-gray-700"
            onClick={handlePrevious}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            className="px-3 py-1 rounded-md bg-rose-300 text-gray-700"
            onClick={handleToday}
          >
            Today
          </button>
          <button
            className="p-2 rounded-md bg-rose-300 text-gray-700"
            onClick={handleNext}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Notice about read-only calendar */}
      <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-md text-sm">
        This calendar displays events from your connected calendars. To add or
        modify events, use your primary calendar application.
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
            {renderTableCalendar()}
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
                          Active connection
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
