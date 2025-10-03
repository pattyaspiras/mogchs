import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
};

export const ThemeProvider = ({ children }) => {
	const [isDarkMode, setIsDarkMode] = useState(() => {
		// Get the theme from localStorage, default to light mode
		const savedTheme = localStorage.getItem("theme");
		if (savedTheme) {
			return savedTheme === "dark";
		}
		// Check system preference if no saved theme
		return window.matchMedia("(prefers-color-scheme: dark)").matches;
	});

	useEffect(() => {
		// Update localStorage when theme changes
		localStorage.setItem("theme", isDarkMode ? "dark" : "light");

		// Update the document class for Tailwind CSS
		if (isDarkMode) {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	}, [isDarkMode]);

	const toggleTheme = () => {
		setIsDarkMode((prev) => !prev);
	};

	const setTheme = (theme) => {
		setIsDarkMode(theme === "dark");
	};

	const value = {
		isDarkMode,
		toggleTheme,
		setTheme,
		theme: isDarkMode ? "dark" : "light",
	};

	return (
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
};
