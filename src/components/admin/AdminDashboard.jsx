import { checkHealth, getModel3Metrics } from "../../api/camspherApi";
// checkHealth() → shows ✅/❌ for all 4 models
// getModel3Metrics() → shows accuracy/AUC of LR, RF, DT

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  ExternalLink,
  Bell,
  Settings,
} from "lucide-react";
import ThemeToggle from "../common/ThemeToggle";

/* CARD */

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-black dark:text-white rounded-2xl shadow-sm p-4 md:p-5 overflow-hidden min-w-0 ${className}`}
  >
    {children}
  </div>
);

/* BADGE  */

const Badge = ({ text, color }) => (
  <span
    className={`px-2 py-1 rounded-full text-[10px] md:text-xs font-medium whitespace-nowrap ${color}`}
  >
    {text}
  </span>
);

/* HEADER */

const Header = () => {
  const navigate = useNavigate();
  const tabs = ["Network", "Insights", "Calendar"];
  const [active, setActive] = useState("Network");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm px-4 md:px-6 py-4 text-black dark:text-white">

      <div className="flex items-center justify-between gap-4">

        {/* LEFT */}
        <h2 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white">
          Placement Intelligence Center
        </h2>

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
                    "3 new recruiter requests pending",
                    "Placement report generated",
                    "12 new students registered",
                    "Analytics updated successfully",
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
                    navigate("/admin-dashboard/profile")
                  }
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
                >
                  Profile Settings
                </button>

                <button
                  onClick={() =>
                    navigate("/admin-dashboard/analytics")
                  }
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
                >
                  Analytics
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
            onClick={() => navigate("/admin-dashboard/profile")}
            className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold cursor-pointer shrink-0"
          >
            {(
              JSON.parse(localStorage.getItem("user"))?.fullName ||
              "User"
            )
              .charAt(0)
              .toUpperCase()}
          </div>

        </div>

      </div>
    </div>
  );
};

/* STATS */

const PlacementStats = () => (
  <Card>
    <div className="flex items-start justify-between">

      <div className="w-11 h-11 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
        <TrendingUp className="text-blue-600" />
      </div>

      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full whitespace-nowrap">
        +12%
      </span>
    </div>

    <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
      Placement % for Current Year
    </p>

    <h1 className="text-3xl md:text-5xl font-bold text-blue-600 mt-1 break-words">
      84.2%
    </h1>
  </Card>
);



/* TOP BRANCHES */

const TopBranches = () => {
  const branches = [
    { name: "Computer Science", value: 94 },
    { name: "Computer Science AI/ML", value: 88 },
    { name: "Electronics & Comm.", value: 76 },
    { name: "Mechanical Engg.", value: 61 },
  ];

  return (
    <Card>
      <h3 className="font-semibold mb-5">
        Top Hiring Branches
      </h3>

      <div className="space-y-4">
        {branches.map((branch) => (
          <div key={branch.name}>

            <div className="flex justify-between gap-3 text-sm mb-1">
              <span className="truncate">
                {branch.name}
              </span>

              <span className="shrink-0">
                {branch.value}%
              </span>
            </div>

            <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-800 dark:bg-gray-800 overflow-hidden">
              <div
                className="h-2 rounded-full bg-blue-600"
                style={{ width: `${branch.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};


/* TABLE */

const companies = [
  {
    name: "Zscaler",
    offers: 24,
    package: "14.2 LPA",
    conversion: 75,
    trend: "up",
    status: "Placed",
  },
  {
    name: "Nexus Solutions",
    offers: 86,
    package: "9.5 LPA",
    conversion: 42,
    trend: "flat",
    status: "Pending",
  },
  {
    name: "Paxcom",
    offers: 22,
    package: "12.0 LPA",
    conversion: 92,
    trend: "up",
    status: "Ready",
  },
  {
    name: "Penthara",
    offers: 7,
    package: "10.3 LPA",
    conversion: 58,
    trend: "down",
    status: "Pending",
  },
];

const getTrendIcon = (trend) => {
  if (trend === "up")
    return (
      <TrendingUp className="text-green-500 w-4 h-4 mx-auto" />
    );

  if (trend === "down")
    return (
      <TrendingDown className="text-red-500 w-4 h-4 mx-auto" />
    );

  return (
    <Minus className="text-gray-400 w-4 h-4 mx-auto" />
  );
};

const getStatusColor = (status) => {
  if (status === "Placed")
    return "bg-green-100 text-green-700";

  if (status === "Pending")
    return "bg-yellow-100 text-yellow-700";

  return "bg-blue-100 text-blue-700";
};

const CompanyTrends = () => (
  <Card className="min-w-0">

    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">

      <h3 className="font-semibold">
        Company Performance Trends
      </h3>
    </div>

    {/* Desktop Table */}
    <div className="hidden lg:block overflow-hidden">
      <table className="w-full table-fixed text-sm">

        <thead className="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
          <tr>
            <th className="text-left py-3 w-[32%]">
              Company
            </th>

            <th className="w-[12%]">
              Offers
            </th>

            <th className="w-[16%]">
              Package
            </th>

            <th className="w-[20%]">
              Conversion
            </th>

            <th className="w-[10%]">
              Trend
            </th>

            <th className="w-[10%]">
              Status
            </th>
          </tr>
        </thead>

        <tbody>
          {companies.map((company) => (
            <tr
              key={company.name}
              className="border-b border-gray-200 dark:border-gray-700 last:border-0"
            >

              <td className="py-4 pr-2 truncate font-medium">
                {company.name}
              </td>

              <td className="text-center">
                {company.offers}
              </td>

              <td className="text-center whitespace-nowrap">
                {company.package}
              </td>

              <td>
                <div className="flex items-center gap-2 min-w-0">

                  <div className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{
                        width: `${company.conversion}%`,
                      }}
                    />
                  </div>

                  <span className="text-xs shrink-0">
                    {company.conversion}%
                  </span>
                </div>
              </td>

              <td>
                {getTrendIcon(company.trend)}
              </td>

              <td className="text-center">
                <Badge
                  text={company.status}
                  color={getStatusColor(company.status)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Mobile Cards */}
    <div className="lg:hidden space-y-4">
      {companies.map((company) => (
        <div
          key={company.name}
          className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3"
        >

          <div className="flex items-start justify-between gap-3">

            <div className="min-w-0">
              <h4 className="font-semibold truncate">
                {company.name}
              </h4>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                {company.package}
              </p>
            </div>

            <Badge
              text={company.status}
              color={getStatusColor(company.status)}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span>Offers</span>
            <span className="font-medium">
              {company.offers}
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Conversion</span>
              <span>{company.conversion}%</span>
            </div>

            <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
              <div
                className="h-2 rounded-full bg-blue-600"
                style={{
                  width: `${company.conversion}%`,
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Trend</span>
            {getTrendIcon(company.trend)}
          </div>
        </div>
      ))}
    </div>
  </Card>
);

/*  MAIN */

function AdminDashboard() {
  return (
    <div className="w-full min-w-0 overflow-x-hidden space-y-5">

      <Header />

      {/* Stats + Branches */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <PlacementStats />
        <TopBranches />
      </div>

      {/* Table */}
      <CompanyTrends />
    </div>
  );
}

export default AdminDashboard;
