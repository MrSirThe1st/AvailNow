import { Link } from "react-router-dom";
import { Bell, Settings, User } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-primary">AvailNow</h1>
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Bell size={20} />
        </button>
        <Link to="/settings" className="p-2 rounded-full hover:bg-gray-100">
          <Settings size={20} />
        </Link>
        <Link to="/account" className="p-2 rounded-full hover:bg-gray-100">
          <User size={20} />
        </Link>
      </div>
    </header>
  );
};

export default Header;
