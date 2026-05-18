import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";

const Login = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const role = params.get("role") || "student";

  // 🎨 Role-based UI
  const roleConfig = {
    student: {
      title: "Student Login",
      color: "text-blue-600",
      ring: "focus-within:ring-blue-400",
      gradient: "from-blue-100 via-blue-200 to-blue-300",
      iconBg: "bg-blue-100",
      icon: "👤",
    },
    admin: {
      title: "Admin Login",
      color: "text-red-500",
      ring: "focus-within:ring-red-400",
      gradient: "from-red-100 via-red-200 to-red-300",
      iconBg: "bg-red-100",
      icon: "🔒",
    },
    recruiter: {
      title: "Recruiter Login",
      color: "text-green-600",
      ring: "focus-within:ring-green-400",
      gradient: "from-green-100 via-green-200 to-green-300",
      iconBg: "bg-green-100",
      icon: "💼",
    },
  };

  const current = roleConfig[role];

  const handleSubmit = (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (showSignup && !fullName) {
      alert("Please enter full name");
      return;
    }

    if (!email || !password) {
      alert("All fields are required");
      return;
    }

    if (!emailRegex.test(email)) {
      alert("Please enter a valid email (e.g. example@gmail.com)");
      return;
    }

    if (password.length < 4) {
      alert("Password must be at least 4 characters");
      return;
    }

    // Console output
    console.table({
      FullName: fullName,
      Email: email,
      Password: password,
      Role: role,
      Mode: showSignup ? "Signup" : "Login",
    });

    // SAVE USER DATA
    const userData = {
      fullName:
        fullName ||
        email
          .split("@")[0]
          .replace(/[0-9]/g, "")
          .replace(/[^a-zA-Z]/g, " ")
          .replace(/\s+/g, " ")
          .trim(),
      email: email,
      role: role,
    };
    localStorage.setItem("user", JSON.stringify(userData));

    // SUCCESS ALERT
    alert(
      showSignup
        ? "Account created successfully!"
        : "Login successful!"
    );

    if (role === "student") {
      localStorage.setItem("role", "student");
      navigate("/student-dashboard");
    }

    else if (role === "recruiter") {
      localStorage.setItem("role", "recruiter");
      navigate("/recruiter-dashboard");
    }

    else if (role === "admin") {
      localStorage.setItem("role", "admin");
      navigate("/admin-dashboard");
    }
  };

  return (
    <div
      className={`min-h-screen w-screen flex items-center justify-center bg-gradient-to-br ${current.gradient}`}
    >
      {/* CARD */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 text-center">

        {/* ICON */}
        <div className={`w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-2xl shadow ${current.iconBg}`}>
          <span className="text-2xl">{current.icon}</span>
        </div>

        {/* TITLE */}
        <h2 className={`text-2xl sm:text-3xl font-bold mb-2 ${current.color}`}>
          {showSignup
            ? `${role.charAt(0).toUpperCase() + role.slice(1)} Sign Up`
            : current.title}
        </h2>

        <p className="text-gray-500 text-sm mb-6">
          {showSignup
            ? "Create your new account"
            : "Welcome back! Please enter your credentials"}
        </p>
        {showSignup && (
          <div
            className={`flex items-center border rounded-lg px-3 mb-4 focus-within:ring-2 ${current.ring}`}
          >
            <User className="text-gray-400 w-5" />

            <input
              type="text"
              placeholder="Full Name"
              className="w-full p-3 outline-none text-sm sm:text-base"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        )}

        {/* EMAIL */}
        <div className={`flex items-center border rounded-lg px-3 mb-4 focus-within:ring-2 ${current.ring}`}>
          <Mail className="text-gray-400 w-5" />
          <input
            type="email"
            placeholder="Email address"
            className="w-full p-3 outline-none text-sm sm:text-base"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* PASSWORD */}
        <div className={`flex items-center border rounded-lg px-3 mb-4 focus-within:ring-2 ${current.ring}`}>
          <Lock className="text-gray-400 w-5" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full p-3 outline-none text-sm sm:text-base"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {showPassword ? (
            <EyeOff
              className="text-gray-400 w-5 cursor-pointer"
              onClick={() => setShowPassword(false)}
            />
          ) : (
            <Eye
              className="text-gray-400 w-5 cursor-pointer"
              onClick={() => setShowPassword(true)}
            />
          )}
        </div>
        {/* SUBMIT BUTTON */}
        <button
          onClick={handleSubmit}
          style={{
            backgroundColor:
              role === "student"
                ? "#4a72e0"
                : role === "admin"
                  ? "#e64c4c"
                  : "#39dc75",
          }}
          className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-all shadow-lg hover:opacity-90"
        >
          {showSignup ? "Create Account" : "Login"}
        </button>

        {/* TOGGLE LOGIN/SIGNUP */}
        <p className="text-sm text-gray-500 mt-5">
          {showSignup
            ? "Already have an account? "
            : "Don't have an account? "}

          <span
            onClick={() => setShowSignup(!showSignup)}
            className={`font-semibold cursor-pointer hover:underline ${current.color}`}
          >
            {showSignup ? "Login" : "Sign Up"}
          </span>
        </p>

        {/* DIVIDER */}
        <div className="my-5 text-gray-400 text-sm">or</div>

        {/* GOOGLE BUTTON */}
        <button className="w-full border py-3 rounded-lg flex items-center justify-center gap-2 text-sm sm:text-base hover:bg-gray-50 transition-all">
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="google"
            className="w-5"
          />

          {showSignup ? "Sign Up with Google" : "Login with Google"}
        </button>
      </div>
    </div>
  );
};

export default Login;