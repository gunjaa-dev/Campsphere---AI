import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

function ThemeToggle() {

    const { darkMode, setDarkMode } =
        useContext(ThemeContext);

    return (

        <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-14 h-7 rounded-full flex items-center p-1 transition-all duration-300 ${darkMode
                ? "bg-blue-600 justify-end"
                : "bg-gray-300 justify-start"
                }`}
        >

            <div className="w-5 h-5 rounded-full bg-white" />

        </button>

    );
}

export default ThemeToggle;