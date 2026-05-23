import React from 'react';
import { Routes, Route } from "react-router-dom";
import Sidebar from '../common/Sidebar';
import AdminDashboard from '../admin/AdminDashboard';
import Analytics from '../admin/Analytics';
import JobManagement from '../admin/JobManagement';
import UserManagement from '../admin/UserManagement';
import AdminProfile from '../admin/AdminProfile';

function AdminPortal() {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 w-full overflow-y-auto p-4 md:p-6 lg:p-8 bg-gradient-to-br from-[#eef2ff] via-white to-[#f8fafc] dark:from-black dark:via-black dark:to-black transition">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="jobs" element={<JobManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="profile" element={<AdminProfile />} />
        </Routes>

      </div>
    </div>
  )
}

export default AdminPortal;
