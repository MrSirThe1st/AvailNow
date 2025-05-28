// src/components/widgets/EmbedWidget.jsx (Updated)
import React, { useState } from "react";
import { createStyles } from "./EmbedWidgetStyles";
import { trackWidgetEvent } from "../../lib/widgetService";
import { formatDate } from "../../lib/calendarUtils";
import { useAvailabilityData } from "../../hooks/useAvailabilityData";
import WidgetHeader from "./calendar/WidgetHeader";
import CalendarSection from "./calendar/CalendarSection";
import TimeSlotsSection from "./calendar/TimeSlotsSection";
import WidgetFooter from "./calendar/WidgetFooter";

/**
 * Embeddable widget component that displays availability slots using real calendar data
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
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Use custom hook for availability data
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
  } = useAvailabilityData(userId, currentMonth);

  // Get styles
  const styles = createStyles(theme, accentColor, textColor, compact);

  // Handle booking click for individual time slot
  const handleBookingClick = (slot) => {
    // Track booking click
    if (userId) {
      trackWidgetEvent(userId, "booking");
    }

    // In a real implementation, this would redirect to a booking page or show a form
    alert(
      `Booking for ${formatDateForDisplay(new Date(selectedDate))} at ${slot.time}`
    );
  };

  // Handle main widget click (BOOK button)
  const handleWidgetClick = () => {
    // Track widget click
    if (userId) {
      trackWidgetEvent(userId, "click");
    }

    alert(
      `Booking appointment on ${formatDateForDisplay(new Date(selectedDate))}`
    );
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

  // Format date in a readable way
  const formatDateForDisplay = (date) => {
    const options = { weekday: "long", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
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

        {/* Time slots section */}
        <TimeSlotsSection
          selectedDate={selectedDate}
          timeSlots={timeSlots}
          styles={styles}
          onBookingClick={handleBookingClick}
          onWidgetClick={handleWidgetClick}
        />
      </div>

      {/* Footer */}
      <WidgetFooter styles={styles} />
    </div>
  );
};

export default EmbedWidget;
