import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, User, Briefcase, Building2 } from "lucide-react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase/firebase";

const Login = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [collegeName, setCollegeName] = useState("");

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
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);

      const user = result.user;

      const userData = {
        fullName: user.displayName,
        email: user.email,
        profilePic: user.photoURL,
        role: role,
      };

      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("role", role);

      alert("Google Login Successful!");

      if (role === "student") {
        navigate("/student-dashboard");
      } else if (role === "recruiter") {
        navigate("/recruiter-dashboard");
      } else if (role === "admin") {
        navigate("/admin-dashboard");
      }

    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

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
      password: password,
      role: role,
      companyName: role === "recruiter" ? companyName : "",
      collegeName: role === "admin" ? collegeName : "",
    };

    const existingUser = localStorage.getItem(email);

    if (showSignup && existingUser) {
      alert("Account already exists");
      return;
    }

    if (showSignup) {
      localStorage.setItem(email, JSON.stringify(userData));
      localStorage.setItem("user", JSON.stringify(userData));
    }
    if (!showSignup) {
      const existingUser = localStorage.getItem(email);

      if (!existingUser) {
        alert("Account not found. Please sign up first.");
        return;
      }

      const parsedUser = JSON.parse(existingUser);

      if (parsedUser.password !== password) {
        alert("Incorrect password");
        return;
      }

      localStorage.setItem("user", JSON.stringify(parsedUser));
    }


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
      className={`min-h-screen w-screen flex items-center justify-center bg-gradient-to-br ${current.gradient} dark:from-gray-950 dark:via-gray-900 dark:to-black transition-all duration-300`}
    >
      {/* CARD */}
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 sm:p-8 text-center dark:text-white border dark:border-gray-700 transition-all duration-300">

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

        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          {showSignup
            ? "Create your new account"
            : "Welcome back! Please enter your credentials"}
        </p>
        {showSignup && (
          <div
            className={`flex items-center border dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 mb-4 focus-within:ring-2 ${current.ring}`}
          >
            <User className="text-gray-400 dark:text-gray-500 w-5" />

            <input
              type="text"
              placeholder="Full Name"
              className="w-full p-3 outline-none text-sm sm:text-base bg-transparent dark:text-white placeholder:text-gray-400"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        )}

        {showSignup && role === "recruiter" && (
          <div
            className={`flex items-center border dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 mb-4 focus-within:ring-2 ${current.ring}`}
          >
            <Briefcase className="text-gray-400 dark:text-gray-500 w-5" />

            <input
              type="text"
              placeholder="Company Name"
              className="w-full p-3 outline-none text-sm sm:text-base bg-transparent dark:text-white placeholder:text-gray-400"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
        )}

        {showSignup && role === "admin" && (
          <div
            className={`flex items-center border dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 mb-4 focus-within:ring-2 ${current.ring}`}
          >
            <Building2 className="text-gray-400 dark:text-gray-500 w-5" />

            <input
              type="text"
              placeholder="College Name"
              className="w-full p-3 outline-none text-sm sm:text-base bg-transparent dark:text-white placeholder:text-gray-400"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
            />
          </div>
        )}
        {/* EMAIL */}
        <div className={`flex items-center border dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 mb-4 focus-within:ring-2 ${current.ring}`}>
          <Mail className="text-gray-400 dark:text-gray-500 w-5" />
          <input
            type="email"
            placeholder="Email address"
            className="w-full p-3 outline-none text-sm sm:text-base bg-transparent dark:text-white placeholder:text-gray-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* PASSWORD */}
        <div className={`flex items-center border dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 mb-4 focus-within:ring-2 ${current.ring}`}>
          <Lock className="text-gray-400 dark:text-gray-500 w-5" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full p-3 outline-none text-sm sm:text-base bg-transparent dark:text-white placeholder:text-gray-400"
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
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-5">
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
        <div className="my-5 text-gray-400 dark:text-gray-500 text-sm">or</div>

        {/* GOOGLE BUTTON */}
        <button
          onClick={handleGoogleLogin}
          className="w-full border dark:border-gray-700 py-3 rounded-lg flex items-center justify-center gap-2 text-sm sm:text-base hover:bg-gray-50 dark:hover:bg-gray-800 transition-all dark:text-white"
        >
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