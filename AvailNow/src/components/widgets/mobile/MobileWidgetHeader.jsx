// src/components/widgets/mobile/MobileWidgetHeader.jsx
import React from "react";
import { Clock, MapPin } from "lucide-react";

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
      backgroundColor: accentColor,
      color: "#FFFFFF",
      padding: "16px",
      position: "relative",
    },
    closeButton: {
      position: "absolute",
      top: "16px",
      right: "16px",
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      border: "none",
      borderRadius: "50%",
      width: "24px",
      height: "24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
    },
    title: {
      margin: 0,
      fontSize: "18px",
      fontWeight: "bold",
      display: "flex",
      alignItems: "center",
    },
    providerInfo: {
      display: "flex",
      alignItems: "center",
      marginTop: "8px",
    },
    providerImage: {
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      marginRight: "8px",
      objectFit: "cover",
    },
    providerDetails: {
      fontSize: "14px",
    },
    providerName: {
      fontWeight: "500",
    },
    providerAddress: {
      fontSize: "12px",
      opacity: 0.8,
      display: "flex",
      alignItems: "center",
    },
  };

  return (
    <div style={styles.header}>
      <h2 style={styles.title}>
        <Clock size={18} style={{ marginRight: "8px" }} />
        {buttonText}
      </h2>
      <button style={styles.closeButton} onClick={onClose}>
        ✕
      </button>

      <div style={styles.providerInfo}>
        <img
          src={providerImage}
          alt={providerName}
          style={styles.providerImage}
        />
        <div style={styles.providerDetails}>
          <div style={styles.providerName}>{providerName}</div>
          <div style={styles.providerAddress}>
            <MapPin size={12} style={{ marginRight: "4px" }} />
            {providerAddress}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileWidgetHeader;
