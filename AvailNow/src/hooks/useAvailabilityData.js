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
  const [lastFetchKey, setLastFetchKey] = useState("");

  // Fetch data once when dependencies change
  useEffect(() => {
    const fetchAvailabilityData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const startDate = new Date(year, month, 1);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(year, month + 1, 0);
      endDate.setHours(23, 59, 59, 999);

      const fetchKey = `${userId}-${startDate.toISOString()}-${endDate.toISOString()}`;

      if (fetchKey === lastFetchKey) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get active calendar setting
        const { data: calendarSettings } = await supabase
          .from("calendar_settings")
          .select("active_calendar")
          .eq("user_id", userId)
          .single();

        const activeCalendarProvider = calendarSettings?.active_calendar;
        setActiveCalendar(activeCalendarProvider);

        // Track widget view
        await trackWidgetEvent(userId, "view");

        // Fetch calendar events only if we have an active calendar
        let events = [];
        if (activeCalendarProvider) {
          try {
            events = await fetchCalendarEvents(
              userId,
              activeCalendarProvider,
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

        setCalendarEvents(events || []);
        setAvailabilitySlots(availSlots || []);

        // Process calendar data
        const calendarDates = getDatesForCalendarView(startDate);
        const processedData = calendarDates.map((dayData) => {
          const dayEvents = (events || []).filter((event) => {
            const eventDate = new Date(event.start_time);
            return eventDate.toDateString() === dayData.date.toDateString();
          });

          const dayAvailabilitySlots = (availSlots || []).filter((slot) => {
            const slotDate = new Date(slot.start_time);
            return slotDate.toDateString() === dayData.date.toDateString();
          });

          const pattern = generateAvailabilityPattern(
            dayData.date,
            dayEvents,
            dayAvailabilitySlots
          );

          const availableSlots = pattern.filter(Boolean).length;

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

        // Find next available date
        const today = new Date();
        const availableDay = processedData.find(
          (day) => day.available && day.date >= today
        );

        if (availableDay) {
          setNextAvailable({
            date: formatDate(new Date(availableDay.date)),
          });

          setSelectedDate(availableDay.date);
          setTimeSlots(
            generateTimeSlotsForDate(
              availableDay.date,
              events || [],
              availSlots || []
            )
          );
        }

        setLastFetchKey(fetchKey);
      } catch (err) {
        console.error("Error fetching availability data:", err);
        setError("Unable to load availability data");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailabilityData();
  }, [
    userId,
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    lastFetchKey,
  ]);

  const getDatesForCalendarView = (baseDate) => {
    const result = [];
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysFromPrevMonth = firstDay === 0 ? 6 : firstDay - 1;

    for (let i = daysFromPrevMonth; i > 0; i--) {
      const date = new Date(year, month, 1 - i);
      result.push({ date, inMonth: false, day: date.getDate() });
    }

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      result.push({ date, inMonth: true, day: i });
    }

    const remainingDays = 42 - result.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      result.push({ date, inMonth: false, day: i });
    }

    return result;
  };

  const generateAvailabilityPattern = (date, events, availabilitySlots) => {
    if (!isWorkingDay(date, businessHours.workingDays)) {
      return Array(8).fill(false);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      return Array(8).fill(false);
    }

    const pattern = [];
    const timeSlotOptions = generateTimeSlots(
      businessHours.startTime,
      businessHours.endTime,
      timeInterval
    );

    timeSlotOptions.forEach((timeSlot) => {
      const [hour, minute] = timeSlot.value.split(":").map(Number);
      const slotStart = new Date(date);
      slotStart.setHours(hour, minute, 0, 0);

      const slotEnd = new Date(date);
      slotEnd.setHours(hour, minute + timeInterval, 0, 0);

      const hasEventOverlap = events.some((event) => {
        const eventStart = new Date(event.start_time || event.startTime);
        const eventEnd = new Date(event.end_time || event.endTime);

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

      const hasAvailabilitySlot = availabilitySlots.some((slot) => {
        const slotSlotStart = new Date(slot.start_time);
        const slotSlotEnd = new Date(slot.end_time);
        return (
          doTimesOverlap(slotStart, slotEnd, slotSlotStart, slotSlotEnd) &&
          slot.available
        );
      });

      const isAvailable =
        !hasEventOverlap &&
        (availabilitySlots.length === 0 || hasAvailabilitySlot);

      pattern.push(isAvailable);
    });

    return pattern;
  };

  const generateTimeSlotsForDate = (date, events, availabilitySlots) => {
    if (!isWorkingDay(date, businessHours.workingDays)) {
      return { morning: [], afternoon: [] };
    }

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

      const hasEventOverlap = events.some((event) => {
        const eventStart = new Date(event.start_time);
        const eventEnd = new Date(event.end_time);

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

      const matchingAvailabilitySlot = availabilitySlots.find((slot) => {
        const availStart = new Date(slot.start_time);
        const availEnd = new Date(slot.end_time);
        return doTimesOverlap(slotStart, slotEnd, availStart, availEnd);
      });

      const isAvailable =
        !hasEventOverlap &&
        (availabilitySlots.length === 0 ||
          (matchingAvailabilitySlot && matchingAvailabilitySlot.available));

      const slot = {
        time: timeSlot.label,
        available: isAvailable,
        start: slotStart,
        end: slotEnd,
      };

      if (hour < 12) {
        morningSlots.push(slot);
      } else {
        afternoonSlots.push(slot);
      }
    });

    return { morning: morningSlots, afternoon: afternoonSlots };
  };

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
