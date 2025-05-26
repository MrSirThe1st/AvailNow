// src/components/widgets/WidgetPreview.jsx (Refactored)
import React, { useState } from "react";
import RegularPreview from "./preview/RegularPreview";
import FullscreenPreview from "./preview/FullscreenPreview";
import useFullscreenEffect from "./preview/hooks/useFullscreenEffect";

const WidgetPreview = ({ settings, userId }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState("desktop"); // desktop or mobile

  // Use custom hook to manage body scroll
  useFullscreenEffect(isFullscreen);

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleFullscreenToggle = () => {
    setIsFullscreen(true);
  };

  const handleExitFullscreen = () => {
    setIsFullscreen(false);
  };

  return isFullscreen ? (
    <FullscreenPreview
      settings={settings}
      userId={userId}
      viewMode={viewMode}
      onViewModeChange={handleViewModeChange}
      onExitFullscreen={handleExitFullscreen}
    />
  ) : (
    <RegularPreview
      settings={settings}
      userId={userId}
      viewMode={viewMode}
      onViewModeChange={handleViewModeChange}
      onFullscreenToggle={handleFullscreenToggle}
    />
  );
};

export default WidgetPreview;
