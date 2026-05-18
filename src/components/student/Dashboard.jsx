import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Sparkles,
  ChevronRight,
  Terminal,
  Bell,
  Settings,
  Upload,
} from "lucide-react";

/* Badge */
const Badge = ({ children, className = "" }) => (
  <span
    className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}
  >
    {children}
  </span>
);

/* Button */
const Button = ({ children, className = "", ...props }) => (
  <button
    className={`rounded-lg transition-all duration-200 ${className}`}
    {...props}
  >
    {children}
  </button>
);

/* Readiness Chart */
const ReadinessChart = ({ value }) => (
  <div className="w-24 h-24 rounded-full border-4 border-blue-500 flex items-center justify-center text-lg font-bold text-blue-600">
    {value}%
  </div>
);

const skills = [
  { label: "Frontend Development", value: 92 },
  { label: "Data Science & NLP", value: 78 },
  { label: "Problem Solving", value: 85 },
];

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const savedProfile =
    JSON.parse(localStorage.getItem("profile")) || {};
  const readiness =
    (savedProfile.skills?.length || 0) * 10 +
    (savedProfile.projects?.length || 0) * 15;
  const [loading, setLoading] = useState(false);

  const [resumeData, setResumeData] = useState(null);

  const notifications = [
    resumeData
      ? `Resume score: ${resumeData.summary.overall_score}`
      : "Upload resume for AI analysis",

    resumeData
      ? `${resumeData.summary.total_skills} skills detected`
      : "No resume analyzed yet",

    savedProfile.projects?.length
      ? `${savedProfile.projects.length} projects added`
      : "No projects added yet",
  ];
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const fileInputRef = useRef();

  const { pathname } = useLocation();

  const pageTitles = {
    "/student-dashboard": "Placement Intelligence",
    "/student-dashboard/jobs": "Job Listings",
    "/student-dashboard/profile": "Profile",
    "/student-dashboard/readiness-score": "Readiness Score",
  };

  const title =
    Object.keys(pageTitles).find((path) =>
      pathname.startsWith(path)
    )
      ? pageTitles[
      Object.keys(pageTitles).find((path) =>
        pathname.startsWith(path)
      )
      ]
      : "Placement Intelligence";

  /* Upload Button */
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  /* Resume Upload + Analysis */
  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch(
        "http://127.0.0.1:8000/api/analyze/file",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      console.log("Resume Analysis:", data);

      if (data.success) {
        setResumeData(data);

        alert("Resume analyzed successfully!");
      } else {
        alert("Analysis failed");
      }
    } catch (error) {
      console.error(error);
      alert("Server Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-5 bg-gradient-to-br from-[#eef2ff] via-white to-[#f8fafc]">

      {/* HEADER */}
      <div className="bg-white border rounded-2xl px-6 py-4 flex items-center justify-between shadow-sm">

        <h2 className="text-lg font-semibold text-gray-800">
          {title}
        </h2>

        <div className="flex items-center gap-3">

          {/* Notifications */}
          <div className="relative">

            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowSettings(false);
              }}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Bell size={18} />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-white border rounded-2xl shadow-lg p-4 z-50">
                <h4 className="font-semibold mb-3">
                  Notifications
                </h4>

                <div className="space-y-3 text-sm">

                  {notifications.map(
                    (notification, index) => (
                      <div
                        key={index}
                        className="border-b pb-2 last:border-none"
                      >
                        {notification}
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
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Settings size={18} />
            </button>

            {showSettings && (
              <div className="absolute right-0 mt-2 w-56 bg-white border rounded-2xl shadow-lg p-2 z-50">

                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-sm">
                  Profile Settings
                </button>

                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-sm">
                  Dashboard Preferences
                </button>

                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-sm text-red-500">
                  Logout
                </button>

              </div>
            )}
          </div>

          {/* Avatar */}
          <div
            onClick={() => navigate("/student-dashboard/profile")}
            className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold cursor-pointer"
          >
            {(user?.fullName || "User")
              .charAt(0)
              .toUpperCase()}
          </div>
        </div>
      </div>

      {/* Welcome */}
      <div className="flex items-center justify-between flex-wrap gap-4">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back,{" "}
            {user?.fullName || "User"}
          </h1>

          <p className="text-gray-500 mt-1">
            Your placement journey is getting smarter with AI.
          </p>
        </div>

        {/* Upload Resume */}
        <>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />

          <Button
            onClick={handleButtonClick}
            className="!bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 font-medium flex items-center gap-2"
          >
            <Upload size={18} />

            {loading ? "Analyzing..." : "Upload Resume"}
          </Button>
        </>
      </div>

      {/* Resume Analysis Result */}
      {resumeData && (
        <div className="bg-white rounded-2xl shadow border p-6">

          <h2 className="text-2xl font-bold mb-5">
            Resume Analysis
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">
                Resume Score
              </p>

              <h3 className="text-3xl font-bold text-blue-600 mt-2">
                {resumeData.summary.overall_score}
              </h3>
            </div>

            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">
                Grade
              </p>

              <h3 className="text-3xl font-bold text-green-600 mt-2">
                {resumeData.summary.grade}
              </h3>
            </div>

            <div className="bg-purple-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">
                Skills Found
              </p>

              <h3 className="text-3xl font-bold text-purple-600 mt-2">
                {resumeData.summary.total_skills}
              </h3>
            </div>

            <div className="bg-orange-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">
                Projects
              </p>

              <h3 className="text-3xl font-bold text-orange-600 mt-2">
                {resumeData.summary.projects_count}
              </h3>
            </div>

          </div>

          {/* Skills */}
          <div className="mt-6">

            <h3 className="font-semibold text-lg mb-3">
              Extracted Skills
            </h3>

            <div className="flex flex-wrap gap-2">

              {resumeData.analysis.skills.found_skills.map(
                (skill, index) => (
                  <Badge
                    key={index}
                    className="bg-blue-100 text-blue-700"
                  >
                    {skill}
                  </Badge>
                )
              )}

            </div>
          </div>

          {/* Recommendations */}
          <div className="mt-6">

            <h3 className="font-semibold text-lg mb-3">
              Recommendations
            </h3>

            <div className="space-y-2">

              {resumeData.analysis.scoring.recommendations.map(
                (rec, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 border rounded-lg p-3 text-sm"
                  >
                    {rec}
                  </div>
                )
              )}

            </div>
          </div>
        </div>
      )}

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Readiness */}
        <div className="bg-white rounded-2xl p-5 shadow border flex flex-col items-center">

          <ReadinessChart value={Math.min(readiness, 100)} />

          <h3 className="mt-3 font-semibold">
            Readiness Score
          </h3>
        </div>

        {/* Academic */}
        <div className="bg-white rounded-2xl p-5 shadow border">

          <div className="flex items-center gap-2 text-gray-500 text-xs uppercase">
            <GraduationCap size={18} />
            Academic Standing
          </div>

          <div className="mt-2">
            <span className="text-4xl font-bold">
              {savedProfile.cgpa || "Not added"}
            </span>

            <span className="text-sm text-gray-500 ml-1">
              / 10.0 CGPA
            </span>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-2xl p-5 shadow border">

          <div className="flex items-center gap-2 text-gray-500 text-xs uppercase">
            <Sparkles size={18} />
            Core Competencies
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {savedProfile.skills?.length > 0 ? (

              savedProfile.skills.map((skill) => (
                <Badge
                  key={skill}
                  className="bg-gray-100"
                >
                  {skill}
                </Badge>
              ))

            ) : (

              <p className="text-sm text-gray-500">
                No skills added yet
              </p>
            )}

          </div>
        </div>
      </div>

      {/* Skills Bar */}
      <div className="bg-white rounded-2xl p-5 shadow border">

        <h3 className="font-semibold mb-4">
          Skill Analysis
        </h3>

        {skills.map((skill) => (
          <div key={skill.label} className="mb-4">

            <div className="flex justify-between text-sm mb-1">
              <span>{skill.label}</span>
              <span>{skill.value}%</span>
            </div>

            <div className="bg-gray-200 h-2 rounded-full">

              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{
                  width: `${skill.value}%`,
                }}
              />

            </div>
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">

        {/* Applications */}
        <div className="md:col-span-3 bg-white p-5 rounded-2xl shadow border">

          <h3 className="font-semibold mb-4">
            Applications
          </h3>
          {savedProfile.projects?.length > 0 ? (

            savedProfile.projects.map(
              (project, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition"
                >
                  <Terminal />

                  <div className="flex-1">

                    <p className="font-semibold text-sm">
                      {project.title || "Untitled Project"}
                    </p>

                    <p className="text-xs text-gray-500">
                      {project.description ||
                        "No description"}
                    </p>

                  </div>

                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                    PROJECT
                  </span>
                </div>
              )
            )

          ) : (

            <p className="text-sm text-gray-500">
              No projects added yet
            </p>

          )}
        </div>

        {/* Upcoming */}
        <div className="md:col-span-2 space-y-3">

          <div className="bg-white shadow border p-4 rounded-2xl font-bold">
            Career Activities
          </div>

          {(
            resumeData
              ? [
                `${resumeData.summary.grade} Grade Candidate`,
                `${resumeData.summary.total_skills} Skills Identified`,
                "AI Resume Improvement",
              ]
              : [
                "Microsoft",
                "AWS Workshop",
                "Mock Interview",
              ]
          ).map((item) => (

            <div
              key={item}
              className="bg-white p-4 rounded-2xl shadow border flex justify-between hover:bg-blue-600 hover:text-white transition cursor-pointer"
            >
              <p>{item}</p>
              <ChevronRight />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;