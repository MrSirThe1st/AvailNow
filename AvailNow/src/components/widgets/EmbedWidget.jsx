// src/components/widgets/EmbedWidget.jsx
import React, { useState } from "react";
import { createStyles } from "./EmbedWidgetStyles";
import { trackWidgetEvent } from "../../lib/widgetService";
import { formatDate } from "../../lib/calendarUtils";
import { useAvailabilityData } from "../../hooks/useAvailabilityData";
import WidgetHeader from "./calendar/WidgetHeader";
import CalendarSection from "./calendar/CalendarSection";
import BookingActionSection from "./calendar/BookingActionSection";
import WidgetFooter from "./calendar/WidgetFooter";
import TimeSlotsSection from "./calendar/TimeSlotsSection";

/**
 * Embeddable widget component with business hours and booking settings
 */
const EmbedWidget = ({
  userId,
  theme = "light",
  accentColor = "#0070f3",
  textColor = "#333333",
  buttonText = "Check Availability",
  showDays = 7,
  compact = false,
  providerName = "Demo Provider",
  providerAddress = "123 Main Street",
  providerCity = "San Francisco, CA 94103",
  companyLogo = null,
  businessHours = {
    startTime: "09:00",
    endTime: "17:00",
    workingDays: [1, 2, 3, 4, 5],
    bufferBefore: 0,
    bufferAfter: 0,
  },
  timeInterval = 30,
  bookingType = "contact",
  contactInfo = {
    phone: "+1 (555) 123-4567",
    email: "appointments@yourcompany.com",
    website: "https://yourcompany.com/book",
    message: "Call us to schedule your appointment or visit our website",
  },
  customInstructions = {
    title: "How to Book",
    message: "Contact us to schedule your appointment",
    buttonText: "Contact Us",
    actionUrl: "",
  },
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Use custom hook for availability data with business hours
  const {
    loading,
    error,
    availabilityData,
    calendarEvents,
    selectedDate,
    timeSlots,
    nextAvailable,
    activeCalendar,
    handleDateClick,
  } = useAvailabilityData(userId, currentMonth, businessHours, timeInterval);

  // Get styles
  const styles = createStyles(theme, accentColor, textColor, compact);

  // Handle main widget click (main booking button)
  const handleWidgetClick = () => {
    // Track widget click
    if (userId) {
      trackWidgetEvent(userId, "click");
    }

    if (bookingType === "contact") {
      // Handle contact booking
      if (contactInfo.website) {
        window.open(contactInfo.website, "_blank");
      } else if (contactInfo.phone) {
        window.open(`tel:${contactInfo.phone}`);
      } else if (contactInfo.email) {
        window.open(`mailto:${contactInfo.email}`);
      } else {
        alert(
          contactInfo.message || "Please contact us to book your appointment"
        );
      }
    } else if (bookingType === "custom") {
      // Handle custom instructions
      if (customInstructions.actionUrl) {
        window.open(customInstructions.actionUrl, "_blank");
      } else {
        alert(
          customInstructions.message || "Please follow our booking instructions"
        );
      }
    }
  };

  // Navigate to previous month
  const handlePreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(currentMonth.getMonth() - 1);
    setCurrentMonth(newDate);
  };

  // Navigate to next month
  const handleNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(currentMonth.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  // Show loading state
  if (loading) {
    return (
      <div style={styles.container}>
        <WidgetHeader
          buttonText={buttonText}
          nextAvailable={null}
          providerName={providerName}
          providerAddress={providerAddress}
          providerCity={providerCity}
          companyLogo={companyLogo}
          styles={styles}
        />
        <div style={styles.contentContainer}>
          <div style={styles.loadingSpinner}>
            <div style={styles.spinner}></div>
            <p>Loading availability...</p>
          </div>
        </div>
        <WidgetFooter styles={styles} />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div style={styles.container}>
        <WidgetHeader
          buttonText={buttonText}
          nextAvailable={null}
          providerName={providerName}
          providerAddress={providerAddress}
          providerCity={providerCity}
          companyLogo={companyLogo}
          styles={styles}
        />
        <div style={styles.contentContainer}>
          <div style={styles.timeSlotsEmpty}>{error}</div>
        </div>
        <WidgetFooter styles={styles} />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header with business info */}
      <WidgetHeader
        buttonText={buttonText}
        nextAvailable={nextAvailable}
        providerName={providerName}
        providerAddress={providerAddress}
        providerCity={providerCity}
        companyLogo={companyLogo}
        styles={styles}
      />

      {/* Main content - side by side layout */}
      <div style={styles.contentContainer}>
        {/* Calendar section */}
        <CalendarSection
          currentMonth={currentMonth}
          availabilityData={availabilityData}
          selectedDate={selectedDate}
          loading={loading}
          styles={styles}
          onDateClick={handleDateClick}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
        />

        {/* Time slots section with modal */}
        <TimeSlotsSection
          selectedDate={selectedDate}
          timeSlots={timeSlots}
          bookingType={bookingType}
          contactInfo={contactInfo}
          customInstructions={customInstructions}
          styles={styles}
          onWidgetClick={handleWidgetClick}
        />
      </div>

      {/* Footer */}
      <WidgetFooter styles={styles} />
    </div>
  );
};

export default EmbedWidget;
