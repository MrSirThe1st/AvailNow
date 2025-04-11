// import React from "react";
// import EmbedWidget from "../components/widgets/EmbedWidget";

// const WidgetPreview = () => {
//   // Get parameters from URL query string
//   const params = new URLSearchParams(window.location.search);
//   const userId = params.get("userId") || "demo123";
//   const theme = params.get("theme") || "light";
//   const accentColor = params.get("accentColor") || "#0070f3";
//   const textColor = params.get("textColor") || "#333333";
//   const buttonText = params.get("buttonText") || "Check Availability";
//   const showDays = parseInt(params.get("showDays") || "5");
//   const compact = params.get("compact") === "true";

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
//       <EmbedWidget
//         userId={userId}
//         theme={theme}
//         accentColor={accentColor}
//         textColor={textColor}
//         buttonText={buttonText}
//         showDays={showDays}
//         compact={compact}
//       />
//     </div>
//   );
// };

// export default WidgetPreview;
