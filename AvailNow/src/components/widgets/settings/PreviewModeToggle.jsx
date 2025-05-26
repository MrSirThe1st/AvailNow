import React from "react";
import { Monitor, Smartphone } from "lucide-react";

const PreviewModeToggle = ({ previewMode, onToggle }) => {
  return (
    <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Preview Mode</span>
      </div>
      <div className="flex bg-gray-100 rounded-md p-1">
        <button
          onClick={() => onToggle("desktop")}
          className={`flex items-center px-3 py-1 text-xs rounded ${
            previewMode === "desktop"
              ? "bg-white shadow-sm text-primary"
              : "text-gray-600"
          }`}
        >
          <Monitor size={14} className="mr-1" />
          Desktop
        </button>
        <button
          onClick={() => onToggle("mobile")}
          className={`flex items-center px-3 py-1 text-xs rounded ${
            previewMode === "mobile"
              ? "bg-white shadow-sm text-primary"
              : "text-gray-600"
          }`}
        >
          <Smartphone size={14} className="mr-1" />
          Mobile
        </button>
      </div>
    </div>
  );
};

export default PreviewModeToggle;
