import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/SupabaseAuthContext";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { updatePassword, user } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    // The user should be authenticated after clicking the reset link in the email
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { error } = await updatePassword(password);
      if (error) throw error;
      setMessage("Password updated successfully!");

      // Redirect to home after a short delay
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Password update error:", error);
      setError(error.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="p-8 text-center">Redirecting to login...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary">AvailNow</h2>
          <h3 className="mt-2 text-xl">Set New Password</h3>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md">{error}</div>
        )}

        {message && (
          <div className="bg-green-50 text-green-700 p-3 rounded-md">
            {message}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              New Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || message}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            <Link to="/" className="text-primary hover:underline">
              Return to Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
