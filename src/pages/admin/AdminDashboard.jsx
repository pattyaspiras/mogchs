import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
	Plus,
	Menu,
	LayoutDashboard,
	Users,
	FileText,
	Settings,
	Folder,
} from "lucide-react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import {
	getUsers,
	getRequestStats,
	getCompletedRequests,
	getRecentActivity,
	getTotalUsers,
	getStudentsWithFilters,
} from "../../utils/admin";
import AddUserModal from "./modal/AddUserModal";
import toast, { Toaster } from "react-hot-toast";
import ThemeToggle from "../../components/ThemeToggle";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
	ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import AddStudentModal from "./modal/AddStudentModal";
import { getSection, getSchoolYear } from "../../utils/registrar";
import { Label } from "../../components/ui/label";
import DashboardContent from "./components/DashboardContent";
import UsersContent from "./components/UsersContent";
import StudentsContent from "./components/StudentsContent";
import ResourcesContent from "./masterfiles/ResourcesContent";
import Sidebar from "../../components/shared/Sidebar";
import UserProfileModal from "./modal/UserProfileModal";

const SECRET_KEY = "mogchs_secret_key";

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
	ArcElement
);

export default function AdminDashboard() {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [activeSection, setActiveSection] = useState("Dashboard");
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(false);
	const [showAddUserModal, setShowAddUserModal] = useState(false);
	const [dashboardData, setDashboardData] = useState({
		requestStats: [],
		completedRequests: [],
		recentActivity: [],
		totalUsers: { totalUsers: 0, adminUsers: 0, studentUsers: 0 },
	});
	const [dashboardLoading, setDashboardLoading] = useState(false);
	const navigate = useNavigate();
	const [showAddStudentModal, setShowAddStudentModal] = useState(false);
	const [sectionOptions, setSectionOptions] = useState([]);
	const [schoolYearOptions, setSchoolYearOptions] = useState([]);
	const [currentUserId, setCurrentUserId] = useState("");
	const [currentUser, setCurrentUser] = useState(null);
	const [students, setStudents] = useState([]);
	const [studentsLoading, setStudentsLoading] = useState(false);
	const [selectedSectionFilter, setSelectedSectionFilter] = useState("");
	const [selectedSchoolYearFilter, setSelectedSchoolYearFilter] = useState("");
	const [showProfileModal, setShowProfileModal] = useState(false);
	const [selectedProfileUser, setSelectedProfileUser] = useState({
		id: "",
		type: "",
	});

	// Initialize sidebar state based on screen size
	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth >= 1024) {
				// Desktop - sidebar should be open by default
				setSidebarOpen(true);
			}
		};

		// Set initial state
		handleResize();

		// Add event listener
		window.addEventListener("resize", handleResize);

		// Cleanup
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// Fetch dashboard data when Dashboard section is active
	useEffect(() => {
		if (activeSection === "Dashboard") {
			fetchDashboardData();
		}
	}, [activeSection]);

	// Fetch users when Users section is active
	useEffect(() => {
		if (activeSection === "Users") {
			fetchUsers();
		}
	}, [activeSection]);

	// Fetch students when Students section is active
	useEffect(() => {
		if (activeSection === "Students") {
			fetchStudents();
			// Load filter options
			getSection().then((data) =>
				setSectionOptions(Array.isArray(data) ? data : [])
			);
			getSchoolYear().then((data) =>
				setSchoolYearOptions(Array.isArray(data) ? data : [])
			);
		}
	}, [activeSection]);

	// Fetch students when filters change
	useEffect(() => {
		if (activeSection === "Students") {
			fetchStudents();
		}
	}, [selectedSectionFilter, selectedSchoolYearFilter]);

	// Fetch section and school year options when AddStudentModal is opened
	useEffect(() => {
		if (showAddStudentModal) {
			getSection().then((data) =>
				setSectionOptions(Array.isArray(data) ? data : [])
			);
			getSchoolYear().then((data) =>
				setSchoolYearOptions(Array.isArray(data) ? data : [])
			);
		}
	}, [showAddStudentModal]);
	// Get current admin user ID from cookie
	useEffect(() => {
		const userCookie = Cookies.get("mogchs_user");
		if (userCookie) {
			try {
				const bytes = CryptoJS.AES.decrypt(userCookie, SECRET_KEY);
				const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
				setCurrentUserId(decryptedData.id || "");
				setCurrentUser(decryptedData); // Set currentUser state
			} catch {}
		}
	}, []);

	const fetchDashboardData = async () => {
		try {
			setDashboardLoading(true);
			const [requestStats, completedRequests, recentActivity, totalUsers] =
				await Promise.all([
					getRequestStats(),
					getCompletedRequests(),
					getRecentActivity(),
					getTotalUsers(),
				]);

			setDashboardData({
				requestStats: Array.isArray(requestStats) ? requestStats : [],
				completedRequests: Array.isArray(completedRequests)
					? completedRequests
					: [],
				recentActivity: Array.isArray(recentActivity) ? recentActivity : [],
				totalUsers: totalUsers || {
					totalUsers: 0,
					adminUsers: 0,
					studentUsers: 0,
				},
			});
		} catch (error) {
			console.error("Failed to fetch dashboard data:", error);
			toast.error("Failed to load dashboard data");
		} finally {
			setDashboardLoading(false);
		}
	};

	const fetchUsers = async () => {
		try {
			setLoading(true);
			const data = await getUsers();
			setUsers(Array.isArray(data) ? data : []);
		} catch (error) {
			console.error("Failed to fetch users:", error);
			toast.error("Failed to load users");
			setUsers([]);
		} finally {
			setLoading(false);
		}
	};

	const fetchStudents = async () => {
		try {
			setStudentsLoading(true);
			const data = await getStudentsWithFilters(
				selectedSectionFilter,
				selectedSchoolYearFilter
			);
			setStudents(Array.isArray(data) ? data : []);
		} catch (error) {
			console.error("Failed to fetch students:", error);
			toast.error("Failed to load students");
			setStudents([]);
		} finally {
			setStudentsLoading(false);
		}
	};

	const handleNavClick = (label) => {
		setActiveSection(label);
		if (window.innerWidth < 1024) {
			setSidebarOpen(false);
		}
	};

	const logout = () => {
		Cookies.remove("mogchs_user");
		navigate("/");
	};

	const handleAddUserSuccess = () => {
		fetchUsers(); // Refresh the user list
		toast.success("User list updated");
	};

	const handleViewProfile = (userId, userType) => {
		setSelectedProfileUser({ id: userId, type: userType });
		setShowProfileModal(true);
	};

	const handleProfileSuccess = () => {
		// Refresh data based on current section
		if (activeSection === "Users") {
			fetchUsers();
		} else if (activeSection === "Students") {
			fetchStudents();
		}
		toast.success("Profile updated successfully");
	};

	// Chart data for request status
	const requestStatusChartData = {
		labels: dashboardData.requestStats.map((stat) => stat.status),
		datasets: [
			{
				label: "Total Requests",
				data: dashboardData.requestStats.map((stat) => stat.count),
				backgroundColor: [
					"rgba(255, 99, 132, 0.8)",
					"rgba(54, 162, 235, 0.8)",
					"rgba(255, 206, 86, 0.8)",
					"rgba(75, 192, 192, 0.8)",
					"rgba(153, 102, 255, 0.8)",
				],
				borderColor: [
					"rgba(255, 99, 132, 1)",
					"rgba(54, 162, 235, 1)",
					"rgba(255, 206, 86, 1)",
					"rgba(75, 192, 192, 1)",
					"rgba(153, 102, 255, 1)",
				],
				borderWidth: 1,
			},
		],
	};

	// Chart data for user distribution
	const userDistributionChartData = {
		labels: ["Admin Users", "Student Users"],
		datasets: [
			{
				data: [
					dashboardData.totalUsers.adminUsers,
					dashboardData.totalUsers.studentUsers,
				],
				backgroundColor: ["rgba(54, 162, 235, 0.8)", "rgba(255, 99, 132, 0.8)"],
				borderColor: ["rgba(54, 162, 235, 1)", "rgba(255, 99, 132, 1)"],
				borderWidth: 1,
			},
		],
	};

	const navItems = [
		{
			icon: <LayoutDashboard className="w-5 h-5" />,
			label: "Dashboard",
			key: "Dashboard",
		},
		{ icon: <Users className="w-5 h-5" />, label: "Users", key: "Users" },
		{ icon: <Users className="w-5 h-5" />, label: "Students", key: "Students" },
		{
			icon: <FileText className="w-5 h-5" />,
			label: "Reports",
			key: "Reports",
		},
		{
			icon: <Settings className="w-5 h-5" />,
			label: "Settings",
			key: "Settings",
		},
		{
			icon: <Folder className="w-5 h-5" />,
			label: "Resources",
			key: "Resources",
		},
	];

	const renderContent = () => {
		switch (activeSection) {
			case "Users":
				return (
					<UsersContent
						users={users}
						loading={loading}
						onAddUser={() => setShowAddUserModal(true)}
						onViewProfile={handleViewProfile}
					/>
				);
			case "Students":
				return (
					<StudentsContent
						students={students}
						studentsLoading={studentsLoading}
						sectionOptions={sectionOptions}
						schoolYearOptions={schoolYearOptions}
						selectedSectionFilter={selectedSectionFilter}
						selectedSchoolYearFilter={selectedSchoolYearFilter}
						onSectionFilterChange={(e) =>
							setSelectedSectionFilter(e.target.value)
						}
						onSchoolYearFilterChange={(e) =>
							setSelectedSchoolYearFilter(e.target.value)
						}
						onAddStudent={() => setShowAddStudentModal(true)}
						onViewProfile={handleViewProfile}
					/>
				);
			case "Reports":
				return (
					<Card className="dark:bg-slate-800 dark:border-slate-700">
						<CardContent className="p-4 lg:p-6">
							<div className="py-8 text-center text-slate-500 dark:text-slate-400">
								Reports section coming soon...
							</div>
						</CardContent>
					</Card>
				);
			case "Settings":
				return (
					<Card className="dark:bg-slate-800 dark:border-slate-700">
						<CardContent className="p-4 lg:p-6">
							<div className="py-8 text-center text-slate-500 dark:text-slate-400">
								Settings section coming soon...
							</div>
						</CardContent>
					</Card>
				);
			case "Resources":
				return <ResourcesContent />;
			default:
				return (
					<DashboardContent
						dashboardData={dashboardData}
						dashboardLoading={dashboardLoading}
						requestStatusChartData={requestStatusChartData}
						userDistributionChartData={userDistributionChartData}
						onRefreshData={fetchDashboardData}
					/>
				);
		}
	};

	return (
		<div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
			<Toaster position="top-right" />

			{/* Sidebar */}
			<Sidebar
				sidebarOpen={sidebarOpen}
				setSidebarOpen={setSidebarOpen}
				activeSection={activeSection}
				handleNavClick={handleNavClick}
				onLogout={logout}
				navItems={navItems}
			/>

			{/* Main Content */}
			<main className="flex-1 p-4 w-full min-w-0 lg:p-8">
				{/* Mobile Menu Button */}
				<div className="flex justify-between items-center mb-4 lg:hidden">
					<button
						onClick={() => setSidebarOpen(true)}
						className="p-2 bg-white rounded-lg border shadow-sm dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
					>
						<Menu className="w-5 h-5" />
					</button>
					<h1 className="text-xl font-bold text-slate-900 dark:text-white">
						Admin {activeSection}
					</h1>
				</div>

				{/* Desktop Header */}
				<header className="hidden justify-between items-center mb-8 lg:flex">
					<h1 className="text-3xl font-bold text-slate-900 dark:text-white">
						Admin {activeSection}
					</h1>
					<div className="flex gap-4 items-center">
						<ThemeToggle />
						{activeSection === "Dashboard" && (
							<Button
								className="text-white bg-blue-600 hover:bg-blue-700"
								onClick={fetchDashboardData}
							>
								Refresh Data
							</Button>
						)}
					</div>
				</header>

				{/* Mobile Header */}
				<header className="flex flex-col gap-4 mb-6 lg:hidden">
					<div className="flex justify-between items-center">
						<h1 className="text-xl font-bold text-slate-900 dark:text-white">
							Admin {activeSection}
						</h1>
						<ThemeToggle />
					</div>
					{activeSection === "Dashboard" && (
						<Button
							className="flex gap-2 items-center w-full bg-blue-600 hover:bg-blue-700"
							onClick={fetchDashboardData}
						>
							Refresh Data
						</Button>
					)}
				</header>

				{/* Dynamic Content */}
				{renderContent()}
			</main>

			{/* Add User Modal */}
			<AddUserModal
				isOpen={showAddUserModal}
				onClose={() => setShowAddUserModal(false)}
				onSuccess={handleAddUserSuccess}
			/>
			<AddStudentModal
				isOpen={showAddStudentModal}
				onClose={() => setShowAddStudentModal(false)}
				onSuccess={handleAddUserSuccess}
				sectionOptions={sectionOptions}
				schoolYearOptions={schoolYearOptions}
				createdBy={currentUserId}
			/>

			{/* User Profile Modal */}
			{showProfileModal && (
				<UserProfileModal
					isOpen={showProfileModal}
					onClose={() => setShowProfileModal(false)}
					userId={selectedProfileUser.id}
					userType={selectedProfileUser.type}
					onSuccess={handleProfileSuccess}
				/>
			)}
		</div>
	);
}
