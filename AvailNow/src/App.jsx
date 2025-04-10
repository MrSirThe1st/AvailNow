import { useState } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

// Layouts
import Layout from "./components/layout/Layout";

// Pages
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Widget from "./pages/Widget";
import Settings from "./pages/Settings";
import Account from "./pages/Account";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";

function App() {
  const [user, setUser] = useState(null);

  // Simple auth check for protected routes
  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          index: true,
          element: (
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          ),
        },
        {
          path: "calendar",
          element: (
            <ProtectedRoute>
              <Calendar />
            </ProtectedRoute>
          ),
        },
        {
          path: "widget",
          element: (
            <ProtectedRoute>
              <Widget />
            </ProtectedRoute>
          ),
        },
        {
          path: "settings",
          element: (
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          ),
        },
        {
          path: "account",
          element: (
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          ),
        },
      ],
    },
    {
      path: "/login",
      element: <Login setUser={setUser} />,
    },
    {
      path: "/register",
      element: <Register setUser={setUser} />,
    },
    {
      path: "/forgot-password",
      element: <ForgotPassword />,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
