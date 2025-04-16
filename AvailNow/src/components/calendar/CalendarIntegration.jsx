import React, { useState, useEffect } from "react";
import { X, Check, Calendar, User, Loader, AlertTriangle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useClerkUser } from "../../hooks/useClerkUser";
import {
  CALENDAR_PROVIDERS,
  initiateCalendarAuth,
  handleCalendarCallback,
  saveSelectedCalendars,
} from "../../lib/calendarService";

const CalendarIntegration = ({ onClose, onSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, supabaseClient } = useClerkUser();

  const [step, setStep] = useState("select");
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectedCalendars, setConnectedCalendars] = useState([]);

  // Calendar provider options
  const calendarProviders = [
    {
      id: CALENDAR_PROVIDERS.GOOGLE,
      name: "Google Calendar",
      icon: <Calendar className="text-red-500" />,
      color: "red-500",
    },
    {
      id: CALENDAR_PROVIDERS.OUTLOOK,
      name: "Microsoft Outlook",
      icon: <Calendar className="text-blue-500" />,
      color: "blue-500",
    },
    {
      id: CALENDAR_PROVIDERS.APPLE,
      name: "Apple Calendar",
      icon: <Calendar className="text-gray-500" />,
      color: "gray-500",
    },
    {
      id: CALENDAR_PROVIDERS.CALENDLY,
      name: "Calendly",
      icon: <Calendar className="text-green-500" />,
      color: "green-500",
    },
  ];

  // Check for OAuth callback parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const provider = localStorage.getItem("calendarAuthProvider");

    if (code && state && provider && user) {
      processOAuthCallback(provider, { code, state });
    }

    // Clean up URL
    if (code || state) {
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate, user]);

  const processOAuthCallback = async (provider, params) => {
    try {
      setLoading(true);
      setError(null);

      const providerObj = calendarProviders.find((p) => p.id === provider);
      setSelectedProvider(providerObj);

      const result = await handleCalendarCallback(provider, params, user.id);

      const calendarsWithSelection = result.calendars.map((cal) => ({
        ...cal,
        selected: true,
      }));
      setConnectedCalendars(calendarsWithSelection);

      setStep("configure");
      localStorage.removeItem("calendarAuthProvider");
    } catch (err) {
      console.error("Error processing OAuth callback:", err);
      setError("Failed to connect to calendar service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const finishIntegration = async () => {
    try {
      setLoading(true);
      setError(null);

      const selectedCalendars = connectedCalendars.filter(
        (cal) => cal.selected
      );

      // Save the selected calendars
      await saveSelectedCalendars(user.id, selectedCalendars);

      const enrichedCalendars = selectedCalendars.map((cal) => ({
        ...cal,
        provider: selectedProvider.id,
        color: selectedProvider.color,
      }));

      onSuccess(enrichedCalendars);
      onClose();
    } catch (err) {
      console.error("Error saving selected calendars:", err);
      setError("Failed to save calendar selections. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const authorizeWithProvider = (provider) => {
    try {
      setLoading(true);
      setError(null);

      localStorage.setItem("calendarAuthProvider", provider.id);
      const authUrl = initiateCalendarAuth(provider.id);
      window.location.href = authUrl;
    } catch (err) {
      console.error("Error initiating authorization:", err);
      setError(`Failed to connect to ${provider.name}. ${err.message}`);
      setLoading(false);
    }
  };

  const toggleCalendarSelection = (calendarId) => {
    setConnectedCalendars(
      connectedCalendars.map((cal) =>
        cal.id === calendarId ? { ...cal, selected: !cal.selected } : cal
      )
    );
  };

  // Render functions for each step
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
          className="px-4 py-2 bg-primary text-white rounded-md flex items-center"
          disabled={!selectedProvider || loading}
          onClick={() => setStep("authorize")}
        >
          Continue
        </button>
      </div>
    </div>
  );

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

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md text-sm flex">
          <AlertTriangle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

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
              <Loader size={16} className="animate-spin" />
            </>
          ) : (
            <>Connect to {selectedProvider.name}</>
          )}
        </button>
      </div>
    </div>
  );

  const renderConfigureStep = () => (
    <div>
      <h2 className="text-lg font-semibold mb-4">Select Calendars to Sync</h2>

      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-4">
          Choose which calendars to check for busy times. AvailNow will mark
          times as unavailable if you have events on these calendars.
        </p>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md text-sm flex">
            <AlertTriangle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <Loader size={24} className="animate-spin mx-auto mb-2" />
            <p>Loading your calendars...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {connectedCalendars.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-md">
                <p>No calendars found for this account.</p>
              </div>
            ) : (
              connectedCalendars.map((calendar) => (
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
                      <p className="text-xs text-gray-500">
                        {calendar.email || calendar.id}
                      </p>
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
              ))
            )}
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md mr-3"
          onClick={() => setStep("authorize")}
          disabled={loading}
        >
          Back
        </button>
        <button
          className="px-4 py-2 bg-primary text-white rounded-md flex items-center"
          onClick={finishIntegration}
          disabled={loading || !connectedCalendars.some((cal) => cal.selected)}
        >
          {loading ? (
            <>
              <span className="mr-2">Saving...</span>
              <Loader size={16} className="animate-spin" />
            </>
          ) : (
            <>Finish Integration</>
          )}
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
