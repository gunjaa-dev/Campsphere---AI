import { useEffect, useState } from "react";
import {
  Camera,
  GraduationCap,
  Edit2,
  Check,
  X,
} from "lucide-react";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [draft, setDraft] = useState(null);
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const savedProfile = JSON.parse(
        localStorage.getItem("profile")
      );

      const localUser =
        JSON.parse(localStorage.getItem("user")) || {};

      if (savedProfile) {
        setProfile(savedProfile);
        setDraft(savedProfile);
        setSkills(savedProfile.skills || []);
        return;
      }

      const fallbackProfile = {
        name: localUser.fullName || "New User",
        role: "Student",
        email: localUser.email || "",
        phone: "",
        location: "",
        bio: "",
        college: "",
        degree: "",
        year: "",
        cgpa: "",
        skills: [],
        projects: [],
      };

      setProfile(fallbackProfile);
      setDraft(fallbackProfile);
      setSkills([]);
    } catch (err) {
      console.log(err);
    }
  };

  const [editing, setEditing] = useState(false);

  const [skills, setSkills] = useState([]);

  const [newSkill, setNewSkill] = useState("");

  const handleSave = async () => {
    const updatedDraft = {
      ...draft,
      skills,
    };

    // Update profile instantly
    setProfile(updatedDraft);

    // Update draft too
    setDraft(updatedDraft);

    // Save locally
    localStorage.setItem(
      "profile",
      JSON.stringify(updatedDraft)
    );

    try {
      // Try backend save
    } catch (err) {
      console.log(err);
    }

    setEditing(false);
  };
  const handleCancel = () => {
    setDraft(profile);
    setSkills(profile.skills || []);
    setEditing(false);
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill("");
    }
  };

  const removeSkill = (s) => {
    setSkills(skills.filter((item) => item !== s));
  };

  if (!profile || !draft) {
    return <div className="dark:bg-gray-950 dark:text-white min-h-screen p-6">
      Loading profile...
    </div>
  }

  return (
    <div className="flex-1 min-h-screen bg-gray-100 dark:bg-gray-950 dark:text-white p-4 sm:p-6 lg:p-8 opacity-100">
      <div className="w-full max-w-none space-y-6 opacity-100">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">My Profile</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Manage your profile
            </p>
          </div>

          {editing ? (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="flex items-center gap-1 px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white rounded-lg"
              >
                <X size={14} /> Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
              >
                <Check size={14} /> Save
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 transition text-white rounded"
            >
              <Edit2 size={14} /> Edit
            </button>
          )}
        </div>

        {/* PROFILE CARD */}
        <div className="w-full bg-white dark:bg-gray-900 rounded-xl shadow border dark:border-gray-700 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">

            {/* Avatar */}
            <div className="relative w-20 h-20">
              <div className="w-full h-full rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl">
                {profile.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              {editing && (
                <div className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full">
                  <Camera size={12} />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-2">
              {editing ? (
                <>
                  <input
                    className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white p-2 rounded"
                    placeholder="Enter your full name"
                    value={draft.name}
                    onChange={(e) =>
                      setDraft({ ...draft, name: e.target.value })
                    }
                  />
                  <input
                    className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white p-2 rounded"
                    placeholder="Enter your role"
                    value={draft.role}
                    onChange={(e) =>
                      setDraft({ ...draft, role: e.target.value })
                    }
                  />
                  <textarea
                    className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white p-2 rounded"
                    placeholder="Write about yourself"
                    value={draft.bio}
                    onChange={(e) =>
                      setDraft({ ...draft, bio: e.target.value })
                    }
                  />
                </>
              ) : (
                <>
                  <h2 className="text-lg font-semibold">{profile.name}</h2>
                  <p className="text-gray-500 dark:text-gray-400">{profile.role}</p>
                  <p className="text-sm dark:text-gray-300">
                    {profile.bio}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* CONTACT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            {["email", "phone", "location"].map((field) => (
              <div key={field} className="flex items-center gap-2">
                {editing ? (
                  <input
                    className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white p-2 rounded"
                    placeholder={
                      field === "email"
                        ? "Enter your email"
                        : field === "phone"
                          ? "Enter phone number"
                          : "Enter your location"
                    }

                    value={draft[field]}
                    onChange={(e) =>
                      setDraft({ ...draft, [field]: e.target.value })
                    }
                  />
                ) : (
                  <span className="dark:text-gray-200">
                    {profile[field] || "Not added yet"}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* EDUCATION */}
        <div className="w-full bg-white dark:bg-gray-900 rounded-xl shadow border dark:border-gray-700 p-4 sm:p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <GraduationCap size={18} /> Education
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {["college", "degree", "year", "cgpa"].map((field) =>
              editing ? (
                <input
                  key={field}
                  className="border dark:border-gray-700 dark:bg-gray-800 dark:text-white p-2 rounded"
                  placeholder={
                    field === "college"
                      ? "Enter college name"
                      : field === "degree"
                        ? "Enter degree"
                        : field === "year"
                          ? "Enter academic year"
                          : "Enter CGPA"
                  }

                  value={draft[field]}
                  onChange={(e) =>
                    setDraft({ ...draft, [field]: e.target.value })
                  }
                />
              ) : (
                <div key={field}>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{field}</p>
                  <p className="font-medium dark:text-gray-200">
                    {profile[field] || "Not added yet"}
                  </p>
                </div>
              )
            )}
          </div>
        </div>

        {/* SKILLS */}
        <div className="w-full bg-white dark:bg-gray-900 rounded-xl shadow border dark:border-gray-700 p-4 sm:p-6">
          <h3 className="font-semibold mb-4">Skills</h3>

          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <div
                key={s}
                className="bg-gray-200 dark:bg-gray-800 dark:text-gray-200 px-3 py-1 rounded flex items-center gap-1"
              >
                {s}
                {editing && (
                  <X
                    size={12}
                    className="cursor-pointer"
                    onClick={() => removeSkill(s)}
                  />
                )}
              </div>
            ))}
          </div>

          {editing && (
            <div className="flex gap-2 mt-3 flex-wrap">
              <input
                className="border dark:border-gray-700 dark:bg-gray-800 dark:text-white p-2 rounded"
                placeholder="Add skill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkill()}
              />
              <button
                onClick={addSkill}
                className="bg-blue-600 hover:bg-blue-700 transition text-white px-3 rounded"
              >
                Add
              </button>
            </div>
          )}
        </div>

        {/* PROJECTS */}
        <div className="w-full bg-white dark:bg-gray-900 rounded-xl shadow border dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">

            <h3 className="font-semibold">
              Projects
            </h3>

            {editing && (
              <button
                onClick={() => {
                  const updatedProjects = [
                    ...(draft.projects || []),
                    {
                      title: "",
                      description: "",
                    },
                  ];

                  setDraft({
                    ...draft,
                    projects: updatedProjects,
                  });
                }}
                className="bg-blue-600 hover:bg-blue-700 transition text-white px-3 py-1 rounded text-sm"
              >
                Add Project
              </button>
            )}
          </div>

          {draft.projects?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

              {draft.projects.map((project, index) => (
                <div
                  key={index}
                  className="border dark:border-gray-700 dark:bg-gray-800 p-3 rounded space-y-2"
                >

                  {editing ? (
                    <>
                      <input
                        className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white p-2 rounded"
                        placeholder="Project title"
                        value={project.title}
                        onChange={(e) => {
                          const updatedProjects = [...draft.projects];

                          updatedProjects[index].title =
                            e.target.value;

                          setDraft({
                            ...draft,
                            projects: updatedProjects,
                          });
                        }}
                      />

                      <textarea
                        className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white p-2 rounded"
                        placeholder="Project description"
                        value={project.description}
                        onChange={(e) => {
                          const updatedProjects = [...draft.projects];

                          updatedProjects[index].description =
                            e.target.value;

                          setDraft({
                            ...draft,
                            projects: updatedProjects,
                          });
                        }}
                      />

                      <button
                        onClick={() => {
                          const updatedProjects =
                            draft.projects.filter(
                              (_, i) => i !== index
                            );

                          setDraft({
                            ...draft,
                            projects: updatedProjects,
                          });
                        }}
                        className="text-red-500 text-sm"
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold">
                        {project.title}
                      </p>

                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {project.description}
                      </p>
                    </>
                  )}
                </div>
              ))}

            </div>
          ) : (
            <div className="text-gray-500 dark:text-gray-400 text-sm border dark:border-gray-700 rounded p-4 text-center">
              No projects added yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
