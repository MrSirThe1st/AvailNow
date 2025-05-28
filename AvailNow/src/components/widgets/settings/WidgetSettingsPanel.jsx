// src/components/widgets/settings/WidgetSettingsPanel.jsx
import React from "react";
import ThemeToggle from "./ThemeToggle";
import ColorPresets from "./ColorPresets";
import FontSelector from "./FontSelector";
import TextInputs from "./TextInputs";
import NumberInputs from "./NumberInputs";
import ColorPickers from "./ColorPickers";
import PreviewModeToggle from "./PreviewModeToggle";
import ProfileImageUpload from "../../settings/ProfileImageUpload";

const WidgetSettingsPanel = ({
  settings,
  onSettingChange,
  previewMode,
  onPreviewModeChange,
  userId,
}) => {
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

      {/* Company Logo Upload */}
      <ProfileImageUpload
        currentImage={settings.companyLogo}
        onImageChange={(imageUrl) => onSettingChange("companyLogo", imageUrl)}
        userId={userId}
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

      {/* Preview Mode Toggle */}
      {previewMode && onPreviewModeChange && (
        <PreviewModeToggle
          previewMode={previewMode}
          onToggle={onPreviewModeChange}
        />
      )}
    </div>
  );
};

export default WidgetSettingsPanel;