import { getAllJobs, getJobCategories, getSimilarJobs } from "../../api/camspherApi";

import React, {useMemo, useState, useEffect } from "react";
import {
  Plus,
  Search,
  MapPin,
  Calendar,
  Users,
  Briefcase,
  Eye,
  Pencil,
  Trash2,
  PauseCircle,
  CheckCircle2,
  Building2,
  Mail,
  Globe,
  IndianRupee,
  Filter,
  X,
  BarChart3,
  Clock3,
} from "lucide-react";

const initialJobs = [
  {
    id: 1,
    company: "ZScaler",
    logo: "🔎",
    role: "Grad Traniee",
    location: "Mohali, IN",
    package: "₹12-15 LPA",
    type: "Full-time",
    eligibility: "CGPA 7.5+ • CSE, IT, ECE",
    deadline: "Aug 15, 2026",
    status: "Open",
    applicants: 156,
    skills: ["React", "Node.js", "DSA"],
    hr: "Priya Sharma",
    email: "campus@zscaler.com",
    website: "zscaler.com",
  },
  {
    id: 2,
    company: "Paxcom",
    logo: "🪟",
    role: "SDE Intern",
    location: "Gurugram, IN",
    package: "₹10–12 LPA",
    type: "Full-time",
    eligibility: "CGPA 7+ • CSE, IT",
    deadline: "Nov 10, 2025",
    status: "Open",
    applicants: 142,
    skills: ["C++", "System Design"],
    hr: "Rahul Gupta",
    email: "campus@paxcom.com",
    website: "paxcom.com",
  },
  {
    id: 3,
    company: "STMicroelectronics",
    logo: "📦",
    role: "Intern",
    location: "Noida, IN",
    package: "₹22–30 LPA",
    type: "Full-time",
    eligibility: "CGPA 7+ • CSE, IT, ECE",
    deadline: "Nov 20, 2026",
    status: "Open",
    applicants: 98,
    skills: ["AWS", "Docker", "Kubernetes"],
    hr: "Neha Singh",
    email: "campus@st.com",
    website: "st.com",
  },
  {
    id: 4,
    company: "Penthara",
    logo: "🛒",
    role: "Frontend Engineer",
    location: "Mohali, IN",
    package: "₹10-12 LPA",
    type: "Full-time",
    eligibility: "CGPA 6.5+ • CSE, IT",
    deadline: "Oct 30, 2025",
    status: "Closed",
    applicants: 210,
    skills: ["React", "Tailwind"],
    hr: "Amit Joshi",
    email: "campus@flipkart.com",
    website: "flipkart.com",
  },
  {
    id: 5,
    company: "Cashify",
    logo: "💼",
    role: "Intern",
    location: "Gurugram, IN",
    package: "₹4.5–6 LPA",
    type: "Full-time",
    eligibility: "CGPA 6+ • All Branches",
    deadline: "Dec 1, 2025",
    status: "Open",
    applicants: 345,
    skills: ["Java", "SQL"],
    hr: "Sunita Rao",
    email: "campus@infosys.com",
    website: "infosys.com",
  },
  {
    id: 6,
    company: "Prodesk",
    logo: "🍕",
    role: "Data Analyst Intern",
    location: "Gurgaon, IN",
    package: "₹10–15 LPA",
    type: "Full-time",
    eligibility: "CGPA 7+ • CSE, IT, Maths",
    deadline: "Nov 25, 2026",
    status: "Paused",
    applicants: 87,
    skills: ["Python", "SQL", "Power BI"],
    hr: "Kiran Patel",
    email: "campus@prodesk.com",
    website: "prodesk.com",
  },
];

