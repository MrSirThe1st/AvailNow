// src/components/widgets/mobile/MobileLoadingState.jsx
import React from "react";
import { Clock } from "lucide-react";

const MobileLoadingState = ({ buttonText, accentColor, theme }) => {
  const styles = {
    container: {
      fontFamily: "'Inter', system-ui, sans-serif",
      backgroundColor: theme === "light" ? "#FFFFFF" : "#1F2937",
      color: theme === "light" ? "#333333" : "#F3F4F6",
      borderRadius: "12px 12px 0 0",
      overflow: "hidden",
      width: "100%",
      maxWidth: "100%",
      boxShadow: "0 -4px 10px rgba(0, 0, 0, 0.1)",
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      maxHeight: "90vh",
      overflowY: "auto",
    },
    header: {
      backgroundColor: accentColor,
      color: "#FFFFFF",
      padding: "16px",
      position: "relative",
    },
    title: {
      margin: 0,
      fontSize: "18px",
      fontWeight: "bold",
      display: "flex",
      alignItems: "center",
    },
    loadingState: {
      textAlign: "center",
      padding: "24px 16px",
    },
    loadingSpinner: {
      width: "30px",
      height: "30px",
      border: `3px solid ${theme === "light" ? "#E5E7EB" : "#374151"}`,
      borderTop: `3px solid ${accentColor}`,
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      margin: "0 auto 12px auto",
    },
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={styles.header}>
        <h2 style={styles.title}>
          <Clock size={18} style={{ marginRight: "8px" }} />
          {buttonText}
        </h2>
      </div>
      <div style={styles.loadingState}>
        <div style={styles.loadingSpinner}></div>
        <p>Loading availability data...</p>
      </div>
    </div>
  );
};

export default MobileLoadingState;
