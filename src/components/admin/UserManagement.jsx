import { getReadinessDirect } from "../../api/camspherApi";
// pass stored student scores → get readiness score back
import React, { useMemo, useState } from "react";
import {
  Search,
  Eye,
  Trash2,
  Users,
  GraduationCap,
  Briefcase,
  UserCheck,
  X,
} from "lucide-react";

const usersData = [
  {
    id: 1,
    initials: "SP",
    name: "Sneha Pillai",
    role: "Student",
    email: "sneha@college.edu",
    status: "Active",
    joined: "Aug 2022",
    color: "bg-pink-100 text-pink-700",
  },
  {
    id: 2,
    initials: "VK",
    name: "Vikash Kumar",
    role: "Student",
    email: "vikash@college.edu",
    status: "Pending",
    joined: "Jan 2023",
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    id: 3,
    initials: "VN",
    name: "Vikram Nair",
    role: "Recruiter",
    email: "vikram@amazon.com",
    status: "Active",
    joined: "Sep 2023",
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: 4,
    initials: "AR",
    name: "Arun Kumar",
    role: "Admin",
    email: "arun@admin.edu",
    status: "Blocked",
    joined: "Jun 2021",
    color: "bg-green-100 text-green-700",
  },
];

const statusStyle = {
  Active: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Blocked: "bg-red-100 text-red-600",
};

