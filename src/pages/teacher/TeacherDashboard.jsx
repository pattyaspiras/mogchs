import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Menu, FileText, Users, FolderOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import toast, { Toaster } from "react-hot-toast";
import { getStudentRecords } from "../../utils/teacher";
import DashboardStats from "./components/DashboardStats";
import StudentFileManagement from "./components/StudentFileManagement";
import ThemeToggle from "../../components/ThemeToggle";
import Sidebar from "../../components/shared/Sidebar";
import CryptoJS from "crypto-js";
import StudentsTab from "../registrar/components/StudentsTab";
import TeacherStudentsTab from "./components/TeacherStudentsTab";

export default function TeacherDashboard() {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [students, setStudents] = useState([]);
	const [teacherGradeLevelId, setTeacherGradeLevelId] = useState(null);
	const [teacherSectionId, setTeacherSectionId] = useState(null);
	const [teacherUserId, setTeacherUserId] = useState(null); // Add teacher user ID state
	const [refreshTrigger, setRefreshTrigger] = useState(0); // Add refresh trigger state
	const navigate = useNavigate();
	const COOKIE_KEY = "mogchs_user";
	const SECRET_KEY = "mogchs_secret_key";

	const navItems = [
		{
			icon: <FolderOpen className="w-5 h-5" />,
			label: "Dashboard",
			key: "dashboard",
		},
		{
			icon: <Users className="w-5 h-5" />,
			label: "Students",
			key: "students",
		},
		{
			icon: <FileText className="w-5 h-5" />,
			label: "Files",
			key: "files",
		},
	];

	const [activeTab, setActiveTab] = useState("dashboard");

	// Get teacher's grade level and section from stored user data
	useEffect(() => {
		const encrypted = Cookies.get(COOKIE_KEY);
		if (encrypted) {
			try {
				const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
				const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

				// Check if decrypted text is not empty
				if (decryptedText && decryptedText.trim() !== "") {
					const decrypted = JSON.parse(decryptedText);

					// Check if user is a teacher and has gradeLevelId
					if (
						decrypted &&
						decrypted.userLevel === "Teacher" &&
						decrypted.gradeLevelId
					) {
						setTeacherGradeLevelId(decrypted.gradeLevelId);
						setTeacherSectionId(decrypted.sectionId || null);
						setTeacherUserId(decrypted.id); // Extract user ID
						console.log(
							"Debug - Set teacherGradeLevelId:",
							decrypted.gradeLevelId
						);
						console.log("Debug - Set teacherSectionId:", decrypted.sectionId);
					} else if (decrypted && decrypted.userLevel === "Teacher") {
						console.warn("Teacher user found but no gradeLevelId assigned");
						// You might want to redirect to an error page or show a message
						toast.error(
							"Teacher account not properly configured. Please contact administrator."
						);
					}
				} else {
					console.warn("Empty decrypted text");
				}
			} catch (e) {
				console.error("Error decrypting user data:", e);
				// If decryption fails, try to get user data from a different approach
				// or redirect to login
				toast.error("Session expired. Please login again.");
				logout();
			}
		} else {
			console.warn("No user cookie found");
			// Redirect to login if no cookie found
			logout();
		}
	}, []);

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

	// Fetch data on component mount
	useEffect(() => {
		if (teacherGradeLevelId) {
			fetchStudents();
		}
	}, [teacherGradeLevelId, teacherSectionId]);

	const fetchStudents = async () => {
		try {
			const data = await getStudentRecords(
				teacherGradeLevelId,
				teacherSectionId
			);
			console.log("API data:", data);
			let studentsArray = data;
			if (typeof data === "string") {
				try {
					studentsArray = JSON.parse(data);
				} catch (e) {
					studentsArray = [];
				}
			}
			setStudents(Array.isArray(studentsArray) ? studentsArray : []);
		} catch (error) {
			console.error("Error fetching students:", error);
			toast.error("Failed to load students");
		}
	};

	const handleRefreshData = () => {
		fetchStudents();
		setRefreshTrigger((prev) => prev + 1); // Trigger refresh in child components
	};

	const logout = () => {
		Cookies.remove("mogchs_user");
		navigate("/");
	};

	const handleNavClick = (key) => {
		setActiveTab(key);
	};

	// Calculate stats - need to group by student id first
	const studentGroups = students.reduce((acc, record) => {
		const id = record.id;
		if (!acc[id]) {
			acc[id] = {
				id: record.id,
				firstname: record.firstname,
				lastname: record.lastname,
				email: record.email,
				sectionName: record.sectionName,
				teacherGradeLevel:
					record.actualTeacherGradeLevel || record.teacherGradeLevel,
				sectionGradeLevel: record.sectionGradeLevel,
				files: [],
			};
		}
		if (record.fileName && record.fileName.trim() !== "") {
			acc[id].files.push({
				fileName: record.fileName,
				sfType: record.actualTeacherGradeLevel || record.teacherGradeLevel, // This is the Teacher's Grade Level (Grade 11 or Grade 12)
			});
		}
		return acc;
	}, {});

	const groupedStudents = Object.values(studentGroups);
	const totalStudents = groupedStudents.length;
	const studentsWithFiles = groupedStudents.filter(
		(s) => s.files.length > 0
	).length;
	const totalFiles = groupedStudents.reduce(
		(acc, s) => acc + s.files.length,
		0
	);

	return (
		<div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
			<Toaster position="top-right" />

			{/* Sidebar */}
			<Sidebar
				sidebarOpen={sidebarOpen}
				setSidebarOpen={setSidebarOpen}
				onLogout={logout}
				navItems={navItems}
				activeSection={activeTab}
				handleNavClick={handleNavClick}
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
						Teacher {activeTab}
					</h1>
				</div>

				{/* Desktop Header */}
				<header className="hidden justify-between items-center mb-8 lg:flex">
					<h1 className="text-3xl font-bold text-slate-900 dark:text-white">
						Teacher {activeTab}
					</h1>
					<div className="flex gap-4 items-center">
						<ThemeToggle />
						<Button
							className="text-white bg-blue-600 hover:bg-blue-700"
							onClick={handleRefreshData}
						>
							Refresh Data
						</Button>
					</div>
				</header>

				{/* Mobile Header */}
				<header className="flex flex-col gap-4 mb-6 lg:hidden">
					<div className="flex justify-between items-center">
						<h1 className="text-xl font-bold text-slate-900 dark:text-white">
							Teacher {activeTab}
						</h1>
						<ThemeToggle />
					</div>
					<Button
						className="flex gap-2 items-center w-full bg-blue-600 hover:bg-blue-700"
						onClick={handleRefreshData}
					>
						Refresh Data
					</Button>
				</header>

				{/* Dashboard Content */}
				<div className="space-y-6">
					{activeTab === "dashboard" ? (
						<>
							<DashboardStats
								totalStudents={totalStudents}
								studentsWithFiles={studentsWithFiles}
								totalFiles={totalFiles}
							/>
							<StudentFileManagement
								teacherGradeLevelId={teacherGradeLevelId}
								teacherSectionId={teacherSectionId}
								teacherUserId={teacherUserId}
								refreshTrigger={refreshTrigger}
							/>
						</>
					) : activeTab === "students" ? (
						<TeacherStudentsTab />
					) : activeTab === "files" ? (
						<div className="py-8 text-center">
							<h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">
								File Management
							</h2>
							<p className="text-slate-600 dark:text-slate-400">
								File management section coming soon...
							</p>
						</div>
					) : null}
				</div>
			</main>
		</div>
	);
}
