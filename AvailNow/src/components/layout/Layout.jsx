// src/components/layout/Layout.jsx
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { useClerkUser } from "../../hooks/useClerkUser";

const Layout = () => {
  const { user, supabaseClient, loading } = useClerkUser();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Outlet context={{ user, supabaseClient }} />
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
