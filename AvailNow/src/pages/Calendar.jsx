import React from 'react'


const Calendar = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Calendar</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Connected Calendars</h2>
        <div className="border rounded-md p-4 text-center">
          <p className="text-gray-500 mb-4">No calendars connected</p>
          <button className="bg-primary text-white px-4 py-2 rounded-md">
            Connect Calendar
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Availability Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Business Hours
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500">
                  Start Time
                </label>
                <select className="w-full border rounded-md p-2">
                  <option>9:00 AM</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500">End Time</label>
                <select className="w-full border rounded-md p-2">
                  <option>5:00 PM</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Working Days
            </label>
            <div className="flex space-x-2">
              {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                <button
                  key={index}
                  className={`w-10 h-10 rounded-full ${
                    index < 5
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
