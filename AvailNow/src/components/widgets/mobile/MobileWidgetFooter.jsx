// src/components/widgets/mobile/MobileWidgetFooter.jsx
import React from "react";

const MobileWidgetFooter = ({ theme, accentColor }) => {
  const styles = {
    footer: {
      padding: "12px",
      textAlign: "center",
      borderTop: `1px solid ${theme === "light" ? "#E5E7EB" : "#374151"}`,
      fontSize: "12px",
      color: theme === "light" ? "#6B7280" : "#9CA3AF",
    },
    footerLink: {
      color: accentColor,
      textDecoration: "none",
    },
  };

  return (
    <div style={styles.footer}>
      Powered by{" "}
      <a href="https://availnow.com" style={styles.footerLink}>
        AvailNow
      </a>
    </div>
  );
};

export default MobileWidgetFooter;
