import { motion } from "framer-motion";

const AnimatedBackground = () => {
  return (
    <motion.h1
      className="text-4xl md:text-6xl font-bold leading-tight text-black dark:text-white"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      Bridging Talent with{" "}

      <span className="text-blue-700 dark:text-blue-500">
        Precision.
      </span>
    </motion.h1>
  );
};

export default AnimatedBackground;