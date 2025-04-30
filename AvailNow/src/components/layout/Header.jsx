import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Settings, User, LogOut, Menu } from "lucide-react";
import { useAuth } from "../../context/SupabaseAuthContext";
import { useNavigate } from "react-router-dom";

const Header = ({ profile }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <header className="h-16 px-6 py-0 bg-white border-b border-gray-200 flex items-center justify-between z-20 w-full">
      <div className="flex items-center">
        {/* Mobile menu button */}
        <button
          className="mr-4 p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 md:hidden"
          onClick={toggleMobileMenu}
        >
          <Menu size={24} />
        </button>

        <Link to="/" className="text-xl font-bold text-primary">
          AvailNow
        </Link>
      </div>

      <div className="flex items-center space-x-1 md:space-x-4">
        {/* Mobile: Show only user icon */}
        <div className="flex md:hidden">
          <button
            onClick={toggleDropdown}
            className="p-2 rounded-full hover:bg-gray-100 relative"
          >
            <User size={20} />
            {showDropdown && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200 z-50">
                <Link
                  to="/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowDropdown(false)}
                >
                  Settings
                </Link>
                <Link
                  to="/account"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowDropdown(false)}
                >
                  Account
                </Link>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    handleSignOut();
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            )}
          </button>
        </div>

        {/* Desktop: Show all icons */}
        <div className="hidden md:flex items-center space-x-4">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <Bell size={20} />
          </button>
          <Link to="/settings" className="p-2 rounded-full hover:bg-gray-100">
            <Settings size={20} />
          </Link>
          <Link to="/account" className="p-2 rounded-full hover:bg-gray-100">
            <User size={20} />
          </Link>
          <button
            onClick={handleSignOut}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-700"
            title="Sign out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {showMobileMenu && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleMobileMenu}
        >
          <div
            className="absolute top-0 left-0 h-full w-64 bg-white shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-primary">AvailNow</h3>
            </div>
            <nav className="p-4">
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/"
                    className="block p-2 rounded-md hover:bg-gray-100"
                    onClick={toggleMobileMenu}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/calendar"
                    className="block p-2 rounded-md hover:bg-gray-100"
                    onClick={toggleMobileMenu}
                  >
                    Calendar
                  </Link>
                </li>
                <li>
                  <Link
                    to="/widget"
                    className="block p-2 rounded-md hover:bg-gray-100"
                    onClick={toggleMobileMenu}
                  >
                    Widget
                  </Link>
                </li>
                <li>
                  <Link
                    to="/settings"
                    className="block p-2 rounded-md hover:bg-gray-100"
                    onClick={toggleMobileMenu}
                  >
                    Settings
                  </Link>
                </li>
                <li>
                  <Link
                    to="/account"
                    className="block p-2 rounded-md hover:bg-gray-100"
                    onClick={toggleMobileMenu}
                  >
                    Account
                  </Link>
                </li>
                <li className="pt-4 mt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      toggleMobileMenu();
                      handleSignOut();
                    }}
                    className="w-full text-left p-2 rounded-md text-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
