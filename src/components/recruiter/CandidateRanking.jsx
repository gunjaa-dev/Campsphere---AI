import { getFullReadiness } from "../../api/camspherApi";
// run for each student → sort by readiness_score
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Search,
  Star,
  SlidersHorizontal,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";


const candidates = [
  { id: 1, name: "Anjali Sahni", initials: "AS", role: "ML Architecture", college: "DAVIET", skills: ["AWS", "Kubernetes", "Python"], score: 95, status: "Shortlisted", email: "anjali@college.edu", cgpa: "8.2" },
  { id: 2, name: "Arushi Sharma", initials: "AS", role: "AI/ML Developer", college: "DAVIET", skills: ["AI/ML", "Node.js", "PostgreSQL"], score: 95, status: "Offered", email: "arushi@college.edu", cgpa: "8.4" },
  { id: 3, name: "Arpit Miglani", initials: "AM", role: "Product Designer", college: "DAVIET", skills: ["Figma", "UX Research"], score: 90, status: "Under Review", email: "arpit@college.edu", cgpa: "8.7" },
  { id: 4, name: "Gunjaa", initials: "GK", role: "Data Scientist", college: "DAVIET", skills: ["Python", "ML"], score: 90, status: "Shortlisted", email: "alex@college.edu", cgpa: "9.0" },
  { id: 5, name: 'Anita Rani', initials: 'AR', role: 'Backend Engineer', college: 'DAVIET', skills: ['Java', 'Spring Boot', 'MySQL'], score: 87, status: 'Under Review', email: 'jamie@college.edu', cgpa: '8.5' },
  { id: 6, name: 'Kashvi Malhotra', initials: 'KM', role: 'Cybersecurity Engineer', college: 'DAVIET', skills: ['PyTorch', 'NLP', 'Python'], score: 85, status: 'Shortlisted', email: 'priya@college.edu', cgpa: '9.1' },
  { id: 7, name: 'Mansvi Salhotra', initials: 'MS', role: 'DevOps Engineer', college: 'DAVIET', skills: ['Docker', 'CI/CD', 'Terraform'], score: 82, status: 'Rejected', email: 'sam@college.edu', cgpa: '8.2' },
  { id: 8, name: 'Bhavya Verma', initials: 'BV', role: 'Frontend Developer', college: 'DAVIET', skills: ['React', 'TypeScript', 'CSS'], score: 80, status: 'Under Review', email: 'nina@college.edu', cgpa: '8.6' },
];

const statusStyle = {
  Shortlisted: "bg-blue-100 text-blue-600",
  "Under Review": "bg-yellow-100 text-yellow-700",
  Rejected: "bg-red-100 text-red-600",
  Offered: "bg-green-100 text-green-600",
};

const applicationsByMonth = [
  { month: "Jun", apps: 180, hired: 12 },
  { month: "Jul", apps: 240, hired: 18 },
  { month: "Aug", apps: 310, hired: 22 },
  { month: "Sep", apps: 290, hired: 19 },
  { month: "Oct", apps: 420, hired: 28 },
];

const funnelData = [
  { name: "Applications", value: 1284 },
  { name: "Screened", value: 640 },
  { name: "Interviewed", value: 210 },
  { name: "Shortlisted", value: 80 },
  { name: "Hired", value: 28 },
];

const pieData = [
  { name: "Full-time", value: 55 },
  { name: "Contract", value: 22 },
  { name: "Internship", value: 23 },
];

