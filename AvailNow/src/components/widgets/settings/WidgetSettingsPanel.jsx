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
import BusinessHoursSettings from "./BusinessHoursSettings";
import BookingSettings from "./BookingSettings";

const WidgetSettingsPanel = ({
  settings,
  onSettingChange,
  previewMode,
  onPreviewModeChange,
  userId,
}) => {
  return (
    <div className="space-y-6">
      {/* Appearance Settings */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h3>

        <ThemeToggle
          theme={settings.theme}
          onToggle={() =>
            onSettingChange(
              "theme",
              settings.theme === "light" ? "dark" : "light"
            )
          }
        />

        <ProfileImageUpload
          currentImage={settings.companyLogo}
          onImageChange={(imageUrl) => onSettingChange("companyLogo", imageUrl)}
          userId={userId}
        />

        <ColorPresets
          currentColor={settings.accentColor}
          onPresetSelect={(preset) => {
            onSettingChange("accentColor", preset.primary);
            if (preset.secondary) {
              onSettingChange("secondaryColor", preset.secondary);
            }
          }}
        />

        <FontSelector
          selectedFont={settings.fontFamily}
          onFontChange={(font) => onSettingChange("fontFamily", font)}
        />

        <TextInputs
          buttonText={settings.buttonText}
          providerName={settings.providerName}
          providerAddress={settings.providerAddress}
          onTextChange={onSettingChange}
        />

        <NumberInputs
          showDays={settings.showDays}
          onNumberChange={onSettingChange}
        />

        <ColorPickers
          accentColor={settings.accentColor}
          textColor={settings.textColor}
          onColorChange={onSettingChange}
        />

        {previewMode && onPreviewModeChange && (
          <PreviewModeToggle
            previewMode={previewMode}
            onToggle={onPreviewModeChange}
          />
        )}
      </div>

      {/* Business Hours Settings */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Business Hours
        </h3>
        <BusinessHoursSettings
          businessHours={settings.businessHours}
          onBusinessHoursChange={(hours) =>
            onSettingChange("businessHours", hours)
          }
        />
      </div>

      {/* Booking Settings */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Booking Settings
        </h3>
        <BookingSettings
          bookingType={settings.bookingType}
          contactInfo={settings.contactInfo}
          customInstructions={settings.customInstructions}
          onBookingTypeChange={(type) => onSettingChange("bookingType", type)}
          onContactInfoChange={(info) => onSettingChange("contactInfo", info)}
          onCustomInstructionsChange={(instructions) =>
            onSettingChange("customInstructions", instructions)
          }
        />
      </div>
    </div>
  );
};

export default WidgetSettingsPanel;
