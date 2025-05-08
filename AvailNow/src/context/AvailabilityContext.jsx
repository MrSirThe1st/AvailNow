// // src/context/AvailabilityContext.jsx
// import { createContext, useContext, useEffect, useState } from "react";
// import { supabase } from "../lib/supabase";
// import { useAuth } from "./SupabaseAuthContext";
// import { useSettings } from "./SettingsContext";
// import { formatDate, doTimesOverlap } from "../lib/calendarUtils";

// const AvailabilityContext = createContext();

// export function useAvailability() {
//   return useContext(AvailabilityContext);
// }

// export function AvailabilityProvider({ children }) {
//   const { user } = useAuth();
//   const { calendarSettings } = useSettings();

//   const [availabilitySlots, setAvailabilitySlots] = useState([]);
//   const [calendarEvents, setCalendarEvents] = useState([]);
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [timeSlots, setTimeSlots] = useState({ morning: [], afternoon: [] });
//   const [nextAvailable, setNextAvailable] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Get dates for current month view
//   const getDatesForMonth = (year, month) => {
//     const result = [];

//     // Find first day of month and adjust to start on Sunday (0 = Sunday)
//     const firstDay = new Date(year, month, 1).getDay();

//     // Add days from previous month to fill first week
//     const prevMonthDays = firstDay;
//     for (let i = prevMonthDays - 1; i >= 0; i--) {
//       const date = new Date(year, month, -i);
//       result.push({
//         date,
//         inMonth: false,
//       });
//     }

//     // Add days from current month
//     const daysInMonth = new Date(year, month + 1, 0).getDate();
//     for (let i = 1; i <= daysInMonth; i++) {
//       const date = new Date(year, month, i);
//       result.push({
//         date,
//         inMonth: true,
//       });
//     }

//     // Add days from next month to complete the grid (6 weeks total)
//     const totalDaysToShow = 42; // 6 weeks × 7 days
//     const nextMonthDays = totalDaysToShow - result.length;
//     for (let i = 1; i <= nextMonthDays; i++) {
//       const date = new Date(year, month + 1, i);
//       result.push({
//         date,
//         inMonth: false,
//       });
//     }

//     return result;
//   };

//   // Generate availability pattern for a date
//   const generateAvailabilityPattern = (date, events, availabilitySlots) => {
//     // If it's not a working day, return all unavailable
//     const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
//     const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek; // Convert to 1-7 format (1 = Monday, 7 = Sunday)

//     if (!calendarSettings?.working_days?.includes(adjustedDay)) {
//       return Array(8).fill(false);
//     }

