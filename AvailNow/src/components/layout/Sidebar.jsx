import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Calendar,
  Layout as LayoutIcon,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/SupabaseAuthContext";

const Sidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { path: "/", label: "Dashboard", icon: <Home size={20} /> },
    { path: "/calendar", label: "Calendar", icon: <Calendar size={20} /> },
    { path: "/widget", label: "Widget", icon: <LayoutIcon size={20} /> },
    { path: "/settings", label: "Settings", icon: <Settings size={20} /> },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="h-full w-64 border-r border-gray-200 p-4">
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-4 py-3 rounded-md transition-colors ${
              location.pathname === item.path
                ? "bg-primary text-white"
                : "hover:bg-gray-100"
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
        <div className="pt-6 mt-auto">
          <button
            onClick={handleSignOut}
            className="flex items-center px-4 py-3 rounded-md w-full text-left text-red-600 hover:bg-red-50 transition-colors"
          >
            <span className="mr-3">
              <LogOut size={20} />
            </span>
            <span>Sign Out</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
