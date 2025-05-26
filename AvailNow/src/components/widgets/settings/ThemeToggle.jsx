import React from "react";

const ThemeToggle = ({ theme, onToggle }) => {
  return (
    <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Dark mode</span>
      </div>
      <div
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
          theme === "dark" ? "bg-primary" : "bg-gray-200"
        }`}
        onClick={onToggle}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            theme === "dark" ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </div>
    </div>
  );
};

export default ThemeToggle;
