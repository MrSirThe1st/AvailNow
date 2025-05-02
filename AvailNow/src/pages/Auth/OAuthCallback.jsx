// src/pages/Auth/OAuthCallback.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Loader } from "lucide-react";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if this is a calendar OAuth callback or auth callback
        const callbackType = sessionStorage.getItem("oauth_callback_type");
        const isCalendarCallback = callbackType === "calendar";

        // If it's a calendar callback, just redirect to calendar page
        // The actual OAuth processing will happen there
        if (isCalendarCallback) {
          // Keep the URL params for processing in the Calendar component
          navigate("/calendar", { replace: false });
          return;
        }

        // Otherwise, this is a regular auth callback - process the auth
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (data?.session) {
          // Successfully authenticated
          navigate("/", { replace: true });
        } else {
          throw new Error("No session detected during OAuth callback");
        }
      } catch (err) {
        console.error("Error during OAuth callback:", err);
        setError(err.message || "Authentication failed");
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold text-primary mb-4">AvailNow</h2>

        {error ? (
          <>
            <div className="text-red-600 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="font-medium">Authentication Error</p>
            </div>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-gray-500">Redirecting you to login...</p>
          </>
        ) : (
          <>
            <Loader className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
            <p className="text-lg font-medium mb-2">
              Finalizing your authentication
            </p>
            <p className="text-gray-600">
              Please wait while we complete the process...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
