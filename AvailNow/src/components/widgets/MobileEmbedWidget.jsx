// src/components/widgets/MobileEmbedWidget.jsx (Refactored)
import React from "react";
import { useMobileAvailability } from "../../hooks/useMobileAvailability";
import MobileWidgetHeader from "./mobile/MobileWidgetHeader";
import MobileDateSelector from "./mobile/MobileDateSelector";
import MobileTimeSlots from "./mobile/MobileTimeSlots";
import MobileWidgetFooter from "./mobile/MobileWidgetFooter";
import MobileLoadingState from "./mobile/MobileLoadingState";

/**
 * Mobile-optimized embedded widget component that displays availability slots
 */
const MobileEmbedWidget = ({
  userId,
  theme = "light",
  accentColor = "#0070f3",
  textColor = "#333333",
  buttonText = "Check Availability",
  showDays = 7,
  providerName = "Demo Provider",
  providerAddress = "123 Main Street",
  providerCity = "San Francisco, CA 94103",
  providerImage = "/api/placeholder/120/120",
  onClose,
}) => {
  const {
    loading,
    error,
    availabilityData,
    selectedDate,
    timeSlots,
    handleDateSelect,
    handleBookSlot,
  } = useMobileAvailability(userId, showDays);

  const containerStyle = {
    fontFamily: "'Inter', system-ui, sans-serif",
    backgroundColor: theme === "light" ? "#FFFFFF" : "#1F2937",
    color: theme === "light" ? textColor : "#F3F4F6",
    borderRadius: "12px 12px 0 0",
    overflow: "hidden",
    width: "100%",
    maxWidth: "100%",
    boxShadow: "0 -4px 10px rgba(0, 0, 0, 0.1)",
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    maxHeight: "90vh",
    overflowY: "auto",
  };

  const noAvailabilityStyle = {
    textAlign: "center",
    padding: "24px 16px",
    color: theme === "light" ? "#6B7280" : "#9CA3AF",
  };

  if (loading) {
    return (
      <MobileLoadingState
        buttonText={buttonText}
        accentColor={accentColor}
        theme={theme}
      />
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <MobileWidgetHeader
          buttonText={buttonText}
          accentColor={accentColor}
          providerName={providerName}
          providerAddress={providerAddress}
          providerImage={providerImage}
          onClose={onClose}
        />
        <div style={noAvailabilityStyle}>{error}</div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <MobileWidgetHeader
        buttonText={buttonText}
        accentColor={accentColor}
        providerName={providerName}
        providerAddress={providerAddress}
        providerImage={providerImage}
        onClose={onClose}
      />

      <MobileDateSelector
        availabilityData={availabilityData}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        theme={theme}
        accentColor={accentColor}
      />

      <MobileTimeSlots
        selectedDate={selectedDate}
        timeSlots={timeSlots}
        onBookSlot={handleBookSlot}
        theme={theme}
        accentColor={accentColor}
      />

      <MobileWidgetFooter theme={theme} accentColor={accentColor} />
    </div>
  );
};

export default MobileEmbedWidget;
