// src/components/widgets/preview/FullscreenPreview.jsx
import React from "react";
import FullscreenControls from "./FullscreenControls";
import MockWebsite from "./MockWebsite";
import MobileMockWebsite from "./MobileMockWebsite";
import FloatingWidget from "../FloatingWidget";
import MobileFloatingWidget from "../MobileFloatingWidget";

const FullscreenPreview = ({
  settings,
  userId,
  viewMode,
  onViewModeChange,
  onExitFullscreen,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-white overflow-auto">
      <FullscreenControls
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        onExitFullscreen={onExitFullscreen}
      />

      {/* Mock website with working widget based on view mode */}
      {viewMode === "desktop" ? (
        <div className="relative">
          <MockWebsite />
          <FloatingWidget {...settings} userId={userId} />
        </div>
      ) : (
        <div className="flex justify-center py-8 bg-gray-900 min-h-screen">
          <MobileMockWebsite />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <MobileFloatingWidget {...settings} userId={userId} />
          </div>
        </div>
      )}
    </div>
  );
};

export default FullscreenPreview;
