import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Settings, User, LogOut, Menu } from "lucide-react";
import { useAuth } from "../../context/SupabaseAuthContext";
import { useNavigate } from "react-router-dom";

const Header = ({ profile }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <header className="h-16 px-6 py-0 bg-white border-b border-gray-200 flex items-center justify-between z-20">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-primary">AvailNow</h1>
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
              <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200">
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
    </header>
  );
};

export default Header;
