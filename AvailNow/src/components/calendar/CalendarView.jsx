import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import AvailabilitySlot from "./AvailabilitySlot";

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

const CalendarView = ({ connectedCalendars = [], onAddCalendar }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("week"); // 'day', 'week', 'month'
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [businessHours, setBusinessHours] = useState({
    startTime: "09:00",
    endTime: "17:00",
    workingDays: [1, 2, 3, 4, 5], // Monday to Friday
  });

  // Hours to display in the calendar
  const displayHours = Array.from({ length: 12 }, (_, i) => i + 8); // 8am to 7pm

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

  // Mock function to create a new availability slot
  const createAvailabilitySlot = (date, hour) => {
    const startTime = new Date(date);
    startTime.setHours(hour, 0, 0, 0);

    const endTime = new Date(startTime);
    endTime.setHours(hour + 1, 0, 0, 0);

    const newSlot = {
      id: Date.now().toString(),
      startTime,
      endTime,
      available: true,
    };

    setAvailabilitySlots([...availabilitySlots, newSlot]);
  };

  // Check if there's a slot at the specified date and hour
  const getSlotAtTime = (date, hour) => {
    return availabilitySlots.find((slot) => {
      const slotDate = new Date(slot.startTime);
      return (
        slotDate.getDate() === date.getDate() &&
        slotDate.getMonth() === date.getMonth() &&
        slotDate.getFullYear() === date.getFullYear() &&
        slotDate.getHours() === hour
      );
    });
  };

  // Toggle a slot's availability
  const toggleSlotAvailability = (slotId) => {
    setAvailabilitySlots(
      availabilitySlots.map((slot) => {
        if (slot.id === slotId) {
          return { ...slot, available: !slot.available };
        }
        return slot;
      })
    );
  };

  // Mock data for demonstration - replace with actual API calls
  useEffect(() => {
    // Simulate fetching availability slots from an API
    const mockSlots = [
      {
        id: "1",
        startTime: new Date(new Date().setHours(10, 0, 0, 0)),
        endTime: new Date(new Date().setHours(11, 0, 0, 0)),
        available: true,
      },
      {
        id: "2",
        startTime: new Date(new Date().setHours(14, 0, 0, 0)),
        endTime: new Date(new Date().setHours(15, 0, 0, 0)),
        available: false,
      },
    ];

    setAvailabilitySlots(mockSlots);
  }, []);

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
                        setCurrentDate(date);
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
                      const slotDate = new Date(slot.startTime);
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

                  return (
                    <div
                      key={index}
                      className={`flex-1 border-l p-1 min-h-16 ${
                        isWorkingDay(date) ? "bg-white" : "bg-gray-50"
                      }`}
                      onClick={() => {
                        if (!slot && isWorkingDay(date)) {
                          createAvailabilitySlot(date, hour);
                        }
                      }}
                    >
                      {slot ? (
                        <AvailabilitySlot
                          slot={slot}
                          onToggle={() => toggleSlotAvailability(slot.id)}
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
                className="flex items-center justify-between p-3 border rounded-md"
              >
                <div className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full bg-${calendar.color} mr-3`}
                  ></div>
                  <span>{calendar.name}</span>
                </div>
                <div className="text-sm text-gray-500">{calendar.email}</div>
              </div>
            ))}
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
  );
};

export default CalendarView;
