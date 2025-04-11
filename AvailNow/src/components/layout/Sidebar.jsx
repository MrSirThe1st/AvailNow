import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Calendar,
  Layout as LayoutIcon,
  Settings,
  LogOut,
} from "lucide-react";
import { useClerk } from "@clerk/clerk-react";

const Sidebar = () => {
  const location = useLocation();
  const { signOut } = useClerk();
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

  const handleTest = async () => {
    navigate("/widget-test");
  };


  return (
    <div className="h-full w-64 border-r border-gray-200 p-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-primary">AvailNow</h2>
      </div>
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
        <div className="pt-6 mt-auto">
          <button
            onClick={handleTest}
            className="flex items-center px-4 py-3 rounded-md w-full text-left text-red-600 hover:bg-red-50 transition-colors"
          >
            <span className="mr-3">
            </span>
            <span>test</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
