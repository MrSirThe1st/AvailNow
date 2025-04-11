import React, { useState } from "react";
import { X, Check, Calendar, User } from "lucide-react";

// This component handles the integration with external calendar services
const CalendarIntegration = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState("select"); // 'select', 'authorize', 'configure'
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [loading, setLoading] = useState(false);
  const [connectedCalendars, setConnectedCalendars] = useState([]);

  // Calendar provider options
  const calendarProviders = [
    {
      id: "google",
      name: "Google Calendar",
      icon: <Calendar className="text-red-500" />,
      color: "red-500",
    },
    {
      id: "outlook",
      name: "Microsoft Outlook",
      icon: <Calendar className="text-blue-500" />,
      color: "blue-500",
    },
    {
      id: "apple",
      name: "Apple Calendar",
      icon: <Calendar className="text-gray-500" />,
      color: "gray-500",
    },
    {
      id: "calendly",
      name: "Calendly",
      icon: <Calendar className="text-green-500" />,
      color: "green-500",
    },
  ];

  // Mock function to authorize with the selected provider
  const authorizeWithProvider = (provider) => {
    setLoading(true);

    // In a real implementation, you would:
    // 1. Redirect to the provider's OAuth authorization endpoint
    // 2. Handle the OAuth callback and token exchange
    // 3. Store the access token for future API calls

    // For demonstration, simulate an OAuth flow with a timeout
    setTimeout(() => {
      setLoading(false);
      setStep("configure");

      // Mock fetch of available calendars
      const mockCalendars = [
        {
          id: "cal1",
          name: "Work Calendar",
          email: "user@example.com",
          selected: true,
        },
        {
          id: "cal2",
          name: "Personal Calendar",
          email: "user@gmail.com",
          selected: false,
        },
      ];

      setConnectedCalendars(mockCalendars);
    }, 1500);
  };

  // Toggle calendar selection
  const toggleCalendarSelection = (calendarId) => {
    setConnectedCalendars(
      connectedCalendars.map((cal) =>
        cal.id === calendarId ? { ...cal, selected: !cal.selected } : cal
      )
    );
  };

  // Finish the integration process
  const finishIntegration = () => {
    // Filter only selected calendars
    const selectedCalendars = connectedCalendars.filter((cal) => cal.selected);

    // Call the success callback with the selected calendars
    onSuccess(
      selectedCalendars.map((cal) => ({
        ...cal,
        provider: selectedProvider.id,
        color: selectedProvider.color,
      }))
    );
  };

  // Render the provider selection step
  const renderSelectStep = () => (
    <div>
      <h2 className="text-lg font-semibold mb-4">Choose Calendar Provider</h2>

      <div className="grid grid-cols-2 gap-4">
        {calendarProviders.map((provider) => (
          <button
            key={provider.id}
            className={`border rounded-lg p-4 flex items-center hover:border-primary
              ${selectedProvider?.id === provider.id ? "border-primary bg-primary bg-opacity-5" : "border-gray-200"}
            `}
            onClick={() => setSelectedProvider(provider)}
          >
            <div className="flex-shrink-0 mr-3">{provider.icon}</div>
            <div className="text-left">
              <p className="font-medium">{provider.name}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md mr-3"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 bg-primary text-white rounded-md"
          disabled={!selectedProvider || loading}
          onClick={() => setStep("authorize")}
        >
          Continue
        </button>
      </div>
    </div>
  );

  // Render the authorization step
  const renderAuthorizeStep = () => (
    <div>
      <h2 className="text-lg font-semibold mb-4">
        Connect to {selectedProvider.name}
      </h2>

      <div className="border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center">
          <div className="mr-4 p-2 bg-gray-100 rounded-full">
            {selectedProvider.icon}
          </div>

          <div>
            <h3 className="font-medium">{selectedProvider.name}</h3>
            <p className="text-sm text-gray-500">
              Connect your account to sync with your existing calendar
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 text-blue-700 rounded-md text-sm">
          <p>
            <strong>Note:</strong> AvailNow will only read your calendar to
            check for busy times. We don't save or store your appointments or
            modify your calendar.
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md mr-3"
          onClick={() => setStep("select")}
          disabled={loading}
        >
          Back
        </button>
        <button
          className="px-4 py-2 bg-primary text-white rounded-md flex items-center"
          onClick={() => authorizeWithProvider(selectedProvider)}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="mr-2">Connecting...</span>
              <div className="animate-spin w-4 h-4 border-2 border-white border-opacity-50 border-t-white rounded-full"></div>
            </>
          ) : (
            <>Connect to {selectedProvider.name}</>
          )}
        </button>
      </div>
    </div>
  );

  // Render the calendar configuration step
  const renderConfigureStep = () => (
    <div>
      <h2 className="text-lg font-semibold mb-4">Select Calendars to Sync</h2>

      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-4">
          Choose which calendars to check for busy times. AvailNow will mark
          times as unavailable if you have events on these calendars.
        </p>

        <div className="space-y-3">
          {connectedCalendars.map((calendar) => (
            <div
              key={calendar.id}
              className="flex items-center justify-between p-3 border rounded-md hover:border-primary"
            >
              <div className="flex items-center">
                <div className="mr-3">
                  <User size={18} className="text-gray-600" />
                </div>
                <div>
                  <p className="font-medium">{calendar.name}</p>
                  <p className="text-xs text-gray-500">{calendar.email}</p>
                </div>
              </div>

              <div>
                <button
                  className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    calendar.selected
                      ? "bg-primary text-white"
                      : "border border-gray-300"
                  }`}
                  onClick={() => toggleCalendarSelection(calendar.id)}
                >
                  {calendar.selected && <Check size={12} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md mr-3"
          onClick={() => setStep("authorize")}
        >
          Back
        </button>
        <button
          className="px-4 py-2 bg-primary text-white rounded-md"
          onClick={finishIntegration}
          disabled={!connectedCalendars.some((cal) => cal.selected)}
        >
          Finish Integration
        </button>
      </div>
    </div>
  );


  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Calendar Integration</h2>
        <button className="text-gray-400 hover:text-gray-600" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      {step === "select" && renderSelectStep()}
      {step === "authorize" && renderAuthorizeStep()}
      {step === "configure" && renderConfigureStep()}
    </div>
  );
};

export default CalendarIntegration;
