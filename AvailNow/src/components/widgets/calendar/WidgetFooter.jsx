// src/components/widgets/calendar/WidgetFooter.jsx
import React from "react";

const WidgetFooter = ({ styles }) => {
  return (
    <div style={styles.footer}>
      Powered by{" "}
      <a
        href="https://availnow.com"
        target="_blank"
        rel="noopener noreferrer"
        style={styles.footerLink}
      >
        AvailNow
      </a>
    </div>
  );
};

export default WidgetFooter;
