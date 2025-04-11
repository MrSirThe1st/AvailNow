// src/pages/WidgetTest.jsx
import React, { useState } from "react";
import EmbedWidget from "../components/widgets/EmbedWidget";

const WidgetTest = () => {
  const [settings, setSettings] = useState({
    userId: "test123",
    theme: "light",
    accentColor: "#0070f3",
    textColor: "#333333",
    buttonText: "Check Availability",
    showDays: 5,
    compact: false,
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Widget Test Page</h1>
      <div className="border p-4 rounded-md bg-gray-50">
        <EmbedWidget {...settings} />
      </div>
    </div>
  );
};

export default WidgetTest;