const applications = [
  {
    id: 1,
    name: "Arushi Sharma",
    branch: "CSE",
    cgpa: "8.4",
    skills: ["Python", "DSA"],
    company: "Zscaler India",
    role: "Software Engineer",
    status: "Shortlisted",
  },
  {
    id: 2,
    name: "Gunjaa ",
    branch: "CSE",
    cgpa: "7.1",
    skills: ["Java", "System Design"],
    company: "Prodesk India",
    role: "Software Engineer",
    status: "Selected",
  },
  {
    id: 3,
    name: "Arpit Miglani",
    branch: "CSE",
    cgpa: "7.8",
    skills: ["React", "Node"],
    company: "Paxcomm India",
    role: "SDE Intern",
    status: "Rejected",
  },
  {
    id: 4,
    name: "Anjali Sahni",
    branch: "CSE",
    cgpa: "8.2",
    skills: ["AWS", "Docker"],
    company: "Zscaler India",
    role: "Cloud Engineer",
    status: "Pending",
  },
];

const statusColors = {
  Open: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Closed: "bg-slate-200 text-slate-700 border-slate-300",
  Paused: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Completed: "bg-blue-100 text-blue-700 border-blue-200",
};

function JobManagement() {
  const [jobs, setJobs] = useState(() => {
  const savedJobs = localStorage.getItem("jobs");

  return savedJobs ? JSON.parse(savedJobs) : initialJobs;
});
  const [activeTab, setActiveTab] = useState("jobs");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [openModal, setOpenModal] = useState(false);

  const [form, setForm] = useState({
    company: "",
    role: "",
    description: "",
    skills: "",
    package: "",
    eligibility: "",
    cgpa: "",
    location: "",
    deadline: "",
    type: "",
    applyLink: "",
  });

  useEffect(() => {
  localStorage.setItem("jobs", JSON.stringify(jobs));
}, [jobs]);
  const filteredJobs = useMemo(() => {
  return jobs.filter((job) => {
    const query = search.toLowerCase();

    const matchSearch =
      job.company.toLowerCase().includes(query) ||
      job.role.toLowerCase().includes(query) ||
      job.location.toLowerCase().includes(query) ||
      job.package.toLowerCase().includes(query) ||
      job.type.toLowerCase().includes(query) ||
      job.status.toLowerCase().includes(query);

    const matchStatus =
      statusFilter === "All" || job.status === statusFilter;

    const matchType =
      typeFilter === "All" || job.type === typeFilter;

    return matchSearch && matchStatus && matchType;
  });
}, [jobs, search, statusFilter, typeFilter]);

const filteredApplications = useMemo(() => {
  return applications.filter((app) => {
    const query = search.toLowerCase();

    return (
      app.name.toLowerCase().includes(query) ||
      app.branch.toLowerCase().includes(query) ||
      app.company.toLowerCase().includes(query) ||
      app.role.toLowerCase().includes(query) ||
      app.status.toLowerCase().includes(query) ||
      app.skills.some((skill) =>
        skill.toLowerCase().includes(query)
      )
    );
  });
}, [search]);

const filteredCompanies = useMemo(() => {
  return jobs.filter((job) => {
    const query = search.toLowerCase();

    return (
      job.company.toLowerCase().includes(query) ||
      job.hr.toLowerCase().includes(query) ||
      job.email.toLowerCase().includes(query) ||
      job.role.toLowerCase().includes(query) ||
      job.location.toLowerCase().includes(query)
    );
  });
}, [jobs, search]);

  const totalApplications = jobs.reduce(
    (acc, item) => acc + item.applicants,
    0
  );

  const addJob = () => {
    if (
      !form.company ||
      !form.role ||
      !form.location ||
      !form.package
    ) {
      alert("Please fill required fields");
      return;
    }

    const newJob = {
      id: Date.now(),
      company: form.company,
      role: form.role,
      logo: "🏢",
      location: form.location,
      package: form.package,
      type: form.type || "Full-time",
      eligibility: form.eligibility,
      deadline: form.deadline,
      status: "Open",
      applicants: 0,
      skills: form.skills.split(","),
      hr: "HR Team",
      email: "hr@company.com",
      website: "company.com",
    };

    setJobs([newJob, ...jobs]);

    setForm({
      company: "",
      role: "",
      description: "",
      skills: "",
      package: "",
      eligibility: "",
      cgpa: "",
      location: "",
      deadline: "",
      type: "",
      applyLink: "",
    });

    setOpenModal(false);
  };

  const deleteJob = (id) => {
    setJobs(jobs.filter((job) => job.id !== id));
  };

  const toggleStatus = (id) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id !== id) return job;

        let newStatus = "Open";

        if (job.status === "Open") newStatus = "Paused";
        else if (job.status === "Paused") newStatus = "Closed";
        else if (job.status === "Closed") newStatus = "Completed";
        else newStatus = "Open";

        return { ...job, status: newStatus };
      })
    );
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] overflow-x-hidden">
  <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 min-w-0">

    {/* HEADER */}
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
          Job Management
        </h2>

        <p className="text-slate-500 mt-1 text-sm md:text-base">
          {jobs.filter((j) => j.status === "Open").length} active jobs •{" "}
          {totalApplications} total applications
        </p>
      </div>

      <button
        onClick={() => setOpenModal(true)}
        className="!bg-indigo-700 hover:bg-indigo-800 text-white px-5 py-3 rounded-2xl flex items-center gap-2 shadow-sm transition-all shrink-0"
      >
        <Plus size={18} />
        Post New Job
      </button>
    </div>

    {/* ANALYTICS */}
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm min-w-0">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm text-slate-500">Total Jobs</p>
            <h2 className="text-3xl font-bold mt-2">{jobs.length}</h2>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0">
            <Briefcase className="text-indigo-700" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm min-w-0">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm text-slate-500">Active Jobs</p>

            <h2 className="text-3xl font-bold mt-2 text-emerald-600">
              {jobs.filter((j) => j.status === "Open").length}
            </h2>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="text-emerald-700" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm min-w-0">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm text-slate-500">Closed Jobs</p>

            <h2 className="text-3xl font-bold mt-2 text-slate-700">
              {jobs.filter((j) => j.status === "Closed").length}
            </h2>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
            <PauseCircle className="text-slate-700" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm min-w-0">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm text-slate-500">
              Total Applications
            </p>

            <h2 className="text-3xl font-bold mt-2 text-indigo-700">
              {totalApplications}
            </h2>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0">
            <Users className="text-indigo-700" />
          </div>
        </div>
      </div>
    </div>

    {/* TABS */}
    <div className="flex flex-wrap gap-3">
      {[
        { id: "jobs", label: "Job Listings" },
        { id: "applications", label: "Applications" },
        { id: "companies", label: "Companies" },
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-5 py-3 rounded-2xl border transition-all whitespace-nowrap ${
            activeTab === tab.id
              ? "bg-white shadow-sm text-slate-900"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>

    {/* FILTERS */}
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">

      <div className="flex flex-col lg:flex-row gap-4 min-w-0">

        <div className="relative flex-1 min-w-0">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder={
               activeTab === "jobs"
                ? "Search company, role, location..."
                : activeTab === "applications"
                ? "Search student, skills, company..."
                : "Search company, HR, email..."
                }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 rounded-2xl border border-gray-200 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap gap-3">

          <select
            className="h-12 px-4 rounded-2xl border border-gray-200 outline-none min-w-[140px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All</option>
            <option>Open</option>
            <option>Closed</option>
            <option>Paused</option>
            <option>Completed</option>
          </select>

          <select
            className="h-12 px-4 rounded-2xl border border-gray-200 outline-none min-w-[140px]"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option>All</option>
            <option>Full-time</option>
            <option>Internship</option>
          </select>
        </div>
      </div>
    </div>

    {/* JOBS */}
    {activeTab === "jobs" && (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        {/* MOBILE CARDS */}
        <div className="block xl:hidden p-4 space-y-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="border border-gray-200 rounded-2xl p-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-xl shrink-0">
                  {job.logo}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900 truncate">
                    {job.role}
                  </h3>

                  <p className="text-sm text-slate-500 truncate">
                    {job.company}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 text-sm">

                <div>
                  <p className="text-slate-400">Location</p>
                  <p className="font-medium">{job.location}</p>
                </div>

                <div>
                  <p className="text-slate-400">Package</p>
                  <p className="font-medium">{job.package}</p>
                </div>

                <div>
                  <p className="text-slate-400">Applicants</p>
                  <p className="font-medium">{job.applicants}</p>
                </div>

                <div>
                  <p className="text-slate-400">Status</p>

                  <span
                    className={`px-2 py-1 rounded-full text-xs border inline-flex mt-1 ${statusColors[job.status]}`}
                  >
                    {job.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-5">

                <div className="flex gap-3">

                  <button className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Eye size={18} />
                  </button>

                  <button className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Pencil size={18} />
                  </button>

                  <button
                    onClick={() => toggleStatus(job.id)}
                    className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center"
                  >
                    <PauseCircle size={18} />
                  </button>

                </div>

                <button
                  onClick={() => deleteJob(job.id)}
                  className="p-1 rounded hover:bg-red-100 text-red-500"
                >
                  <Trash2 size={18} />
                </button>

              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden xl:block w-full overflow-hidden">
          <table className="w-full table-auto">

            <thead className="bg-slate-50 border-b">
              <tr className="text-left text-sm text-slate-500">
                <th className="p-5 font-medium">Company / Role</th>
                <th className="p-5 font-medium">Location</th>
                <th className="p-5 font-medium">Package</th>
                <th className="p-5 font-medium">Status</th>
                <th className="p-5 font-medium">Applicants</th>
                <th className="p-5 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredJobs.map((job) => (
                <tr
                  key={job.id}
                  className="border-b hover:bg-slate-50 transition-all"
                >
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-xl shrink-0">
                        {job.logo}
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900">
                          {job.role}
                        </h3>

                        <p className="text-slate-500 text-sm">
                          {job.company}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="p-5 text-sm text-slate-600">
                    {job.location}
                  </td>

                  <td className="p-5 font-semibold">
                    {job.package}
                  </td>

                  <td className="p-5">
                    <span
                      className={`px-3 py-1 rounded-full text-xs border ${statusColors[job.status]}`}
                    >
                      {job.status}
                    </span>
                  </td>

                  <td className="p-5">
                    {job.applicants}
                  </td>

                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleStatus(job.id)}>
                        <PauseCircle size={18} />
                      </button>

                      <button onClick={() => deleteJob(job.id)}>
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
    )}
  </div>

      {/* APPLICATIONS */}
      {activeTab === "applications" && (
        <div className="bg-white rounded-3xl border shadow-sm mt-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-slate-50 border-b">
                <tr className="text-left text-sm text-slate-500">
                  <th className="p-5">Student</th>
                  <th className="p-5">Branch</th>
                  <th className="p-5">CGPA</th>
                  <th className="p-5">Role</th>
                  <th className="p-5">Company</th>
                  <th className="p-5">Skills</th>
                  <th className="p-5">Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="border-b">
                    <td className="p-5 font-medium">{app.name}</td>
                    <td className="p-5">{app.branch}</td>
                    <td className="p-5 font-semibold text-indigo-700">
                      {app.cgpa}
                    </td>
                    <td className="p-5">{app.role}</td>
                    <td className="p-5">{app.company}</td>

                    <td className="p-5">
                      <div className="flex flex-wrap gap-2">
                        {app.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-1 rounded-full text-xs bg-slate-100"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="p-5">
                      <span
                        className={`px-3 py-1 rounded-full text-xs border ${
                          app.status === "Selected"
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                            : app.status === "Rejected"
                            ? "bg-red-100 text-red-700 border-red-200"
                            : app.status === "Shortlisted"
                            ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                            : "bg-yellow-100 text-yellow-700 border-yellow-200"
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* COMPANIES */}
      {activeTab === "companies" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 mt-6">
          {filteredCompanies.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-3xl border shadow-sm p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl">
                    {job.logo}
                  </div>

                  <div>
                    <h3 className="text-2xl font-semibold">
                      {job.company}
                    </h3>

                    <a
                      href={`https://${job.website}`}
                      className="text-indigo-700 text-sm flex items-center gap-1 mt-1"
                    >
                      <Globe size={14} />
                      Website
                    </a>
                  </div>
                </div>

                <div className="text-right">
                  <h3 className="font-bold">1 Job</h3>
                  <p className="text-sm text-slate-500">
                    {job.applicants} applicants
                  </p>
                </div>
              </div>

              <div className="border-t my-5" />

              <div className="space-y-3 text-slate-600">
                <div className="flex items-center gap-3">
                  <Users size={16} />
                  HR: {job.hr}
                </div>

                <div className="flex items-center gap-3">
                  <Mail size={16} />
                  {job.email}
                </div>
              </div>

              <div className="border-t my-5" />

              <div>
                <p className="text-sm text-slate-500 mb-3">
                  Posted Role
                </p>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-sm">
                    {job.role}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-xs border ${statusColors[job.status]}`}
                  >
                    {job.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD JOB MODAL */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 z-50 overflow-y-auto p-0">
          <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-4 space-y-3">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-2xl font-bold">
                    Create New Job
                  </h3>

                  <p className="text-slate-500 ">
                    Add a new placement opportunity
                  </p>
                </div>

                <button
                  onClick={() => setOpenModal(false)}
                  className="w-10 h-8 rounded-xl bg-grey-200 hover:bg-red-500 hover:text-white text-gray-700 flex items-center justify-center transition-all duration-200"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <input
                  placeholder="Company Name"
                  className="h-8 rounded-2xl border px-4 outline-none"
                  value={form.company}
                  onChange={(e) =>
                    setForm({ ...form, company: e.target.value })
                  }
                />

                <input
                  placeholder="Role Title"
                  className="h-8 rounded-2xl border px-4 outline-none"
                  value={form.role}
                  onChange={(e) =>
                    setForm({ ...form, role: e.target.value })
                  }
                />

                <input
                  placeholder="Package / Salary"
                  className="h-8 rounded-2xl border px-4 outline-none"
                  value={form.package}
                  onChange={(e) =>
                    setForm({ ...form, package: e.target.value })
                  }
                />

                <input
                  placeholder="Location"
                  className="h-8 rounded-2xl border px-4 outline-none"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                />

                <input
                  placeholder="CGPA Requirement"
                  className="h-8 rounded-2xl border px-4 outline-none"
                  value={form.cgpa}
                  onChange={(e) =>
                    setForm({ ...form, cgpa: e.target.value })
                  }
                />

                <select
                  className="h-8rounded-2xl border px-4 outline-none"
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value })
                  }
                >
                  <option value="">Job Type</option>
                  <option>Full-time</option>
                  <option>Internship</option>
                </select>

                <input
                  type="date"
                  className="h-8 rounded-2xl border px-4 outline-none"
                  value={form.deadline}
                  onChange={(e) =>
                    setForm({ ...form, deadline: e.target.value })
                  }
                />

                <input
                  placeholder="Apply Link"
                  className="h-8 rounded-2xl border px-4 outline-none"
                  value={form.applyLink}
                  onChange={(e) =>
                    setForm({ ...form, applyLink: e.target.value })
                  }
                />

                <textarea
                  rows={2}
                  placeholder="Required Skills (comma separated)"
                  className="rounded-2xl border p-3 outline-none md:col-span-2"
                  value={form.skills}
                  onChange={(e) =>
                    setForm({ ...form, skills: e.target.value })
                  }
                />

                <textarea
                  rows={2}
                  placeholder="Eligibility Criteria"
                  className="rounded-2xl border p-3 outline-none md:col-span-2"
                  value={form.eligibility}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      eligibility: e.target.value,
                    })
                  }
                />

                <textarea
                  rows={2}
                  placeholder="Job Description"
                  className="rounded-2xl border p-3 outline-none md:col-span-2"
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex justify-end gap-3 mt-5">
                <button
                  onClick={() => setOpenModal(false)}
                  className="px-5 py-3 rounded-2xl border"
                >
                  Cancel
                </button>

                <button
                  onClick={addJob}
                  className="!bg-indigo-700 hover:bg-indigo-800 text-white px-6 py-3 rounded-2xl"
                >
                  Publish Job
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobManagement;
