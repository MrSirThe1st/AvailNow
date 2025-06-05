// src/components/widgets/settings/BookingSettings.jsx
import React from "react";
import { Phone, MessageSquare, ExternalLink } from "lucide-react";

const BookingSettings = ({
  bookingType,
  contactInfo,
  customInstructions,
  onBookingTypeChange,
  onContactInfoChange,
  onCustomInstructionsChange,
}) => {
  const bookingOptions = [
    {
      id: "direct",
      name: "Direct Booking",
      description: "Allow clients to select and book time slots directly",
      icon: <ExternalLink size={20} />,
    },
    {
      id: "contact",
      name: "Contact to Book",
      description: "Show contact information for clients to reach out",
      icon: <Phone size={20} />,
    },
    {
      id: "custom",
      name: "Custom Instructions",
      description: "Display custom booking instructions",
      icon: <MessageSquare size={20} />,
    },
  ];

  const handleContactInfoChange = (field, value) => {
    onContactInfoChange({
      ...contactInfo,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Booking Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Booking Method
        </label>
        <div className="space-y-3">
          {bookingOptions.map((option) => (
            <div
              key={option.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                bookingType === option.id
                  ? "border-primary bg-primary bg-opacity-5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => onBookingTypeChange(option.id)}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      bookingType === option.id
                        ? "border-primary bg-primary"
                        : "border-gray-300"
                    }`}
                  >
                    {bookingType === option.id && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <span className="text-primary mr-2">{option.icon}</span>
                    <h4 className="text-sm font-medium text-gray-900">
                      {option.name}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Information (shown when bookingType is 'contact') */}
      {bookingType === "contact" && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Contact Information
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={contactInfo.phone || ""}
                onChange={(e) =>
                  handleContactInfoChange("phone", e.target.value)
                }
                placeholder="+1 (555) 123-4567"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={contactInfo.email || ""}
                onChange={(e) =>
                  handleContactInfoChange("email", e.target.value)
                }
                placeholder="appointments@yourcompany.com"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website/Booking URL
              </label>
              <input
                type="url"
                value={contactInfo.website || ""}
                onChange={(e) =>
                  handleContactInfoChange("website", e.target.value)
                }
                placeholder="https://yourcompany.com/book"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Message
              </label>
              <textarea
                value={contactInfo.message || ""}
                onChange={(e) =>
                  handleContactInfoChange("message", e.target.value)
                }
                placeholder="Call us to schedule your appointment or visit our website"
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Custom Instructions (shown when bookingType is 'custom') */}
      {bookingType === "custom" && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Custom Booking Instructions
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instructions Title
              </label>
              <input
                type="text"
                value={customInstructions.title || ""}
                onChange={(e) =>
                  onCustomInstructionsChange({
                    ...customInstructions,
                    title: e.target.value,
                  })
                }
                placeholder="How to Book Your Appointment"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instructions Text
              </label>
              <textarea
                value={customInstructions.message || ""}
                onChange={(e) =>
                  onCustomInstructionsChange({
                    ...customInstructions,
                    message: e.target.value,
                  })
                }
                placeholder="Enter your custom booking instructions here..."
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Action Button Text
              </label>
              <input
                type="text"
                value={customInstructions.buttonText || ""}
                onChange={(e) =>
                  onCustomInstructionsChange({
                    ...customInstructions,
                    buttonText: e.target.value,
                  })
                }
                placeholder="Contact Us"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Action URL (optional)
              </label>
              <input
                type="url"
                value={customInstructions.actionUrl || ""}
                onChange={(e) =>
                  onCustomInstructionsChange({
                    ...customInstructions,
                    actionUrl: e.target.value,
                  })
                }
                placeholder="https://yourcompany.com/contact"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Preview of what clients will see */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Preview</h4>
        <p className="text-sm text-blue-700">
          {bookingType === "direct" &&
            "Clients will be able to select and book available time slots directly."}
          {bookingType === "contact" &&
            "Clients will see your contact information and a 'Contact Us' button."}
          {bookingType === "custom" &&
            "Clients will see your custom instructions and action button."}
        </p>
      </div>
    </div>
  );
};

export default BookingSettings;
