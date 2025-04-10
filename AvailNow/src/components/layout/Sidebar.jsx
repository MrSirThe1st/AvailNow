import { Link, useLocation } from "react-router-dom";
import { Home, Calendar, Layout as LayoutIcon, Settings } from "lucide-react";

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: <Home size={20} /> },
    { path: "/calendar", label: "Calendar", icon: <Calendar size={20} /> },
    { path: "/widget", label: "Widget", icon: <LayoutIcon size={20} /> },
    { path: "/settings", label: "Settings", icon: <Settings size={20} /> },
  ];

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
      </nav>
    </div>
  );
};

export default Sidebar;
