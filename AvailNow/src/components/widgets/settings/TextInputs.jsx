import React from "react";

const TextInputs = ({
  buttonText,
  providerName,
  providerAddress,
  onTextChange,
}) => {
  return (
    <div className="space-y-4">
      {/* Button text input */}
      <div>
        <label className="block text-sm font-medium mb-1">Button Text</label>
        <input
          type="text"
          value={buttonText}
          onChange={(e) => onTextChange("buttonText", e.target.value)}
          className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Check Availability"
        />
      </div>

      {/* Provider Name input */}
      <div>
        <label className="block text-sm font-medium mb-1">Provider Name</label>
        <input
          type="text"
          value={providerName}
          onChange={(e) => onTextChange("providerName", e.target.value)}
          className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Dr. Sarah Johnson"
        />
      </div>

      {/* Provider Address input */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Provider Address
        </label>
        <input
          type="text"
          value={providerAddress}
          onChange={(e) => onTextChange("providerAddress", e.target.value)}
          className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="123 Main St, City, ST 12345"
        />
      </div>
    </div>
  );
};

export default TextInputs;
