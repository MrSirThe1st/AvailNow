// src/components/widgets/preview/RegularPreview.jsx
import React from "react";
import PreviewControls from "./PreviewControls";
import FloatingWidget from "../FloatingWidget";
import MobileFloatingWidget from "../MobileFloatingWidget";

const RegularPreview = ({
  settings,
  userId,
  viewMode,
  onViewModeChange,
  onFullscreenToggle,
}) => {
  return (
    <div className="relative bg-white p-4 rounded-lg border border-gray-200">
      <PreviewControls
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        onFullscreenToggle={onFullscreenToggle}
      />

      {/* Preview area */}
      <div className="flex justify-center">
        {viewMode === "desktop" ? (
          <FloatingWidget {...settings} userId={userId} />
        ) : (
          <MobileFloatingWidget {...settings} userId={userId} />
        )}
      </div>
    </div>
  );
};

export default RegularPreview;
