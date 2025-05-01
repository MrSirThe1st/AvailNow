import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader,
  AlertTriangle,
  Clock,
  Calendar as CalendarIcon,
} from "lucide-react";
import { fetchCalendarEvents } from "../../lib/calendarService";
import { formatDate } from "../../lib/calendarUtils";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

const CalendarView = ({
  onAddCalendar,
  user,
  connectedCalendars = [],
  calendarsList = [],
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [businessHours] = useState({
    startTime: "09:00",
    endTime: "17:00",
    workingDays: [1, 2, 3, 4, 5],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentMonthDates, setCurrentMonthDates] = useState([]);

  // Get date range for current view (month)
  const getDateRange = useCallback(() => {
    const startDate = new Date(currentDate);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(currentDate);
    endDate.setMonth(endDate.getMonth() + 1, 0);
    endDate.setHours(23, 59, 59, 999);

    return { startDate, endDate };
  }, [currentDate]);

  // Get dates for calendar grid (includes days from prev/next months to fill the grid)
  const getDatesForCalendarView = useCallback(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get the first day of the month
    const firstDay = new Date(year, month, 1);
    // Get the last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Calculate the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();

    // Create array of dates
    const dates = [];

    // Add days from previous month
    for (let i = 0; i < firstDayOfWeek; i++) {
      const date = new Date(year, month, 1 - (firstDayOfWeek - i));
      dates.push({
        date,
        inCurrentMonth: false,
      });
    }

    // Add days from current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      dates.push({
        date: new Date(year, month, i),
        inCurrentMonth: true,
      });
    }

    // Add days from next month to complete a 6-week grid
    const daysToAdd = 42 - dates.length;
    for (let i = 1; i <= daysToAdd; i++) {
      dates.push({
        date: new Date(year, month + 1, i),
        inCurrentMonth: false,
      });
    }

    return dates;
  }, [currentDate]);

  // Load calendar events for the current month
  const loadCalendarEvents = useCallback(async () => {
    if (!user?.id || !connectedCalendars.length) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get date range
      const { startDate, endDate } = getDateRange();

      // Create array to hold all events
      let allEvents = [];

      console.log("Fetching calendar events for connected calendars");

      // Get connected calendars with actual IDs
      const calendarsToFetch = connectedCalendars.map((integration) => ({
        id: integration.calendar_id || integration.id,
        provider: integration.provider,
      }));

      // Fetch events for each calendar
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
      allEvents = eventArrays.flat();
      console.log("Fetched real calendar events:", allEvents.length);

      // Sort events by start time
      allEvents.sort((a, b) => {
        const dateA = new Date(a.start_time);
        const dateB = new Date(b.start_time);
        return dateA - dateB;
      });

      setCalendarEvents(allEvents);
    } catch (err) {
      console.error("Error loading calendar events:", err);
      setError("Failed to load calendar events. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [connectedCalendars, user, getDateRange]);

  // Update the calendar grid when the month changes
  useEffect(() => {
    const dates = getDatesForCalendarView();
    setCurrentMonthDates(dates);
  }, [currentDate, getDatesForCalendarView]);

  // Load calendar events when date or connected calendars change
  useEffect(() => {
    if (connectedCalendars.length > 0) {
      loadCalendarEvents();
    }
  }, [currentDate, connectedCalendars, loadCalendarEvents]);

  // Update events for selected date when date is selected or events change
  useEffect(() => {
    if (!selectedDate || !calendarEvents?.length) {
      setSelectedDateEvents([]);
      return;
    }

    // Get events for selected date
    const selectedDateStr = formatDate(selectedDate);
    const eventsOnDate = calendarEvents.filter((event) => {
      const eventStart = new Date(event.start_time);
      const eventDate = formatDate(eventStart);
      return eventDate === selectedDateStr;
    });

    // Sort by start time
    eventsOnDate.sort((a, b) => {
      return new Date(a.start_time) - new Date(b.start_time);
    });

    setSelectedDateEvents(eventsOnDate);
  }, [selectedDate, calendarEvents]);

  // Update upcoming events when calendar events change
  useEffect(() => {
    if (!calendarEvents?.length) {
      setUpcomingEvents([]);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get events from today onwards
    const futureEvents = calendarEvents.filter((event) => {
      const eventStart = new Date(event.start_time);
      return eventStart >= today;
    });

    // Sort by date and limit to 5 events
    const sortedEvents = futureEvents
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
      .slice(0, 5);

    setUpcomingEvents(sortedEvents);
  }, [calendarEvents]);

  // Count events for a specific date
  const countEventsOnDate = (date) => {
    if (!calendarEvents?.length) return 0;

    const dateStr = formatDate(date);

    return calendarEvents.filter((event) => {
      const eventStart = new Date(event.start_time);
      const eventDate = formatDate(eventStart);
      return eventDate === dateStr;
    }).length;
  };

  // Handle previous month navigation
  const handlePreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  // Handle next month navigation
  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  // Handle today button
  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Handle date selection
  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  // Format time for display (e.g., "9:00 AM")
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${formattedHours}:${formattedMinutes} ${ampm}`;
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

  // Format date for event display
  const formatDisplayDate = (date) => {
    return `${DAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}`;
  };

  // Get color for event count badge
  const getEventCountColor = (count) => {
    if (count === 0) return "";
    if (count < 3) return "bg-blue-100 text-blue-600";
    if (count < 5) return "bg-green-100 text-green-600";
    return "bg-purple-100 text-purple-600";
  };

  // Generate an icon for an event (using the provider or type)
  const getEventIcon = (event) => {
    // You can customize this based on event type or provider
    return (
      <div className="rounded-full bg-blue-100 w-8 h-8 flex items-center justify-center">
        <CalendarIcon size={16} className="text-blue-600" />
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Calendar Section */}
      <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
          </div>

          <div className="flex space-x-2">
            <button
              className="p-2 rounded-md bg-rose-300 text-gray-700"
              onClick={handlePreviousMonth}
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
              onClick={handleNextMonth}
            >
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

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS_SHORT.map((day) => (
            <div
              key={day}
              className="text-center font-medium text-sm text-gray-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="text-center py-20">
            <Loader size={24} className="animate-spin mx-auto mb-2" />
            <p>Loading calendar data...</p>
          </div>
        ) : (
          /* Calendar grid */
          <div className="grid grid-cols-7 gap-1">
            {currentMonthDates.map((dateObj, index) => {
              const eventCount = countEventsOnDate(dateObj.date);
              const isCurrentDay = isToday(dateObj.date);
              const isSelected =
                selectedDate &&
                selectedDate.getDate() === dateObj.date.getDate() &&
                selectedDate.getMonth() === dateObj.date.getMonth() &&
                selectedDate.getFullYear() === dateObj.date.getFullYear();

              return (
                <div
                  key={index}
                  onClick={() => handleDateClick(dateObj.date)}
                  className={`
                    h-24 border rounded-md p-1 relative cursor-pointer transition-colors
                    ${dateObj.inCurrentMonth ? "bg-white" : "bg-gray-50"}
                    ${isSelected ? "border-rose-400 border-2" : "border-gray-200 hover:border-gray-300"}
                  `}
                >
                  <div className="flex justify-between items-start">
                    <span
                      className={`
                        text-sm font-medium inline-block w-6 h-6 rounded-full text-center leading-6
                        ${isCurrentDay ? "bg-rose-400 text-white" : dateObj.inCurrentMonth ? "text-gray-700" : "text-gray-400"}
                      `}
                    >
                      {dateObj.date.getDate()}
                    </span>

                    {eventCount > 0 && (
                      <span
                        className={`text-xs ${getEventCountColor(eventCount)} px-1.5 py-0.5 rounded-full font-medium`}
                      >
                        {eventCount}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

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
      </div>

      {/* Events Panel */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">
            {selectedDate && formatDisplayDate(selectedDate)}
          </h2>
        </div>

        {/* Selected Date Events */}
        <div className="space-y-3 mb-6">
          <h3 className="font-medium text-gray-600 border-b pb-2">
            Events for this day
          </h3>

          {selectedDateEvents.length > 0 ? (
            selectedDateEvents.map((event, index) => (
              <div
                key={index}
                className="border rounded-lg p-3 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start gap-3">
                  {getEventIcon(event)}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">
                      {event.title || "Untitled Event"}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Clock size={14} className="mr-1" />
                      <span>
                        {formatTime(event.start_time)} -{" "}
                        {formatTime(event.end_time)}
                      </span>
                    </div>
                    {event.location && (
                      <p className="text-sm text-gray-500 mt-1">
                        {event.location}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-6">
              <CalendarIcon size={24} className="mx-auto mb-2 opacity-40" />
              <p>No events scheduled for this day</p>
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div>
          <h3 className="font-medium text-gray-600 border-b pb-2 mb-3">
            Upcoming Events
          </h3>
          <div className="space-y-3">
            {upcomingEvents.length > 0 ? (
              upcomingEvents
                .map((event, index) => {
                  const eventDate = new Date(event.start_time);

                  // Skip event if it's on the selected date (to avoid duplication)
                  if (
                    selectedDate &&
                    eventDate.getDate() === selectedDate.getDate() &&
                    eventDate.getMonth() === selectedDate.getMonth() &&
                    eventDate.getFullYear() === selectedDate.getFullYear()
                  ) {
                    return null;
                  }

                  return (
                    <div
                      key={index}
                      className="border rounded-lg p-3 hover:shadow-sm transition-shadow"
                    >
                      <div className="text-xs text-gray-500 mb-1">
                        {formatDisplayDate(eventDate)}
                      </div>
                      <div className="flex items-start gap-2">
                        {getEventIcon(event)}
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800">
                            {event.title || "Untitled Event"}
                          </h3>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Clock size={14} className="mr-1" />
                            <span>
                              {formatTime(event.start_time)} -{" "}
                              {formatTime(event.end_time)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
                .filter(Boolean) // Remove null entries
            ) : (
              <div className="text-center text-gray-500 py-6">
                <CalendarIcon size={24} className="mx-auto mb-2 opacity-40" />
                <p>No upcoming events</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
