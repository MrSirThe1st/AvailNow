import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
} from "@clerk/clerk-react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Firebase
import { auth } from "./lib/firebase";

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
import WidgetTest from "./pages/WidgetTest";

function App() {
  const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  // Protected route component using Clerk
  const ProtectedRoute = ({ children }) => {
    return (
      <>
        <SignedIn>{children}</SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </>
    );
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
          path: "/widget-test",
          element: <WidgetTest />,
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
  ]);

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      appearance={{
        elements: {
          rootBox: "mx-auto",
          card: "shadow-md rounded-md border border-gray-200",
          formButtonPrimary: "bg-primary hover:bg-primary-dark",
        },
      }}
    >
      <RouterProvider router={router} />
    </ClerkProvider>
  );
}

export default App;
