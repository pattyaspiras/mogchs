"use client";

import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { Menu, FileText, LogOut, Plus, User, RefreshCw } from "lucide-react";
import { getUserRequests, getStudentProfile } from "../../utils/student";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import RequestDocuments from "./modal/RequestDocuments";
import ThemeToggle from "../../components/ThemeToggle";
import Sidebar from "../../components/shared/Sidebar";
import StatsCards from "./components/StatsCards";
import RequestsTable from "./components/RequestsTable";
import ProfileModal from "./modal/ProfileModal";
import RequestDetailsModal from "./modal/RequestDetailsModal";

export default function StudentDashboard() {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [showRequestForm, setShowRequestForm] = useState(false);
	const [showProfileModal, setShowProfileModal] = useState(false);
	const [userRequests, setUserRequests] = useState([]);
	const [loadingRequests, setLoadingRequests] = useState(false);
	const [refreshTrigger, setRefreshTrigger] = useState(0);
	const [studentProfile, setStudentProfile] = useState(null);
	const navigate = useNavigate();

	// Get userId from cookie
	const COOKIE_KEY = "mogchs_user";
	const SECRET_KEY = "mogchs_secret_key";
	let userId = "";
	const encrypted = Cookies.get(COOKIE_KEY);
	if (encrypted) {
		try {
			const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
			const user = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
			userId = user?.id;
		} catch {}
	}

	// Fetch user requests and profile on component mount
	React.useEffect(() => {
		if (userId) {
			fetchUserRequests();
			fetchStudentProfile();
		}
	}, [userId]);

	const fetchUserRequests = () => {
		setLoadingRequests(true);
		getUserRequests(userId)
			.then((data) => {
				setUserRequests(Array.isArray(data) ? data : []);
			})
			.catch((err) => {
				console.error("Failed to fetch user requests:", err);
				toast.error("Failed to load your requests.");
			})
			.finally(() => setLoadingRequests(false));
	};

	const fetchStudentProfile = async () => {
		try {
			const data = await getStudentProfile(userId);
			if (!data.error) {
				setStudentProfile(data);
			}
		} catch (err) {
			console.error("Failed to fetch student profile:", err);
		}
	};

	const navItems = [
		{
			icon: <FileText className="w-5 h-5" />,
			label: "My Requests",
			key: "requests",
		},
		{
			icon: <User className="w-5 h-5" />,
			label: "Profile",
			key: "profile",
		},
	];

	const [activeTab, setActiveTab] = useState("requests");

	const handleNavClick = (key) => {
		setActiveTab(key);
	};

	// Initialize sidebar state based on screen size
	React.useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth >= 1024) {
				setSidebarOpen(true);
			} else {
				setSidebarOpen(false);
			}
		};

		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const logout = () => {
		Cookies.remove("mogchs_user");
		navigate("/");
	};

	const handleRequestSuccess = () => {
		fetchUserRequests();
		// Increment refresh trigger to notify child components
		setRefreshTrigger((prev) => prev + 1);
	};

	return (
		<div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
			<Toaster position="top-right" />

			{/* Sidebar */}
			<Sidebar
				sidebarOpen={sidebarOpen}
				setSidebarOpen={setSidebarOpen}
				activeSection={activeTab}
				handleNavClick={handleNavClick}
				onLogout={logout}
				onProfileClick={() => setShowProfileModal(true)}
				navItems={navItems}
			/>

			{/* Main Content */}
			<main className="flex-1 p-3 w-full min-w-0 sm:p-4 lg:p-8">
				{/* Mobile Menu Button */}
				<div className="flex justify-between items-center mb-4 lg:hidden">
					<button
						onClick={() => setSidebarOpen(true)}
						className="p-2 bg-white rounded-lg border shadow-sm transition-colors dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"
					>
						<Menu className="w-5 h-5" />
					</button>
					<h1 className="text-lg font-bold sm:text-xl text-slate-900 dark:text-white">
						Student {activeTab}
					</h1>
				</div>

				{/* Desktop Header */}
				<header className="hidden justify-between items-center mb-8 lg:flex">
					<div>
						<h1 className="text-3xl font-bold text-slate-900 dark:text-white">
							Student {activeTab}
						</h1>
						<p className="text-base text-slate-600 dark:text-slate-300">
							Request and track your documents
						</p>
					</div>
					<div className="flex gap-4 items-center">
						<ThemeToggle />
						<div className="flex gap-2">
							<Button
								className="flex gap-2 items-center text-white bg-blue-600 hover:bg-blue-700"
								onClick={() => setShowRequestForm(true)}
							>
								<Plus className="w-4 h-4" /> Request Document
							</Button>
							<Button
								onClick={fetchUserRequests}
								disabled={loadingRequests}
								className="flex gap-2 items-center text-white bg-gray-600 hover:bg-gray-700 disabled:opacity-75 disabled:cursor-not-allowed"
							>
								<RefreshCw
									className={`w-4 h-4 ${loadingRequests ? "animate-spin" : ""}`}
								/>
								Refresh
							</Button>
						</div>
					</div>
				</header>

				{/* Mobile Header */}
				<header className="flex flex-col gap-4 mb-6 lg:hidden">
					<div className="flex justify-between items-center">
						<div>
							<p className="text-sm text-slate-600 dark:text-slate-300">
								Request and track your documents
							</p>
						</div>
						<ThemeToggle />
					</div>
					<div className="flex gap-2">
						<Button
							className="flex gap-2 items-center w-full text-white bg-blue-600 hover:bg-blue-700"
							onClick={() => setShowRequestForm(true)}
						>
							<Plus className="w-4 h-4" /> Request Document
						</Button>
						<Button
							onClick={fetchUserRequests}
							disabled={loadingRequests}
							className="flex gap-2 items-center w-full text-white bg-gray-600 hover:bg-gray-700 disabled:opacity-75 disabled:cursor-not-allowed"
						>
							<RefreshCw
								className={`w-4 h-4 ${loadingRequests ? "animate-spin" : ""}`}
							/>
							Refresh
						</Button>
					</div>
				</header>

				{/* Enhanced Stats Cards */}
				{activeTab === "requests" && <StatsCards userRequests={userRequests} />}

				{/* Request Form Modal */}
				{showRequestForm && (
					<RequestDocuments
						isOpen={showRequestForm}
						onClose={() => setShowRequestForm(false)}
						userId={userId}
						onSuccess={handleRequestSuccess}
						studentGradeLevel={studentProfile?.gradeLevel}
						userRequests={userRequests}
					/>
				)}

				{/* Content based on active tab */}
				{activeTab === "requests" ? (
					<RequestsTable
						userRequests={userRequests}
						loadingRequests={loadingRequests}
						onRequestFormOpen={() => setShowRequestForm(true)}
						refreshTrigger={refreshTrigger}
						onRequestSuccess={handleRequestSuccess}
					/>
				) : activeTab === "profile" ? (
					<div className="py-8 text-center">
						<h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">
							Student Profile
						</h2>
						<p className="mb-6 text-slate-600 dark:text-slate-400">
							View and edit your profile information
						</p>
						<Button
							onClick={() => setShowProfileModal(true)}
							className="flex items-center space-x-2 text-white bg-blue-600 hover:bg-blue-700"
						>
							<User className="w-4 h-4" />
							<span>Open Profile</span>
						</Button>
					</div>
				) : null}
			</main>

			{/* Profile Modal */}
			{showProfileModal && (
				<ProfileModal
					isOpen={showProfileModal}
					onClose={() => setShowProfileModal(false)}
					userId={userId}
				/>
			)}
		</div>
	);
}
