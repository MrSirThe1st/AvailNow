import React from "react";
import { Clock, X, Check, Calendar, MapPin } from "lucide-react";

const AvailabilitySlot = ({ slot, onToggle, onDelete, compact = false }) => {
  // Format time to display in 12-hour format
  const formatTime = (date) => {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  // Get time range string (e.g., "9:00 AM - 10:00 AM")
  const getTimeRange = () => {
    const startTime = slot.startTime || slot.start_time;
    const endTime = slot.endTime || slot.end_time;

    return `${formatTime(new Date(startTime))} - ${formatTime(new Date(endTime))}`;
  };

  // Determine if this is a Google Calendar event or a manual availability slot
  const isCalendarEvent = slot.isEvent || slot.provider === "google";

  // Get background color class based on slot type
  const getBackgroundColorClass = () => {
    if (isCalendarEvent) {
      // Calendar events get a blue color scheme
      return "bg-blue-100 border border-blue-200";
    } else {
      // Manual availability slots
      return slot.available
        ? "bg-green-100 border border-green-200"
        : "bg-red-100 border border-red-200";
    }
  };

  // Get text color class based on slot type
  const getTextColorClass = () => {
    if (isCalendarEvent) {
      return "text-blue-800";
    } else {
      return slot.available ? "text-green-800" : "text-red-800";
    }
  };

  if (compact) {
    // Compact version for month view
    return (
      <div
        className={`text-xs px-1 py-0.5 rounded ${
          isCalendarEvent
            ? "bg-blue-100 text-blue-800"
            : slot.available
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
        } cursor-pointer`}
        onClick={(e) => {
          e.stopPropagation();
          if (onToggle) onToggle();
        }}
      >
        {isCalendarEvent ? (
          <div className="flex items-center">
            <Calendar size={10} className="mr-1" />
            <span>
              {slot.title ||
                formatTime(new Date(slot.startTime || slot.start_time))}
            </span>
          </div>
        ) : (
          formatTime(new Date(slot.startTime || slot.start_time))
        )}
      </div>
    );
  }

  return (
    <div
      className={`h-full p-2 rounded ${getBackgroundColorClass()} transition-colors duration-200 ease-in-out`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <Clock size={14} className="mr-1" />
          <span className="text-sm font-medium">{getTimeRange()}</span>
        </div>

        <div className="flex space-x-1">
          {!isCalendarEvent && onToggle && (
            <button
              className={`p-1 rounded-full ${
                slot.available
                  ? "bg-green-200 text-green-700 hover:bg-green-300"
                  : "bg-red-200 text-red-700 hover:bg-red-300"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              title={
                slot.available ? "Mark as unavailable" : "Mark as available"
              }
            >
              {slot.available ? <Check size={12} /> : <X size={12} />}
            </button>
          )}

          {!isCalendarEvent && onDelete && (
            <button
              className="p-1 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title="Delete slot"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      <div className="mt-1 text-xs flex flex-col">
        {isCalendarEvent ? (
          <>
            <span className="font-medium">
              {slot.title || "Calendar Event"}
            </span>
            {slot.location && (
              <span className="flex items-center mt-1 text-gray-600">
                <MapPin size={10} className="mr-1" />
                {slot.location}
              </span>
            )}
          </>
        ) : (
          <span className={getTextColorClass()}>
            {slot.available ? "Available" : "Unavailable"}
          </span>
        )}
      </div>
    </div>
  );
};

export default AvailabilitySlot;
