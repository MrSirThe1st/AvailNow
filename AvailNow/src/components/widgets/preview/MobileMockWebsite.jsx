// src/components/widgets/preview/MobileMockWebsite.jsx
import React from "react";

const MobileMockWebsite = () => {
  return (
    <div
      className="min-h-full bg-white text-gray-800 font-sans"
      style={{
        maxWidth: "100%",
        margin: "0 auto",
        height: "100vh",
        overflow: "auto",
        position: "relative",
      }}
    >
      {/* Mobile Header */}
      <div className="bg-white p-4 shadow-sm flex flex-col items-center">
        <div className="h-10 w-32 bg-blue-600 rounded-md flex items-center justify-center text-white mb-2">
          LOGO
        </div>
        <h1 className="text-xl font-bold">Website Title</h1>
      </div>

      {/* Mobile Content */}
      <div className="p-4 space-y-3">
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>

        <div className="h-40 bg-gray-200 rounded-md w-full flex items-center justify-center mt-4 mb-4 text-gray-500">
          Content Image
        </div>

        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-4/5"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
      </div>

      {/* This div ensures enough height for scrolling */}
      <div className="min-h-[300px]"></div>
    </div>
  );
};

export default MobileMockWebsite;
