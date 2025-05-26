import React from "react";

const ColorPresets = ({ currentColor, onPresetSelect }) => {
  const colorPresets = [
    { primary: "#FF5F1F", secondary: "#5928E5" }, // Orange-Purple
    { primary: "#FF69B4", secondary: "#00CED1" }, // Pink-Turquoise
    { primary: "#2ECC71", secondary: "#3498DB" }, // Green-Blue
    { primary: "#3498DB", secondary: "#F39C12" }, // Blue-Orange
    { primary: "#27AE60", secondary: "#E74C3C" }, // Green-Red
    { primary: "#8E44AD", secondary: "#D35400" }, // Purple-Brown
  ];

  return (
    <div>
      <div className="mb-2 p-2 rounded bg-gray-800 text-white text-xs font-medium inline-block">
        Presets
      </div>
      <div className="grid grid-cols-3 gap-3">
        {colorPresets.map((preset, index) => (
          <div
            key={index}
            className={`w-16 h-16 rounded-lg bg-white p-2 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary transition-all ${
              currentColor === preset.primary ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => onPresetSelect(preset)}
          >
            <div className="w-10 h-10 rounded-full relative overflow-hidden">
              <div
                className="absolute inset-0 left-1/2 bg-gradient-to-r"
                style={{
                  background: `linear-gradient(to right, ${preset.primary} 50%, ${preset.secondary} 50%)`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorPresets;
