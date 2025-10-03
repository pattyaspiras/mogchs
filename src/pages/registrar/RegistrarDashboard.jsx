import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
	FileText,
	Users,
	CheckCircle2,
	XCircle,
	Filter,
	Calendar,
	FolderOpen,
	Menu,
	Key,
	PlusCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import {
	getAllRequests,
	getRequestStats,
	markAdditionalRequirementsViewed,
} from "../../utils/registrar";
import toast, { Toaster } from "react-hot-toast";
import ProcessedRequest from "./modal/ProcessedRequest";
import StudentsTab from "./components/StudentsTab";
import DocumentsTab from "./components/DocumentsTab";
import LrnRequestsTab from "./components/LrnRequestsTab";
import ThemeToggle from "../../components/ThemeToggle";
import Sidebar from "../../components/shared/Sidebar";
import { getStudent } from "../../utils/teacher";
import CryptoJS from "crypto-js";

export default function RegistrarDashboard() {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [recentRequests, setRecentRequests] = useState([]);
	const [filteredRequests, setFilteredRequests] = useState([]);
	const [requestStats, setRequestStats] = useState([]);
	const [loading, setLoading] = useState(false);
	const [selectedRequest, setSelectedRequest] = useState(null);
	const [showProcessModal, setShowProcessModal] = useState(false);
	const [activeFilter, setActiveFilter] = useState("today");
	const [customDate, setCustomDate] = useState("");
	const [activeTab, setActiveTab] = useState("requests");
	const [refreshTrigger, setRefreshTrigger] = useState(0);
	const [students, setStudents] = useState([]);
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

	// Helper function to get Philippine date in YYYY-MM-DD format
	const getPhilippineDate = () => {
		const now = new Date();
		// Philippine timezone is UTC+8
		const philippineTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
		return philippineTime.toISOString().split("T")[0];
	};

	// Helper function to get Philippine date for a specific date
	const getPhilippineDateForDate = (date) => {
		const philippineTime = new Date(date.getTime() + 8 * 60 * 60 * 1000);
		return philippineTime.toISOString().split("T")[0];
	};

	const navItems = [
		{
			icon: <FileText className="w-5 h-5" />,
			label: "Requests",
			key: "requests",
		},
		{
			icon: <Users className="w-5 h-5" />,
			label: "Students",
			key: "students",
		},
		{
			icon: <FolderOpen className="w-5 h-5" />,
			label: "Documents",
			key: "documents",
		},
		{
			icon: <Key className="w-5 h-5" />,
			label: "LRN Requests",
			key: "lrn_requests",
		},
	];

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
		fetchData();
	}, []);

	// Apply filters when data or filter changes
	useEffect(() => {
		applyFilters();
	}, [recentRequests, activeFilter, customDate]);

	const fetchData = async () => {
		setLoading(true);
		try {
			const [requestsData, statsData, studentsData] = await Promise.all([
				getAllRequests(),
				getRequestStats(),
				getStudent(),
			]);

			// Debug: Log the requests data to see what's being returned
			console.log("Requests data:", requestsData);
			if (Array.isArray(requestsData)) {
				requestsData.forEach((req) => {
					if (req.status === "Completed") {
						console.log(`Completed request ${req.id}:`, {
							status: req.status,
							expectedReleaseDate: req.expectedReleaseDate,
							expectedReleaseDateFormatted: req.expectedReleaseDateFormatted,
							daysRemaining: req.daysRemaining,
						});
					}
				});
			}

			setRecentRequests(Array.isArray(requestsData) ? requestsData : []);
			setRequestStats(Array.isArray(statsData) ? statsData : []);
			setStudents(Array.isArray(studentsData) ? studentsData : []);

			// Trigger refresh for StudentsTab and other components
			setRefreshTrigger((prev) => prev + 1);
		} catch (error) {
			console.error("Failed to fetch data:", error);
			toast.error("Failed to load dashboard data");
		} finally {
			setLoading(false);
		}
	};

	// Filter functions
	const applyFilters = () => {
		let filtered = [...recentRequests];
		const today = getPhilippineDate(); // YYYY-MM-DD format

		switch (activeFilter) {
			case "today":
				filtered = filtered.filter((req) => req.dateRequested === today);
				break;
			case "week":
				const weekAgo = new Date();
				weekAgo.setDate(weekAgo.getDate() - 7);
				const weekAgoStr = getPhilippineDateForDate(weekAgo);
				filtered = filtered.filter((req) => req.dateRequested >= weekAgoStr);
				break;
			case "month":
				const monthAgo = new Date();
				monthAgo.setMonth(monthAgo.getMonth() - 1);
				const monthAgoStr = getPhilippineDateForDate(monthAgo);
				filtered = filtered.filter((req) => req.dateRequested >= monthAgoStr);
				break;
			case "custom":
				if (customDate) {
					filtered = filtered.filter((req) => req.dateRequested === customDate);
				}
				break;
			case "all":
			default:
				// No filtering, show all
				break;
		}

		setFilteredRequests(filtered);
	};

	const handleFilterChange = (filterType) => {
		setActiveFilter(filterType);
		if (filterType !== "custom") {
			setCustomDate("");
		}
	};

	const handleCustomDateChange = (date) => {
		setCustomDate(date);
		if (date) {
			setActiveFilter("custom");
		}
	};

	// Helper function to get stat by status name
	const getStatByStatus = (statusName) => {
		const stat = requestStats.find((s) => s.status === statusName);
		return stat || { count: 0, todayCount: 0 };
	};

	// Helper function to get filtered stats based on active filter
	const getFilteredStatByStatus = (statusName) => {
		const today = getPhilippineDate();
		let filteredData = [...recentRequests];

		// Apply the same filter logic as the table
		switch (activeFilter) {
			case "today":
				filteredData = filteredData.filter(
					(req) => req.dateRequested === today
				);
				break;
			case "week":
				const weekAgo = new Date();
				weekAgo.setDate(weekAgo.getDate() - 7);
				const weekAgoStr = getPhilippineDateForDate(weekAgo);
				filteredData = filteredData.filter(
					(req) => req.dateRequested >= weekAgoStr
				);
				break;
			case "month":
				const monthAgo = new Date();
				monthAgo.setMonth(monthAgo.getMonth() - 1);
				const monthAgoStr = getPhilippineDateForDate(monthAgo);
				filteredData = filteredData.filter(
					(req) => req.dateRequested >= monthAgoStr
				);
				break;
			case "custom":
				if (customDate) {
					filteredData = filteredData.filter(
						(req) => req.dateRequested === customDate
					);
				}
				break;
			case "all":
			default:
				// Use original stats for "all"
				return getStatByStatus(statusName);
		}

		// Count filtered requests by status
		const filteredCount = filteredData.filter(
			(req) => req.status === statusName
		).length;
		const todayCount = filteredData.filter(
			(req) => req.status === statusName && req.dateRequested === today
		).length;

		return { count: filteredCount, todayCount };
	};

	// Helper function to get the appropriate time period label
	const getTimePeriodLabel = () => {
		switch (activeFilter) {
			case "today":
				return "today";
			case "week":
				return "this week";
			case "month":
				return "this month";
			case "custom":
				return customDate ? `on ${customDate}` : "selected date";
			case "all":
			default:
				return "today";
		}
	};

	const formatShortDateTime = (dateString) => {
		if (!dateString) return "";
		const date = new Date(dateString);
		if (isNaN(date.getTime())) return String(dateString);
		return date.toLocaleString("en-US", {
			month: "short",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			hour12: true,
		});
	};

	// Handle row click to open modal
	const handleRequestClick = async (request) => {
		// Mark additional requirements as viewed if they exist
		if (request.hasAdditionalRequirements > 0) {
			try {
				await markAdditionalRequirementsViewed(request.id);
				// Refresh the data to update the notification badge
				fetchData();
			} catch (error) {
				console.error(
					"Failed to mark additional requirements as viewed:",
					error
				);
				// Continue with opening the modal even if marking fails
			}
		}

		setSelectedRequest(request);
		setShowProcessModal(true);
	};

	// Handle modal close
	const handleModalClose = () => {
		setShowProcessModal(false);
		setSelectedRequest(null);
	};

	// Handle successful processing
	const handleProcessSuccess = () => {
		fetchData(); // Refresh the data
	};

	// Handle navigation
	const handleNavClick = (key) => {
		setActiveTab(key);
	};

	const logout = () => {
		Cookies.remove("mogchs_user");
		navigate("/");
	};

	return (
		<div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
			<Toaster position="top-right" />

			{/* Sidebar */}
			<Sidebar
				sidebarOpen={sidebarOpen}
				setSidebarOpen={setSidebarOpen}
				activeSection={activeTab}
				handleNavClick={handleNavClick}
				onLogout={logout}
				navItems={navItems}
				userId={userId}
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
						Registrar {activeTab}
					</h1>
				</div>

				{/* Desktop Header */}
				<header className="hidden justify-between items-center mb-8 lg:flex">
					<h1 className="text-3xl font-bold text-slate-900 dark:text-white">
						Registrar {activeTab}
					</h1>
					<div className="flex gap-4 items-center">
						<ThemeToggle />
						<Button
							className="text-white bg-blue-600 hover:bg-blue-700"
							onClick={fetchData}
						>
							Refresh Data
						</Button>
					</div>
				</header>

				{/* Mobile Header */}
				<header className="flex flex-col gap-4 mb-6 lg:hidden">
					<div className="flex justify-between items-center">
						<h1 className="text-xl font-bold text-slate-900 dark:text-white">
							Registrar {activeTab}
						</h1>
						<ThemeToggle />
					</div>
					<Button
						className="flex gap-2 items-center w-full bg-blue-600 hover:bg-blue-700"
						onClick={fetchData}
					>
						Refresh Data
					</Button>
				</header>

				{/* Scrollable Content Area */}
				<div className="overflow-y-auto flex-1 p-4 lg:p-8">
					{/* Content based on active tab */}
					{activeTab === "requests" ? (
						<>
							{/* Stats Cards */}
							<div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6 lg:mb-8">
								<Card className="dark:bg-slate-800 dark:border-slate-700">
									<CardContent className="p-4 lg:p-6">
										<div className="flex gap-2 items-center text-xs lg:text-sm text-slate-500 dark:text-slate-400">
											<FileText className="w-4 h-4" />
											<span className="truncate">Pending</span>
										</div>
										<div className="mt-2 text-xl font-bold lg:text-2xl text-slate-900 dark:text-white">
											{getFilteredStatByStatus("Pending").count}
										</div>
										<div className="mt-1 text-xs text-yellow-600">
											{activeFilter === "all"
												? `+${
														getFilteredStatByStatus("Pending").todayCount
												  } today`
												: `${
														getFilteredStatByStatus("Pending").count
												  } ${getTimePeriodLabel()}`}
										</div>
									</CardContent>
								</Card>
								<Card className="dark:bg-slate-800 dark:border-slate-700">
									<CardContent className="p-4 lg:p-6">
										<div className="flex gap-2 items-center text-xs lg:text-sm text-slate-500 dark:text-slate-400">
											<CheckCircle2 className="w-4 h-4" />
											<span className="truncate">Processed</span>
										</div>
										<div className="mt-2 text-xl font-bold lg:text-2xl text-slate-900 dark:text-white">
											{getFilteredStatByStatus("Processed").count}
										</div>
										<div className="mt-1 text-xs text-green-600">
											{activeFilter === "all"
												? `+${
														getFilteredStatByStatus("Processed").todayCount
												  } today`
												: `${
														getFilteredStatByStatus("Processed").count
												  } ${getTimePeriodLabel()}`}
										</div>
									</CardContent>
								</Card>
								<Card className="dark:bg-slate-800 dark:border-slate-700">
									<CardContent className="p-4 lg:p-6">
										<div className="flex gap-2 items-center text-xs lg:text-sm text-slate-500 dark:text-slate-400">
											<Users className="w-4 h-4" />
											<span className="truncate">Signatory</span>
										</div>
										<div className="mt-2 text-xl font-bold lg:text-2xl text-slate-900 dark:text-white">
											{getFilteredStatByStatus("Signatory").count}
										</div>
										<div className="mt-1 text-xs text-blue-600">
											{activeFilter === "all"
												? `+${
														getFilteredStatByStatus("Signatory").todayCount
												  } today`
												: `${
														getFilteredStatByStatus("Signatory").count
												  } ${getTimePeriodLabel()}`}
										</div>
									</CardContent>
								</Card>
								<Card className="dark:bg-slate-800 dark:border-slate-700">
									<CardContent className="p-4 lg:p-6">
										<div className="flex gap-2 items-center text-xs lg:text-sm text-slate-500 dark:text-slate-400">
											<XCircle className="w-4 h-4" />
											<span className="truncate">Release</span>
										</div>
										<div className="mt-2 text-xl font-bold lg:text-2xl text-slate-900 dark:text-white">
											{getFilteredStatByStatus("Release").count}
										</div>
										<div className="mt-1 text-xs text-purple-600">
											{activeFilter === "all"
												? `+${
														getFilteredStatByStatus("Release").todayCount
												  } today`
												: `${
														getFilteredStatByStatus("Release").count
												  } ${getTimePeriodLabel()}`}
										</div>
									</CardContent>
								</Card>
								<Card className="dark:bg-slate-800 dark:border-slate-700">
									<CardContent className="p-4 lg:p-6">
										<div className="flex gap-2 items-center text-xs lg:text-sm text-slate-500 dark:text-slate-400">
											<XCircle className="w-4 h-4" />
											<span className="truncate">Complete</span>
										</div>
										<div className="mt-2 text-xl font-bold lg:text-2xl text-slate-900 dark:text-white">
											{getFilteredStatByStatus("Completed").count}
										</div>
										<div className="mt-1 text-xs text-purple-600">
											{activeFilter === "all"
												? `+${
														getFilteredStatByStatus("Completed").todayCount
												  } today`
												: `${
														getFilteredStatByStatus("Completed").count
												  } ${getTimePeriodLabel()}`}
										</div>
									</CardContent>
								</Card>
							</div>

							{/* Recent Requests Table */}
							<Card className="dark:bg-slate-800 dark:border-slate-700">
								<CardContent className="p-4 lg:p-6">
									<div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
										<div className="text-lg font-semibold text-slate-900 dark:text-white">
											Recent Document Requests
										</div>

										{/* Filter Controls */}
										<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
											{/* Filter Buttons */}
											<div className="flex gap-2 items-center">
												<Filter className="w-4 h-4 text-slate-500 dark:text-slate-400" />
												<div className="flex gap-1">
													<Button
														size="sm"
														variant={
															activeFilter === "today" ? "default" : "outline"
														}
														onClick={() => handleFilterChange("today")}
														className="text-xs"
													>
														Today
													</Button>
													<Button
														size="sm"
														variant={
															activeFilter === "week" ? "default" : "outline"
														}
														onClick={() => handleFilterChange("week")}
														className="text-xs"
													>
														This Week
													</Button>
													<Button
														size="sm"
														variant={
															activeFilter === "month" ? "default" : "outline"
														}
														onClick={() => handleFilterChange("month")}
														className="text-xs"
													>
														This Month
													</Button>
													<Button
														size="sm"
														variant={
															activeFilter === "all" ? "default" : "outline"
														}
														onClick={() => handleFilterChange("all")}
														className="text-xs"
													>
														All
													</Button>
												</div>
											</div>

											{/* Custom Date Input */}
											<div className="flex gap-2 items-center">
												<Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
												<input
													type="date"
													value={customDate}
													onChange={(e) =>
														handleCustomDateChange(e.target.value)
													}
													className="px-3 py-1 text-xs text-black bg-white rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:filter-none [&::-webkit-calendar-picker-indicator]:cursor-pointer"
													style={{
														colorScheme: "light",
													}}
													placeholder="Custom date"
												/>
											</div>
										</div>
									</div>

									{/* Results Count */}
									<div className="mb-3 text-xs lg:mb-4 lg:text-sm text-slate-600 dark:text-slate-400">
										Showing {filteredRequests.length} of {recentRequests.length}{" "}
										requests
										{activeFilter === "today" && " (Today)"}
										{activeFilter === "week" && " (This Week)"}
										{activeFilter === "month" && " (This Month)"}
										{activeFilter === "custom" &&
											customDate &&
											` (${customDate})`}
									</div>

									{loading ? (
										<div className="py-6 text-center lg:py-8">
											<p className="text-sm text-slate-500 dark:text-slate-400 lg:text-base">
												Loading requests...
											</p>
										</div>
									) : filteredRequests.length === 0 ? (
										<div className="py-6 text-center lg:py-8">
											<p className="text-sm text-slate-500 dark:text-slate-400 lg:text-base">
												No document requests found.
											</p>
										</div>
									) : (
										<div className="overflow-x-auto -mx-4 lg:mx-0">
											<table className="min-w-full text-xs lg:text-sm text-slate-700 dark:text-slate-400">
												<thead>
													<tr className="border-b border-slate-200 dark:border-slate-700">
														<th className="px-3 py-2 font-semibold text-left lg:px-4">
															Student
														</th>
														<th className="px-3 py-2 font-semibold text-left lg:px-4">
															Document
														</th>
														<th className="hidden px-3 py-2 font-semibold text-left lg:px-4 sm:table-cell">
															Date
														</th>
														<th className="px-3 py-2 font-semibold text-left lg:px-4">
															Status
														</th>
													</tr>
												</thead>
												<tbody>
													{filteredRequests.map((req) => (
														<tr
															key={req.id}
															className="border-b transition-colors cursor-pointer border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 active:bg-slate-100 dark:active:bg-slate-700"
															onClick={() => handleRequestClick(req)}
														>
															<td className="px-3 py-3 lg:px-4 lg:py-2">
																<div>
																	<div className="font-medium">
																		{req.student}
																	</div>
																	{/* Additional Requirements Notification Badge */}
																	{req.hasAdditionalRequirements > 0 && (
																		<div className="flex items-center gap-1 mt-1">
																			<div className="relative">
																				<span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-orange-800 bg-orange-100 rounded-full dark:text-orange-400 dark:bg-orange-900/20">
																					<PlusCircle className="w-3 h-3" />+
																					{req.hasAdditionalRequirements}{" "}
																					Additional Requirements
																				</span>
																				<span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
																			</div>
																		</div>
																	)}
																</div>
																<div className="text-xs text-slate-500 dark:text-slate-400 sm:hidden">
																	{req.dateRequested}
																</div>
															</td>
															<td className="px-3 py-3 lg:px-4 lg:py-2">
																<div className="truncate max-w-[120px] lg:max-w-none">
																	{req.document}
																</div>
																{/* Expected Release Date and Countdown - Show different wording for Completed status */}
																{req.expectedReleaseDateFormatted && (
																	<div className="text-xs mt-1">
																		{req.status?.toLowerCase() ===
																		"completed" ? (
																			<span className="text-green-600 dark:text-green-400 font-medium">
																				✅ Released Date:{" "}
																				{req.expectedReleaseDateFormatted}
																			</span>
																		) : req.daysRemaining === 0 ? (
																			<span className="text-green-600 dark:text-green-400 font-medium">
																				📅 Expected release: Today!
																			</span>
																		) : req.daysRemaining > 0 ? (
																			<span className="text-blue-600 dark:text-blue-400">
																				📅 Expected release:{" "}
																				{req.expectedReleaseDateFormatted}
																				<span className="font-medium text-blue-700 dark:text-blue-300">
																					({req.daysRemaining}{" "}
																					{req.daysRemaining === 1
																						? "day"
																						: "days"}{" "}
																					left)
																				</span>
																			</span>
																		) : (
																			<span className="text-red-600 dark:text-red-400 font-medium">
																				⚠️ Expected release was:{" "}
																				{req.expectedReleaseDateFormatted}
																				<span className="text-red-700 dark:text-red-300">
																					({Math.abs(req.daysRemaining)}{" "}
																					{Math.abs(req.daysRemaining) === 1
																						? "day"
																						: "days"}{" "}
																					overdue)
																				</span>
																			</span>
																		)}
																	</div>
																)}
																{/* Release Date (if officially scheduled) - Hide for Completed status since we show actual completion date above */}
																{req.releaseDate &&
																	req.status?.toLowerCase() !== "completed" && (
																		<div className="text-xs text-green-600 dark:text-green-400 mt-1">
																			{req.status?.toLowerCase() ===
																			"completed" ? (
																				<span>
																					✅ Released Date:{" "}
																					{req.releaseDateFormatted}
																				</span>
																			) : (
																				<span>
																					📅 Releasing Date:{" "}
																					{req.releaseDateFormatted}
																				</span>
																			)}
																		</div>
																	)}
															</td>
															<td className="hidden px-3 py-3 lg:px-4 lg:py-2 sm:table-cell">
																{formatShortDateTime(req.dateRequested)}
															</td>
															<td className="px-3 py-3 lg:px-4 lg:py-2">
																<div className="flex flex-col gap-1">
																	<span className="text-sm font-medium text-slate-700 dark:text-slate-300">
																		{req.status}
																	</span>
																	{/* Show processed by information below the status */}
																	{req.processedBy && (
																		<span className="text-xs text-slate-500 dark:text-slate-400">
																			Processed by: {req.processedBy}
																		</span>
																	)}
																</div>
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									)}
								</CardContent>
							</Card>
						</>
					) : activeTab === "students" ? (
						/* Students Tab - Now using the separate component */
						<StudentsTab refreshTrigger={refreshTrigger} userId={userId} />
					) : activeTab === "documents" ? (
						/* Documents Tab - New component for student documents */
						<DocumentsTab />
					) : activeTab === "lrn_requests" ? (
						/* LRN Requests Tab */
						<LrnRequestsTab userId={userId} students={students} />
					) : null}
				</div>

				{/* Modals */}
				<ProcessedRequest
					isOpen={showProcessModal}
					onClose={handleModalClose}
					request={selectedRequest}
					onSuccess={handleProcessSuccess}
					userId={userId}
				/>
			</main>
		</div>
	);
}
