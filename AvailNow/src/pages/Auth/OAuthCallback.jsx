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
        // Process the OAuth callback
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (data?.session) {
          // Store a flag in sessionStorage to indicate which callback is being processed
          const previousCallback = sessionStorage.getItem(
            "oauth_callback_type"
          );

          if (previousCallback === "calendar") {
            navigate("/calendar", { replace: true });
          } else {
            navigate("/", { replace: true });
          }
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
