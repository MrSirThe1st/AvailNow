// src/components/widgets/preview/FullscreenControls.jsx
import React from "react";
import { Monitor, Smartphone, Minimize2, X } from "lucide-react";

const FullscreenControls = ({
  viewMode,
  onViewModeChange,
  onExitFullscreen,
}) => {
  return (
    <>
      {/* Floating controls */}
      <div className="absolute top-4 right-4 z-50 flex space-x-2">
        {/* Toggle between desktop and mobile view */}
        <div className="flex bg-white rounded-full shadow-lg">
          <button
            onClick={() => onViewModeChange("desktop")}
            className={`flex items-center p-2 rounded-l-full ${
              viewMode === "desktop"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600"
            }`}
            title="Desktop view"
          >
            <Monitor size={20} />
          </button>
          <button
            onClick={() => onViewModeChange("mobile")}
            className={`flex items-center p-2 rounded-r-full ${
              viewMode === "mobile"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600"
            }`}
            title="Mobile view"
          >
            <Smartphone size={20} />
          </button>
        </div>

        {/* Exit fullscreen button */}
        <button
          onClick={onExitFullscreen}
          className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          title="Exit fullscreen"
        >
          <Minimize2 size={20} />
        </button>
      </div>

      {/* Demo info bar */}
      <div className="sticky top-0 z-40 bg-blue-600 text-white text-sm px-4 py-2 flex justify-between items-center">
        <div>
          AvailNow Widget Demo - {viewMode === "desktop" ? "Desktop" : "Mobile"}{" "}
          Preview
        </div>
        <button
          onClick={onExitFullscreen}
          className="flex items-center text-white hover:text-blue-200"
        >
          <X size={16} className="mr-1" />
          Close Preview
        </button>
      </div>
    </>
  );
};

export default FullscreenControls;
