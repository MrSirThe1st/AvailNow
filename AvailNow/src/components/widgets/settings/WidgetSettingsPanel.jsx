import React from "react";
import ThemeToggle from "./ThemeToggle";
import ColorPresets from "./ColorPresets";
import FontSelector from "./FontSelector";
import TextInputs from "./TextInputs";
import NumberInputs from "./NumberInputs";
import ColorPickers from "./ColorPickers";

const WidgetSettingsPanel = ({ settings, onSettingChange }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-6">
      {/* Theme Toggle */}
      <ThemeToggle
        theme={settings.theme}
        onToggle={() =>
          onSettingChange(
            "theme",
            settings.theme === "light" ? "dark" : "light"
          )
        }
      />

      {/* Color Presets */}
      <ColorPresets
        currentColor={settings.accentColor}
        onPresetSelect={(preset) => {
          onSettingChange("accentColor", preset.primary);
          if (preset.secondary) {
            onSettingChange("secondaryColor", preset.secondary);
          }
        }}
      />

      {/* Font Selector */}
      <FontSelector
        selectedFont={settings.fontFamily}
        onFontChange={(font) => onSettingChange("fontFamily", font)}
      />

      {/* Text Inputs */}
      <TextInputs
        buttonText={settings.buttonText}
        providerName={settings.providerName}
        providerAddress={settings.providerAddress}
        onTextChange={onSettingChange}
      />

      {/* Number Inputs */}
      <NumberInputs
        showDays={settings.showDays}
        onNumberChange={onSettingChange}
      />

      {/* Color Pickers */}
      <ColorPickers
        accentColor={settings.accentColor}
        textColor={settings.textColor}
        onColorChange={onSettingChange}
      />
    </div>
  );
};

export default WidgetSettingsPanel;
