// src/components/widgets/mobile/MobileWidgetHeader.jsx
import React from "react";
import { Clock, X } from "lucide-react";

const MobileWidgetHeader = ({
  buttonText,
  accentColor,
  providerName,
  providerAddress,
  providerImage,
  onClose,
}) => {
  const styles = {
    header: {
      backgroundColor: "#FFFFFF",
      color: "#333333",
      padding: "16px",
      position: "relative",
      borderBottom: "1px solid #E5E7EB",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    leftSection: {
      display: "flex",
      alignItems: "center",
    },
    icon: {
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      backgroundColor: accentColor,
      color: "#FFFFFF",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginRight: "12px",
    },
    title: {
      margin: 0,
      fontSize: "16px",
      fontWeight: "500",
      color: "#333333",
    },
    closeButton: {
      backgroundColor: "transparent",
      border: "none",
      borderRadius: "50%",
      width: "32px",
      height: "32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      color: "#6B7280",
    },
  };

  return (
    <div style={styles.header}>
      <div style={styles.leftSection}>
        <div style={styles.icon}>
          <Clock size={16} />
        </div>
        <h2 style={styles.title}>{buttonText}</h2>
      </div>
      {onClose && (
        <button style={styles.closeButton} onClick={onClose}>
          <X size={20} />
        </button>
      )}
    </div>
  );
};

export default MobileWidgetHeader;
