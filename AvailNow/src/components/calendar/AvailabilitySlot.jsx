import React from "react";
import { Clock, X, Check } from "lucide-react";

const AvailabilitySlot = ({ slot, onToggle, onDelete, compact = false }) => {
  // Format time to display in 12-hour format
  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  // Get time range string (e.g., "9:00 AM - 10:00 AM")
  const getTimeRange = () => {
    return `${formatTime(new Date(slot.startTime))} - ${formatTime(new Date(slot.endTime))}`;
  };

  if (compact) {
    // Compact version for month view
    return (
      <div
        className={`text-xs px-1 py-0.5 rounded ${
          slot.available
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        } cursor-pointer`}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      >
        {formatTime(new Date(slot.startTime))}
      </div>
    );
  }

  return (
    <div
      className={`h-full p-2 rounded ${
        slot.available
          ? "bg-green-100 border border-green-200"
          : "bg-red-100 border border-red-200"
      } transition-colors duration-200 ease-in-out`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <Clock size={14} className="mr-1" />
          <span className="text-sm font-medium">{getTimeRange()}</span>
        </div>

        <div className="flex space-x-1">
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
            title={slot.available ? "Mark as unavailable" : "Mark as available"}
          >
            {slot.available ? <Check size={12} /> : <X size={12} />}
          </button>

          {onDelete && (
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

      <div className="mt-1 text-xs">
        {slot.available ? "Available" : "Unavailable"}
      </div>
    </div>
  );
};

export default AvailabilitySlot;
