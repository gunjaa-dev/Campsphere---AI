import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../common/navbar";
import AnimatedBackground from "../common/AnimatedBackground";


const LandingPage = () => {
  const navigate = useNavigate();

  const cards = [
  {
    title: "Students",
    desc: "Build Profile & Apply to Dream Jobs",
    path: "/login?role=student",
    icon: "🎓",
  },
  {
    title: "Recruiters",
    desc: "Find Top Talent with AI Filters",
    path: "/login?role=recruiter",
    icon: "💼",
  },
  {
    title: "TPOs",
    desc: "Manage Placements & Analytics",
    path: "/login?role=admin",
    icon: "🏫",
  },
];

const companies = ["Google", "Microsoft", "Amazon", "Infosys", "TCS"];
  
const stories = [
    {
      name: "Priya Sharma",
      role: "Software Engineer @ Infosys",
      text: "CampSphere helped me improve my resume and land interviews faster.",
    },
    {
      name: "Aman Verma",
      role: "Data Analyst @ TCS",
      text: "The AI readiness score showed exactly what skills I needed to improve.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef2ff] via-white to-[#f8fafc] dark:from-[#0f172a] dark:to-[#020617] transition">

      <Navbar/>

      <div id="home"className="grid md:grid-cols-2 px-10 py-20 items-center gap-10">

        {/* LEFT */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <p className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 inline-block px-4 py-1 rounded-full text-xs font-semibold mb-5">
            AI-POWERED INTELLIGENCE
          </p>

          <AnimatedBackground />

          <p className="text-gray-600 dark:text-gray-300 mt-6 max-w-lg leading-relaxed">
            CampSphere uses advanced neural matching to connect the right
            students with the right opportunities.
          </p>
        </motion.div>

        {/* RIGHT */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="absolute -top-10 -right-10 w-72 h-72 bg-blue-300 opacity-20 blur-3xl rounded-full"></div>

          <div className="backdrop-blur-xl bg-white/70 dark:bg-white/10 border border-white/30 shadow-xl rounded-3xl p-8 relative z-10">

            <h2 className="text-2xl font-bold mb-8 text-center text-gray-800 dark:text-white">
              Select Your Path
            </h2>

            {cards.map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate(item.path)}
                className="flex items-center gap-4 p-5 mb-4 rounded-xl bg-white/60 dark:bg-white/10 border hover:bg-blue-600 hover:text-white cursor-pointer transition"
              >
                <div className="text-xl">{item.icon}</div>
                <div>
                  <h3 className="font-semibold text-base">{item.title}</h3>
                  <p className="text-xs opacity-80">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

             {/* PROCESS SECTION */}
      <section id="process" className="py-16 px-6 md:px-10 bg-white">
        <h2 className="text-2xl md:text-4xl font-bold text-center mb-10">Our Process</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {["Create Profile", "Upload Resume", "Get AI Insights", "Apply & Get Placed"].map((step, i) => (
            <div key={i} className="bg-blue-50 p-6 rounded-2xl shadow-sm text-center">
              <div className="text-3xl font-bold text-blue-600 mb-3">0{i + 1}</div>
              <p className="font-medium">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COMPANIES */}
      <section id="companies" className="py-20 px-6 md:px-10 bg-slate-50">
        <h2 className="text-4xl font-bold text-center mb-14">Top Hiring Companies</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {companies.map((company, i) => (
            <div key={i} className="bg-white rounded-2xl shadow p-6 text-center font-semibold">
              {company}
            </div>
          ))}
        </div>
      </section>

      {/* SUCCESS STORIES */}
      <section id="success" className="px-6 md:px-10 py-20 bg-white">
        <h2 className="text-4xl font-bold text-center mb-14">Success Stories</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {stories.map((story, index) => (
            <div key={index} className="bg-blue-50 rounded-3xl p-8 shadow-md">
              <p className="text-gray-700 mb-6 italic">“{story.text}”</p>
              <h3 className="text-xl font-bold text-blue-700">{story.name}</h3>
              <p className="text-gray-500">{story.role}</p>
            </div>
          ))}
        </div>
      </section>


      {/* HELP */}
      <section id="help" className="py-20 px-6 md:px-10 bg-[#dbe4f0]  text-center">
        <h2 className="text-4xl font-bold mb-6 text-black">Need Help?</h2>
        <p className="max-w-2xl mx-auto text-black mb-8">
            Our AI assistant helps you with resumes, placement preparation,
            mock interviews, and job applications.
        </p>
    
         <button
            onClick={() => navigate("/help")}
            className="bg-[#1d4ed8] hover:bg-black text-white px-8 py-3 rounded-xl font-semibold transition"
          >
            Get Support
          </button>
      </section>
      </div>
    </div>
  );
};

export default LandingPage;