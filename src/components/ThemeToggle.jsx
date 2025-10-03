import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";

const ThemeToggle = ({ className = "" }) => {
	const { isDarkMode, toggleTheme } = useTheme();

	return (
		<button
			onClick={toggleTheme}
			className={`p-2 rounded-lg transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 ${className}`}
			aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
			title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
		>
			{isDarkMode ? (
				<Sun className="w-5 h-5 text-yellow-400" />
			) : (
				<Moon className="w-5 h-5 text-gray-600" />
			)}
		</button>
	);
};

export default ThemeToggle;
