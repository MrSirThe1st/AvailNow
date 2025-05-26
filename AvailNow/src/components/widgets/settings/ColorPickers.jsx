import React from "react";

const ColorPickers = ({ accentColor, textColor, onColorChange }) => {
  return (
    <div className="space-y-4">
      {/* Accent Color */}
      <div>
        <label className="block text-sm font-medium mb-1">Accent Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={accentColor}
            onChange={(e) => onColorChange("accentColor", e.target.value)}
            className="h-10 w-10 border-none rounded cursor-pointer"
          />
          <input
            type="text"
            value={accentColor}
            onChange={(e) => onColorChange("accentColor", e.target.value)}
            className="flex-1 border rounded-md p-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="#0070f3"
          />
        </div>
      </div>

      {/* Text Color */}
      <div>
        <label className="block text-sm font-medium mb-1">Text Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={textColor}
            onChange={(e) => onColorChange("textColor", e.target.value)}
            className="h-10 w-10 border-none rounded cursor-pointer"
          />
          <input
            type="text"
            value={textColor}
            onChange={(e) => onColorChange("textColor", e.target.value)}
            className="flex-1 border rounded-md p-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="#333333"
          />
        </div>
      </div>
    </div>
  );
};

export default ColorPickers;