//     // If it's in the past, return all unavailable
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     if (date < today) {
//       return Array(8).fill(false);
//     }

//     const pattern = [];

//     // Business hours from settings (default to 9am-5pm)
//     const startTime = calendarSettings?.availability_start_time || "09:00";
//     const endTime = calendarSettings?.availability_end_time || "17:00";

//     const [startHour] = startTime.split(":").map(Number);
//     const [endHour] = endTime.split(":").map(Number);

//     // Generate pattern for each hour in working hours
//     for (let hour = startHour; hour < endHour; hour++) {
//       const hourStart = new Date(date);
//       hourStart.setHours(hour, 0, 0, 0);

//       const hourEnd = new Date(date);
//       hourEnd.setHours(hour + 1, 0, 0, 0);

//       // Check if this hour overlaps with any event
//       const hasEventOverlap = events.some((event) => {
//         const eventStart = new Date(event.start_time);
//         const eventEnd = new Date(event.end_time);
//         return doTimesOverlap(hourStart, hourEnd, eventStart, eventEnd);
//       });

//       // Check if this hour is marked as available in availability slots
//       const hasAvailabilitySlot = availabilitySlots.some((slot) => {
//         const slotStart = new Date(slot.start_time);
//         const slotEnd = new Date(slot.end_time);
//         return (
//           doTimesOverlap(hourStart, hourEnd, slotStart, slotEnd) &&
//           slot.available
//         );
//       });

//       // Hour is available if no event conflict AND either no availability defined OR marked as available
//       const isAvailable =
//         !hasEventOverlap &&
//         (availabilitySlots.length === 0 || hasAvailabilitySlot);

//       pattern.push(isAvailable);
//     }

//     return pattern;
//   };

//   // Generate time slots for a specific date
//   const generateTimeSlotsForDate = (date, events, availabilitySlots) => {
//     const morningSlots = [];
//     const afternoonSlots = [];

//     // Business hours from settings
//     const startTime = calendarSettings?.availability_start_time || "09:00";
//     const endTime = calendarSettings?.availability_end_time || "17:00";

//     const [startHour] = startTime.split(":").map(Number);
//     const [endHour] = endTime.split(":").map(Number);

//     // Generate slots every 30 minutes
//     for (let hour = startHour; hour < endHour; hour++) {
//       for (let minute of [0, 30]) {
//         const slotStart = new Date(date);
//         slotStart.setHours(hour, minute, 0, 0);

//         const slotEnd = new Date(date);
//         slotEnd.setHours(hour, minute + 30, 0, 0);

//         // Check if this slot overlaps with any event
//         const hasEventOverlap = events.some((event) => {
//           const eventStart = new Date(event.start_time);
//           const eventEnd = new Date(event.end_time);
//           return doTimesOverlap(slotStart, slotEnd, eventStart, eventEnd);
//         });

//         // Check if this slot is explicitly set in availability slots
//         const matchingAvailabilitySlot = availabilitySlots.find((slot) => {
//           const availStart = new Date(slot.start_time);
//           const availEnd = new Date(slot.end_time);
//           return doTimesOverlap(slotStart, slotEnd, availStart, availEnd);
//         });

//         // Slot is available if no event conflict AND either no availability defined OR marked as available
//         const isAvailable =
//           !hasEventOverlap &&
//           (availabilitySlots.length === 0 ||
//             (matchingAvailabilitySlot && matchingAvailabilitySlot.available));

//         // Format time (e.g., "9:00 AM")
//         const displayHour = hour % 12 === 0 ? 12 : hour % 12;
//         const displayMinute = minute === 0 ? "00" : minute;
//         const amPm = hour >= 12 ? "PM" : "AM";
//         const timeLabel = `${displayHour}:${displayMinute} ${amPm}`;

//         const slot = {
//           time: timeLabel,
//           available: isAvailable,
//           start: slotStart,
//           end: slotEnd,
//         };

//         // Sort into morning/afternoon
//         if (hour < 12) {
//           morningSlots.push(slot);
//         } else {
//           afternoonSlots.push(slot);
//         }
//       }
//     }

//     return { morning: morningSlots, afternoon: afternoonSlots };
//   };

//   // Load availability data for current month
//   useEffect(() => {
//     const loadAvailabilityData = async () => {
//       if (!user?.id) {
//         setLoading(false);
//         return;
//       }

//       try {
//         setLoading(true);
//         setError(null);

//         // Get current month range
//         const year = currentDate.getFullYear();
//         const month = currentDate.getMonth();
//         const startDate = new Date(year, month, 1);
//         startDate.setHours(0, 0, 0, 0);

//         const endDate = new Date(year, month + 1, 0);
//         endDate.setHours(23, 59, 59, 999);

//         // Fetch availability slots
//         const { data: slots, error: slotsError } = await supabase
//           .from("availability_slots")
//           .select("*")
//           .eq("user_id", user.id)
//           .gte("start_time", startDate.toISOString())
//           .lte("end_time", endDate.toISOString());

//         if (slotsError) {
//           console.error("Error fetching availability slots:", slotsError);
//           throw new Error("Failed to fetch availability slots");
//         }

//         setAvailabilitySlots(slots || []);

//         // Fetch calendar events if we have an active calendar
//         const activeCalendar = calendarSettings?.active_calendar;
//         if (activeCalendar) {
//           // In a real app, you would use your fetchCalendarEvents function here
//           // For now, we'll use mock data
//           const mockEvents = [];
//           // Generate some mock events
//           for (let i = 1; i <= 10; i++) {
//             const eventDate = new Date(
//               year,
//               month,
//               Math.floor(Math.random() * 28) + 1
//             );
//             const startHour = 9 + Math.floor(Math.random() * 8);

//             const startTime = new Date(eventDate);
//             startTime.setHours(startHour, 0, 0, 0);

//             const endTime = new Date(eventDate);
//             endTime.setHours(startHour + 1, 0, 0, 0);

//             mockEvents.push({
//               id: `mock-${i}`,
//               title: `Event ${i}`,
//               start_time: startTime.toISOString(),
//               end_time: endTime.toISOString(),
//               provider: activeCalendar,
//             });
//           }

//           setCalendarEvents(mockEvents);
//         } else {
//           setCalendarEvents([]);
//         }

//         // Create availability data structure for UI
//         const monthDates = getDatesForMonth(year, month);

//         // Find first available date for default selection
//         const today = new Date();
//         let firstAvailableDate = null;

//         monthDates.forEach((dateObj) => {
//           const { date } = dateObj;
//           if (!firstAvailableDate && date >= today) {
//             const dateEvents = calendarEvents.filter((event) => {
//               const eventDate = new Date(event.start_time);
//               return eventDate.toDateString() === date.toDateString();
//             });

//             const dateSlots =
//               slots?.filter((slot) => {
//                 const slotDate = new Date(slot.start_time);
//                 return slotDate.toDateString() === date.toDateString();
//               }) || [];

//             const pattern = generateAvailabilityPattern(
//               date,
//               dateEvents,
//               dateSlots
//             );

//             if (pattern.some((isAvailable) => isAvailable)) {
//               firstAvailableDate = date;
//               setNextAvailable({
//                 date: formatDate(date),
//               });
//             }
//           }
//         });

//         // Set selected date to first available or today
//         if (firstAvailableDate) {
//           setSelectedDate(firstAvailableDate);

//           // Generate time slots for selected date
//           const selectedDateEvents = calendarEvents.filter((event) => {
//             const eventDate = new Date(event.start_time);
//             return (
//               eventDate.toDateString() === firstAvailableDate.toDateString()
//             );
//           });

//           const selectedDateSlots =
//             slots?.filter((slot) => {
//               const slotDate = new Date(slot.start_time);
//               return (
//                 slotDate.toDateString() === firstAvailableDate.toDateString()
//               );
//             }) || [];

//           setTimeSlots(
//             generateTimeSlotsForDate(
//               firstAvailableDate,
//               selectedDateEvents,
//               selectedDateSlots
//             )
//           );
//         } else {
//           setSelectedDate(today);
//         }
//       } catch (err) {
//         console.error("Error in availability context:", err);
//         setError(err.message || "Failed to load availability data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadAvailabilityData();

//     // Set up real-time subscription for availability slots
//     if (user?.id) {
//       const subscription = supabase
//         .channel("availability_changes")
//         .on(
//           "postgres_changes",
//           {
//             event: "*", // Listen for all events (INSERT, UPDATE, DELETE)
//             schema: "public",
//             table: "availability_slots",
//             filter: `user_id=eq.${user.id}`,
//           },
//           (payload) => {
//             // Refresh availability data on changes
//             loadAvailabilityData();
//           }
//         )
//         .subscribe();

//       return () => {
//         subscription.unsubscribe();
//       };
//     }
//   }, [user?.id, currentDate, calendarSettings?.active_calendar]);

//   // Create a new availability slot
//   const createAvailabilitySlot = async (slotData) => {
//     if (!user?.id) return { error: "No user logged in" };

//     try {
//       const data = {
//         ...slotData,
//         user_id: user.id,
//         created_at: new Date().toISOString(),
//       };

//       const { data: newSlot, error } = await supabase
//         .from("availability_slots")
//         .insert(data)
//         .select()
//         .single();

//       if (error) throw error;

//       return { data: newSlot, error: null };
//     } catch (err) {
//       console.error("Error creating availability slot:", err);
//       return { data: null, error: err };
//     }
//   };

//   // Update an availability slot
//   const updateAvailabilitySlot = async (slotId, updatedData) => {
//     if (!user?.id) return { error: "No user logged in" };

//     try {
//       const data = {
//         ...updatedData,
//         updated_at: new Date().toISOString(),
//       };

//       const { data: updatedSlot, error } = await supabase
//         .from("availability_slots")
//         .update(data)
//         .eq("id", slotId)
//         .eq("user_id", user.id)
//         .select()
//         .single();

//       if (error) throw error;

//       return { data: updatedSlot, error: null };
//     } catch (err) {
//       console.error("Error updating availability slot:", err);
//       return { data: null, error: err };
//     }
//   };

//   // Delete an availability slot
//   const deleteAvailabilitySlot = async (slotId) => {
//     if (!user?.id) return { error: "No user logged in" };

//     try {
//       const { error } = await supabase
//         .from("availability_slots")
//         .delete()
//         .eq("id", slotId)
//         .eq("user_id", user.id);

//       if (error) throw error;

//       return { success: true, error: null };
//     } catch (err) {
//       console.error("Error deleting availability slot:", err);
//       return { success: false, error: err };
//     }
//   };

//   // Toggle availability status
//   const toggleAvailability = async (slotId) => {
//     try {
//       // First get current status
//       const { data: slot, error: fetchError } = await supabase
//         .from("availability_slots")
//         .select("available")
//         .eq("id", slotId)
//         .eq("user_id", user.id)
//         .single();

//       if (fetchError) throw fetchError;

//       // Toggle status
//       const { data, error } = await supabase
//         .from("availability_slots")
//         .update({
//           available: !slot.available,
//           updated_at: new Date().toISOString(),
//         })
//         .eq("id", slotId)
//         .eq("user_id", user.id)
//         .select()
//         .single();

//       if (error) throw error;

//       return { data, error: null };
//     } catch (err) {
//       console.error("Error toggling availability:", err);
//       return { data: null, error: err };
//     }
//   };

//   // Handle date selection
//   const selectDate = (date) => {
//     setSelectedDate(date);

//     // Generate time slots for selected date
//     const selectedDateEvents = calendarEvents.filter((event) => {
//       const eventDate = new Date(event.start_time);
//       return eventDate.toDateString() === date.toDateString();
//     });

//     const selectedDateSlots = availabilitySlots.filter((slot) => {
//       const slotDate = new Date(slot.start_time);
//       return slotDate.toDateString() === date.toDateString();
//     });

//     setTimeSlots(
//       generateTimeSlotsForDate(date, selectedDateEvents, selectedDateSlots)
//     );
//   };

//   // Navigate to previous month
//   const previousMonth = () => {
//     const newDate = new Date(currentDate);
//     newDate.setMonth(currentDate.getMonth() - 1);
//     setCurrentDate(newDate);
//   };
//   // Navigate to next month
//   const nextMonth = () => {
//     const newDate = new Date(currentDate);
//     newDate.setMonth(currentDate.getMonth() + 1);
//     setCurrentDate(newDate);
//   };

//   // Get availability for a date
//   const getAvailabilityForDate = (date) => {
//     if (!date) return [];

//     const dateStr = date.toDateString();

//     // Get events for this date
//     const dateEvents = calendarEvents.filter((event) => {
//       const eventDate = new Date(event.start_time);
//       return eventDate.toDateString() === dateStr;
//     });

//     // Get availability slots for this date
//     const dateSlots = availabilitySlots.filter((slot) => {
//       const slotDate = new Date(slot.start_time);
//       return slotDate.toDateString() === dateStr;
//     });

//     // Generate pattern
//     const pattern = generateAvailabilityPattern(date, dateEvents, dateSlots);

//     return {
//       date,
//       pattern,
//       events: dateEvents,
//       slots: dateSlots,
//       isAvailable: pattern.some((slot) => slot),
//     };
//   };

//   const value = {
//     availabilitySlots,
//     calendarEvents,
//     currentDate,
//     selectedDate,
//     timeSlots,
//     nextAvailable,
//     loading,
//     error,
//     createAvailabilitySlot,
//     updateAvailabilitySlot,
//     deleteAvailabilitySlot,
//     toggleAvailability,
//     selectDate,
//     previousMonth,
//     nextMonth,
//     generateTimeSlotsForDate,
//     getAvailabilityForDate,
//   };

//   return (
//     <AvailabilityContext.Provider value={value}>
//       {children}
//     </AvailabilityContext.Provider>
//   );
// }