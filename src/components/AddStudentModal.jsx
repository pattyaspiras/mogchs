import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
	X,
	UserPlus,
	Upload,
	FileText,
	Plus,
	Trash2,
	Users,
} from "lucide-react";
import toast from "react-hot-toast";
import {
	getStrands,
	getSchoolYear,
	getSf10DocumentId,
} from "../utils/registrar";
import { addIndividualStudent } from "../utils/registrar";
import { getSection } from "../utils/registrar";

export default function AddStudentModal({
	isOpen,
	onClose,
	onSuccess,
	userId,
}) {
	const [strands, setStrands] = useState([]);
	const [schoolYears, setSchoolYears] = useState([]);
	const [sections, setSections] = useState([]);
	const [gradeLevels, setGradeLevels] = useState([
		{ id: 1, name: "Grade 11" },
		{ id: 2, name: "Grade 12" },
	]);
	const [students, setStudents] = useState([
		{
			firstname: "",
			middlename: "",
			lastname: "",
			lrn: "",
			password: "",
			schoolYearId: "",
			strandId: "",
			gradeLevelId: "",
			sectionId: "",
			userLevel: "4", // Student level
			sf10File: null,
		},
	]);
	const [loading, setLoading] = useState(false);
	const [sf10DocumentId, setSf10DocumentId] = useState(null);
	const [activeStudent, setActiveStudent] = useState(0);

	// Fetch data when modal opens
	useEffect(() => {
		if (isOpen) {
			fetchInitialData();
		}
	}, [isOpen]);

	const fetchInitialData = async () => {
		try {
			// Fetch strands
			const strandsData = await getStrands();
			let strandsArray = strandsData;
			if (typeof strandsData === "string") {
				try {
					strandsArray = JSON.parse(strandsData);
				} catch (e) {
					strandsArray = [];
				}
			}
			setStrands(Array.isArray(strandsArray) ? strandsArray : []);

			// Fetch school years
			const schoolYearsData = await getSchoolYear();
			let schoolYearsArray = schoolYearsData;
			if (typeof schoolYearsData === "string") {
				try {
					schoolYearsArray = JSON.parse(schoolYearsData);
				} catch (e) {
					schoolYearsArray = [];
				}
			}
			setSchoolYears(Array.isArray(schoolYearsArray) ? schoolYearsArray : []);

			// Fetch sections
			const sectionsData = await getSection();
			let sectionsArray = sectionsData;
			if (typeof sectionsData === "string") {
				try {
					sectionsArray = JSON.parse(sectionsData);
				} catch (e) {
					sectionsArray = [];
				}
			}
			setSections(Array.isArray(sectionsArray) ? sectionsArray : []);

			// Get SF10 document ID dynamically
			const sf10Response = await getSf10DocumentId();
			if (sf10Response.success && sf10Response.documentId) {
				setSf10DocumentId(sf10Response.documentId);
			} else {
				toast.error("Failed to get SF10 document ID");
			}
		} catch (error) {
			console.error("Error fetching initial data:", error);
			toast.error("Failed to load form data");
		}
	};

	const handleInputChange = (index, field, value) => {
		const updatedStudents = [...students];
		updatedStudents[index] = {
			...updatedStudents[index],
			[field]: value,
		};

		// Clear section when grade level changes
		if (field === "gradeLevelId") {
			updatedStudents[index].sectionId = "";
		}

		// Auto-set password to lastname when lastname changes
		if (field === "lastname" && value) {
			updatedStudents[index].password = value;
		}

		setStudents(updatedStudents);
	};

	const handleFileSelect = (index, file) => {
		if (file) {
			// Check if it's a PDF file
			if (file.type !== "application/pdf") {
				toast.error("Please select a valid PDF file");
				return;
			}

			// Check file size (max 10MB)
			if (file.size > 10 * 1024 * 1024) {
				toast.error("File size too large. Maximum size is 10MB.");
				return;
			}

			const updatedStudents = [...students];
			updatedStudents[index].sf10File = file;
			setStudents(updatedStudents);
		}
	};

	const addStudent = () => {
		const newStudents = [
			...students,
			{
				firstname: "",
				middlename: "",
				lastname: "",
				lrn: "",
				password: "",
				schoolYearId: "",
				strandId: "",
				gradeLevelId: "",
				sectionId: "",
				userLevel: "4",
				sf10File: null,
			},
		];
		setStudents(newStudents);
		setActiveStudent(newStudents.length - 1);
	};

	const removeStudent = (index) => {
		if (students.length > 1) {
			const updatedStudents = students.filter((_, i) => i !== index);
			setStudents(updatedStudents);
			// Adjust active student if needed
			if (activeStudent >= updatedStudents.length) {
				setActiveStudent(updatedStudents.length - 1);
			} else if (activeStudent > index) {
				setActiveStudent(activeStudent - 1);
			}
		}
	};

	const scrollToStudent = (index) => {
		setActiveStudent(index);
		const element = document.getElementById(`student-${index}`);
		if (element) {
			element.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	};

	const validateStudent = (student) => {
		if (!student.sf10File) {
			return "SF10 document is required";
		}

		if (
			!student.firstname ||
			!student.lastname ||
			!student.lrn ||
			!student.password
		) {
			return "Please fill in all required fields";
		}

		if (!student.schoolYearId || !student.strandId || !student.gradeLevelId) {
			return "Please select school year, strand, and grade level";
		}

		// sectionId optional

		return null;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!sf10DocumentId) {
			toast.error("SF10 document ID not available. Please try again.");
			return;
		}

		// Validate all students
		for (let i = 0; i < students.length; i++) {
			const error = validateStudent(students[i]);
			if (error) {
				toast.error(`Student ${i + 1}: ${error}`);
				scrollToStudent(i);
				return;
			}
		}

		setLoading(true);
		let successCount = 0;
		let errorCount = 0;

		try {
			// Process each student
			for (let i = 0; i < students.length; i++) {
				try {
					const result = await addIndividualStudent(
						students[i],
						students[i].sf10File,
						sf10DocumentId,
						userId
					);

					console.log(`Student ${i + 1} result:`, result);

					// Extract JSON from response if it contains HTML notices
					let parsedResult = result;
					if (typeof result === "string" && result.includes("{")) {
						try {
							// Find the JSON part in the response
							const jsonStart = result.indexOf("{");
							const jsonEnd = result.lastIndexOf("}") + 1;
							const jsonString = result.substring(jsonStart, jsonEnd);
							parsedResult = JSON.parse(jsonString);
						} catch (parseError) {
							console.error("Failed to parse JSON response:", parseError);
							parsedResult = { error: "Invalid response format" };
						}
					}

					if (parsedResult.success) {
						successCount++;
					} else {
						errorCount++;
						const errorMessage =
							parsedResult.error ||
							parsedResult.message ||
							"Unknown error occurred";
						console.error(`Student ${i + 1} error:`, errorMessage);
						console.error(`Full result:`, parsedResult);
					}
				} catch (error) {
					errorCount++;
					console.error(`Student ${i + 1} error:`, error);
					console.error(`Full error object:`, error);
				}
			}

			if (successCount > 0) {
				toast.success(`Successfully added ${successCount} student(s)!`);
				if (errorCount > 0) {
					toast.error(`${errorCount} student(s) failed to add.`);
				}
				onSuccess({ success: true, added: successCount, failed: errorCount });
				handleClose();
			} else {
				toast.error("Failed to add any students. Please try again.");
			}
		} catch (error) {
			console.error("Error adding students:", error);
			toast.error("Failed to add students. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		setStudents([
			{
				firstname: "",
				middlename: "",
				lastname: "",
				lrn: "",
				password: "",
				schoolYearId: "",
				strandId: "",
				gradeLevelId: "",
				sectionId: "",
				userLevel: "4",
				sf10File: null,
			},
		]);
		setActiveStudent(0);
		setLoading(false);
		onClose();
	};

	const isStudentComplete = (student) => {
		return (
			student.firstname &&
			student.lastname &&
			student.lrn &&
			student.schoolYearId &&
			student.strandId &&
			student.gradeLevelId &&
			// sectionId optional
			student.sf10File
		);
	};

	const areAllStudentsComplete = () => {
		return (
			students.length > 0 &&
			students.every((student) => isStudentComplete(student))
		);
	};

	if (!isOpen) return null;

	return (
		<div className="flex fixed inset-0 z-50 justify-center items-center bg-black/50 dark:bg-black/70">
			<div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-7xl w-full mx-4 max-h-[90vh] flex overflow-hidden">
				{/* Sticky Left Sidebar */}
				<div className="flex flex-col w-80 bg-gray-50 border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700">
					{/* Header */}
					<div className="p-6 border-b border-gray-200 dark:border-gray-700">
						<div className="flex justify-between items-center">
							<div className="flex items-center space-x-2">
								<UserPlus className="w-6 h-6 text-blue-500" />
								<h2 className="text-xl font-semibold text-gray-900 dark:text-white">
									Add Students
								</h2>
							</div>
							<button
								onClick={handleClose}
								className="text-gray-500 transition-colors dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
							>
								<X className="w-5 h-5" />
							</button>
						</div>
					</div>

					{/* Student Count & Add Button */}
					<div className="p-4 border-b border-gray-200 dark:border-gray-700">
						<div className="flex justify-between items-center mb-4">
							<div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
								<Users className="w-4 h-4" />
								<span>
									{students.length} student{students.length > 1 ? "s" : ""}{" "}
									ready
								</span>
							</div>
						</div>
						<Button
							type="button"
							onClick={addStudent}
							className="flex justify-center items-center space-x-2 w-full bg-blue-600 hover:bg-blue-700"
						>
							<Plus className="w-4 h-4" />
							<span>Add Another Student</span>
						</Button>
					</div>

					{/* Student Navigation List */}
					<div className="overflow-y-auto flex-1 p-4">
						<div className="space-y-2">
							{students.map((student, index) => (
								<div
									key={index}
									onClick={() => scrollToStudent(index)}
									className={`p-3 rounded-lg border cursor-pointer transition-all ${
										activeStudent === index
											? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700"
											: "bg-white border-gray-200 dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
									}`}
								>
									<div className="flex justify-between items-center">
										<div className="flex items-center space-x-2">
											<div
												className={`w-2 h-2 rounded-full ${
													isStudentComplete(student)
														? "bg-green-500"
														: "bg-gray-300 dark:bg-gray-500"
												}`}
											/>
											<span className="font-medium text-gray-900 dark:text-white">
												Student {index + 1}
											</span>
										</div>
										{students.length > 1 && (
											<button
												onClick={(e) => {
													e.stopPropagation();
													removeStudent(index);
												}}
												className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
											>
												<Trash2 className="w-4 h-4" />
											</button>
										)}
									</div>
									<div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
										{student.firstname && student.lastname
											? `${student.firstname} ${student.lastname}`
											: "Incomplete"}
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Submit Button */}
					<div className="p-4 border-t border-gray-200 dark:border-gray-700">
						<Button
							onClick={handleSubmit}
							disabled={loading || !areAllStudentsComplete()}
							className={`flex justify-center items-center space-x-2 w-full ${
								areAllStudentsComplete() && !loading
									? "bg-green-600 hover:bg-green-700"
									: "bg-gray-400 cursor-not-allowed"
							}`}
						>
							{loading ? (
								<>
									<div className="w-4 h-4 rounded-full border-2 border-white animate-spin border-t-transparent"></div>
									<span>Adding Students...</span>
								</>
							) : (
								<>
									<UserPlus className="w-4 h-4" />
									<span>
										{areAllStudentsComplete()
											? `Add ${students.length} Student${
													students.length > 1 ? "s" : ""
											  }`
											: "Complete all students to continue"}
									</span>
								</>
							)}
						</Button>
						{!areAllStudentsComplete() && !loading && (
							<p className="mt-2 text-xs text-center text-red-500">
								Please complete all student information before submitting
							</p>
						)}
					</div>
				</div>

				{/* Main Content Area */}
				<div className="overflow-y-auto flex-1">
					<form onSubmit={handleSubmit} className="p-6">
						{/* Students Forms */}
						{students.map((student, index) => (
							<div
								key={index}
								id={`student-${index}`}
								className={`p-6 mb-8 rounded-lg border-2 transition-all ${
									activeStudent === index
										? "border-blue-300 bg-blue-50/30 dark:border-blue-600 dark:bg-blue-900/10"
										: "border-gray-200 dark:border-gray-700"
								}`}
							>
								{/* Student Header */}
								<div className="flex justify-between items-center mb-6">
									<h3 className="flex items-center space-x-2 text-xl font-semibold text-gray-900 dark:text-white">
										<div
											className={`w-3 h-3 rounded-full ${
												isStudentComplete(student)
													? "bg-green-500"
													: "bg-gray-300 dark:bg-gray-500"
											}`}
										/>
										<span>Student {index + 1}</span>
									</h3>
									<div className="text-sm text-gray-500 dark:text-gray-400">
										{isStudentComplete(student) ? "Complete" : "Incomplete"}
									</div>
								</div>

								<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
									{/* Personal Information */}
									<div className="space-y-4">
										<h4 className="pb-2 text-lg font-medium text-gray-900 border-b dark:text-white">
											Personal Information
										</h4>

										<div>
											<Label htmlFor={`firstname-${index}`}>First Name *</Label>
											<Input
												id={`firstname-${index}`}
												value={student.firstname}
												onChange={(e) =>
													handleInputChange(index, "firstname", e.target.value)
												}
												required
												className="mt-1"
											/>
										</div>

										<div>
											<Label htmlFor={`middlename-${index}`}>Middle Name</Label>
											<Input
												id={`middlename-${index}`}
												value={student.middlename}
												onChange={(e) =>
													handleInputChange(index, "middlename", e.target.value)
												}
												className="mt-1"
											/>
										</div>

										<div>
											<Label htmlFor={`lastname-${index}`}>Last Name *</Label>
											<Input
												id={`lastname-${index}`}
												value={student.lastname}
												onChange={(e) =>
													handleInputChange(index, "lastname", e.target.value)
												}
												required
												className="mt-1"
											/>
										</div>

										<div>
											<Label htmlFor={`lrn-${index}`}>LRN *</Label>
											<Input
												id={`lrn-${index}`}
												value={student.lrn}
												onChange={(e) =>
													handleInputChange(index, "lrn", e.target.value)
												}
												required
												className="mt-1"
											/>
										</div>

										<div>
											<Label htmlFor={`password-${index}`}>
												Password (Auto-set to Last Name) *
											</Label>
											<Input
												id={`password-${index}`}
												type="text"
												value={student.password}
												onChange={(e) =>
													handleInputChange(index, "password", e.target.value)
												}
												required
												className="mt-1 bg-gray-100 dark:bg-gray-700"
												readOnly
											/>
										</div>
									</div>

									{/* Academic Information */}
									<div className="space-y-4">
										<h4 className="pb-2 text-lg font-medium text-gray-900 border-b dark:text-white">
											Academic Information
										</h4>

										<div>
											<Label htmlFor={`gradeLevelId-${index}`}>
												Grade Level *
											</Label>
											<select
												id={`gradeLevelId-${index}`}
												value={student.gradeLevelId}
												onChange={(e) =>
													handleInputChange(
														index,
														"gradeLevelId",
														e.target.value
													)
												}
												required
												className="px-3 py-2 mt-1 w-full text-sm bg-white rounded-md border border-gray-300 dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
											>
												<option value="">Select Grade Level</option>
												{gradeLevels.map((level) => (
													<option key={level.id} value={level.id}>
														{level.name}
													</option>
												))}
											</select>
										</div>

										<div>
											<Label htmlFor={`schoolYearId-${index}`}>
												School Year *
											</Label>
											<select
												id={`schoolYearId-${index}`}
												value={student.schoolYearId}
												onChange={(e) =>
													handleInputChange(
														index,
														"schoolYearId",
														e.target.value
													)
												}
												required
												className="px-3 py-2 mt-1 w-full text-sm bg-white rounded-md border border-gray-300 dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
											>
												<option value="">Select School Year</option>
												{schoolYears.map((year) => (
													<option key={year.id} value={year.id}>
														{year.year}
													</option>
												))}
											</select>
										</div>

										<div>
											<Label htmlFor={`strandId-${index}`}>Strand *</Label>
											<select
												id={`strandId-${index}`}
												value={student.strandId}
												onChange={(e) =>
													handleInputChange(index, "strandId", e.target.value)
												}
												required
												className="px-3 py-2 mt-1 w-full text-sm bg-white rounded-md border border-gray-300 dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
											>
												<option value="">Select Strand</option>
												{strands.map((strand) => (
													<option key={strand.id} value={strand.id}>
														{strand.name} ({strand.trackName})
													</option>
												))}
											</select>
										</div>
										<div>
											<Label htmlFor={`sectionId-${index}`}>
												Section (optional)
											</Label>
											<select
												id={`sectionId-${index}`}
												value={student.sectionId}
												onChange={(e) =>
													handleInputChange(index, "sectionId", e.target.value)
												}
												disabled={!student.gradeLevelId}
												className="px-3 py-2 mt-1 w-full text-sm bg-white rounded-md border border-gray-300 dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
											>
												<option value="">
													{!student.gradeLevelId
														? "Select Grade Level first"
														: sections.filter(
																(s) =>
																	String(s.gradeLevelId) ===
																	String(student.gradeLevelId)
														  ).length === 0
														? "No sections for selected grade level"
														: "Select Section"}
												</option>
												{student.gradeLevelId &&
													sections
														.filter(
															(s) =>
																String(s.gradeLevelId) ===
																String(student.gradeLevelId)
														)
														.map((section) => (
															<option key={section.id} value={section.id}>
																{section.name}
															</option>
														))}
											</select>
										</div>
									</div>
								</div>

								{/* SF10 Document Upload */}
								<div className="mt-6 space-y-4">
									<h4 className="pb-2 text-lg font-medium text-gray-900 border-b dark:text-white">
										SF10 Document Upload *
									</h4>

									<div className="p-6 rounded-lg border-2 border-gray-300 border-dashed dark:border-gray-600">
										<div className="text-center">
											<FileText className="mx-auto mb-4 w-12 h-12 text-gray-400" />
											<div className="mb-4">
												<Label
													htmlFor={`sf10-file-${index}`}
													className="cursor-pointer"
												>
													<div className="flex justify-center items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
														<Upload className="w-5 h-5" />
														<span>Upload SF10 Document (PDF)</span>
													</div>
												</Label>
												<input
													id={`sf10-file-${index}`}
													type="file"
													accept=".pdf"
													onChange={(e) =>
														handleFileSelect(index, e.target.files[0])
													}
													className="hidden"
												/>
											</div>

											{student.sf10File ? (
												<div className="text-sm text-green-600 dark:text-green-400">
													✓ {student.sf10File.name} selected
												</div>
											) : (
												<div className="text-sm text-gray-500 dark:text-gray-400">
													Only PDF files are allowed. Maximum size: 10MB
												</div>
											)}
										</div>
									</div>
								</div>
							</div>
						))}
					</form>
				</div>
			</div>
		</div>
	);
}
