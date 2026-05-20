import { getAllJobs, getJobCategories } from "../../api/camspherApi";
import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  MapPin,
  Users,
  Calendar,
  MoreHorizontal,
  Trash2 ,
    X,
} from "lucide-react";

const initialJobs = [
  { id: 1, title: "Grad Trainee", dept: "Engineering", type: "Internship", location: "Bangalore, IN", applicants: 142, date: "Oct 24, 2026", status: "LIVE", description: "Build scalable backend systems and lead a team of 3." },
  { id: 2, title: "SDE Intern", dept: "Engineering", type: "Internship", location: "Mumbai, IN", applicants: 89, date: "Oct 22, 2026", status: "LIVE", description: "Develop software solutions." },
  { id: 3, title: "UX Designer (Junior) Intern", dept: "Design", type: "Internship", location: "Remote", applicants: 312, date: "Oct 15, 2026", status: "LIVE", description: "Create user-centered designs." },
  { id: 4, title: "Data Scientist Intern", dept: "Analytics", type: "Internship", location: "Hyderabad, IN", applicants: 56, date: "Oct 12, 2026", status: "LIVE", description: "Build ML models." },
  { id: 5, title: "Backend Engineer Intern", dept: "Engineering", type: "Internship", location: "Pune, IN", applicants: 98, date: "Oct 10, 2026", status: "LIVE", description: "Develop APIs." },
  { id: 6, title: "Python Developer Intern", dept: "Development", type: "Internship", location: "Delhi, IN", applicants: 23, date: "Oct 8, 2026", status: "DRAFT", description: "Develop Python applications." },
];

const statusStyle = {
  LIVE: "bg-blue-100 text-blue-600",
  CLOSED: "bg-gray-200 text-gray-600",
  DRAFT: "bg-yellow-100 text-yellow-700",
};

const filterOptions = ["All", "LIVE", "CLOSED", "DRAFT"];

