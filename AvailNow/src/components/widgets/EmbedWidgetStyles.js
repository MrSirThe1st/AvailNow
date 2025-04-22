// Styles for EmbedWidget component
export const createStyles = (theme, accentColor, textColor, compact) => {
  return {
    // Widget outer container style
    container: {
      fontFamily: "'Inter', system-ui, sans-serif",
      backgroundColor: theme === "light" ? "#FFFFFF" : "#1F2937",
      color: theme === "light" ? textColor : "#F3F4F6",
      borderRadius: "8px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      border: `1px solid ${theme === "light" ? "#E5E7EB" : "#374151"}`,
      overflow: "hidden",
      maxWidth: compact ? "700px" : "800px",
      width: "100%",
      margin: "0 auto",
    },
    
    // Header style
    header: {
      backgroundColor: "#FFFFFF",
      borderBottom: `1px solid ${theme === "light" ? "#E5E7EB" : "#374151"}`,
      padding: compact ? "12px 16px" : "16px 20px",
    },
    
    // Header title container
    headerTitleContainer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "10px",
    },
    
    // Header title
    headerTitle: {
      margin: 0,
      fontSize: "20px",
      fontWeight: "bold",
      color: textColor,
    },
    
    // Next available badge
    nextAvailableBadge: {
      backgroundColor: "#ECFDF5",
      color: "#047857",
      fontSize: "14px",
      padding: "4px 12px",
      borderRadius: "9999px",
      display: "flex",
      alignItems: "center",
    },
    
    // Provider info container
    providerInfo: {
      display: "flex",
      alignItems: "center",
    },
    
    // Provider image
    providerImage: {
      width: "48px",
      height: "48px",
      borderRadius: "50%",
      objectFit: "cover",
      marginRight: "12px",
    },
    
    // Provider name
    providerName: {
      margin: 0,
      fontWeight: "500",
      color: textColor,
    },
    
    // Provider address
    providerAddress: {
      margin: "4px 0 0 0",
      fontSize: "14px",
      color: "#6B7280",
      display: "flex",
      alignItems: "center",
    },
    
    // Main content container - side by side layout
    contentContainer: {
      display: "flex",
      flexDirection: compact ? "column" : "row",
    },
    
    // Calendar section
    calendarSection: {
      flex: "1",
      padding: "16px",
      borderRight: compact ? "none" : `1px solid ${theme === "light" ? "#E5E7EB" : "#374151"}`,
      borderBottom: compact ? `1px solid ${theme === "light" ? "#E5E7EB" : "#374151"}` : "none",
    },
    
    // Month navigation
    monthNav: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "16px",
    },
    
    // Month nav button
    monthNavButton: {
      background: "transparent",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      padding: "4px",
      color: accentColor,
    },
    
    // Month title
    monthTitle: {
      margin: 0,
      fontWeight: "500",
      fontSize: "16px",
      color: theme === "light" ? textColor : "#F3F4F6",
    },
    
    // Loading spinner
    loadingSpinner: {
      display: "flex",
      justifyContent: "center",
      padding: "32px",
    },
    
    // Spinner animation
    spinner: {
      border: "3px solid #F3F4F6",
      borderTop: `3px solid ${accentColor}`,
      borderRadius: "50%",
      width: "24px",
      height: "24px",
      animation: "spin 1s linear infinite",
    },
    
    // Day headers grid
    dayHeadersGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(7, 1fr)",
      textAlign: "center",
      marginBottom: "10px",
    },
    
    // Day header
    dayHeader: {
      fontSize: "0.875rem",
      fontWeight: "500",
      color: theme === "light" ? "#6B7280" : "#9CA3AF",
    },
    
    // Calendar grid
    calendarGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(7, 1fr)",
      gap: "4px",
    },
    
    // Date cell
    dateCell: (isSelected, hasAvailability, isInMonth) => ({
      position: "relative",
      height: "36px",
      width: "36px",
      padding: "2px",
      textAlign: "center",
      cursor: hasAvailability ? "pointer" : "default",
      opacity: hasAvailability ? 1 : 0.5,
      backgroundColor: isSelected
        ? theme === "light" ? "#EBF5FF" : "#1E3A8A"
        : "transparent",
      borderRadius: "0px", // Remove border radius for square corners
      border: isSelected ? `1px solid ${accentColor}` : "none", // Remove default border
    }),
    
    // Date number
    dateNumber: (isSelected, isInMonth) => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      fontWeight: isSelected ? "bold" : "normal",
      color: !isInMonth
        ? theme === "light" ? "#9CA3AF" : "#6B7280"
        : isSelected ? accentColor : theme === "light" ? textColor : "#F3F4F6",
    }),
    
    // Time slots section
    timeSlotsSection: {
      flex: "1",
      padding: "16px",
    },
    
    // Time slots header
    timeSlotsHeader: {
      display: "flex",
      alignItems: "center",
      marginBottom: "16px",
    },
    
    // Time slots icon
    timeSlotsIcon: {
      marginRight: "8px",
      color: theme === "light" ? "#6B7280" : "#9CA3AF",
    },
    
    // Time slots title
    timeSlotsTitle: {
      margin: 0,
      fontWeight: "500",
      fontSize: "16px",
      color: theme === "light" ? textColor : "#F3F4F6",
    },
    
    // Selected date title
    selectedDateTitle: {
      fontSize: "1.125rem",
      fontWeight: "500",
      marginBottom: "12px",
      color: theme === "light" ? textColor : "#F3F4F6",
    },
    
    // Time slots empty state
    timeSlotsEmpty: {
      textAlign: "center",
      padding: "16px",
      color: theme === "light" ? "#6B7280" : "#9CA3AF",
    },
    
    // Section title
    sectionTitle: {
      fontSize: "0.875rem",
      fontWeight: "500",
      marginBottom: "8px",
      color: theme === "light" ? "#6B7280" : "#9CA3AF",
    },
    
    // Time slots grid
    timeSlotsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "8px",
      marginBottom: "16px",
    },
    
    // Time slot
    timeSlot: (isAvailable) => ({
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "8px",
      borderRadius: "8px",
      cursor: isAvailable ? "pointer" : "not-allowed",
      opacity: isAvailable ? 1 : 0.5,
      transition: "background-color 0.2s",
      backgroundColor: isAvailable && theme === "light" ? "#F3F4F6" : "transparent",
      "&:hover": {
        backgroundColor: isAvailable && theme === "light" ? "#E5E7EB" : "transparent",
      },
    }),
    
    // Time slot dot
    timeSlotDot: (isAvailable) => ({
      width: "12px",
      height: "12px",
      borderRadius: "50%",
      marginBottom: "4px",
      backgroundColor: isAvailable ? "#10B981" : "#D1D5DB",
    }),
    
    // Time slot text
    timeSlotText: {
      fontSize: "0.875rem",
      color: theme === "light" ? textColor : "#F3F4F6",
    },
    
    // Book button container
    bookButtonContainer: {
      marginTop: "24px",
    },
    
    // Book button
    bookButton: {
      width: "100%",
      padding: "10px",
      backgroundColor: accentColor,
      color: "#FFFFFF",
      border: "none",
      borderRadius: "6px",
      fontWeight: "200",
      cursor: "pointer",
      transition: "background-color 0.2s",
      "&:hover": {
        backgroundColor: "#0062cc",
      },
    },
    
    // Footer
    footer: {
      borderTop: `1px solid ${theme === "light" ? "#E5E7EB" : "#374151"}`,
      padding: "12px",
      textAlign: "center",
      fontSize: "12px",
      color: theme === "light" ? "#6B7280" : "#9CA3AF",
    },
    
    // Footer link
    footerLink: {
      color: accentColor,
      textDecoration: "none",
    },
    
    // Availability indicator circle
    availabilityCircle: {
      position: "absolute",
      top: "50%",
      left: "50%",
      width: "32px",
      height: "32px",
      transform: "translate(-50%, -50%)",
      borderRadius: "50%",
    },
    
    // Availability indicator dash
    availabilityDash: (angle, isAvailable) => ({
      position: "absolute",
      top: "50%",
      left: "50%",
      width: "2px",
      height: "5px",
      backgroundColor: isAvailable ? "#10B981" : "#D1D5DB",
      borderRadius: "1px",
      transformOrigin: "0 0",
      transform: `translate(16px, 0) rotate(${angle}rad)`,
    }),
  };
};