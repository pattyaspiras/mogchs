import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
	Upload,
	Filter,
	ChevronLeft,
	ChevronRight,
	UserPlus,
	FileText,
	Eye,
	Download,
	ChevronDown,
	ChevronUp,
	Search,
} from "lucide-react";
import toast from "react-hot-toast";
import StudentImport from "../../../components/StudentImport";
import AddStudentModal from "../../../components/AddStudentModal";
import DocumentViewer from "../../../components/DocumentViewer";
import { getStudent } from "../../../utils/teacher";
import {
	getSection,
	getStrands,
	getSchoolYear,
} from "../../../utils/registrar";
import { getDecryptedApiUrl } from "../../../utils/apiConfig";

export default function StudentsTab({ refreshTrigger, userId }) {
	const [students, setStudents] = useState([]);
	const [filteredStudents, setFilteredStudents] = useState([]);
	const [sections, setSections] = useState([]);
	const [studentsLoading, setStudentsLoading] = useState(true);
	const [showImportModal, setShowImportModal] = useState(false);
	const [showAddStudentModal, setShowAddStudentModal] = useState(false);

	// Document management state
	const [studentDocuments, setStudentDocuments] = useState({});
	const [expandedStudents, setExpandedStudents] = useState(new Set());
	const [selectedDocument, setSelectedDocument] = useState(null);
	const [showDocumentViewer, setShowDocumentViewer] = useState(false);

	// Pagination state
	const [currentPage, setCurrentPage] = useState(1);
	const [studentsPerPage] = useState(10);

	// Filter state
	const [selectedSection, setSelectedSection] = useState("");
	const [strands, setStrands] = useState([]);
	const [selectedStrand, setSelectedStrand] = useState("");
	const [schoolYears, setSchoolYears] = useState([]);
	const [selectedSchoolYear, setSelectedSchoolYear] = useState("");
	const [searchTerm, setSearchTerm] = useState("");

	// Fetch students and sections when component mounts
	useEffect(() => {
		fetchStudents();
		fetchSections();
		fetchStrands();
		fetchSchoolYears();
	}, []);

	// Refresh data when refreshTrigger changes
	useEffect(() => {
		if (refreshTrigger && refreshTrigger > 0) {
			fetchStudents();
			fetchSections();
			fetchStrands();
			fetchSchoolYears();
		}
	}, [refreshTrigger]);

	// Apply filters when any filter changes
	useEffect(() => {
		applyFilters();
	}, [
		students,
		selectedSection,
		selectedStrand,
		selectedSchoolYear,
		searchTerm,
	]);

	// Reset to page 1 when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [selectedSection, selectedStrand, selectedSchoolYear, searchTerm]);

	const fetchStudents = async () => {
		setStudentsLoading(true);
		try {
			const data = await getStudent();
			console.log("API data:", data);
			let studentsArray = data;
			if (typeof data === "string") {
				try {
					studentsArray = JSON.parse(data);
				} catch (e) {
					studentsArray = [];
				}
			}

			// Extract documents from student data and populate studentDocuments
			const documentsMap = {};
			if (Array.isArray(studentsArray)) {
				studentsArray.forEach((student) => {
					if (student.documents && Array.isArray(student.documents)) {
						documentsMap[student.id] = student.documents;
						console.log(
							`Student ${student.id} has ${student.documents.length} documents:`,
							student.documents.map((doc) => ({
								id: doc.id,
								type: doc.documentType,
							}))
						);
					}
				});
			}

			setStudents(Array.isArray(studentsArray) ? studentsArray : []);
			setStudentDocuments(documentsMap);
			setExpandedStudents(new Set());
		} catch (error) {
			console.error("Error fetching students:", error);
			toast.error("Failed to load students");
		} finally {
			setStudentsLoading(false);
		}
	};

	const fetchSections = async () => {
		try {
			const data = await getSection();
			let sectionsArray = data;
			if (typeof data === "string") {
				try {
					sectionsArray = JSON.parse(data);
				} catch (e) {
					sectionsArray = [];
				}
			}
			setSections(Array.isArray(sectionsArray) ? sectionsArray : []);
		} catch (error) {
			console.error("Error fetching sections:", error);
			toast.error("Failed to load sections");
		}
	};

	const fetchStrands = async () => {
		try {
			const data = await getStrands();
			let strandsArray = data;
			if (typeof data === "string") {
				try {
					strandsArray = JSON.parse(data);
				} catch (e) {
					strandsArray = [];
				}
			}
			setStrands(Array.isArray(strandsArray) ? strandsArray : []);
		} catch (error) {
			toast.error("Failed to load strands");
		}
	};

	const fetchSchoolYears = async () => {
		try {
			const data = await getSchoolYear();
			let schoolYearsArray = data;
			if (typeof data === "string") {
				try {
					schoolYearsArray = JSON.parse(data);
				} catch (e) {
					schoolYearsArray = [];
				}
			}
			setSchoolYears(Array.isArray(schoolYearsArray) ? schoolYearsArray : []);
		} catch (error) {
			console.error("Error fetching school years:", error);
			toast.error("Failed to load school years");
		}
	};

	const applyFilters = () => {
		let filtered = [...students];

		// Apply search filter
		if (searchTerm && searchTerm.trim() !== "") {
			const searchLower = searchTerm.toLowerCase().trim();
			filtered = filtered.filter((student) => {
				const fullName = `${student.firstname || ""} ${
					student.middlename || ""
				} ${student.lastname || ""}`.toLowerCase();
				const lrn = (student.lrn || "").toString().toLowerCase();
				return fullName.includes(searchLower) || lrn.includes(searchLower);
			});
		}

		// Apply section filter
		if (selectedSection && selectedSection !== "") {
			filtered = filtered.filter(
				(student) =>
					student.sectionName === selectedSection ||
					student.sectionId === selectedSection
			);
		}
		// Apply strand filter
		if (selectedStrand && selectedStrand !== "") {
			console.log("Filtering by strand:", selectedStrand);
			console.log(
				"Available students:",
				students.map((s) => ({
					id: s.id,
					strandId: s.strandId,
					strand: s.strand,
				}))
			);
			filtered = filtered.filter((student) => {
				const matches =
					student.strandId == selectedStrand ||
					student.strand === selectedStrand;
				console.log(
					`Student ${student.id}: strandId=${student.strandId}, strand=${student.strand}, matches=${matches}`
				);
				return matches;
			});
			console.log("Filtered students:", filtered.length);
		}

		// Apply school year filter
		if (selectedSchoolYear && selectedSchoolYear !== "") {
			filtered = filtered.filter((student) => {
				const matches =
					student.schoolyearId == selectedSchoolYear ||
					student.schoolYear === selectedSchoolYear;
				return matches;
			});
		}

		setFilteredStudents(filtered);
	};

	const handleSectionChange = (sectionValue) => {
		setSelectedSection(sectionValue);
	};
	const handleStrandChange = (strandValue) => {
		setSelectedStrand(strandValue);
	};
	const handleSchoolYearChange = (schoolYearValue) => {
		setSelectedSchoolYear(schoolYearValue);
	};

	const handleSearchChange = (e) => {
		setSearchTerm(e.target.value);
	};

	// Calculate pagination
	const indexOfLastStudent = currentPage * studentsPerPage;
	const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
	const currentStudents = filteredStudents.slice(
		indexOfFirstStudent,
		indexOfLastStudent
	);
	const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

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

	// Handle import completion
	const handleImportComplete = (results) => {
		fetchStudents(); // Refresh students list
		setShowImportModal(false);
		toast.success(`Successfully imported ${results.imported} students!`);
	};

	// Handle add student completion
	const handleAddStudentComplete = (results) => {
		fetchStudents(); // Refresh students list
		setShowAddStudentModal(false);
		toast.success("Student added successfully!");
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

	// Document management functions - documents are now loaded with students

	const toggleStudentDocuments = (studentId) => {
		const newExpanded = new Set(expandedStudents);
		if (newExpanded.has(studentId)) {
			newExpanded.delete(studentId);
		} else {
			newExpanded.add(studentId);
			// Documents are already loaded with student data, no need to fetch
		}
		setExpandedStudents(newExpanded);
	};

	const handleViewDocument = (documentData) => {
		setSelectedDocument(documentData);
		setShowDocumentViewer(true);
	};

	const handleDownloadDocument = (documentData) => {
		const apiUrl = getDecryptedApiUrl();
		const fileUrl = `${apiUrl}/documents/${documentData.fileName}`;
		const link = document.createElement("a");
		link.href = fileUrl;
		link.download = documentData.fileName;
		link.target = "_blank";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const handleViewDocumentInTab = (documentData) => {
		const apiUrl = getDecryptedApiUrl();
		const fileUrl = `${apiUrl}/documents/${documentData.fileName}`;
		window.open(fileUrl, "_blank");
	};

	const getFileExtension = (filename) => {
		return filename.split(".").pop().toLowerCase();
	};

	const isViewableFile = (filename) => {
		const extension = getFileExtension(filename);
		return ["pdf", "jpg", "jpeg", "png", "gif"].includes(extension);
	};

	const isPdfFile = (filename) => {
		return getFileExtension(filename) === "pdf";
	};

	return (
		<>
			<Card className="dark:bg-slate-800 dark:border-slate-700">
				<CardContent className="p-4 lg:p-6">
					<div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
						<div className="text-lg font-semibold text-slate-900 dark:text-white">
							Students ({filteredStudents.length})
						</div>
						<div className="flex gap-2">
							<Button
								onClick={() => setShowAddStudentModal(true)}
								className="flex gap-2 items-center text-white bg-blue-600 hover:bg-blue-700"
							>
								<UserPlus className="w-4 h-4" /> Add Student
							</Button>
							<Button
								onClick={() => setShowImportModal(true)}
								className="flex gap-2 items-center text-white bg-green-600 hover:bg-green-700"
							>
								<Upload className="w-4 h-4" /> Import Students
							</Button>
						</div>
					</div>

					{/* Filter Controls */}
					<div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center">
						{/* Search Input */}
						<div className="flex gap-2 items-center">
							<Search className="w-4 h-4 text-slate-500 dark:text-slate-400" />
							<input
								type="text"
								placeholder="Search by name or LRN..."
								value={searchTerm}
								onChange={handleSearchChange}
								className="px-3 py-2 text-sm bg-white rounded-md border dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white min-w-[200px]"
							/>
						</div>
						<div className="flex gap-2 items-center">
							<Filter className="w-4 h-4 text-slate-500 dark:text-slate-400" />
							<select
								value={selectedSection}
								onChange={(e) => handleSectionChange(e.target.value)}
								className="px-3 py-2 text-sm bg-white rounded-md border dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
							>
								<option value="">All Sections</option>
								{sections.map((section) => (
									<option key={section.id} value={section.name}>
										{section.name}
									</option>
								))}
							</select>
							<select
								value={selectedStrand}
								onChange={(e) => handleStrandChange(e.target.value)}
								className="px-3 py-2 text-sm bg-white rounded-md border dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
							>
								<option value="">All Strands</option>
								{strands.map((strand) => (
									<option key={strand.id} value={strand.id}>
										{strand.name} ({strand.trackName})
									</option>
								))}
							</select>
							<select
								value={selectedSchoolYear}
								onChange={(e) => handleSchoolYearChange(e.target.value)}
								className="px-3 py-2 text-sm bg-white rounded-md border dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
							>
								<option value="">All School Years</option>
								{schoolYears.map((schoolYear) => (
									<option key={schoolYear.id} value={schoolYear.id}>
										{schoolYear.year}
									</option>
								))}
							</select>
						</div>
					</div>

					{studentsLoading ? (
						<div className="py-6 text-center lg:py-8">
							<p className="text-sm text-slate-500 dark:text-slate-400 lg:text-base">
								Loading students...
							</p>
						</div>
					) : filteredStudents.length === 0 ? (
						<div className="py-6 text-center lg:py-8">
							<p className="text-sm text-slate-500 dark:text-slate-400 lg:text-base">
								{selectedSection
									? `No students found in section "${selectedSection}".`
									: "No students found. Import students to get started."}
							</p>
						</div>
					) : (
						<>
							{/* Pagination Info */}
							<div className="mb-4 text-sm text-slate-600 dark:text-slate-400">
								Showing {indexOfFirstStudent + 1} to{" "}
								{Math.min(indexOfLastStudent, filteredStudents.length)} of{" "}
								{filteredStudents.length} students
								{totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
							</div>

							{/* Students Table */}
							<div className="overflow-x-auto -mx-4 mb-6 lg:mx-0">
								<table className="min-w-full text-xs lg:text-sm text-slate-700 dark:text-slate-300">
									<thead>
										<tr className="border-b border-slate-200 dark:border-slate-700">
											<th className="px-3 py-2 font-semibold text-left lg:px-4">
												Student
											</th>
											<th className="px-3 py-2 font-semibold text-left lg:px-4">
												LRN
											</th>
											<th className="hidden px-3 py-2 font-semibold text-left lg:px-4 sm:table-cell">
												Email
											</th>
											<th className="px-3 py-2 font-semibold text-left lg:px-4">
												Section
											</th>
											<th className="px-3 py-2 font-semibold text-left lg:px-4">
												School Year
											</th>
											<th className="px-3 py-2 font-semibold text-left lg:px-4">
												Track & Strand
											</th>
											<th className="px-3 py-2 font-semibold text-left lg:px-4">
												Documents
											</th>
										</tr>
									</thead>
									<tbody>
										{currentStudents.map((student) => (
											<React.Fragment key={student.id}>
												<tr className="border-b transition-colors border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
													<td className="px-3 py-3 lg:px-4 lg:py-2">
														<div className="flex items-center">
															<div className="flex-shrink-0 mr-3 w-8 h-8">
																<div className="flex justify-center items-center w-8 h-8 bg-blue-100 rounded-full dark:bg-blue-900">
																	<span className="text-xs font-medium text-blue-600 dark:text-blue-300">
																		{student.firstname?.[0]}
																		{student.lastname?.[0]}
																	</span>
																</div>
															</div>
															<div>
																<div className="font-medium dark:text-white">
																	{student.firstname} {student.middlename}{" "}
																	{student.lastname}
																</div>
															</div>
														</div>
													</td>
													<td className="px-3 py-3 lg:px-4 lg:py-2 dark:text-white">
														{student.lrn || "N/A"}
													</td>
													<td className="hidden px-3 py-3 lg:px-4 lg:py-2 sm:table-cell dark:text-white">
														{student.email || "N/A"}
													</td>
													<td className="px-3 py-3 lg:px-4 lg:py-2">
														<span className="inline-flex px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full dark:text-blue-300 dark:bg-blue-900/20">
															{student.sectionName || "N/A"}
														</span>
													</td>
													<td className="px-3 py-3 lg:px-4 lg:py-2">
														<span className="inline-flex px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full dark:text-green-300 dark:bg-green-900/20">
															{student.schoolYear || "N/A"}
														</span>
													</td>
													<td className="px-3 py-3 lg:px-4 lg:py-2">
														<div>
															<div className="text-xs font-medium dark:text-white">
																{student.track || "N/A"}
															</div>
															<div className="text-xs text-slate-500 dark:text-slate-400">
																{student.strand || "N/A"}
															</div>
														</div>
													</td>
													<td className="px-3 py-3 lg:px-4 lg:py-2">
														<Button
															onClick={() => toggleStudentDocuments(student.id)}
															variant="outline"
															size="sm"
															className="flex gap-1 items-center"
														>
															{expandedStudents.has(student.id) ? (
																<ChevronUp className="w-3 h-3" />
															) : (
																<ChevronDown className="w-3 h-3" />
															)}
															<FileText className="w-3 h-3" />
															Documents
														</Button>
													</td>
												</tr>

												{/* Expanded Documents Row */}
												{expandedStudents.has(student.id) && (
													<tr className="bg-slate-50 dark:bg-slate-800">
														<td colSpan="7" className="px-3 py-4 lg:px-4">
															{studentDocuments[student.id]?.length > 0 ? (
																<div className="space-y-2">
																	<h4 className="text-sm font-medium text-slate-900 dark:text-white">
																		Student Documents:
																	</h4>
																	<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
																		{studentDocuments[student.id]
																			.sort((a, b) => b.id - a.id)
																			.map((doc) => (
																				<div
																					key={doc.id}
																					className="flex justify-between items-center p-3 bg-white rounded-lg border dark:bg-slate-700 dark:border-slate-600"
																				>
																					<div className="flex-1 min-w-0">
																						<div className="flex gap-2 items-center">
																							<FileText className="flex-shrink-0 w-4 h-4 text-blue-600 dark:text-blue-400" />
																							<div className="min-w-0">
																								<p className="text-xs font-medium truncate text-slate-900 dark:text-white">
																									{doc.documentType}
																								</p>
																								<p className="text-xs truncate text-slate-500 dark:text-slate-400">
																									{doc.gradeLevelName} •{" "}
																									{new Date(
																										doc.createdAt
																									).toLocaleDateString()}
																								</p>
																							</div>
																						</div>
																					</div>
																					<div className="flex gap-1 ml-2">
																						{isViewableFile(doc.fileName) && (
																							<Button
																								onClick={() =>
																									handleViewDocument(doc)
																								}
																								size="sm"
																								variant="outline"
																								className="p-1 w-7 h-7"
																								title="View in Modal"
																							>
																								<Eye className="w-3 h-3" />
																							</Button>
																						)}
																						<Button
																							onClick={() =>
																								handleDownloadDocument(doc)
																							}
																							size="sm"
																							variant="outline"
																							className="p-1 w-7 h-7 text-green-600 bg-green-50 border-green-200 hover:bg-green-100"
																							title="Download Document"
																						>
																							<Download className="w-3 h-3" />
																						</Button>
																					</div>
																				</div>
																			))}
																	</div>
																</div>
															) : (
																<div className="py-4 text-center">
																	<p className="text-sm text-slate-500 dark:text-slate-400">
																		No documents found for this student.
																	</p>
																</div>
															)}
														</td>
													</tr>
												)}
											</React.Fragment>
										))}
									</tbody>
								</table>
							</div>

							{/* Pagination Controls */}
							{totalPages > 1 && (
								<div className="flex flex-col gap-4 justify-between items-center sm:flex-row">
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
				</CardContent>
				{/* Import Modal */}
				{showImportModal && (
					<StudentImport
						onClose={() => setShowImportModal(false)}
						onImportComplete={handleImportComplete}
					/>
				)}

				{/* Add Student Modal */}
				{showAddStudentModal && (
					<AddStudentModal
						isOpen={showAddStudentModal}
						onClose={() => setShowAddStudentModal(false)}
						onSuccess={handleAddStudentComplete}
						userId={userId}
					/>
				)}

				{/* Document Viewer Modal */}
				{showDocumentViewer && (
					<DocumentViewer
						document={selectedDocument}
						isOpen={showDocumentViewer}
						onClose={() => {
							setShowDocumentViewer(false);
							setSelectedDocument(null);
						}}
					/>
				)}
			</Card>
		</>
	);
}