function PostJob() {
  const [jobs, setJobs] = useState(initialJobs);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

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

  const filtered = jobs.filter((j) => {
    const matchSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.dept.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || j.status === filter;
    return matchSearch && matchFilter;
  });

const handlePost = () => {
  if (
    !form.company ||
    !form.role ||
    !form.location ||
    !form.type
  ) {
    alert("Fill all fields");
    return;
  }

  setJobs([
    ...jobs,
    {
      id: Date.now(),
      title: form.role,
      dept: form.company,
      company: form.company,
      role: form.role,
      type: form.type,
      location: form.location,
      description: form.description,
      package: form.package,
      applicants: 0,
      date: new Date().toDateString(),
      status: "LIVE",
    },
  ]);

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

  setOpen(false);
};
  const toggleStatus = (id) => {
  setJobs((prev) =>
    prev.map((job) => {
      if (job.id !== id) return job;

      let newStatus;
      if (job.status === "LIVE") newStatus = "CLOSED";
      else if (job.status === "CLOSED") newStatus = "DRAFT";
      else newStatus = "LIVE";

      return { ...job, status: newStatus };
    })
  );
};

const deleteJob = (id) => {
  setJobs((prev) => prev.filter((job) => job.id !== id));
};
  return (
    <div className="max-w-6xl space-y-5">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Job Postings</h1>
          <p className="text-sm text-gray-500">
            {jobs.filter((j) => j.status === "LIVE").length} active postings
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="!bg-blue-600 !text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={16} /> Post New Job
        </button>
      </div>

      {/* FILTER */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-2 text-gray-400" />
          <input
            className="pl-8 border rounded px-3 py-2 w-full"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {filterOptions.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
             className={`px-3 py-1.5 rounded-lg text-sm border ${
  filter === f
    ? "!bg-blue-600 !text-white"
    : "!bg-gray-200 !text-black"
}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-xl border shadow-sm p-5 flex flex-col gap-3 hover:shadow-md"
          >
            <div className="flex justify-between">
              <div className="w-10 h-10 bg-blue-100 flex items-center justify-center rounded-lg">
                💼
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded ${statusStyle[job.status]}`}
                >
                  {job.status}
                </span>

                <button onClick={() => toggleStatus(job.id)}>
                  <MoreHorizontal size={10} />
                </button>

                <button onClick={() => deleteJob(job.id)}
                  className="p-1 rounded hover:bg-red-100 text-red-500"
                >
                   <Trash2 size={10} />
                </button>

              </div>
            </div>

            <div>
              <h3 className="font-semibold">{job.title}</h3>
              <p className="text-xs text-gray-500">
                {job.dept} • {job.type}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {job.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-auto pt-2 border-t">
              <span className="flex items-center gap-1">
                <MapPin size={12} /> {job.location}
              </span>
              <span className="flex items-center gap-1">
                <Users size={12} /> {job.applicants}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={12} /> {job.date}
              </span>
            </div>
          </div>
        ))}
      </div>

     {/* MODAL */}
{open && (
  <div className="fixed inset-0 bg-black/40 z-50 overflow-y-auto p-4">
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-5 space-y-4">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              Create New Job
            </h2>

            <p className="text-gray-500 text-sm">
              Add a new placement opportunity
            </p>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="p-1 rounded hover:bg-red-100 text-red-500"
          >
            <X size={18} />
          </button>
        </div>

        {/* FORM */}
<div className="grid md:grid-cols-2 gap-5">

  <input
    placeholder="Company Name"
    className="h-12 rounded-2xl border px-4 outline-none"
    value={form.company}
    onChange={(e) =>
      setForm({ ...form, company: e.target.value })
    }
  />

  <input
    placeholder="Role Title"
    className="h-12 rounded-2xl border px-4 outline-none"
    value={form.role}
    onChange={(e) =>
      setForm({ ...form, role: e.target.value })
    }
  />

  <input
    placeholder="Package / Salary"
    className="h-12 rounded-2xl border px-4 outline-none"
    value={form.package}
    onChange={(e) =>
      setForm({ ...form, package: e.target.value })
    }
  />

  <input
    placeholder="Location"
    className="h-12 rounded-2xl border px-4 outline-none"
    value={form.location}
    onChange={(e) =>
      setForm({ ...form, location: e.target.value })
    }
  />

  <input
    placeholder="CGPA Requirement"
    className="h-12 rounded-2xl border px-4 outline-none"
    value={form.cgpa}
    onChange={(e) =>
      setForm({ ...form, cgpa: e.target.value })
    }
  />

  <select
    className="h-12 rounded-2xl border px-4 outline-none"
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
    className="h-12 rounded-2xl border px-4 outline-none"
    value={form.deadline}
    onChange={(e) =>
      setForm({ ...form, deadline: e.target.value })
    }
  />

  <input
    placeholder="Apply Link"
    className="h-12 rounded-2xl border px-4 outline-none"
    value={form.applyLink}
    onChange={(e) =>
      setForm({ ...form, applyLink: e.target.value })
    }
  />

  <textarea
    rows={3}
    placeholder="Required Skills (comma separated)"
    className="rounded-2xl border p-4 outline-none md:col-span-2"
    value={form.skills}
    onChange={(e) =>
      setForm({ ...form, skills: e.target.value })
    }
  />

  <textarea
    rows={3}
    placeholder="Eligibility Criteria"
    className="rounded-2xl border p-4 outline-none md:col-span-2"
    value={form.eligibility}
    onChange={(e) =>
      setForm({
        ...form,
        eligibility: e.target.value,
      })
    }
  />

  <textarea
    rows={4}
    placeholder="Job Description"
    className="rounded-2xl border p-4 outline-none md:col-span-2"
    value={form.description}
    onChange={(e) =>
      setForm({
        ...form,
        description: e.target.value,
      })
    }
  />
</div>

        {/* BUTTONS */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => setOpen(false)}
            className="px-5 py-2 rounded-xl border"
          >
            Cancel
          </button>

          <button
            onClick={handlePost}
            className="bg-indigo-700 hover:bg-indigo-800 text-white px-6 py-2 rounded-xl transition-all"
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

export default PostJob;
