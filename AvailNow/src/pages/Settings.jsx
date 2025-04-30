import React from "react";

const Settings = () => {
  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">General Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Business Name
              </label>
              <input
                type="text"
                className="w-full border rounded-md p-2"
                placeholder="Your Business Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Time Zone
              </label>
              <select className="w-full border rounded-md p-2">
                <option>America/New_York (Eastern Time)</option>
                <option>America/Chicago (Central Time)</option>
                <option>America/Denver (Mountain Time)</option>
                <option>America/Los_Angeles (Pacific Time)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Date Format
              </label>
              <select className="w-full border rounded-md p-2">
                <option>MM/DD/YYYY</option>
                <option>DD/MM/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Time Format
              </label>
              <select className="w-full border rounded-md p-2">
                <option>12-hour (AM/PM)</option>
                <option>24-hour</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Subscription</h2>
          <div className="border rounded-md p-4 text-center">
            <p className="text-gray-500 mb-4">Free Plan</p>
            <button className="bg-primary text-white px-4 py-2 rounded-md">
              Upgrade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
