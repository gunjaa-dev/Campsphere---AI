import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Mail,
    Building2,
    User,
    ArrowLeft,
    Briefcase,
    Save,
    X,
} from "lucide-react";

function RecruiterProfile() {
    const navigate = useNavigate();

    const storedUser = JSON.parse(localStorage.getItem("user"));

    const [isEditing, setIsEditing] = useState(false);

    const [profile, setProfile] = useState({
        fullName: storedUser?.fullName || "",
        email: storedUser?.email || "",
        companyName: storedUser?.companyName || "",
        role: storedUser?.role || "recruiter",
    });

    const handleChange = (e) => {
        setProfile({
            ...profile,
            [e.target.name]: e.target.value,
        });
    };

    const handleSave = () => {
        localStorage.setItem("user", JSON.stringify(profile));

        setIsEditing(false);

        alert("Profile updated successfully!");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#eef2ff] via-white to-[#f8fafc] dark:from-black dark:via-black dark:to-black text-black dark:text-white p-6">

            {/* TOP BAR */}
            <div className="max-w-5xl mx-auto flex justify-between items-center mb-6">

                <button
                    onClick={() => navigate("/recruiter-dashboard")}
                    className="flex items-center gap-2 text-sm text-blue-400 hover:underline"
                >
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </button>

                <div className="flex gap-3">

                    {isEditing ? (
                        <>
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 px-4 py-2 bg-[#24389c] text-white rounded-xl hover:bg-[#1e2f85] transition"
                            >
                                <Save size={18} />
                                Save
                            </button>

                            <button
                                onClick={() => setIsEditing(false)}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 text-black dark:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-900 transition"
                            >
                                <X size={18} />
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-5 py-2 bg-[#24389c] text-white rounded-xl hover:bg-[#1e2f85] transition"
                        >
                            Edit Profile
                        </button>
                    )}

                </div>
            </div>

            {/* PROFILE CARD */}
            <div className="max-w-5xl mx-auto bg-white dark:bg-gray-950 rounded-3xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800">

                {/* HEADER */}
                <div className="bg-gradient-to-r from-[#24389c] to-[#4f46e5] px-8 py-10">

                    <div className="flex items-center gap-6">

                        {/* AVATAR */}
                        <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
                            {profile.fullName?.charAt(0).toUpperCase()}
                        </div>

                        {/* INFO */}
                        <div className="text-white">

                            <h1 className="text-3xl font-bold">
                                {profile.fullName || "Recruiter"}
                            </h1>

                            <p className="text-sm text-white/90 mt-1">
                                Recruiter at {profile.companyName || "Company"}
                            </p>

                            <p className="text-sm text-white/70 mt-2">
                                Managing campus hiring and recruitment activities
                            </p>

                        </div>
                    </div>
                </div>

                {/* CONTENT */}
                <div className="p-8">

                    {/* PROFILE DETAILS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* FULL NAME */}
                        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">

                            <div className="flex items-center gap-2 mb-3 text-gray-600 dark:text-gray-300">
                                <User size={18} />
                                <span>Full Name</span>
                            </div>

                            {isEditing ? (
                                <input
                                    type="text"
                                    name="fullName"
                                    value={profile.fullName}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            ) : (
                                <p className="font-semibold text-lg text-black dark:text-white">
                                    {profile.fullName}
                                </p>
                            )}
                        </div>

                        {/* EMAIL */}
                        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">

                            <div className="flex items-center gap-2 mb-3 text-gray-600 dark:text-gray-300">
                                <Mail size={18} />
                                <span>Email Address</span>
                            </div>

                            <p className="font-semibold text-lg text-black dark:text-white break-all">
                                {profile.email}
                            </p>
                        </div>

                        {/* COMPANY */}
                        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">

                            <div className="flex items-center gap-2 mb-3 text-gray-600 dark:text-gray-300">
                                <Building2 size={18} />
                                <span>Company Name</span>
                            </div>

                            {isEditing ? (
                                <input
                                    type="text"
                                    name="companyName"
                                    value={profile.companyName}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            ) : (
                                <p className="font-semibold text-lg text-black dark:text-white">
                                    {profile.companyName}
                                </p>
                            )}
                        </div>

                        {/* ROLE */}
                        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">

                            <div className="flex items-center gap-2 mb-3 text-gray-600 dark:text-gray-300">
                                <Briefcase size={18} />
                                <span>Role</span>
                            </div>

                            <p className="font-semibold text-lg capitalize text-black dark:text-white">
                                {profile.role}
                            </p>
                        </div>
                    </div>

                    {/* LOGOUT */}
                    <div className="mt-10 flex justify-end">

                        <button
                            onClick={() => {
                                localStorage.removeItem("user");
                                localStorage.removeItem("role");

                                navigate("/login?role=recruiter");
                            }}
                            className="px-6 py-3 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-950 transition"
                        >
                            Logout
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default RecruiterProfile;