// src/components/calendar/CalendarCarousel.jsx
import React from "react";
import { Trash2, Check, Plus } from "lucide-react";

const CalendarCarousel = ({
  connectedCalendars,
  activeCalendar,
  onToggleCalendar,
  onDeleteCalendar,
  onConnectCalendar,
}) => {
  const providers = [
    {
      id: "google",
      name: "Google",
      icon: (
        <svg viewBox="0 0 24 24" className="w-8 h-8">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      ),
      borderColor: "border-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      id: "outlook",
      name: "Outlook",
      icon: (
        <svg viewBox="0 0 24 24" className="w-8 h-8">
          <path
            fill="#0078D4"
            d="M23 12.004c0 6.623-5.377 12-12 12s-12-5.377-12-12 5.377-12 12-12 12 5.377 12 12z"
          />
          <path
            fill="white"
            d="M12.004 6.5c-3.036 0-5.5 2.464-5.5 5.5s2.464 5.5 5.5 5.5 5.5-2.464 5.5-5.5-2.464-5.5-5.5-5.5zm0 8.5c-1.654 0-3-1.346-3-3s1.346-3 3-3 3 1.346 3 3-1.346 3-3 3z"
          />
        </svg>
      ),
      borderColor: "border-indigo-500",
      bgColor: "bg-indigo-50",
    },
    {
      id: "apple",
      name: "Apple",
      icon: (
        <svg viewBox="0 0 24 24" className="w-8 h-8">
          <path
            fill="#A3A3A3"
            d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
          />
        </svg>
      ),
      borderColor: "border-gray-400",
      bgColor: "bg-gray-50",
      disabled: true,
    },
    {
      id: "calendly",
      name: "Calendly",
      icon: (
        <svg viewBox="0 0 24 24" className="w-8 h-8">
          <circle cx="12" cy="12" r="10" fill="#006BFF" />
          <path fill="white" d="M7 11h2v6H7zm4-4h2v10h-2zm4 2h2v8h-2z" />
        </svg>
      ),
      borderColor: "border-blue-400",
      bgColor: "bg-blue-50",
      disabled: true,
    },
    {
      id: "acuity",
      name: "Acuity",
      icon: (
        <svg viewBox="0 0 24 24" className="w-8 h-8">
          <circle cx="12" cy="12" r="10" fill="#FF6B35" />
          <path fill="white" d="M8 8h8l-2 8H6l2-8zm2 2v4h4V10H10z" />
        </svg>
      ),
      borderColor: "border-orange-500",
      bgColor: "bg-orange-50",
      disabled: true,
    },
    {
      id: "cal",
      name: "Cal.com",
      icon: (
        <svg viewBox="0 0 24 24" className="w-8 h-8">
          <rect x="3" y="3" width="18" height="18" rx="2" fill="#292929" />
          <path fill="white" d="M7 9h10v2H7zm0 4h10v2H7z" />
        </svg>
      ),
      borderColor: "border-gray-800",
      bgColor: "bg-gray-50",
      disabled: true,
    },
    {
      id: "hubspot",
      name: "HubSpot",
      icon: (
        <svg viewBox="0 0 24 24" className="w-8 h-8">
          <circle cx="12" cy="12" r="10" fill="#FF7A59" />
          <path
            fill="white"
            d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"
          />
        </svg>
      ),
      borderColor: "border-orange-400",
      bgColor: "bg-orange-50",
      disabled: true,
    },
  ];

  const isConnected = (id) =>
    connectedCalendars.some((cal) => cal.provider === id);
  const isActive = (id) => activeCalendar === id;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-center space-x-4 pb-2">
        {providers.map((provider) => {
          const connected = isConnected(provider.id);
          const active = isActive(provider.id);

          return (
            <div
              key={provider.id}
              className="flex flex-col items-center min-w-0"
            >
              <div className="relative group">
                {/* Main Circle */}
                <div
                  className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all duration-300 cursor-pointer ${
                    active
                      ? `${provider.borderColor} ${provider.bgColor} shadow-lg scale-110`
                      : connected
                        ? `${provider.borderColor} bg-white shadow-md`
                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                  } ${provider.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={() => {
                    if (!provider.disabled) {
                      if (connected) {
                        onToggleCalendar(provider.id);
                      } else {
                        onConnectCalendar();
                      }
                    }
                  }}
                >
                  {provider.icon}
                </div>

                {/* Active Indicator */}
                {active && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}

                {/* Connected but not active indicator */}
                {connected && !active && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full" />
                )}

                {/* Coming Soon Badge */}
                {provider.disabled && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-gray-600 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                    Soon
                  </div>
                )}

                {/* Delete Button (on hover for connected) */}
                {connected && !provider.disabled && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCalendar(provider.id);
                    }}
                    className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}

                {/* Plus Icon for unconnected */}
                {!connected && !provider.disabled && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-600 text-white rounded-full flex items-center justify-center">
                    <Plus className="w-3 h-3" />
                  </div>
                )}
              </div>

              {/* Label */}
              <span className="mt-2 text-sm font-medium text-gray-700">
                {provider.name}
              </span>

              {/* Status */}
              <span className="text-xs text-gray-500">
                {!connected ? "Connect" : active ? "Active" : "Connected"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-center mt-4 text-xs text-gray-500 space-x-4">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span>Active</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-yellow-400 rounded-full" />
          <span>Connected</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-gray-300 rounded-full" />
          <span>Available</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarCarousel;
