import { CalendarClock, Users, ExternalLink } from "lucide-react";

const Dashboard = () => {
  // Placeholder data
  const stats = [
    { title: "Slots Available", value: 34, icon: <CalendarClock size={24} /> },
    { title: "Views", value: 128, icon: <Users size={24} /> },
    { title: "Website Clicks", value: 42, icon: <ExternalLink size={24} /> },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div className="text-primary">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <p className="text-gray-500">No recent activity to display</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Upcoming Availability</h2>
          <p className="text-gray-500">No upcoming availability</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
