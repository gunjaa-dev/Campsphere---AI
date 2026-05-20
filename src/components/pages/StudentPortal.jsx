import React from "react";
import { Routes, Route } from "react-router-dom";

import Dashboard from "../student/Dashboard";
import JobRecommendation from "../student/JobRecommendation";
import ReadinessScore from "../student/ReadinessScore";
import Profile from "../student/Profile";
import Sidebar from "../common/Sidebar";
import { PlacementProvider } from "../context/PlacementContext";

function StudentPortal() {
  return (
    <PlacementProvider>
    <div className="flex h-screen w-screen overflow-hidden">

      <Sidebar />
      
      <div className="flex-1 w-full overflow-y-auto p-4 md:p-6 lg:p-8 bg-gradient-to-br from-[#eef2ff] via-white to-[#f8fafc] dark:from-[#0f172a] dark:to-[#020617] transition">

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="jobs" element={<JobRecommendation />} />
          <Route path="profile" element={<Profile />} />
          <Route path="readiness-score" element={<ReadinessScore />} />
        </Routes>

      </div>
    </div>
    </PlacementProvider>
  );
}

export default StudentPortal;