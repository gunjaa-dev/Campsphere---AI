import React from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  BarChart2,
  Building2,
  Bell,
  Settings,
} from "lucide-react";
import ThemeToggle from "../common/ThemeToggle";
function RecruiterDashboard() {

  const [activeTab, setActiveTab] = React.useState("dashboard");
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  /* COMPONENTS */
  const navigate = useNavigate();
  const StatCard = ({ title, value, extra }) => (
    <div className="bg-white dark:bg-gray-900 text-black dark:text-white p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">{title}</span>
        {extra && <span className="text-xs text-blue-500">{extra}</span>}
      </div>
      <h3 className="text-2xl font-bold mt-2">{value}</h3>
    </div>
  );

  const Row = ({ title, apps, status = "Live" }) => (
    <tr className="border-t dark:border-gray-700">
      <td className="p-4">{title}</td>
      <td>Oct</td>
      <td>{apps}</td>
      <td>
        <span
          className={`px-2 py-1 text-xs rounded ${status === "Closed"
            ? "!bg-gray-200 dark:!bg-gray-700 dark:text-white"
            : "!bg-indigo-100 text-indigo-700"
            }`}
        >
          {status}
        </span>
      </td>
    </tr>
  );

  const Card = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-900 text-black dark:text-white p-4 rounded-xl shadow-sm border dark:border-gray-700">
      <h3 className="font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );

  const Item = ({ text }) => (
    <div className="p-3 bg-gray-100 dark:bg-gray-800 text-black dark:text-white rounded-lg">{text}</div>
  );

  /* COMPANIES DATA  */

  const companies = [
    { id: 1, name: "Zscaler", location: "Mohali", employees: "500+", roles: 4, logo: "🤖", status: "Active" },
    { id: 2, name: "Paxcom", location: "Gurgaon", employees: "200+", roles: 3, logo: "☁️", status: "Active" },
    { id: 3, name: "Penthara", location: "Mohali", employees: "10,000+", roles: 6, logo: "🪟", status: "Active" },
    { id: 4, name: 'SAP Labs', industry: 'Analytics / BI', location: 'Gurgaon, IN', employees: '200+', openRoles: 2, hired: 5, logo: '📊', tier: 'Tier 2', status: 'Active' },
    { id: 5, name: 'GreyB', industry: 'FinTech', location: 'Pune, IN', employees: '50–100', openRoles: 2, hired: 3, logo: '💳', tier: 'Startup', status: 'Active' },
    { id: 6, name: 'STmicroelectronics', industry: 'Microchips Infrastructure', location: 'Noida, IN', employees: '500', openRoles: 1, hired: 6, logo: '🌩️', tier: 'Tier 2', status: 'Inactive' },
    { id: 7, name: 'Infosys', industry: ' Cloud', location: 'Bangalore, IN', employees: '10,000+', openRoles: 8, hired: 32, logo: '📦', tier: 'FAANG', status: 'Active' },
    { id: 8, name: 'Prodesk', industry: 'Consumer Tech', location: 'Delhi, IN', employees: '10–50', openRoles: 3, hired: 2, logo: '🚀', tier: 'Startup', status: 'Active' },

  ];

  const Companies = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Companies</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {companies.map((co) => (
          <div key={co.id} className="bg-white dark:bg-gray-900 text-black dark:text-white p-4 rounded-xl shadow-sm border dark:border-gray-700">

            <div className="flex justify-between">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 flex items-center justify-center rounded">
                  {co.logo}
                </div>

                <div>
                  <h4 className="font-semibold text-sm">{co.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{co.location}</p>
                </div>
              </div>

              <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded">
                {co.status}
              </span>
            </div>

            <div className="flex justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
              <span>{co.employees} Employees</span>
              <span>{co.roles} Roles</span>
            </div>

          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex w-full bg-white dark:bg-black text-black dark:text-white transition">
      {/* MAIN */}
      <div className="!flex-1 flex flex-col">

        {/* NAVBAR */}
        <header className="flex justify-between items-center px-8 h-16 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">

          <div className="flex items-center gap-8">

            <span
              onClick={() => setActiveTab("dashboard")}
              className={`cursor-pointer pb-1 ${activeTab === "dashboard"
                ? "text-[#24389c] font-bold border-b-2 border-[#24389c]"
                : "text-gray-500 dark:text-gray-400"
                }`}
            >
              Dashboard
            </span>

            <span
              onClick={() => setActiveTab("companies")}
              className={`cursor-pointer pb-1 ${activeTab === "companies"
                ? "text-[#24389c] font-bold border-b-2 border-[#24389c]"
                : "text-gray-500 dark:text-gray-400 "
                }`}
            >
              Companies
            </span>
          </div>

          <div className="flex items-center gap-3">

            {/* Notifications */}
            <div className="relative">

              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowSettings(false);
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Bell size={18} />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-4 z-50">

                  <h4 className="font-semibold mb-3">
                    Notifications
                  </h4>

                  <div className="space-y-3 text-sm">

                    {[
                      "12 new applications received",
                      "3 candidates shortlisted",
                      "Interview scheduled at 2 PM",
                      "2 new job postings are active",
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="border-b border-gray-200 dark:border-gray-700 pb-2 last:border-none"
                      >
                        {item}
                      </div>
                    ))}

                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="relative">

              <button
                onClick={() => {
                  setShowSettings(!showSettings);
                  setShowNotifications(false);
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Settings size={18} />
              </button>

              {showSettings && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-2 z-50">

                  <button
                    onClick={() =>
                      navigate("/recruiter-dashboard/profile")
                    }
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
                  >
                    Profile Settings
                  </button>

                  <button
                    onClick={() =>
                      navigate("/recruiter-dashboard/jobs")
                    }
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
                  >
                    Manage Jobs
                  </button>

                  {/* DARK MODE */}
                  <div className="flex items-center justify-between px-3 py-2">

                    <p className="text-sm">
                      Dark Mode
                    </p>

                    <ThemeToggle />

                  </div>

                  <button
                    onClick={() => {
                      localStorage.removeItem("user");
                      navigate("/login");
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-red-500"
                  >
                    Logout
                  </button>

                </div>
              )}
            </div>

            {/* Avatar */}
            <div
              onClick={() => navigate("/recruiter-dashboard/profile")}
              className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold cursor-pointer"
            >
              {(
                JSON.parse(localStorage.getItem("user"))?.fullName ||
                "User"
              )
                .charAt(0)
                .toUpperCase()}
            </div>

          </div>

        </header>

        {/* CONTENT */}
        <main className="p-8 space-y-8 w-full min-h-screen bg-gradient-to-br from-[#eef2ff] via-white to-[#f8fafc] dark:bg-black dark:bg-none">
          {activeTab === "dashboard" ? (
            <>

              <div className="flex items-center gap-3">
                <div>

                  <h1 className="text-2xl font-bold text-black dark:text-white">
                    Welcome back, {user?.fullName || "Recruiter"}
                  </h1>

                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Recruiting for {user?.companyName || "Company"}
                  </p>

                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Here is what's happening with your placements today.
                  </p>

                </div>
              </div>
              {/* STATS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                <StatCard title="Total Applications" value="584" extra="+12%" />
                <StatCard title="Pending Shortlists" value="12" extra="5 New" />
                <StatCard title="Active Job Postings" value="18" />
                <StatCard title="Selection Rate" value="94.5%" extra="+3%" />

              </div>

              {/* GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT TABLE */}
                <div className="lg:col-span-2">

                  <div className="flex justify-between mb-4">
                    <h3 className="text-xl font-bold">Recent Job Postings</h3>
                    <span className="text-[#24389c] text-sm">View All</span>
                  </div>

                  <div className="bg-white dark:bg-gray-900 dark:text-white rounded-xl overflow-hidden shadow-sm border dark:border-gray-700">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs uppercase">
                        <tr>
                          <th className="p-4 text-left">Job Title</th>
                          <th>Date</th>
                          <th>Applicants</th>
                          <th>Status</th>
                        </tr>
                      </thead>

                      <tbody>
                        <Row title=" Software Engineer Intern" apps="42" />
                        <Row title="Grad Trainee" apps="9" />
                        <Row title="UX Designer Intern" apps="12" status="Closed" />
                        <Row title="Data Scientist Intern" apps="6" />
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="space-y-6">

                  <Card title="Interviews">
                    <div className="space-y-3">
                      <Item text="Gaurav Sharma - 10:30 AM" />
                      <Item text="Parth Rana - 02:00 PM" />
                    </div>
                  </Card>

                  <Card title="Top Candidates">
                    <Item text="Mehak Arora - 98%" />
                    <Item text="Ahnis Singh - 95%" />
                    <Item text="Palak - 92%" />
                  </Card>

                </div>
              </div>
            </>
          ) : (
            <Companies />
          )}
        </main>
      </div>
    </div>
  );
};

export default RecruiterDashboard;