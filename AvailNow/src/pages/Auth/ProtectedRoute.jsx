import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/SupabaseAuthContext";
import { Loader } from "lucide-react";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
