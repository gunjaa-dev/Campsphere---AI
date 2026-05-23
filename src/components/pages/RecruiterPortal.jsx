import React from 'react';
import { Routes, Route } from "react-router-dom";
import RecruiterDashboard from '../recruiter/RecruiterDashboard';
import PostJob from '../recruiter/PostJob';
import Sidebar from '../common/Sidebar';
import CandidateRanking from '../recruiter/CandidateRanking';
import RecruiterProfile from '../recruiter/RecruiterProfile';

function RecruiterPortal() {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 w-full overflow-y-auto p-4 md:p-6 lg:p-8 bg-gradient-to-br from-[#eef2ff] via-white to-[#f8fafc] dark:from-black dark:via-black dark:to-black transition">

        <Routes>
          <Route path="/" element={<RecruiterDashboard />} />
          <Route path="jobs" element={<PostJob />} />
          <Route path="candidate" element={<CandidateRanking />} />
          <Route path="analytics" element={<CandidateRanking />} />
          <Route path="profile" element={<RecruiterProfile />} />
        </Routes>

      </div>
    </div>
  )
}

export default RecruiterPortal;
