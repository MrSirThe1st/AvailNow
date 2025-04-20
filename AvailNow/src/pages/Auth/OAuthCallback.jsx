// src/components/auth/OAuthCallback.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Loader } from "lucide-react";
import { handleCalendarCallback } from "../../lib/calendarService";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [status, setStatus] = useState("processing");
  const [error, setError] = useState(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        setStatus("processing");

        // Log the complete URL for debugging
        console.log("OAuth Callback URL:", window.location.href);

        // Get URL parameters
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get("code");
        const state = searchParams.get("state");

        // Get provider from localStorage
        const provider = localStorage.getItem("calendarAuthProvider");

        console.log("OAuth Callback Parameters:", {
          code: code ? "PRESENT" : "NULL",
          state: state ? "PRESENT" : "NULL",
          provider,
        });

        if (!code || !state || !provider) {
          throw new Error("Missing required OAuth parameters");
        }

        if (!userId) {
          throw new Error("User not authenticated");
        }

        // Process the OAuth callback
        const result = await handleCalendarCallback(
          provider,
          { code, state },
          userId
        );

        // Store the result in sessionStorage for the calendar component
        sessionStorage.setItem(
          "oauth_callback_result",
          JSON.stringify({
            success: true,
            provider,
            calendars: result.calendars,
          })
        );

        // Clean up
        localStorage.removeItem("calendarAuthProvider");

        setStatus("success");

        // Redirect back to the calendar page after a short delay
        setTimeout(() => {
          navigate("/calendar", { replace: true });
        }, 1500);
      } catch (err) {
        console.error("Error processing OAuth callback:", err);
        setError(err.message || "Failed to connect calendar");
        setStatus("error");

        // Store the error for the calendar component
        sessionStorage.setItem(
          "oauth_callback_error",
          JSON.stringify({
            message: err.message || "Failed to connect calendar",
          })
        );

        // Redirect after error with a longer delay
        setTimeout(() => {
          navigate("/calendar", { replace: true });
        }, 3000);
      }
    };

    processCallback();
  }, [userId, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-xl font-bold mb-4">Calendar Connection</h1>

        {status === "processing" && (
          <>
            <Loader className="animate-spin h-12 w-12 mx-auto mb-4 text-primary" />
            <p>Processing your calendar connection...</p>
            <p className="text-sm text-gray-500 mt-2">
              Please wait, you'll be redirected automatically.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="h-12 w-12 rounded-full bg-green-100 text-green-500 flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-green-600 font-medium">
              Calendar connected successfully!
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Redirecting you back to calendar settings...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="h-12 w-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <p className="text-red-600 font-medium">Connection failed</p>
            <p className="text-sm text-gray-700 mt-2">{error}</p>
            <p className="text-sm text-gray-500 mt-4">
              Redirecting you back to calendar settings...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
