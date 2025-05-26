// src/components/widgets/MobileEmbedWidget.jsx
import React from "react";
import { useMobileAvailability } from "../../hooks/useMobileAvailability";
import MobileWidgetHeader from "./mobile/MobileWidgetHeader";
import MobileDateSelector from "./mobile/MobileDateSelector";
import MobileTimeSlots from "./mobile/MobileTimeSlots";
import MobileWidgetFooter from "./mobile/MobileWidgetFooter";
import MobileLoadingState from "./mobile/MobileLoadingState";

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
    backgroundColor: "#FFFFFF",
    borderRadius: "16px 16px 0 0",
    overflow: "hidden",
    width: "100%",
    maxWidth: "100%",
    boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.12)",
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9998,
    maxHeight: "85vh",
    overflowY: "auto",
    animation: "slideUp 0.3s ease-out",
  };

  const globalStyle = `
    @keyframes slideUp {
      from {
        transform: translateY(100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `;

  if (loading) {
    return (
      <>
        <style>{globalStyle}</style>
        <MobileLoadingState
          buttonText={buttonText}
          accentColor={accentColor}
          theme={theme}
        />
      </>
    );
  }

  if (error) {
    return (
      <>
        <style>{globalStyle}</style>
        <div style={containerStyle}>
          <MobileWidgetHeader
            buttonText={buttonText}
            accentColor={accentColor}
            onClose={onClose}
          />
          <div
            style={{
              textAlign: "center",
              padding: "24px 16px",
              color: "#6B7280",
            }}
          >
            {error}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{globalStyle}</style>
      <div style={containerStyle}>
        <MobileWidgetHeader
          buttonText={buttonText}
          accentColor={accentColor}
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
    </>
  );
};

export default MobileEmbedWidget;
