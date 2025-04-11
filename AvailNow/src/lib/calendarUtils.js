/**
 * Utility functions for calendar operations
 */

// Format a date to YYYY-MM-DD format
export const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Format time from 24h to 12h format
export const formatTime12h = (time) => {
  const [hourStr, minuteStr] = time.split(":");
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;

  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
};

// Format time from 12h to 24h format
export const formatTime24h = (time12h) => {
  const [timePart, period] = time12h.split(" ");
  let [hours, minutes] = timePart.split(":").map(Number);

  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

// Get days in month
export const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

// Get formatted day name
export const getDayName = (date, format = "short") => {
  const days = {
    short: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    long: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
  };

  return days[format][date.getDay()];
};

// Get formatted month name
export const getMonthName = (month, format = "long") => {
  const months = {
    short: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    long: [
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
    ],
  };

  return months[format][month];
};

// Check if two time ranges overlap
export const doTimesOverlap = (start1, end1, start2, end2) => {
  return start1 < end2 && start2 < end1;
};

// Create time slots for a day with specified interval (in minutes)
export const createTimeSlots = (startTime, endTime, intervalMinutes = 30) => {
  const slots = [];

  // Convert times to Date objects for easier manipulation
  const start = new Date(`2000-01-01T${startTime}:00`);
  const end = new Date(`2000-01-01T${endTime}:00`);

  // Create a temporary date for the current slot
  let currentSlot = new Date(start);

  // Generate slots
  while (currentSlot < end) {
    const slotStart = new Date(currentSlot);

    // Add interval to get the end time
    currentSlot.setMinutes(currentSlot.getMinutes() + intervalMinutes);

    // Ensure we don't exceed the end time
    const slotEnd = currentSlot <= end ? new Date(currentSlot) : new Date(end);

    // Format the times
    const formattedStart = `${String(slotStart.getHours()).padStart(2, "0")}:${String(slotStart.getMinutes()).padStart(2, "0")}`;
    const formattedEnd = `${String(slotEnd.getHours()).padStart(2, "0")}:${String(slotEnd.getMinutes()).padStart(2, "0")}`;

    slots.push({
      start: formattedStart,
      end: formattedEnd,
      label: `${formatTime12h(formattedStart)} - ${formatTime12h(formattedEnd)}`,
    });
  }

  return slots;
};

// Check if a date is today
export const isToday = (date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

// Check if a date is in the past
export const isPastDate = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

// Get the first day of the week (Sunday) for a given date
export const getFirstDayOfWeek = (date) => {
  const newDate = new Date(date);
  const day = newDate.getDay();
  newDate.setDate(newDate.getDate() - day);
  return newDate;
};

// Get an array of dates for a week starting from a given date
export const getDatesForWeek = (startDate) => {
  const dates = [];
  const currentDate = new Date(startDate);

  for (let i = 0; i < 7; i++) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

// Get an array of dates for a month
export const getDatesForMonth = (year, month) => {
  const dates = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Get days from previous month to fill the first week
  const firstDayOfWeek = firstDay.getDay();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    dates.push(date);
  }

  // Get all days of the current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i);
    dates.push(date);
  }

  // Add days from next month to complete the grid (6 weeks)
  const remainingDays = 42 - dates.length;
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i);
    dates.push(date);
  }

  return dates;
};

// Merge availability slots with existing events
export const mergeAvailabilityWithEvents = (availabilitySlots, events) => {
  // Clone the availability slots to avoid modifying the original
  const mergedSlots = [...availabilitySlots];

  // Mark slots as unavailable if they overlap with events
  for (const event of events) {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);

    for (const slot of mergedSlots) {
      const slotStart = new Date(slot.startTime);
      const slotEnd = new Date(slot.endTime);

      if (doTimesOverlap(slotStart, slotEnd, eventStart, eventEnd)) {
        slot.available = false;
      }
    }
  }

  return mergedSlots;
};

// Parse calendar data from different providers
export const parseCalendarData = (calendarData, provider) => {
  switch (provider) {
    case "google":
      return calendarData.items.map((event) => ({
        id: event.id,
        title: event.summary,
        start: new Date(event.start.dateTime || event.start.date),
        end: new Date(event.end.dateTime || event.end.date),
        allDay: !event.start.dateTime,
        description: event.description,
        location: event.location,
      }));

    case "outlook":
      return calendarData.value.map((event) => ({
        id: event.id,
        title: event.subject,
        start: new Date(event.start.dateTime),
        end: new Date(event.end.dateTime),
        allDay: event.isAllDay,
        description: event.bodyPreview,
        location: event.location.displayName,
      }));

    case "apple":
      // Simplified example - actual implementation would depend on the API
      return calendarData.events.map((event) => ({
        id: event.id,
        title: event.title,
        start: new Date(event.startDate),
        end: new Date(event.endDate),
        allDay: event.allDay,
        description: event.notes,
        location: event.location,
      }));

    default:
      return [];
  }
};
