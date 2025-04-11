import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import TimeSelector from "./TimeSelector";

const AvailabilitySlotModal = ({ slot, date, onSave, onCancel }) => {
  const [slotData, setSlotData] = useState({
    startTime: "09:00",
    endTime: "10:00",
    available: true,
    recurrence: "none", // none, daily, weekly, monthly
  });

  useEffect(() => {
    // If editing an existing slot, populate the form
    if (slot) {
      const startDate = new Date(slot.startTime);
      const endDate = new Date(slot.endTime);

      setSlotData({
        startTime: `${String(startDate.getHours()).padStart(2, "0")}:${String(startDate.getMinutes()).padStart(2, "0")}`,
        endTime: `${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}`,
        available: slot.available,
        recurrence: slot.recurrence || "none",
      });
    }
  }, [slot]);

  const handleChange = (field, value) => {
    setSlotData({
      ...slotData,
      [field]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Create dates for the start and end times
    const startDateTime = new Date(date);
    const [startHours, startMinutes] = slotData.startTime
      .split(":")
      .map(Number);
    startDateTime.setHours(startHours, startMinutes, 0, 0);

    const endDateTime = new Date(date);
    const [endHours, endMinutes] = slotData.endTime.split(":").map(Number);
    endDateTime.setHours(endHours, endMinutes, 0, 0);

    // Create the slot object
    const newSlot = {
      id: slot?.id || Date.now().toString(),
      startTime: startDateTime,
      endTime: endDateTime,
      available: slotData.available,
      recurrence: slotData.recurrence !== "none" ? slotData.recurrence : null,
    };

    onSave(newSlot);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          {slot ? "Edit Availability Slot" : "Create Availability Slot"}
        </h2>
        <button
          className="text-gray-400 hover:text-gray-600"
          onClick={onCancel}
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <div className="p-2 bg-gray-50 rounded-md">
              {date.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <TimeSelector
              label="Start Time"
              value={slotData.startTime}
              onChange={(value) => handleChange("startTime", value)}
              startHour={6}
              endHour={22}
            />

            <TimeSelector
              label="End Time"
              value={slotData.endTime}
              onChange={(value) => handleChange("endTime", value)}
              startHour={6}
              endHour={22}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Availability
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="availability"
                  checked={slotData.available}
                  onChange={() => handleChange("available", true)}
                  className="mr-2"
                />
                <span>Available</span>
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  name="availability"
                  checked={!slotData.available}
                  onChange={() => handleChange("available", false)}
                  className="mr-2"
                />
                <span>Unavailable</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Recurrence</label>
            <select
              value={slotData.recurrence}
              onChange={(e) => handleChange("recurrence", e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
            >
              <option value="none">One-time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Recurring slots will be created on the same day/time according to
              the pattern.
            </p>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md"
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AvailabilitySlotModal;
