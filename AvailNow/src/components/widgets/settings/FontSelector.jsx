import React from "react";

const FontSelector = ({ selectedFont, onFontChange }) => {
  const fontOptions = [
    { name: "Public Sans", preview: "Aa", class: "font-sans" },
    { name: "Inter", preview: "Aa", class: "font-serif" },
    { name: "DM Sans", preview: "Aa", class: "font-mono" },
    { name: "Nunito Sans", preview: "Aa", class: "font-mono" },
  ];

  return (
    <div>
      <div className="mb-2 p-2 rounded bg-gray-800 text-white text-xs font-medium inline-block">
        Font
      </div>
      <div className="mt-2">
        <p className="text-xs text-gray-500 mb-2">Family</p>
        <div className="grid grid-cols-2 gap-3">
          {fontOptions.map((font) => (
            <div
              key={font.name}
              className={`p-3 rounded-lg flex flex-col items-center cursor-pointer hover:bg-gray-100 transition-colors ${
                selectedFont === font.name
                  ? "bg-gray-100 ring-1 ring-primary"
                  : "bg-white"
              }`}
              onClick={() => onFontChange(font.name)}
            >
              <span
                className={`text-xl ${font.class} ${
                  selectedFont === font.name ? "text-primary" : "text-gray-400"
                }`}
              >
                {font.preview}
              </span>
              <span className="text-xs mt-2">{font.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FontSelector;