function CandidateRanking() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [starred, setStarred] = useState([1]);
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [tab, setTab] = useState(params.get("tab") || "candidates");

  useEffect(() => {
    setTab(params.get("tab") || "candidates");
  }, [params]);

  const filtered = candidates.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "All" || c.status === statusFilter;

    return matchSearch && matchStatus;
  });
  const AnalyticsView = () => (
    <div className="space-y-6">

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-black dark:text-white p-4 rounded-xl shadow-sm">Applications: 1284</div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-black dark:text-white p-4 rounded-xl shadow-sm">Interviews: 210</div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-black dark:text-white p-4 rounded-xl shadow-sm">Offers: 28</div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-black dark:text-white p-4 rounded-xl shadow-sm">Hire Rate: 24%</div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">

        {/* BAR */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-black dark:text-white p-5 rounded-xl shadow-sm">
          <h3 className="mb-3 font-semibold">Applications vs Hired</h3>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={applicationsByMonth}>
              <CartesianGrid
                stroke={
                  document.documentElement.classList.contains("dark")
                    ? "#374151"
                    : "#d1d5db"
                }
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="month"
                stroke={
                  document.documentElement.classList.contains("dark")
                    ? "#9ca3af"
                    : "#374151"
                }
              />
              <YAxis
                stroke={
                  document.documentElement.classList.contains("dark")
                    ? "#9ca3af"
                    : "#374151"
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor:
                    document.documentElement.classList.contains("dark")
                      ? "#111827"
                      : "#ffffff",
                  border: "1px solid #374151",
                  color:
                    document.documentElement.classList.contains("dark")
                      ? "white"
                      : "black",
                }}
              />
              <Bar dataKey="apps" fill="#2563eb" />
              <Bar dataKey="hired" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* FUNNEL */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-black dark:text-white p-5 rounded-xl shadow-sm">
          <h3 className="mb-3 font-semibold">Hiring Funnel</h3>

          {funnelData.map((d, i) => (
            <div key={d.name} className="mb-2">
              <div className="flex justify-between text-xs">
                <span>{d.name}</span>
                <span>{d.value}</span>
              </div>

              <div className="bg-gray-200 dark:bg-gray-800 h-2 rounded">
                <div
                  className="bg-blue-600 h-2 rounded"
                  style={{
                    width: `${(d.value / 1284) * 100}%`,
                    opacity: 1 - i * 0.1,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* PIE */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-black dark:text-white p-5 rounded-xl shadow-sm col-span-2">
          <h3 className="mb-3 font-semibold">Employment Type</h3>

          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} dataKey="value" innerRadius={50} outerRadius={80}>
                <Cell fill="#2563eb" />
                <Cell fill="#10b981" />
                <Cell fill="#f59e0b" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );

  return (
    <div className="w-full space-y-5 text-black dark:text-white">

      {/* HEADER */}
      <div className="inline-flex bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-1 rounded-xl">
        <button
          onClick={() => navigate("?tab=candidates")}
          className={`px-4 py-1.5 rounded-lg ${tab === "candidates"
            ? "bg-blue-600 text-white"
            : "text-gray-500 dark:text-gray-400"
            }`}
        >
          Candidates
        </button>

        <button
          onClick={() => navigate("?tab=analytics")}
          className={`px-4 py-1.5 rounded-lg ${tab === "analytics"
            ? "bg-blue-600 text-white"
            : "text-gray-500 dark:text-gray-400"
            }`}
        >
          Analytics
        </button>
      </div>

      {/* ✅ CONDITIONAL VIEW */}
      {tab === "candidates" ? (
        <>
          <div>
            <h1 className="text-2xl font-bold text-black dark:text-white">Candidates</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {candidates.length} candidates
            </p>
          </div>

          {/* SEARCH + FILTER */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-2 text-gray-400" />
              <input
                className="pl-8 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded px-3 py-2 w-full"
                placeholder="Search candidates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded px-3 py-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All</option>
              <option>Shortlisted</option>
              <option>Under Review</option>
              <option>Offered</option>
              <option>Rejected</option>
            </select>
          </div>

          {/* TABLE */}
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">

              <thead className="bg-gray-100 dark:bg-gray-900 text-xs uppercase text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="p-4 text-left">Candidate</th>
                  <th>College</th>
                  <th>Skills</th>
                  <th>CGPA</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900">

                    {/* NAME */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                          {c.initials}
                        </div>
                        <div>
                          <p className="font-semibold">{c.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{c.role}</p>
                        </div>
                      </div>
                    </td>

                    {/* COLLEGE */}
                    <td>{c.college}</td>

                    {/* SKILLS */}
                    <td>
                      <div className="flex gap-1 flex-wrap">
                        {c.skills.map((s) => (
                          <span
                            key={s}
                            className="text-xs bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-2 py-0.5 rounded"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* CGPA */}
                    <td>{c.cgpa}</td>

                    {/* SCORE */}
                    <td className="font-bold text-blue-600">{c.score}%</td>

                    {/* STATUS */}
                    <td>
                      <span
                        className={`text-xs px-2 py-1 rounded ${statusStyle[c.status]
                          }`}
                      >
                        {c.status}
                      </span>
                    </td>

                    {/* STAR */}
                    <td>
                      <button
                        onClick={() =>
                          setStarred((prev) =>
                            prev.includes(c.id)
                              ? prev.filter((x) => x !== c.id)
                              : [...prev, c.id]
                          )
                        }
                      >
                        <Star
                          size={15}
                          className={
                            starred.includes(c.id)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-400"
                          }
                        />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <AnalyticsView />
      )}
    </div>
  );
}
export default CandidateRanking
