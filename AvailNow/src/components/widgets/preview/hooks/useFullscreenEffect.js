// src/components/widgets/preview/hooks/useFullscreenEffect.js
import { useEffect } from "react";

/**
 * Custom hook to manage body scroll when in fullscreen mode
 * @param {boolean} isFullscreen - Whether fullscreen mode is active
 */
const useFullscreenEffect = (isFullscreen) => {
  useEffect(() => {
    if (isFullscreen) {
      // Prevent body scrolling when in fullscreen
      document.body.style.overflow = "hidden";
    } else {
      // Restore body scrolling
      document.body.style.overflow = "";
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  // Optional: Handle escape key to exit fullscreen
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape" && isFullscreen) {
        // This would need to be passed as a callback if you want to handle escape
        // For now, we'll just document that this could be extended
        console.log("Escape key pressed in fullscreen mode");
      }
    };

    if (isFullscreen) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isFullscreen]);
};

export default useFullscreenEffect;
