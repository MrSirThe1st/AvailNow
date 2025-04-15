import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { useClerkUser } from "../../hooks/useClerkUser";

const Layout = () => {
  const { firebaseUser, loading } = useClerkUser();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 bg-gray-50">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <Outlet context={{ firebaseUser }} />
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
