// src/components/widgets/calendar/WidgetHeader.jsx
import React from "react";

const WidgetHeader = ({
  buttonText,
  nextAvailable,
  providerName,
  providerAddress,
  providerCity,
  providerImage,
  styles,
}) => {
  return (
    <div style={styles.header}>
      <div style={styles.headerTitleContainer}>
        <h2 style={styles.headerTitle}>{buttonText}</h2>
        {nextAvailable && (
          <div style={styles.nextAvailableBadge}>
            <span style={{ marginRight: "4px" }}>✓</span>
            Next Available: {nextAvailable.date}
          </div>
        )}
      </div>

      <div style={styles.providerInfo}>
        <img
          src={providerImage}
          alt={providerName}
          style={styles.providerImage}
        />
        <div>
          <p style={styles.providerName}>{providerName}</p>
          <p style={styles.providerAddress}>
            <span style={{ marginRight: "4px" }}>📍</span>
            {providerAddress}, {providerCity}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WidgetHeader;
