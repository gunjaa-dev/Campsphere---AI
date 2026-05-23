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
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { usePlacement } from "../context/PlacementContext";
import toast from "react-hot-toast";
import ThemeToggle from "../common/ThemeToggle";

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
  <div className="w-24 h-24 rounded-full border-4 border-blue-500 dark:border-blue-500 flex items-center justify-center text-lg font-bold text-blue-600">
    {value}%
  </div>
);

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const savedProfile =
    JSON.parse(localStorage.getItem("profile") || "{}");

  const {
    resumeData,
    jobData,
    prediction,
    readiness,
    loading,
    error,
    progress,
    runPipeline,
    getAtsScore,
    resetAnalysis,
  } = usePlacement();

  const readinessScore = readiness?.readiness_score ?? Math.min(
    (savedProfile.skills?.length || 0) * 10 +
    (savedProfile.projects?.length || 0) * 15,
    100
  );

  const atsScore = getAtsScore();
  const placementProb = prediction?.selection_probability;

  const allSkills = resumeData?.analysis?.skills?.found_skills?.length
    ? resumeData.analysis.skills.found_skills
    : savedProfile.skills || [];

  const dynamicSkills = allSkills.slice(0, 6).map((skill, index) => ({
    label: skill,

    value: Math.max(
      60,
      Math.min(
        95,
        Math.round(
          readinessScore -
          index * 4 +
          Math.random() * 8
        )
      )
    ),
  }));


  const scoreChartData = resumeData?.analysis?.scoring?.category_scores
    ? Object.entries(resumeData.analysis.scoring.category_scores).map(
      ([key, value]) => ({
        name: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        score: Math.round(value),
      })
    )
    : [];

  const notifications = [
    resumeData
      ? `Resume score: ${resumeData.summary.overall_score}/100`
      : "Upload resume for AI analysis",
    atsScore != null
      ? `ATS compatibility: ${Math.round(atsScore)}%`
      : "ATS score available after upload",
    placementProb != null
      ? `Placement probability: ${Math.round(placementProb)}%`
      : "Run pipeline for placement prediction",
    resumeData
      ? `${resumeData.summary.total_skills} AI skills detected`
      : "No resume analyzed yet",

    savedProfile.projects?.length
      ? `${savedProfile.projects.length} projects added`
      : "No projects added yet",

    savedProfile.skills?.length
      ? `${savedProfile.skills.length} profile skills updated`
      : "Add skills to improve recommendations",

    readinessScore >= 80
      ? "You are placement ready"
      : "Improve profile to increase readiness",
    jobData?.total_jobs_matched
      ? `${jobData.total_jobs_matched} jobs matched your profile`
      : "Upload resume for job recommendations",
  ];
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const fileInputRef = useRef();
  const [dragOver, setDragOver] = useState(false);

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

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    const allowed = ["pdf", "doc", "docx", "jpg", "jpeg", "png", "webp", "bmp", "tif", "tiff"];
    if (!allowed.includes(ext)) {
      toast.error("Supported: PDF, DOC, DOCX, JPG, PNG, WEBP");
      return;
    }

    if (!savedProfile.cgpa) {
      toast.error("Add your CGPA in Profile first for accurate predictions");
    }

    try {
      const result = await runPipeline(file);

      localStorage.setItem(
        "profile",
        JSON.stringify({
          name:
            JSON.parse(localStorage.getItem("user"))
              ?.fullName || "User",

          role: "Student",

          skills:
            result?.resumeData?.analysis?.skills
              ?.found_skills || [],

          college:
            result?.resumeData?.analysis?.content
              ?.education?.[0]?.institution || "",

          degree:
            result?.resumeData?.analysis?.content
              ?.education?.[0]?.degree || "",

          year:
            result?.resumeData?.analysis?.content
              ?.education?.[0]?.duration || "",

          projects:
            result?.resumeData?.analysis?.content
              ?.projects?.map((p) => ({
                title: p.name,
                description: p.description,
              })) || [],
        })
      );
      toast.success("Full AI analysis complete!");
    } catch (err) {
      toast.error(err.message || "Analysis failed. Is the backend running?");
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-5 bg-gradient-to-br from-[#eef2ff] dark:from-gray-950 dark:to-black dark:text-white">

      {/* HEADER */}
      <div className="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-2xl px-6 py-4 flex items-center justify-between shadow-sm">

        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
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
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Bell size={18} />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-2xl shadow-lg p-4 z-50">
                <h4 className="font-semibold mb-3">
                  Notifications
                </h4>

                <div className="space-y-3 text-sm">

                  {notifications.map(
                    (notification, index) => (
                      <div
                        key={index}
                        className="border-b dark:border-gray-700 pb-2 last:border-none"
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
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Settings size={18} />
            </button>

            {showSettings && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-2xl shadow-lg p-2 z-50">

                <button
                  onClick={() =>
                    navigate("/student-dashboard/profile")
                  }
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
                >
                  Profile Settings
                </button>

                <button
                  onClick={() =>
                    navigate("/student-dashboard/readiness-score")
                  }
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
                >
                  Readiness Analytics
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Welcome back,{" "}
            {user?.fullName || "User"}
          </h1>

          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Your placement journey is getting smarter with AI.
          </p>
        </div>

        <div
          className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-3 border-2 border-dashed rounded-xl p-4 transition ${dragOver
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
            }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) handleFileChange({ target: { files: [f] } });
          }}
        >
          <input
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.bmp,.tif,.tiff,image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 flex-1">
            Drop resume here or browse — PDF, scanned PDF, DOC, DOCX, JPG, PNG, WEBP
          </p>
          <Button
            onClick={handleButtonClick}
            disabled={loading}
            className="!bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-3 font-medium flex items-center gap-2 shrink-0"
          >
            <Upload size={18} />
            {loading ? progress.message || "Processing…" : "Upload Resume"}
          </Button>
          {resumeData && (
            <Button
              onClick={() => {
                resetAnalysis();

                localStorage.removeItem("profile");

                toast.success("Previous analysis cleared");

                fileInputRef.current.click();
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-5 py-3"
            >
              Re-upload Resume
            </Button>
          )}
        </div>
      </div>

      {loading && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border dark:border-gray-700 p-4 shadow-sm">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">{progress.message || "Processing…"}</span>
            <span className="font-semibold text-blue-600">{progress.percent}%</span>
          </div>
          <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border dark:border-gray-700 border-red-200 rounded-2xl p-4 flex gap-3 text-red-700 text-sm">
          <AlertCircle size={20} className="shrink-0" />
          <div>
            <p className="font-semibold">Analysis error</p>
            <p>{error}</p>
            <p className="mt-1 opacity-80 text-xs">
              Run backend in a second terminal:{" "}
              <code className="bg-red-100 px-1 rounded">
                cd backend/resume_analyzer && python main.py
              </code>
              <br />
              Then verify:{" "}
              <a
                href="http://127.0.0.1:8000/docs"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                http://127.0.0.1:8000/docs
              </a>
            </p>
          </div>
        </div>
      )}

      {resumeData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Resume Score", value: resumeData.summary.overall_score, color: "text-blue-600" },
            { label: "ATS Score", value: atsScore != null ? Math.round(atsScore) : "—", color: "text-emerald-600" },
            { label: "Placement Odds", value: placementProb != null ? `${Math.round(placementProb)}%` : "—", color: "text-violet-600" },
            { label: "Readiness", value: readiness?.readiness_score != null ? Math.round(readiness.readiness_score) : "—", color: "text-indigo-600" },
          ].map((card) => (
            <div key={card.label} className="bg-white dark:bg-gray-900 rounded-2xl border p-4 shadow-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{card.label}</p>
              <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Resume Analysis Result */}
      {resumeData && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow border dark:border-gray-700 p-6">

          <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
            <h2 className="text-2xl font-bold">Resume Analysis</h2>
            {resumeData.extraction && (
              <span className="text-xs bg-gray-100 dark:bg-gray-800 dark:text-gray-200 text-gray-600 px-3 py-1 rounded-full">
                {resumeData.extraction.extraction_method_used} ·{" "}
                {resumeData.extraction.confidence_score}% confidence
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Resume Score
              </p>

              <h3 className="text-3xl font-bold text-blue-600 mt-2">
                {resumeData.summary.overall_score}
              </h3>
            </div>

            <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Grade
              </p>

              <h3 className="text-3xl font-bold text-green-600 mt-2">
                {resumeData.summary.grade}
              </h3>
            </div>

            <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Skills Found
              </p>

              <h3 className="text-3xl font-bold text-purple-600 mt-2">
                {resumeData.summary.total_skills}
              </h3>
            </div>

            <div className="bg-orange-50 dark:bg-orange-950/30 rounded-xl p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
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

          {scoreChartData.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-3">Score Breakdown</h3>
              <div className="w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={scoreChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                      {scoreChartData.map((_, i) => (
                        <Cell key={i} fill={i % 2 === 0 ? "#2563eb" : "#6366f1"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

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
                    className="bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-3 text-sm"
                  >
                    <div className="flex gap-2 items-center mb-2">
                      <span className="font-semibold text-red-500">
                        {rec.priority?.toUpperCase()}
                      </span>

                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                        {rec.category}
                      </span>

                    </div>

                    <p>
                      <strong>Issue:</strong>{" "}
                      {rec.issue}
                    </p>

                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                      <strong>Action:</strong>{" "}
                      {rec.action}
                    </p>
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
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow border dark:border-gray-700 flex flex-col items-center">

          <ReadinessChart value={Math.min(Math.round(readinessScore), 100)} />

          <h3 className="mt-3 font-semibold">
            Readiness Score
          </h3>
        </div>

        {/* Academic */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow border dark:border-gray-700">

          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs uppercase">
            <GraduationCap size={18} />
            Academic Standing
          </div>

          <div className="mt-2">
            {resumeData?.analysis?.education?.[0]?.cgpa ||
              resumeData?.extraction?.cgpa ||
              savedProfile?.cgpa ? (
              <>
                <span className="text-4xl font-bold">
                  {resumeData?.analysis?.education?.[0]?.cgpa ||
                    resumeData?.extraction?.cgpa ||
                    savedProfile?.cgpa}
                </span>

                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                  / 10.0 CGPA
                </span>
              </>
            ) : (
              <span className="text-base text-gray-500 dark:text-gray-400">
                Not added
              </span>
            )}
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow border dark:border-gray-700">

          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs uppercase">
            <Sparkles size={18} />
            Core Competencies
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {allSkills.length > 0 ? (

              allSkills
                .filter(skill => skill.length > 3)
                .filter(skill =>
                  ![
                    "organization",
                    "legal",
                    "medical",
                    "communication",
                    "cross-functional",
                    "benchmarking",
                    "support",
                    "work"
                  ].includes(skill.toLowerCase())
                )
                .slice(0, 10).map((skill) => (

                  <Badge
                    key={skill}
                    className="bg-gray-100 dark:bg-gray-800 dark:text-gray-200"
                  >
                    {skill}
                  </Badge>

                ))



            ) : (

              <p className="text-sm text-gray-500 dark:text-gray-400">
                No skills added yet
              </p>
            )}

          </div>
        </div>
      </div>

      {/* Skills Bar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow border dark:border-gray-700">

        <h3 className="font-semibold mb-4">
          Skill Analysis
        </h3>

        {dynamicSkills.length === 0 ? (

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Upload resume or add skills in profile
          </p>

        ) : (

          dynamicSkills.map((skill) => (
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
          ))
        )}
      </div>

      {/* Bottom */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">

        {/* Applications */}
        <div className="md:col-span-3 bg-white dark:bg-gray-900 p-5 rounded-2xl shadow border dark:border-gray-700">

          <h3 className="font-semibold mb-4">
            Applied Jobs
          </h3>
          {jobData?.top_recommendations?.length > 0 ? (

            jobData.top_recommendations.slice(0, 4).map((rec, index) => {
              const job = rec.job || {};

              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition"
                >
                  <Terminal />

                  <div className="flex-1">

                    <p className="font-semibold text-sm">
                      {job.title || "Job Role"}
                    </p>

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {job.company || "Company"}
                    </p>

                  </div>

                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                    APPLIED
                  </span>
                </div>
              );
            })

          ) : (

            <p className="text-sm text-gray-500 dark:text-gray-400">
              No job applications yet
            </p>

          )}
        </div>


        {/* Upcoming */}
        <div className="md:col-span-2 space-y-3">

          <div className="bg-white dark:bg-gray-900 shadow border dark:border-gray-700 p-4 rounded-2xl font-bold">
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
              className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow border dark:border-gray-700 flex justify-between hover:bg-blue-600 hover:text-white transition cursor-pointer"
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