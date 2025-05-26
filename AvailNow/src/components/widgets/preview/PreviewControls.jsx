// src/components/widgets/preview/PreviewControls.jsx
import React from "react";
import { Maximize2, Monitor, Smartphone } from "lucide-react";

const PreviewControls = ({
  viewMode,
  onViewModeChange,
  onFullscreenToggle,
  showFullscreenButton = true,
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-sm font-medium">Widget Preview</h3>
      <div className="flex items-center">
        {/* Toggle between desktop and mobile view */}
        <div className="flex bg-gray-100 rounded-md p-1 mr-4">
          <button
            onClick={() => onViewModeChange("desktop")}
            className={`flex items-center px-3 py-1 text-xs rounded ${
              viewMode === "desktop"
                ? "bg-white shadow-sm text-blue-600"
                : "text-gray-600"
            }`}
          >
            <Monitor size={16} className="mr-1" />
            Desktop
          </button>
          <button
            onClick={() => onViewModeChange("mobile")}
            className={`flex items-center px-3 py-1 text-xs rounded ${
              viewMode === "mobile"
                ? "bg-white shadow-sm text-blue-600"
                : "text-gray-600"
            }`}
          >
            <Smartphone size={16} className="mr-1" />
            Mobile
          </button>
        </div>

        {/* Fullscreen button */}
        {showFullscreenButton && (
          <button
            onClick={onFullscreenToggle}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <Maximize2 size={16} className="mr-1" />
            View Fullscreen
          </button>
        )}
      </div>
    </div>
  );
};

export default PreviewControls;
