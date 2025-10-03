import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
	Download,
	ChevronLeft,
	ChevronRight,
	Filter,
	DownloadCloud,
	BookOpen,
	CheckSquare,
	Square,
	Users2,
	Search,
} from "lucide-react";
import toast from "react-hot-toast";
import {
	getStudentRecords,
	downloadFile,
	getSectionsByGradeLevel,
} from "../../../utils/teacher";
import StudentModal from "./StudentModal";

export default function StudentFileManagement({
	teacherGradeLevelId,
	teacherSectionId,
	teacherUserId, // Add teacher user ID prop
	refreshTrigger,
}) {
	const [students, setStudents] = useState([]);
	const [filteredStudents, setFilteredStudents] = useState([]);
	const [loading, setLoading] = useState(true);
	const [downloadingAll, setDownloadingAll] = useState(false);

	// Modal state
	const [selectedStudent, setSelectedStudent] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Selection state
	const [selectedStudents, setSelectedStudents] = useState(new Set());
	const [selectAll, setSelectAll] = useState(false);
	const [modalSelectedStudents, setModalSelectedStudents] = useState([]); // For modal display

	// Pagination state
	const [currentPage, setCurrentPage] = useState(1);
	const [studentsPerPage] = useState(10);

	// Filter state
	const [selectedSection, setSelectedSection] = useState("");
	const [selectedGradeLevel, setSelectedGradeLevel] = useState("");
	const [sectionsByGradeLevel, setSectionsByGradeLevel] = useState({});

	// Search state
	const [searchQuery, setSearchQuery] = useState("");

	// Fetch data on component mount
	useEffect(() => {
		if (teacherGradeLevelId) {
			fetchStudents();
			fetchSectionsByGradeLevel();
		}
	}, [teacherGradeLevelId]);

	// Refresh data when refreshTrigger changes
	useEffect(() => {
		if (teacherGradeLevelId && refreshTrigger > 0) {
			fetchStudents();
			fetchSectionsByGradeLevel();
		}
	}, [refreshTrigger, teacherGradeLevelId]);

	// Apply section filter when selectedSection changes
	useEffect(() => {
		applyFilters();
	}, [students, selectedSection, selectedGradeLevel, searchQuery]);

	// Reset to page 1 when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [selectedSection, selectedGradeLevel, searchQuery]);

	// Set default grade level when sections are loaded
	useEffect(() => {
		if (Object.keys(sectionsByGradeLevel).length > 0 && !selectedGradeLevel) {
			const availableGradeLevels = Object.keys(sectionsByGradeLevel);
			if (availableGradeLevels.length > 0) {
				setSelectedGradeLevel(availableGradeLevels[0]);
			}
		}
	}, [sectionsByGradeLevel, selectedGradeLevel]);

	// Auto-select section when a grade level is chosen and sections are available
	useEffect(() => {
		if (!selectedGradeLevel) return;

		const sections = sectionsByGradeLevel[selectedGradeLevel] || [];
		if (sections.length === 0) return;

		// If no section selected yet, or the current one is no longer valid, pick the first
		if (!selectedSection || !sections.includes(selectedSection)) {
			setSelectedSection(sections[0]);
		}
	}, [selectedGradeLevel, sectionsByGradeLevel, selectedSection]);

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

			setLoading(false);
		} catch (error) {
			console.error("Error fetching students:", error);
			toast.error("Failed to load students");
			setLoading(false);
		}
	};

	const fetchSectionsByGradeLevel = async () => {
		try {
			console.log("Debug - teacherGradeLevelId:", teacherGradeLevelId);
			console.log("Debug - teacherSectionId:", teacherSectionId);
			const data = await getSectionsByGradeLevel(
				teacherGradeLevelId,
				teacherSectionId
			);
			let sectionsData = data;
			if (typeof data === "string") {
				try {
					sectionsData = JSON.parse(data);
				} catch (e) {
					sectionsData = [];
				}
			}

			console.log("Debug - sectionsData:", sectionsData);

			// Group sections by grade level (use actual teacher grade level)
			const grouped = sectionsData.reduce((acc, item) => {
				// Use actual teacher grade level if available, otherwise use section grade level
				const gradeLevel =
					item.actualTeacherGradeLevel || item.sectionGradeLevel;
				if (gradeLevel && !acc[gradeLevel]) {
					acc[gradeLevel] = [];
				}
				if (gradeLevel && item.sectionName) {
					// Only add if not already in the array to prevent duplicates
					if (!acc[gradeLevel].includes(item.sectionName)) {
						acc[gradeLevel].push(item.sectionName);
					}
				}
				return acc;
			}, {});

			console.log("Debug - grouped sections:", grouped);
			setSectionsByGradeLevel(grouped);
		} catch (error) {
			console.error("Error fetching sections by grade level:", error);
		}
	};

	const applyFilters = () => {
		let filtered = [...students];

		// Always apply grade level filter since teachers are restricted to their grade level
		if (selectedGradeLevel && selectedGradeLevel !== "") {
			filtered = filtered.filter(
				(student) =>
					student.teacherGradeLevel === selectedGradeLevel ||
					student.sectionGradeLevel === selectedGradeLevel
			);
		}

		// Apply section filter
		if (selectedSection && selectedSection !== "") {
			filtered = filtered.filter(
				(student) => student.sectionName === selectedSection
			);
		}

		// Apply search filter
		if (searchQuery && searchQuery.trim() !== "") {
			const query = searchQuery.toLowerCase().trim();
			filtered = filtered.filter(
				(student) =>
					student.firstname?.toLowerCase().includes(query) ||
					student.lastname?.toLowerCase().includes(query) ||
					student.lrn?.toLowerCase().includes(query)
			);
		}

		setFilteredStudents(filtered);
	};

	const handleGradeLevelChange = (gradeLevel) => {
		if (gradeLevel && gradeLevel !== "") {
			setSelectedGradeLevel(gradeLevel);
			setSelectedSection(""); // Reset section when grade level changes
		}
	};

	const handleSectionChange = (sectionValue) => {
		if (sectionValue && sectionValue !== "") {
			setSelectedSection(sectionValue);
		}
	};

	const handleFileDownload = async (fileName) => {
		try {
			await downloadFile(fileName);
			toast.success("File downloaded successfully");
		} catch (error) {
			console.error("Download error:", error);
			toast.error("Failed to download file");
		}
	};

	const handleDownloadAllFiles = async () => {
		if (!selectedSection) {
			toast.error("Please select a section first");
			return;
		}

		const filesInSection = groupedStudents
			.filter((student) => student.files && student.files.length > 0)
			.flatMap((student) =>
				student.files.map((file) => ({
					...file,
					studentName: `${student.firstname}_${student.lastname}`,
				}))
			);

		if (filesInSection.length === 0) {
			toast.error(`No files found in section "${selectedSection}"`);
			return;
		}

		setDownloadingAll(true);

		try {
			// Create a promise for each file download
			const downloadPromises = filesInSection.map(async (file, index) => {
				try {
					// Add a small delay between downloads to avoid overwhelming the server
					await new Promise((resolve) => setTimeout(resolve, index * 100));
					await downloadFile(file.fileName);
					return { success: true, fileName: file.fileName };
				} catch (error) {
					console.error(`Failed to download ${file.fileName}:`, error);
					return { success: false, fileName: file.fileName, error };
				}
			});

			const results = await Promise.allSettled(downloadPromises);
			const successful = results.filter(
				(result) => result.status === "fulfilled" && result.value.success
			).length;
			const failed = results.length - successful;

			if (successful > 0) {
				toast.success(
					`Successfully downloaded ${successful} files from "${selectedSection}"`
				);
			}
			if (failed > 0) {
				toast.error(`Failed to download ${failed} files`);
			}
		} catch (error) {
			console.error("Download all error:", error);
			toast.error("Failed to download files");
		} finally {
			setDownloadingAll(false);
		}
	};

	// Calculate stats - need to group by student id first
	const studentGroups = filteredStudents.reduce((acc, record) => {
		const id = record.id;
		if (!acc[id]) {
			acc[id] = {
				id: record.id,
				firstname: record.firstname,
				lastname: record.lastname,
				lrn: record.lrn,
				email: record.email,
				sectionName: record.sectionName,
				teacherGradeLevel:
					record.actualTeacherGradeLevel || record.teacherGradeLevel,
				sectionGradeLevel: record.sectionGradeLevel,
				files: [],
				grade11File: null,
				grade12File: null,
			};
		}

		// Handle file records based on grade level
		if (record.fileName && record.fileName.trim() !== "") {
			// This is a file record
			const fileInfo = {
				fileName: record.fileName,
				sfType:
					record.sfGradeLevelName ||
					record.actualTeacherGradeLevel ||
					record.teacherGradeLevel,
				gradeLevelId: record.sfGradeLevelId,
				gradeLevelName: record.sfGradeLevelName,
			};

			// Add to files array
			acc[id].files.push(fileInfo);

			// Also store separately for easy access
			if (record.sfGradeLevelId == 1) {
				acc[id].grade11File = fileInfo;
			} else if (record.sfGradeLevelId == 2) {
				acc[id].grade12File = fileInfo;
			}
		} else if (record.sfGradeLevelId) {
			// This is a NULL file record (enrollment record)
			const fileInfo = {
				fileName: null,
				sfType: record.sfGradeLevelName,
				gradeLevelId: record.sfGradeLevelId,
				gradeLevelName: record.sfGradeLevelName,
				isNullRecord: true,
			};

			// Add to files array
			acc[id].files.push(fileInfo);

			// Also store separately for easy access
			if (record.sfGradeLevelId == 1) {
				acc[id].grade11File = fileInfo;
			} else if (record.sfGradeLevelId == 2) {
				acc[id].grade12File = fileInfo;
			}
		}

		return acc;
	}, {});

	const groupedStudents = Object.values(studentGroups);
	const totalStudents = groupedStudents.length;

	// Calculate pagination
	const indexOfLastStudent = currentPage * studentsPerPage;
	const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
	const currentStudents = groupedStudents.slice(
		indexOfFirstStudent,
		indexOfLastStudent
	);
	const totalPages = Math.ceil(groupedStudents.length / studentsPerPage);

	// Handle pagination
	const handlePageChange = (pageNumber) => {
		setCurrentPage(pageNumber);
	};

	const handlePrevPage = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
		}
	};

	const handleNextPage = () => {
		if (currentPage < totalPages) {
			setCurrentPage(currentPage + 1);
		}
	};

	// Modal handlers
	const handleOpenModal = (student) => {
		// If students are selected, use selected students
		if (selectedStudents.size > 0) {
			const selectedStudentList = groupedStudents.filter((s) =>
				selectedStudents.has(s.id)
			);
			setModalSelectedStudents(selectedStudentList);
		} else {
			// Individual mode - just the clicked student
			setModalSelectedStudents([student]);
		}
		setSelectedStudent(student);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedStudent(null);
	};

	const handleFileUpdate = () => {
		// Refresh the data after file update
		fetchStudents();
		fetchSectionsByGradeLevel();

		// Clear student selection after successful upload
		setSelectedStudents(new Set());
		setSelectAll(false);
	};

	// Selection handlers
	const handleSelectStudent = (studentId) => {
		const newSelected = new Set(selectedStudents);
		if (newSelected.has(studentId)) {
			newSelected.delete(studentId);
		} else {
			newSelected.add(studentId);
		}
		setSelectedStudents(newSelected);
		setSelectAll(newSelected.size === groupedStudents.length);
	};

	const handleSelectAll = () => {
		if (selectAll) {
			setSelectedStudents(new Set());
			setSelectAll(false);
		} else {
			const allStudentIds = groupedStudents.map((student) => student.id);
			setSelectedStudents(new Set(allStudentIds));
			setSelectAll(true);
		}
	};

	const clearBulkSelection = () => {
		setSelectedStudents(new Set());
		setSelectAll(false);
	};

	// Generate page numbers for pagination
	const getPageNumbers = () => {
		const pageNumbers = [];
		const maxPagesToShow = 5;

		if (totalPages <= maxPagesToShow) {
			for (let i = 1; i <= totalPages; i++) {
				pageNumbers.push(i);
			}
		} else {
			if (currentPage <= 3) {
				for (let i = 1; i <= 4; i++) {
					pageNumbers.push(i);
				}
				pageNumbers.push("...");
				pageNumbers.push(totalPages);
			} else if (currentPage >= totalPages - 2) {
				pageNumbers.push(1);
				pageNumbers.push("...");
				for (let i = totalPages - 3; i <= totalPages; i++) {
					pageNumbers.push(i);
				}
			} else {
				pageNumbers.push(1);
				pageNumbers.push("...");
				for (let i = currentPage - 1; i <= currentPage + 1; i++) {
					pageNumbers.push(i);
				}
				pageNumbers.push("...");
				pageNumbers.push(totalPages);
			}
		}

		return pageNumbers;
	};

	// Handle search input change
	const handleSearchChange = (e) => {
		setSearchQuery(e.target.value);
	};

	// Clear search
	const clearSearch = () => {
		setSearchQuery("");
	};

	return (
		<Card className="dark:bg-slate-800 dark:border-slate-700">
			<CardContent className="p-4 lg:p-6">
				<div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
					<div className="text-lg font-semibold text-slate-900 dark:text-white">
						Student File Management ({totalStudents})
					</div>
					<div className="flex gap-2 items-center">
						{selectedStudents.size > 0 && (
							<Button
								variant="outline"
								onClick={clearBulkSelection}
								className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
							>
								Clear Selection ({selectedStudents.size})
							</Button>
						)}
						{selectedStudents.size > 0 && (
							<Button
								onClick={() => {
									const selectedStudentList = groupedStudents.filter((s) =>
										selectedStudents.has(s.id)
									);
									setModalSelectedStudents(selectedStudentList);
									setSelectedStudent(selectedStudentList[0]); // Set first student as default
									setIsModalOpen(true);
								}}
								className="flex gap-2 items-center text-white bg-purple-600 hover:bg-purple-700"
							>
								<Users2 className="w-4 h-4" />
								Update Section or SF10 ({selectedStudents.size})
							</Button>
						)}
					</div>
				</div>

				{/* Grade Level Tabs */}
				<div className="mb-6">
					<div className="flex flex-wrap gap-2 mb-4">
						{Object.keys(sectionsByGradeLevel).map((gradeLevel) => (
							<Button
								key={gradeLevel}
								variant="outline"
								onClick={() => handleGradeLevelChange(gradeLevel)}
								className={`flex gap-2 items-center ${
									selectedGradeLevel === gradeLevel
										? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:text-white dark:bg-blue-600 dark:text-white dark:border-blue-600 dark:hover:bg-blue-700 dark:hover:text-white"
										: "hover:bg-slate-100 dark:hover:bg-slate-700 dark:hover:text-white"
								}`}
							>
								<BookOpen className="w-4 h-4" />
								{gradeLevel}
							</Button>
						))}
					</div>

					{/* Section Filter and Search Row */}
					{selectedGradeLevel && sectionsByGradeLevel[selectedGradeLevel] && (
						<div className="mb-4">
							<div className="flex flex-col gap-4 justify-between items-start lg:flex-row lg:items-center">
								{/* Section Filter */}
								<div className="flex-1">
									<div className="flex gap-2 items-center mb-2">
										<Filter className="w-4 h-4 text-slate-500 dark:text-slate-400" />
										<span className="text-sm font-medium text-slate-700 dark:text-slate-300">
											Sections in {selectedGradeLevel}:
										</span>
									</div>
									<div className="flex flex-wrap gap-2">
										{sectionsByGradeLevel[selectedGradeLevel].map((section) => (
											<Button
												key={section}
												variant="outline"
												size="sm"
												onClick={() => handleSectionChange(section)}
												className={`${
													selectedSection === section
														? "bg-green-600 text-white border-green-600 hover:bg-green-700 hover:text-white dark:bg-green-600 dark:text-white dark:border-green-600 dark:hover:bg-green-700 dark:hover:text-white"
														: "hover:bg-slate-100 dark:hover:bg-slate-700 dark:hover:text-white"
												}`}
											>
												{section}
											</Button>
										))}
									</div>
								</div>

								{/* Search Bar */}
								<div className="w-full lg:w-auto lg:min-w-[300px]">
									<div className="relative">
										<Search className="absolute left-3 top-1/2 w-4 h-4 transform -translate-y-1/2 text-slate-400" />
										<input
											type="text"
											placeholder="Search by name or LRN..."
											value={searchQuery}
											onChange={handleSearchChange}
											className="py-2 pr-10 pl-10 w-full rounded-lg border dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white dark:placeholder-slate-400"
										/>
										{searchQuery && (
											<Button
												variant="ghost"
												size="sm"
												onClick={clearSearch}
												className="absolute right-1 top-1/2 p-0 w-6 h-6 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
											>
												×
											</Button>
										)}
									</div>
									{searchQuery && (
										<div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
											Searching for:{" "}
											<span className="font-medium">"{searchQuery}"</span>
											{filteredStudents.length > 0 && (
												<span className="ml-2">
													({filteredStudents.length} result
													{filteredStudents.length !== 1 ? "s" : ""})
												</span>
											)}
										</div>
									)}
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Filter Summary */}
				{(selectedSection || searchQuery) && (
					<div className="p-3 mb-4 bg-blue-50 rounded-lg dark:bg-blue-900/20">
						<div className="text-sm text-blue-800 dark:text-blue-200">
							<strong>Current Filters:</strong>
							{selectedGradeLevel && (
								<span className="ml-2">
									Grade Level:{" "}
									<span className="font-medium">{selectedGradeLevel}</span>
								</span>
							)}
							{selectedSection && (
								<span className="ml-2">
									Section:{" "}
									<span className="font-medium">{selectedSection}</span>
								</span>
							)}
							{searchQuery && (
								<span className="ml-2">
									Search: <span className="font-medium">"{searchQuery}"</span>
								</span>
							)}
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									setSelectedSection("");
									setSearchQuery("");
								}}
								className="ml-4"
							>
								Clear All Filters
							</Button>
						</div>
					</div>
				)}

				{/* Download All Files Button */}
				{selectedSection &&
					groupedStudents.some(
						(student) => student.files && student.files.length > 0
					) && (
						<div className="mb-4">
							<Button
								onClick={handleDownloadAllFiles}
								disabled={downloadingAll}
								className="flex gap-2 items-center text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 dark:bg-green-600 dark:text-white dark:border-green-600 dark:hover:bg-green-700 dark:hover:text-white"
							>
								{downloadingAll ? (
									<>
										<div className="w-4 h-4 rounded-full border-b-2 border-white animate-spin"></div>
										<span>Downloading...</span>
									</>
								) : (
									<>
										<DownloadCloud className="w-4 h-4" />
										<span>Download All Files from {selectedSection}</span>
									</>
								)}
							</Button>
						</div>
					)}

				{loading ? (
					<div className="py-6 text-center lg:py-8">
						<p className="text-sm text-slate-500 lg:text-base dark:text-slate-400">
							Loading students...
						</p>
					</div>
				) : groupedStudents.length === 0 ? (
					<div className="py-6 text-center lg:py-8">
						<p className="text-sm text-slate-500 lg:text-base dark:text-slate-400">
							{searchQuery
								? `No students found matching "${searchQuery}".`
								: selectedSection
								? `No students found in ${selectedGradeLevel} - ${selectedSection}.`
								: `No students found in ${selectedGradeLevel}.`}
						</p>
					</div>
				) : (
					<>
						{/* Pagination Info */}
						<div className="mb-4 text-sm text-slate-600 dark:text-slate-400">
							Showing {indexOfFirstStudent + 1} to{" "}
							{Math.min(indexOfLastStudent, groupedStudents.length)} of{" "}
							{groupedStudents.length} students
							{totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
						</div>

						<div className="overflow-x-auto -mx-4 lg:mx-0">
							<table className="min-w-full text-xs lg:text-sm text-slate-700 dark:text-slate-300">
								<thead>
									<tr className="border-b border-slate-200 dark:border-slate-700">
										<th className="px-3 py-2 font-semibold text-left lg:px-4">
											<div className="flex gap-2 items-center">
												<button
													onClick={handleSelectAll}
													className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
												>
													{selectAll ? (
														<CheckSquare className="w-4 h-4 text-blue-600" />
													) : (
														<Square className="w-4 h-4 text-slate-600 dark:text-slate-400" />
													)}
												</button>
												Select All
											</div>
										</th>
										<th className="px-3 py-2 font-semibold text-left lg:px-4">
											First Name
										</th>
										<th className="px-3 py-2 font-semibold text-left lg:px-4">
											Last Name
										</th>
										<th className="px-3 py-2 font-semibold text-left lg:px-4">
											LRN
										</th>
										<th className="px-3 py-2 font-semibold text-left lg:px-4">
											Email
										</th>
										<th className="px-3 py-2 font-semibold text-left lg:px-4">
											Section
										</th>
										<th className="px-3 py-2 font-semibold text-left lg:px-4">
											Files
										</th>
									</tr>
								</thead>
								<tbody>
									{currentStudents.map((student, idx) => (
										<tr
											key={student.id || idx}
											className="border-b transition-colors border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
										>
											<td className="px-3 py-3 lg:px-4 lg:py-2">
												<div className="flex gap-2 items-center">
													<button
														onClick={(e) => {
															e.stopPropagation(); // Prevent row click
															handleSelectStudent(student.id);
														}}
														className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
													>
														{selectedStudents.has(student.id) ? (
															<CheckSquare className="w-4 h-4 text-blue-600" />
														) : (
															<Square className="w-4 h-4 text-slate-600 dark:text-slate-400" />
														)}
													</button>
												</div>
											</td>
											<td
												className="px-3 py-3 cursor-pointer lg:px-4 lg:py-2"
												onClick={() => handleOpenModal(student)}
											>
												<div className="font-medium">{student.firstname}</div>
											</td>
											<td
												className="px-3 py-3 cursor-pointer lg:px-4 lg:py-2"
												onClick={() => handleOpenModal(student)}
											>
												<div className="font-medium">{student.lastname}</div>
											</td>
											<td
												className="px-3 py-3 cursor-pointer lg:px-4 lg:py-2"
												onClick={() => handleOpenModal(student)}
											>
												<div className="truncate max-w-[120px] lg:max-w-none">
													{student.lrn}
												</div>
											</td>
											<td
												className="px-3 py-3 cursor-pointer lg:px-4 lg:py-2"
												onClick={() => handleOpenModal(student)}
											>
												<div className="truncate max-w-[120px] lg:max-w-none">
													{student.email}
												</div>
											</td>

											<td
												className="px-3 py-3 cursor-pointer lg:px-4 lg:py-2"
												onClick={() => handleOpenModal(student)}
											>
												<span className="inline-flex px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full dark:text-blue-200 dark:bg-blue-900">
													{student.sectionName || "N/A"}
												</span>
											</td>
											<td
												className="px-3 py-3 cursor-pointer lg:px-4 lg:py-2"
												onClick={() => handleOpenModal(student)}
											>
												<div className="max-w-xs">
													{student.files && student.files.length > 0 ? (
														<div className="space-y-2">
															{/* Grade 11 File */}
															{student.grade11File && (
																<div className="p-2 bg-gray-50 rounded-md dark:bg-gray-800">
																	<div className="mb-1 text-xs font-medium text-green-600 dark:text-green-400">
																		{student.grade11File.sfType}
																	</div>
																	{student.grade11File.fileName ? (
																		<div className="text-xs text-gray-700 truncate dark:text-slate-400">
																			{student.grade11File.fileName}
																		</div>
																	) : (
																		<div className="text-xs italic text-gray-500">
																			No file uploaded
																		</div>
																	)}
																	{student.grade11File.fileName && (
																		<div className="flex gap-1 mt-1">
																			<Button
																				size="sm"
																				variant="outline"
																				className="p-1 w-6 h-6"
																				onClick={(e) => {
																					e.stopPropagation();
																					handleFileDownload(
																						student.grade11File.fileName
																					);
																				}}
																				title="Download file"
																			>
																				<Download className="w-3 h-3" />
																			</Button>
																		</div>
																	)}
																</div>
															)}

															{/* Grade 12 File */}
															{student.grade12File && (
																<div className="p-2 bg-blue-50 rounded-md dark:bg-blue-900/20">
																	<div className="mb-1 text-xs font-medium text-blue-600 dark:text-blue-400">
																		{student.grade12File.sfType}
																	</div>
																	{student.grade12File.fileName ? (
																		<div className="text-xs text-gray-700 truncate dark:text-slate-400">
																			{student.grade12File.fileName}
																		</div>
																	) : (
																		<div className="text-xs font-medium text-orange-600 dark:text-orange-400">
																			⚠️ Please upload Grade 12 file
																		</div>
																	)}
																	{student.grade12File.fileName && (
																		<div className="flex gap-1 mt-1">
																			<Button
																				size="sm"
																				variant="outline"
																				className="p-1 w-6 h-6"
																				onClick={(e) => {
																					e.stopPropagation();
																					handleFileDownload(
																						student.grade12File.fileName
																					);
																				}}
																				title="Download file"
																			>
																				<Download className="w-3 h-3" />
																			</Button>
																		</div>
																	)}
																</div>
															)}

															{/* Show note if no Grade 12 file exists */}
															{!student.grade12File && student.grade11File && (
																<div className="p-2 bg-yellow-50 rounded-md dark:bg-yellow-900/20">
																	<div className="text-xs font-medium text-yellow-700 dark:text-yellow-300">
																		📝 Enroll to Grade 12 to upload SF10 file
																	</div>
																</div>
															)}
														</div>
													) : (
														<span className="text-xs italic text-gray-500">
															No files uploaded
														</span>
													)}
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* Pagination Controls */}
						{totalPages > 1 && (
							<div className="flex flex-col gap-4 justify-between items-center mt-6 sm:flex-row">
								<div className="text-sm text-slate-600 dark:text-slate-400">
									Page {currentPage} of {totalPages}
								</div>

								<div className="flex gap-2 items-center">
									{/* Previous Button */}
									<Button
										variant="outline"
										size="sm"
										onClick={handlePrevPage}
										disabled={currentPage === 1}
										className="flex gap-1 items-center"
									>
										<ChevronLeft className="w-4 h-4" />
										Previous
									</Button>

									{/* Page Numbers */}
									<div className="flex gap-1">
										{getPageNumbers().map((pageNum, index) => (
											<React.Fragment key={index}>
												{pageNum === "..." ? (
													<span className="px-3 py-1 text-sm text-slate-400 dark:text-slate-500">
														...
													</span>
												) : (
													<Button
														variant={
															currentPage === pageNum ? "default" : "outline"
														}
														size="sm"
														onClick={() => handlePageChange(pageNum)}
														className="min-w-[36px]"
													>
														{pageNum}
													</Button>
												)}
											</React.Fragment>
										))}
									</div>

									{/* Next Button */}
									<Button
										variant="outline"
										size="sm"
										onClick={handleNextPage}
										disabled={currentPage === totalPages}
										className="flex gap-1 items-center"
									>
										Next
										<ChevronRight className="w-4 h-4" />
									</Button>
								</div>
							</div>
						)}
					</>
				)}

				{/* Student Modal */}
				<StudentModal
					isOpen={isModalOpen}
					onClose={handleCloseModal}
					student={selectedStudent}
					onFileUpdate={handleFileUpdate}
					allStudents={modalSelectedStudents}
					teacherGradeLevelId={teacherGradeLevelId}
					teacherSectionId={teacherSectionId}
					teacherUserId={teacherUserId} // Pass teacherUserId to StudentModal
				/>
			</CardContent>
		</Card>
	);
}
