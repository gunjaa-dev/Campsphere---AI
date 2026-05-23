import React, { useState, useEffect, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";

import {
  LayoutDashboard,
  Briefcase,
  Users,
  BarChart2,
  Building2,
  User,
  LogOut,
  HelpCircle,
  Mail,
  Phone,
  MessageCircle,
  X,
  Menu,
  Moon,
} from "lucide-react";

const sidebarConfig = {
  student: [
    { to: "/student-dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/student-dashboard/jobs", label: "Jobs", icon: Briefcase },
    { to: "/student-dashboard/readiness-score", label: "Readiness Score", icon: BarChart2 },
    { to: "/student-dashboard/profile", label: "Profile", icon: User },
  ],
  recruiter: [
    { to: "/recruiter-dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/recruiter-dashboard/jobs", label: "Jobs", icon: Briefcase },
    { to: "/recruiter-dashboard/candidate?tab=candidates", label: "Candidates", icon: Users },
    { to: "/recruiter-dashboard/analytics?tab=analytics", label: "Analytics", icon: BarChart2 },
  ],
  admin: [
    { to: "/admin-dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin-dashboard/users", label: "User Management", icon: Users },
    { to: "/admin-dashboard/jobs", label: "Job Management", icon: Building2 },
    { to: "/admin-dashboard/analytics", label: "Analytics", icon: BarChart2 },
  ],
};

function Sidebar() {
  const navigate = useNavigate();

  const [role, setRole] = useState("student");
  const [showSupport, setShowSupport] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [supportType, setSupportType] =
    useState("Technical Issue");

  const [supportMessage, setSupportMessage] =
    useState("");

  const [submitted, setSubmitted] =
    useState(false);
  const { darkMode, setDarkMode } =
    useContext(ThemeContext);

  useEffect(() => {
    const storedRole = localStorage.getItem("role") || "student";
    setRole(storedRole);

    const handleStorageChange = () => {
      setRole(localStorage.getItem("role") || "student");
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const navItems = sidebarConfig[role] || [];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };



  const handleSupportSubmit = () => {

    const tickets =
      JSON.parse(
        localStorage.getItem("supportTickets")
      ) || [];

    const newTicket = {
      id: `TICKET-${Date.now()}`,
      type: supportType,
      message: supportMessage,
      time: new Date().toLocaleString(),
    };

    localStorage.setItem(
      "supportTickets",
      JSON.stringify([...tickets, newTicket])
    );

    setSubmitted(true);

    setSupportMessage("");

    setTimeout(() => {
      setSubmitted(false);
      setShowSupport(false);
    }, 2000);
  };

  return (
    <>
      <aside
        className={`hidden md:flex flex-col sticky top-0 h-screen bg-gradient-to-b from-[#f8fafc] to-[#eef2ff] dark:from-black dark:to-black dark:border-r dark:border-gray-800 py-6 transition-all duration-300 ${collapsed ? "w-24 px-3" : "w-64 pr-4"
          }`}
      >

        {/* TOP */}
        <div
          className={`group relative flex items-center mb-8 h-10 ${collapsed
            ? "justify-center"
            : "justify-between px-6"
            }`}
        >

          {/* LOGO */}
          {collapsed ? (

            <div className="w-9 h-9 rounded-xl bg-[#24389c] dark:bg-blue-700 text-white flex items-center justify-center font-bold text-lg shadow-sm transition-all duration-300 group-hover:opacity-0">
              C
            </div>

          ) : (

            <h2 className="text-2xl font-extrabold text-[#24389c] dark:text-blue-400 tracking-tight transition">
              CampSphere
            </h2>

          )}

          {/* MENU BUTTON */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`absolute p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-900 hover:shadow-sm transition-all duration-300 ${collapsed
              ? "opacity-0 group-hover:opacity-100"
              : "right-2 opacity-100"
              }`}
          >
            <Menu size={18} />
          </button>

        </div>

        {/* NAV */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={
                to === "/student-dashboard" ||
                to === "/recruiter-dashboard" ||
                to === "/admin-dashboard"
              }
              className={({ isActive }) =>
                `flex items-center ${collapsed
                  ? "justify-center"
                  : "gap-3"
                } px-3 py-2.5 rounded-lg text-sm transition-all duration-300 ${isActive
                  ? "bg-white dark:bg-gray-900 text-[#24389c] dark:text-blue-400 shadow-md border border-gray-200 dark:border-gray-700"
                  : "text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm hover:text-[#24389c] dark:hover:text-blue-400"}`
              }
            >
              <Icon size={18} />
              {!collapsed && label}
            </NavLink>
          ))}
        </nav>

        {/* FOOTER */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-1">
          {[
            {
              icon: HelpCircle,
              label: "Support",
              action: () => setShowSupport(true),
            },
            {
              icon: LogOut,
              label: "Logout",
              action: () => setShowLogout(true),
            },
          ].map(({ icon: Icon, label, action }) => (
            <button
              key={label}
              onClick={action}
              className={`flex items-center h-10 w-full rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all px-3 ${collapsed ? "justify-center" : "gap-3"
                }`}
            >
              <Icon size={18} />
              {!collapsed && label}
            </button>
          ))}
        </div>
        {/* DARK MODE */}
        <div
          className={`flex items-center h-10 w-full rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all px-3 ${collapsed ? "justify-center" : "justify-between"
            }`}
        >
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`flex items-center h-10 w-full rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all px-3 ${collapsed ? "justify-center" : "gap-3"
              }`}
          >

            <Moon
              size={18}
              className={`transition ${darkMode
                ? "text-yellow-400"
                : "text-gray-500"
                }`}
            />

            {!collapsed && (
              <span>
                Dark Mode
              </span>
            )}

          </button>

        </div>
      </aside>


      {/* SUPPORT MODAL */}
      {showSupport && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 dark:text-white w-[350px] p-6 rounded-xl relative">

            <button
              onClick={() => setShowSupport(false)}
              className="absolute top-3 right-3 text-gray-500 dark:text-gray-400"
            >
              <X size={18} />
            </button>

            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <HelpCircle size={18} /> AI Support Assistant
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Need help? Our support team is available Monday–Friday, 9 AM – 6 PM IST.
            </p>

            <div className="space-y-4">

              {/* TYPE */}
              <div>

                <label className="text-sm font-medium">
                  Issue Type
                </label>

                <select
                  value={supportType}
                  onChange={(e) =>
                    setSupportType(e.target.value)
                  }
                  className="w-full mt-1 border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg p-2 text-sm"
                >
                  <option>Technical Issue</option>
                  <option>Profile Problem</option>
                  <option>Resume Analysis</option>
                  <option>Placement Query</option>
                </select>

              </div>

              {/* MESSAGE */}
              <div>

                <label className="text-sm font-medium">
                  Describe your issue
                </label>

                <textarea
                  value={supportMessage}
                  onChange={(e) =>
                    setSupportMessage(e.target.value)
                  }
                  rows={4}
                  placeholder="Explain your issue..."
                  className="w-full mt-1 border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg p-2 text-sm resize-none"
                />
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-lg p-3 text-xs text-blue-700 dark:text-blue-300">

                  <p className="font-semibold mb-1">
                    Suggested Help
                  </p>

                  {supportType === "Resume Analysis" &&
                    "Try uploading resume in PDF format under 5MB."}

                  {supportType === "Profile Problem" &&
                    "Complete skills and projects to improve recommendations."}

                  {supportType === "Placement Query" &&
                    "Keep readiness score above 75 for better matches."}

                  {supportType === "Technical Issue" &&
                    "Try refreshing dashboard or checking internet connection."}

                </div>

              </div>

              {/* SUCCESS */}
              {submitted && (
                <div className="bg-green-100 text-green-700 text-sm p-2 rounded-lg">
                  Your request has been submitted successfully.
                </div>
              )}

              {JSON.parse(localStorage.getItem("supportTickets"))
                ?.slice(-2)
                .reverse()
                .map((ticket) => (

                  <div
                    key={ticket.id}
                    className="bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg p-2 text-xs"
                  >
                    <p className="font-medium">
                      {ticket.type}
                    </p>

                    <p className="text-gray-500 dark:text-gray-400 truncate">
                      {ticket.message}
                    </p>
                  </div>

                ))}

              {/* BUTTON */}
              <button
                onClick={handleSupportSubmit}
                disabled={!supportMessage.trim()}
                className="w-full bg-[#24389c] dark:bg-blue-700 text-white py-2 rounded-lg hover:bg-[#1d2f82] transition-all duration-300 disabled:opacity-50"
              >
                Send Request
              </button>

            </div>
          </div>
        </div>
      )}

      {/* LOGOUT MODAL */}
      {showLogout && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 dark:text-white p-6 rounded-xl w-[320px]">

            <h2 className="font-semibold mb-3">Log out of CampSphere?</h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              You'll be signed out. Unsaved changes will be lost.
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowLogout(false)}
                className="px-3 py-1 border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;