function UserManagement() {
  const [users, setUsers] = useState(usersData);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "Student",
    status: "Active",
  });

  const tabs = ["All", "Student", "Recruiter", "Admin"];

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchTab =
        activeTab === "All" ? true : user.role === activeTab;

      const matchSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());

      return matchTab && matchSearch;
    });
  }, [users, activeTab, search]);

  const deleteUser = (id) => {
    setUsers(users.filter((user) => user.id !== id));
  };

  const addUser = () => {
    if (!newUser.name || !newUser.email) return;

    const createdUser = {
      id: Date.now(),
      initials: newUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      name: newUser.name,
      role: newUser.role,
      email: newUser.email,
      status: newUser.status,
      joined: "Just Now",
      color: "bg-indigo-100 text-indigo-700",
    };

    setUsers([createdUser, ...users]);

    setNewUser({
      name: "",
      email: "",
      role: "Student",
      status: "Active",
    });

    setShowAddModal(false);
  };

  return (
    <div className=" w-full min-h-screen bg-[#f5f7fb] ">
  <div className="w-full  p-4 md:p-6 space-y-6 min-w-0">


        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              User Management
            </h1>

            <p className="text-gray-500 mt-1">
              Manage students, recruiters and admins
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="!bg-indigo-700 hover:bg-indigo-800 text-white px-5 py-3 rounded-2xl flex items-center gap-2 shadow-sm transition-all shrink-0"
          >
            Add User
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

          <div className="bg-white rounded-3xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center">
              <Users className="text-indigo-600" />
            </div>

            <div>
              <h2 className="text-2xl font-bold">20</h2>
              <p className="text-sm text-gray-500">Total Users</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-yellow-100 flex items-center justify-center">
              <GraduationCap className="text-yellow-600" />
            </div>

            <div>
              <h2 className="text-2xl font-bold">11</h2>
              <p className="text-sm text-gray-500">Students</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center">
              <Briefcase className="text-purple-600" />
            </div>

            <div>
              <h2 className="text-2xl font-bold">6</h2>
              <p className="text-sm text-gray-500">Recruiters</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
              <UserCheck className="text-green-600" />
            </div>

            <div>
              <h2 className="text-2xl font-bold">15</h2>
              <p className="text-sm text-gray-500">Active Users</p>
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">

          <div className="flex flex-wrap gap-2 bg-gray-200 p-2 rounded-2xl w-fit">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-xl text-sm font-medium transition ${
                  activeTab === tab
                    ? "bg-white shadow text-black"
                    : "text-gray-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-80">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white rounded-2xl border pl-11 pr-4 py-3 outline-none"
            />
          </div>
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden lg:block bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">

              <thead className="bg-gray-50 text-gray-500 text-sm">
                <tr>
                  <th className="text-left px-6 py-4">USER</th>
                  <th className="text-left">ROLE</th>
                  <th className="text-left">EMAIL</th>
                  <th className="text-left">STATUS</th>
                  <th className="text-left">JOINED</th>
                  <th className="text-left">ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">

                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${user.color}`}
                        >
                          {user.initials}
                        </div>

                        <h3 className="font-semibold text-gray-900">
                          {user.name}
                        </h3>
                      </div>
                    </td>

                    <td>
                      <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium">
                        {user.role}
                      </span>
                    </td>

                    <td className="text-gray-600">
                      {user.email}
                    </td>

                    <td>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle[user.status]}`}
                      >
                        {user.status}
                      </span>
                    </td>

                    <td className="text-gray-500">
                      {user.joined}
                    </td>

                    <td>
                      <div className="flex items-center gap-4 text-gray-500">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="hover:text-indigo-600"
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          onClick={() => deleteUser(user.id)}
                          className="hover:text-red-600"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MOBILE CARDS */}
        <div className="grid grid-cols-1 gap-4 lg:hidden">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-3xl shadow-sm p-5"
            >
              <div className="flex items-center gap-4">

                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center font-bold ${user.color}`}
                >
                  {user.initials}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold">
                    {user.name}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="flex justify-between mt-5">
                <span className="text-sm font-medium">
                  {user.role}
                </span>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle[user.status]}`}
                >
                  {user.status}
                </span>
              </div>

              <div className="flex items-center gap-5 mt-5 text-gray-500 border-t pt-4">
                <button
                  onClick={() => setSelectedUser(user)}
                  className="hover:text-indigo-600"
                >
                  <Eye size={18} />
                </button>

                <button
                  onClick={() => deleteUser(user.id)}
                  className="hover:text-red-600"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg p-6 relative">

              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-5 right-5 w-10 h-10 rounded-xl bg-red-500 hover:bg-red-600 flex items-center justify-center"
              >
                <X size={18} className="text-white" />
              </button>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Add New User
              </h2>

              <div className="space-y-4">

                <input
                  type="text"
                  placeholder="Full Name"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  className="w-full border rounded-2xl px-4 py-3 outline-none"
                />

                <input
                  type="email"
                  placeholder="Email Address"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="w-full border rounded-2xl px-4 py-3 outline-none"
                />

                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                  className="w-full border rounded-2xl px-4 py-3 outline-none"
                >
                  <option>Student</option>
                  <option>Recruiter</option>
                  <option>Admin</option>
                </select>

                <select
                  value={newUser.status}
                  onChange={(e) =>
                    setNewUser({ ...newUser, status: e.target.value })
                  }
                  className="w-full border rounded-2xl px-4 py-3 outline-none"
                >
                  <option>Active</option>
                  <option>Pending</option>
                  <option>Blocked</option>
                </select>

                <button
                  onClick={addUser}
                  className="!bg-indigo-700 hover:bg-indigo-800 text-white px-6 py-3 rounded-2xl"
                >
                  Create User
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedUser && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 relative">

              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-5 right-5 w-10 h-10 rounded-xl bg-red-500 hover:bg-red-600 flex items-center justify-center"
              >
                <X size={18} className="text-white" />
              </button>

              <div className="flex flex-col items-center text-center">

                <div
                  className={`w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold ${selectedUser.color}`}
                >
                  {selectedUser.initials}
                </div>

                <h2 className="text-2xl font-bold mt-4">
                  {selectedUser.name}
                </h2>

                <p className="text-gray-500 mt-1">
                  {selectedUser.email}
                </p>
              </div>

              <div className="space-y-4 mt-8">

                <div className="flex justify-between border-b pb-3">
                  <span className="text-gray-500">Role</span>
                  <span>{selectedUser.role}</span>
                </div>

                <div className="flex justify-between border-b pb-3">
                  <span className="text-gray-500">Status</span>
                  <span>{selectedUser.status}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Joined</span>
                  <span>{selectedUser.joined}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserManagement;
