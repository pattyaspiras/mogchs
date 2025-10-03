import React, { useState, useEffect } from "react";
import {
	Menu,
	LayoutDashboard,
	Users,
	FileText,
	Settings,
	LogOut,
	ChevronDown,
	User,
	FolderOpen,
	User2,
} from "lucide-react";
import CryptoJS from "crypto-js";
import Cookies from "js-cookie";

const SECRET_KEY = "mogchs_secret_key";

export default function Sidebar({
	sidebarOpen,
	setSidebarOpen,
	activeSection,
	handleNavClick,
	onLogout,
	onProfileClick,
	navItems,
	userType = "admin", // optional fallback, panel type is determined from userLevel in cookie
	userId,
}) {
	const [showUserDropdown, setShowUserDropdown] = useState(false);
	const [currentUser, setCurrentUser] = useState(null);

	// Get current user from cookie
	useEffect(() => {
		const userCookie = Cookies.get("mogchs_user");
		if (userCookie) {
			try {
				const bytes = CryptoJS.AES.decrypt(userCookie, SECRET_KEY);
				const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
				setCurrentUser(decryptedData);
			} catch {}
		}
	}, []);

	// Determine panel type based on userLevel from cookie
	const getPanelType = () => {
		if (!currentUser) return userType; // fallback to prop if no user data

		const userLevel = currentUser.userLevel;
		if (userLevel === "Admin") return "admin";
		if (userLevel === "Registrar") return "registrar";
		if (userLevel === "Teacher") return "teacher";
		if (userLevel === "Student") return "student";

		return userType; // fallback to prop
	};

	const panelType = getPanelType();

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				showUserDropdown &&
				!event.target.closest(".user-dropdown-container")
			) {
				setShowUserDropdown(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [showUserDropdown]);

	useEffect(() => {
		if (!sidebarOpen) {
			setShowUserDropdown(false);
		}
	}, [sidebarOpen]);

	return (
		<>
			{/* Mobile Overlay */}
			{sidebarOpen && (
				<div
					className="fixed inset-0 z-20 bg-black/50 lg:hidden"
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<aside
				className={`fixed lg:sticky top-0 z-30 flex flex-col bg-slate-900 text-white transition-all duration-300 h-screen ${
					sidebarOpen
						? "w-64 translate-x-0"
						: "w-64 -translate-x-full lg:translate-x-0"
				} ${sidebarOpen ? "lg:w-64" : "lg:w-20"}`}
				style={{ backgroundColor: "#0f172a", color: "white" }}
			>
				{/* Top Section */}
				<div className="flex flex-col h-full">
					{/* Header with Toggle and Logo */}
					{!sidebarOpen ? (
						<div className="flex flex-col items-center pt-4 pb-2 border-b border-slate-700">
							<button
								className="p-2 mb-4 rounded-lg transition-colors text-slate-400 hover:text-white hover:bg-slate-800"
								onClick={() => setSidebarOpen((open) => !open)}
							>
								<Menu className="w-6 h-6" />
							</button>
							<div className="flex justify-center items-center mb-2 w-14 h-14">
								<img
									src="/images/mogchs.jpg"
									alt="MOGCHS Logo"
									className="object-cover w-12 h-12 bg-white rounded-full"
								/>
							</div>
						</div>
					) : (
						<div className="flex justify-between items-center p-4 h-16 border-b border-slate-700">
							<div className="flex items-center space-x-3">
								<img
									src="/images/mogchs.jpg"
									alt="MOGCHS Logo"
									className="object-cover w-10 h-10 bg-white rounded-full"
								/>
								<div className="flex flex-col">
									<span className="text-sm font-semibold text-white">
										MOGCHS
									</span>
									<span className="text-xs text-slate-400">
										{panelType === "admin"
											? "Admin Panel"
											: panelType === "registrar"
											? "Registrar Panel"
											: panelType === "teacher"
											? "Teacher Panel"
											: panelType === "student"
											? "Student Panel"
											: "Panel"}
									</span>
								</div>
							</div>
							<button
								className="p-2 ml-2 rounded-lg transition-colors text-slate-400 hover:text-white hover:bg-slate-800"
								onClick={() => setSidebarOpen((open) => !open)}
							>
								<Menu className="w-5 h-5" />
							</button>
						</div>
					)}

					{/* User Profile Section */}
					{sidebarOpen && (
						<div className="p-4 border-b border-slate-700">
							<div className="relative user-dropdown-container">
								<button
									onClick={() => setShowUserDropdown(!showUserDropdown)}
									className="flex items-center p-3 space-x-3 w-full rounded-lg transition-colors hover:bg-slate-800"
								>
									<div className="flex flex-shrink-0 justify-center items-center w-10 h-10 bg-blue-600 rounded-full">
										<User className="w-5 h-5 text-white" />
									</div>
									<div className="flex-1 min-w-0 text-left">
										<div className="text-sm font-medium text-white truncate">
											{currentUser?.firstname || "User"}{" "}
											{currentUser?.lastname || "Name"}
										</div>
										<div className="text-xs truncate text-slate-400">
											{currentUser?.email || "user@mogchs.edu.ph"}
										</div>
									</div>
									<ChevronDown
										className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${
											showUserDropdown ? "rotate-180" : ""}`}
									/>
								</button>

								{/* User Dropdown */}
								{showUserDropdown && (
									<div className="absolute right-0 left-0 top-full z-50 mt-2 rounded-lg border shadow-lg bg-slate-800 border-slate-700">
										<div className="p-3 border-b border-slate-700">
											<div className="text-sm font-medium text-white">
												{currentUser?.firstname || "User"}{" "}
												{currentUser?.lastname || "Name"}
											</div>
											<div className="text-xs break-all text-slate-400">
												{currentUser?.email || "user@mogchs.edu.ph"}
											</div>
										</div>
										{/* Profile button - only show for students */}
										{panelType === "student" && (
											<button
												onClick={onProfileClick}
												className="flex items-center p-3 space-x-3 w-full text-left text-blue-400 rounded-b-lg transition-colors hover:bg-slate-700"
											>
												<User2 className="w-4 h-4" />
												<span className="text-sm">Profile</span>
											</button>
										)}
										<button
											onClick={onLogout}
											className="flex items-center p-3 space-x-3 w-full text-left text-red-400 rounded-b-lg transition-colors hover:bg-slate-700"
										>
											<LogOut className="w-4 h-4" />
											<span className="text-sm">Sign Out</span>
										</button>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Navigation */}
					<nav className="flex-1 p-4 space-y-2">
						{navItems.map((item) => (
							<button
								key={item.key || item.label}
								onClick={() => handleNavClick(item.key || item.label)}
								className={`flex items-center space-x-3 w-full px-3 py-3 rounded-lg transition-all duration-200 ${
									activeSection === (item.key || item.label)
										? "bg-blue-600 text-white shadow-lg"
										: "text-slate-300 hover:bg-slate-800 hover:text-white"
								}`}
							>
								{item.icon}
								{sidebarOpen && (
									<span className="text-sm font-medium">{item.label}</span>
								)}
							</button>
						))}
					</nav>

					{/* Footer - Only show when sidebar is collapsed */}
					{!sidebarOpen && (
						<div className="p-4 border-t border-slate-700">
							<button
								onClick={onLogout}
								className="flex justify-center items-center w-10 h-10 rounded-lg transition-colors text-slate-400 hover:text-white hover:bg-slate-800"
								title="Sign Out"
							>
								<LogOut className="w-5 h-5" />
							</button>
						</div>
					)}
				</div>
			</aside>
		</>
	);
}
