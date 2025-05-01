import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar as CalendarIcon,
} from "lucide-react";
import { formatDate, getDayName, getMonthName } from "../../lib/calendarUtils";
import AvailabilitySlot from "../calendar/AvailabilitySlot";
import { useAuth } from "../../context/SupabaseAuthContext";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const CalendarView = ({
  onAddCalendar,
  connectedCalendars = [],
  calendarEvents = [],
  loading = false,
  error = null,
}) => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonthDates, setCurrentMonthDates] = useState([]);
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  // Get dates for the current month view
  const getDatesForMonthView = useCallback(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get the first day of the month
    const firstDay = new Date(year, month, 1);
    // Get the last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Calculate the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    let firstDayOfWeek = firstDay.getDay() - 1; // Adjust for Monday as first day
    if (firstDayOfWeek < 0) firstDayOfWeek = 6; // Sunday becomes 6

    // Calculate days from previous month to show
    const daysFromPrevMonth = firstDayOfWeek;

    // Calculate total days needed (previous month + current month + next month)
    const totalDays = 42; // 6 weeks * 7 days

    // Create array of dates
    const dates = [];

    // Add days from previous month
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();

    for (
      let i = prevMonthDays - daysFromPrevMonth + 1;
      i <= prevMonthDays;
      i++
    ) {
      dates.push({
        date: new Date(year, month - 1, i),
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

    // Add days from next month
    const remainingDays = totalDays - dates.length;
    for (let i = 1; i <= remainingDays; i++) {
      dates.push({
        date: new Date(year, month + 1, i),
        inCurrentMonth: false,
      });
    }

    return dates;
  }, [currentDate]);

  // Update the calendar grid when the month changes
  useEffect(() => {
    const dates = getDatesForMonthView();
    setCurrentMonthDates(dates);
  }, [currentDate, getDatesForMonthView]);

  // Get events for the selected date
  useEffect(() => {
    if (!selectedDate || !calendarEvents?.length) {
      setSelectedDateEvents([]);
      return;
    }

    // Format selectedDate to be just the date part (no time)
    const selectedDateStr = formatDate(selectedDate);

    // Filter events that occur on the selected date
    const eventsOnSelectedDate = calendarEvents.filter((event) => {
      const eventStartDate = formatDate(
        new Date(event.start_time || event.startTime)
      );
      return eventStartDate === selectedDateStr;
    });

    // Sort by start time
    const sortedEvents = [...eventsOnSelectedDate].sort((a, b) => {
      const dateA = new Date(a.start_time || a.startTime);
      const dateB = new Date(b.start_time || b.startTime);
      return dateA - dateB;
    });

    setSelectedDateEvents(sortedEvents);
  }, [selectedDate, calendarEvents]);

  // Get upcoming events starting from today
  useEffect(() => {
    if (!calendarEvents?.length) {
      setUpcomingEvents([]);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter upcoming events (today and future)
    const futureEvents = calendarEvents.filter((event) => {
      const eventDate = new Date(event.start_time || event.startTime);
      return eventDate >= today;
    });

    // Sort by date and take first 5
    const sortedUpcomingEvents = [...futureEvents]
      .sort((a, b) => {
        const dateA = new Date(a.start_time || a.startTime);
        const dateB = new Date(b.start_time || b.startTime);
        return dateA - dateB;
      })
      .slice(0, 5);

    setUpcomingEvents(sortedUpcomingEvents);
  }, [calendarEvents]);

  // Count events for a specific date
  const countEventsOnDate = (date) => {
    if (!calendarEvents?.length) return 0;

    const dateStr = formatDate(date);

    return calendarEvents.filter((event) => {
      const eventStartDate = formatDate(
        new Date(event.start_time || event.startTime)
      );
      return eventStartDate === dateStr;
    }).length;
  };

  // Format event time
  const formatEventTime = (dateString) => {
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

  // Handle date selection
  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  // Get color for event count badge
  const getEventCountColor = (count) => {
    if (count === 0) return "bg-gray-200 text-gray-500";
    if (count < 3) return "bg-blue-100 text-blue-600";
    if (count < 5) return "bg-green-100 text-green-600";
    return "bg-purple-100 text-purple-600";
  };

  // Generate a placeholder icon for events without one
  const getEventIcon = (event) => {
    // If the event has a specific icon or category, you could use it here
    // For now we'll use a default calendar icon
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
              {getMonthName(currentDate.getMonth(), "long")}{" "}
              {currentDate.getFullYear()}
            </h2>
          </div>

          <div className="flex space-x-2">
            <button
              className="p-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
              onClick={handlePreviousMonth}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </button>
            <button
              className="p-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
              onClick={handleNextMonth}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md text-sm">
            <p>{error}</p>
          </div>
        )}

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map((day) => (
            <div
              key={day}
              className="text-center font-medium text-sm text-gray-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full w-12 h-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading calendar...</p>
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
                    ${isSelected ? "border-primary border-2" : "border-gray-200 hover:border-gray-300"}
                  `}
                >
                  <div className="flex justify-between items-start">
                    <span
                      className={`
                        text-sm font-medium inline-block w-6 h-6 rounded-full text-center leading-6
                        ${isCurrentDay ? "bg-primary text-white" : dateObj.inCurrentMonth ? "text-gray-700" : "text-gray-400"}
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
            {selectedDate ? (
              <span>
                {`${getDayName(selectedDate, "long")}, ${selectedDate.getDate()} ${getMonthName(selectedDate.getMonth(), "long")}`}
              </span>
            ) : (
              "Upcoming Events"
            )}
          </h2>
        </div>

        {/* Selected Date Events */}
        {selectedDate && (
          <div className="space-y-3 mb-6">
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
                          {formatEventTime(event.start_time || event.startTime)}{" "}
                          - {formatEventTime(event.end_time || event.endTime)}
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
              <div className="text-center text-gray-500 py-8">
                <CalendarIcon size={24} className="mx-auto mb-2 opacity-40" />
                <p>No events scheduled for this day</p>
              </div>
            )}
          </div>
        )}

        {/* Upcoming Events Section */}
        <div>
          <h3 className="text-lg font-semibold border-b pb-2 mb-3">
            {selectedDate ? "Other Upcoming Events" : "Upcoming Events"}
          </h3>
          <div className="space-y-3">
            {upcomingEvents.length > 0 ? (
              upcomingEvents
                .map((event, index) => {
                  const eventDate = new Date(
                    event.start_time || event.startTime
                  );
                  // Don't show events from selected date in the upcoming section
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
                        {formatDate(eventDate)} (
                        {getDayName(eventDate, "short")})
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
                              {formatEventTime(
                                event.start_time || event.startTime
                              )}{" "}
                              -{" "}
                              {formatEventTime(event.end_time || event.endTime)}
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
