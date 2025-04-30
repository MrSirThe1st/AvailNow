import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Calendar,
  Code,
  Settings,
  User,
  Bell,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../../context/SupabaseAuthContext";
// Import the color constants to match your color palette
const COLORS = {
  darkBlue: "#1B1d2a",
  purple: "#748efe",
  lightGray: "#e8ebed",
  white: "#ffffff",
};

const Navbar = ({ profile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const navItems = [
    { path: "/", label: "Dashboard", icon: <Home size={20} /> },
    { path: "/calendar", label: "Calendar", icon: <Calendar size={20} /> },
    { path: "/widget", label: "Widget", icon: <Code size={20} /> },
    { path: "/settings", label: "Settings", icon: <Settings size={20} /> },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest(".user-dropdown")) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and desktop navigation */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 rounded-md bg-purple text-white flex items-center justify-center mr-2">
                <Calendar size={18} />
              </div>
              <span className="font-bold text-lg text-darkBlue">AvailNow</span>
            </div>
            <div className="hidden md:ml-8 md:flex md:space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? "border-purple text-darkBlue"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop right navigation */}
          <div className="hidden md:flex md:items-center md:space-x-2">
            <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="relative user-dropdown">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center text-sm rounded-full focus:outline-none"
              >
                <span className="sr-only">Open user menu</span>
                {profile?.avatar_url ? (
                  <img
                    className="h-8 w-8 rounded-full"
                    src={profile.avatar_url}
                    alt={profile?.display_name || "User"}
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-purple text-white flex items-center justify-center">
                    <User size={18} />
                  </div>
                )}
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold">
                      {profile?.display_name || user?.email}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <Link
                    to="/account"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Account Settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-2 text-base font-medium ${
                  location.pathname === item.path
                    ? "bg-purple bg-opacity-10 text-purple"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              {profile?.avatar_url ? (
                <img
                  className="h-10 w-10 rounded-full"
                  src={profile.avatar_url}
                  alt={profile?.display_name || "User"}
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-purple text-white flex items-center justify-center">
                  <User size={20} />
                </div>
              )}
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">
                  {profile?.display_name || "User"}
                </div>
                <div className="text-sm font-medium text-gray-500">
                  {user?.email}
                </div>
              </div>
              <button className="ml-auto p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 relative">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
            <div className="mt-3 space-y-1">
              <Link
                to="/account"
                className="flex items-center px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                <User size={20} className="mr-3" />
                Account Settings
              </Link>
              <button
                onClick={handleSignOut}
                className="flex w-full items-center px-4 py-2 text-base font-medium text-red-600 hover:bg-gray-50"
              >
                <LogOut size={20} className="mr-3" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
