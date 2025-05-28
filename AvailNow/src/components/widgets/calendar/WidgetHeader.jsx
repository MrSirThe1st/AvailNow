import React from "react";

const WidgetHeader = ({
  buttonText,
  nextAvailable,
  providerName,
  providerAddress,
  providerCity,
  companyLogo,
  styles,
}) => {
  // Use company logo if available, otherwise fall back to placeholder
  const logoSrc = companyLogo || "/api/placeholder/48/48";

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
          src={logoSrc}
          alt={providerName || "Company logo"}
          style={styles.providerImage}
          onError={(e) => {
            // Fallback to a default avatar if image fails to load
            e.target.src = "/api/placeholder/48/48";
          }}
        />
        <div>
          <p style={styles.providerName}>{providerName}</p>
          {providerAddress && (
            <p style={styles.providerAddress}>
              <span style={{ marginRight: "4px" }}>📍</span>
              {providerAddress}
              {providerCity && `, ${providerCity}`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WidgetHeader;
