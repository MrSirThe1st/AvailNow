import React from "react";
import {
  User,
  CreditCard,
  Bell,
  Shield,
  Eye,
  AlertTriangle,
} from "lucide-react";

const SettingsNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "billing", label: "Billing", icon: <CreditCard size={20} /> },
    { id: "danger", label: "Danger Zone", icon: <AlertTriangle size={20} /> },
  ];

  return (
    <div className="lg:w-64 flex-shrink-0">
      <nav className="bg-white rounded-lg shadow p-4">
        <ul className="space-y-1">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-left rounded-md transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="mr-3">{tab.icon}</span>
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default SettingsNavigation;
