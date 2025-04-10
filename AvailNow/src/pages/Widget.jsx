import React from 'react'
import { useState } from "react";
import { Code } from "lucide-react";

const Widget = () => {
  const [activeTab, setActiveTab] = useState("website");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Widget Configuration</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex border-b mb-4">
          <button
            className={`pb-2 px-4 ${
              activeTab === "website"
                ? "border-b-2 border-primary font-medium"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("website")}
          >
            Website Widget
          </button>
          <button
            className={`pb-2 px-4 ${
              activeTab === "standalone"
                ? "border-b-2 border-primary font-medium"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("standalone")}
          >
            Standalone Page
          </button>
        </div>

        {activeTab === "website" ? (
          <div>
            <h2 className="text-lg font-semibold mb-4">
              Embed on your website
            </h2>
            <div className="bg-gray-50 p-4 rounded-md mb-4 flex items-center">
              <Code size={20} className="text-gray-400 mr-2" />
              <code className="text-sm">
                {
                  '<script src="https://availnow.com/widget.js?id=YOUR_ID"></script>'
                }
              </code>
            </div>
            <button className="bg-primary text-white px-4 py-2 rounded-md">
              Copy Code
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-semibold mb-4">
              Your availability page
            </h2>
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <p className="text-sm">https://yourusername.availnow.com</p>
            </div>
            <button className="bg-primary text-white px-4 py-2 rounded-md">
              Copy Link
            </button>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Appearance Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Theme Color
            </label>
            <div className="flex space-x-2">
              {["#0070f3", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"].map(
                (color) => (
                  <button
                    key={color}
                    className="w-8 h-8 rounded-full border-2 border-white outline outline-1 outline-gray-200"
                    style={{ backgroundColor: color }}
                  />
                )
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Button Text
            </label>
            <input
              type="text"
              className="w-full border rounded-md p-2"
              placeholder="Check Availability"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Widget;

