import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { SupabaseAuthProvider } from "./context/SupabaseAuthContext";
import { CalendarProvider } from "./context/CalendarContext";
// Layouts
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./pages/Auth/ProtectedRoute";

// Pages
import Billing from "./pages/Billing";
import Calendar from "./pages/Calendar";
import Widget from "./pages/Widget";
import Settings from "./pages/Settings";
import Account from "./pages/Account";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import OAuthCallback from "./pages/Auth/OAuthCallback";
import Home from "./pages/Home";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <ProtectedRoute />,
      children: [
        {
          element: <Layout />,
          children: [
            {
              index: true,
              element: <Home />,
            },
            {
              path: "calendar",
              element: <Calendar />,
            },
            {
              path: "widget",
              element: <Widget />,
            },
            {
              path: "settings",
              element: <Settings />,
            },
            {
              path: "account",
              element: <Account />,
            },
            {
              path: "billing",
              element: <Billing />,
            },
          ],
        },
      ],
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/forgot-password",
      element: <ForgotPassword />,
    },
    {
      path: "/reset-password",
      element: <ResetPassword />,
    },
    {
      // Auth callback route for OAuth providers
      path: "/auth/callback",
      element: <OAuthCallback />,
    },
  ]);

  return (
    <SupabaseAuthProvider>
      <CalendarProvider>
        <RouterProvider router={router} />
      </CalendarProvider>
    </SupabaseAuthProvider>
  );
}

export default App;
