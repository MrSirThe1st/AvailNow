// src/components/widgets/calendar/CalendarSection.jsx
import React from "react";
import DateCellWithDotIndicator from "./DateCellWithDotIndicator";

const CalendarSection = ({
  currentMonth,
  availabilityData,
  selectedDate,
  loading,
  styles,
  onDateClick,
  onPreviousMonth,
  onNextMonth,
}) => {
  const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  // Render day of week headers
  const renderDayHeaders = () => {
    return (
      <div style={styles.dayHeadersGrid}>
        {DAYS.map((day) => (
          <div key={day} style={styles.dayHeader}>
            {day}
          </div>
        ))}
      </div>
    );
  };

  // Render calendar grid
  const renderCalendar = () => {
    return (
      <div style={styles.calendarGrid}>
        {availabilityData.map((dateData, index) => (
          <DateCellWithDotIndicator
            key={index}
            date={dateData.date}
            availabilityPattern={dateData.availabilityPattern}
            isSelected={
              selectedDate &&
              selectedDate.toDateString() === dateData.date.toDateString()
            }
            isInMonth={dateData.inMonth}
            onClick={onDateClick}
          />
        ))}
      </div>
    );
  };

  return (
    <div style={styles.calendarSection}>
      <div style={styles.monthNav}>
        <button onClick={onPreviousMonth} style={styles.monthNavButton}>
          <span>←</span>
        </button>

        <h3 style={styles.monthTitle}>
          {currentMonth.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </h3>

        <button onClick={onNextMonth} style={styles.monthNavButton}>
          <span>→</span>
        </button>
      </div>

      {loading ? (
        <div style={styles.loadingSpinner}>
          <div style={styles.spinner}></div>
        </div>
      ) : (
        <>
          {renderDayHeaders()}
          {renderCalendar()}
        </>
      )}
    </div>
  );
};

export default CalendarSection;
