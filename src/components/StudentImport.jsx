import React, { useState, useEffect } from "react";
import {
	Upload,
	FileSpreadsheet,
	X,
	Save,
	Trash2,
	Edit3,
	Users,
	Calendar,
} from "lucide-react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import axios from "axios";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import { getDecryptedApiUrl } from "../utils/apiConfig";
import { getSection, getSchoolYear, getStrands } from "../utils/registrar";
import { getGradeLevel as getAdminGradeLevel } from "../utils/admin";

const StudentImport = ({
	onClose,
	onImportComplete,
	teacherSectionId,
	teacherGradeLevelId,
}) => {
	const [file, setFile] = useState(null);
	const [previewData, setPreviewData] = useState([]);
	const [headers, setHeaders] = useState([]);
	const [isParsing, setIsParsing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [saveResult, setSaveResult] = useState(null);
	const [dragActive, setDragActive] = useState(false);
	const [editingCell, setEditingCell] = useState(null); // { rowIndex, colIndex }
	const [sections, setSections] = useState([]);
	const [selectedSection, setSelectedSection] = useState("");
	const [loadingSections, setLoadingSections] = useState(false);
	const [schoolYears, setSchoolYears] = useState([]);
	const [selectedSchoolYear, setSelectedSchoolYear] = useState("");
	const [loadingSchoolYears, setLoadingSchoolYears] = useState(false);
	const [strands, setStrands] = useState([]);
	const [selectedStrand, setSelectedStrand] = useState("");
	const [loadingStrands, setLoadingStrands] = useState(false);
	const [gradeLevels, setGradeLevels] = useState([]);
	const [selectedGradeLevel, setSelectedGradeLevel] = useState("");
	const [loadingGrades, setLoadingGrades] = useState(false);

	// Constants for authentication
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

	// Load sections when component mounts
	useEffect(() => {
		loadSections();
		loadSchoolYears();
		loadStrands();
		loadGradeLevels();
	}, []);

	// Auto-select teacher's section, grade level, and strand if provided
	useEffect(() => {
		if (teacherSectionId) {
			setSelectedSection(teacherSectionId);
		}
	}, [teacherSectionId]);

	useEffect(() => {
		if (teacherGradeLevelId) {
			setSelectedGradeLevel(teacherGradeLevelId);
		}
	}, [teacherGradeLevelId]);

	const loadSections = async () => {
		setLoadingSections(true);
		try {
			const sectionsData = await getSection();
			setSections(sectionsData);
		} catch (error) {
			console.error("Failed to load sections:", error);
			toast.error("Failed to load sections");
		} finally {
			setLoadingSections(false);
		}
	};

	const loadSchoolYears = async () => {
		setLoadingSchoolYears(true);
		try {
			const schoolYearsData = await getSchoolYear();
			setSchoolYears(schoolYearsData);
		} catch (error) {
			console.error("Failed to load school years:", error);
			toast.error("Failed to load school years");
		} finally {
			setLoadingSchoolYears(false);
		}
	};

	const loadStrands = async () => {
		setLoadingStrands(true);
		try {
			const strandsData = await getStrands();
			setStrands(strandsData);
		} catch (error) {
			toast.error("Failed to load strands");
		} finally {
			setLoadingStrands(false);
		}
	};

	const loadGradeLevels = async () => {
		setLoadingGrades(true);
		try {
			const data = await getAdminGradeLevel();
			setGradeLevels(Array.isArray(data) ? data : []);
		} catch (error) {
			toast.error("Failed to load grade levels");
		} finally {
			setLoadingGrades(false);
		}
	};

	const handleDrag = (e) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActive(true);
		} else if (e.type === "dragleave") {
			setDragActive(false);
		}
	};

	const handleDrop = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);

		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			const droppedFile = e.dataTransfer.files[0];
			if (validateFile(droppedFile)) {
				setFile(droppedFile);
				parseFile(droppedFile);
			}
		}
	};

	const handleFileSelect = (e) => {
		if (e.target.files && e.target.files[0]) {
			const selectedFile = e.target.files[0];
			if (validateFile(selectedFile)) {
				setFile(selectedFile);
				parseFile(selectedFile);
			}
		}
	};

	const validateFile = (file) => {
		const allowedTypes = [
			"text/csv",
			"application/csv",
			"text/plain",
			"application/vnd.ms-excel",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		];
		const fileExtension = file.name.split(".").pop().toLowerCase();
		const allowedExtensions = ["csv", "xls", "xlsx"];
		if (
			!allowedTypes.includes(file.type) &&
			!allowedExtensions.includes(fileExtension)
		) {
			toast.error(
				"Please select a valid CSV or Excel file (.csv, .xls, .xlsx)"
			);
			return false;
		}
		if (file.size > 10 * 1024 * 1024) {
			toast.error("File size should be less than 10MB");
			return false;
		}
		return true;
	};

	const parseFile = (file) => {
		setIsParsing(true);
		const reader = new FileReader();
		reader.onload = (e) => {
			let data = new Uint8Array(e.target.result);
			let workbook = XLSX.read(data, { type: "array" });
			const firstSheetName = workbook.SheetNames[0];
			const worksheet = workbook.Sheets[firstSheetName];
			const allRows = XLSX.utils.sheet_to_json(worksheet, {
				header: 1,
				raw: false,
			});

			// Find the header row (row with LRN and NAME)
			let headerRowIndex = allRows.findIndex(
				(row) =>
					row &&
					row.some(
						(cell) =>
							typeof cell === "string" &&
							(cell.trim().toUpperCase() === "LRN" ||
								cell.trim().toUpperCase().includes("LRN"))
					)
			);
			if (headerRowIndex === -1) {
				toast.error("Could not find header row with 'LRN'.");
				setIsParsing(false);
				return;
			}
			const header = allRows[headerRowIndex];
			const dataRows = allRows
				.slice(headerRowIndex + 1)
				.filter(
					(row) =>
						row &&
						row.length > 0 &&
						row.some((cell) => cell && cell.toString().trim() !== "")
				);

			// Clean up LRN values by removing trailing dots
			const cleanedDataRows = dataRows.map((row) => {
				const cleanedRow = [...row];
				// Find LRN column index
				const lrnColumnIndex = header.findIndex(
					(h) => h && h.toString().toUpperCase().includes("LRN")
				);

				if (lrnColumnIndex !== -1 && cleanedRow[lrnColumnIndex]) {
					// Remove trailing dots from LRN
					cleanedRow[lrnColumnIndex] = cleanedRow[lrnColumnIndex]
						.toString()
						.replace(/\.+$/, "");
				}

				return cleanedRow;
			});

			setHeaders(header);
			setPreviewData(cleanedDataRows);
			setIsParsing(false);
		};
		reader.readAsArrayBuffer(file);
	};

	const handleSave = async () => {
		if (!previewData.length) {
			toast.error("No data to save.");
			return;
		}
		if (!selectedSection) {
			toast.error("Please select a section for the students.");
			return;
		}
		if (!selectedSchoolYear) {
			toast.error("Please select a school year for the students.");
			return;
		}
		if (!selectedStrand) {
			toast.error("Please select a strand for the students.");
			return;
		}
		if (!selectedGradeLevel) {
			toast.error("Please select a grade level for the students.");
			return;
		}
		setIsSaving(true);
		setSaveResult(null);
		const apiUrl = getDecryptedApiUrl();
		try {
			const response = await axios.post(`${apiUrl}/import_students.php`, {
				operation: "savePreviewedStudents",
				data: previewData,
				headers,
				sectionId: selectedSection,
				schoolYearId: selectedSchoolYear,
				userId: userId,
				strandId: selectedStrand,
				gradeLevelId: selectedGradeLevel,
			});
			setSaveResult(response.data);
			if (response.data.success) {
				toast.success(
					`Successfully imported ${response.data.imported} students${
						response.data.schoolYear
							? ` for School Year ${response.data.schoolYear}`
							: ""
					}`
				);
				if (onImportComplete) onImportComplete(response.data);
			} else {
				toast.error(response.data.error || "Save failed");
			}
		} catch (error) {
			console.error("Save error:", error);
			toast.error("Save failed. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	const resetForm = () => {
		setFile(null);
		setPreviewData([]);
		setHeaders([]);
		setIsParsing(false);
		setIsSaving(false);
		setSaveResult(null);
		setSelectedSection("");
		setSelectedSchoolYear("");
		setSelectedStrand("");
	};

	const removeRow = (rowIndex) => {
		const updatedData = previewData.filter((_, index) => index !== rowIndex);
		setPreviewData(updatedData);
	};

	const updateCellValue = (rowIndex, colIndex, newValue) => {
		const updatedData = [...previewData];
		if (!updatedData[rowIndex]) {
			updatedData[rowIndex] = [];
		}
		updatedData[rowIndex][colIndex] = newValue;
		setPreviewData(updatedData);
	};

	const startEditing = (rowIndex, colIndex) => {
		setEditingCell({ rowIndex, colIndex });
	};

	const stopEditing = () => {
		setEditingCell(null);
	};

	const handleCellKeyPress = (e, rowIndex, colIndex) => {
		if (e.key === "Enter") {
			updateCellValue(rowIndex, colIndex, e.target.value);
			stopEditing();
		} else if (e.key === "Escape") {
			stopEditing();
		}
	};

	return (
		<div className="flex fixed inset-0 z-50 justify-center items-center bg-black/50 dark:bg-black/70">
			<div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
					<div className="flex items-center space-x-2">
						<FileSpreadsheet className="w-6 h-6 text-green-500" />
						<h2 className="text-xl font-semibold text-gray-900 dark:text-white">
							Import Students from CSV/Excel
						</h2>
					</div>
					<button
						onClick={onClose}
						className="text-gray-500 transition-colors dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
					>
						<X className="w-6 h-6" />
					</button>
				</div>

				<div className="p-6">
					{!file ? (
						<>
							{/* Instructions */}
							<div className="p-4 mb-6 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/30">
								<h3 className="mb-2 font-medium text-blue-800 dark:text-blue-200">
									File Requirements:
								</h3>
								<ul className="space-y-1 text-sm text-blue-700 dark:text-blue-100">
									<li>
										• <strong>CSV format (.csv) is recommended</strong> for best
										compatibility
									</li>
									<li>
										• Excel formats (.xls, .xlsx) are supported but may require
										additional server components
									</li>
									<li>
										• Required columns: LRN, Name, Birth Date, Age, Religion,
										Address
									</li>
									<li>
										• <strong>School Year and Section</strong> will be selected
										via dropdown after file upload
									</li>
									<li>
										• Names should be in "LAST NAME, FIRST NAME MIDDLE NAME"
										format
									</li>
									<li>• Dates should be in MM/DD/YYYY format</li>
									<li>• File size should be less than 10MB</li>
								</ul>
							</div>

							{/* File Upload Area */}
							<div
								className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
									dragActive
										? "bg-green-50 border-green-500 dark:bg-green-900/20"
										: file
										? "bg-green-50 border-green-600 dark:bg-green-900/20"
										: "bg-gray-50 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 dark:bg-gray-800/50"
								}`}
								onDragEnter={handleDrag}
								onDragLeave={handleDrag}
								onDragOver={handleDrag}
								onDrop={handleDrop}
							>
								<input
									type="file"
									id="file-input"
									accept=".csv,.xls,.xlsx"
									onChange={handleFileSelect}
									className="hidden"
								/>

								<div className="space-y-4">
									<Upload className="mx-auto w-12 h-12 text-gray-400" />
									<div>
										<p className="text-lg font-medium text-gray-900 dark:text-white">
											Drop your CSV or Excel file here, or{" "}
											<label
												htmlFor="file-input"
												className="text-green-600 cursor-pointer dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
											>
												browse
											</label>
										</p>
										<p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
											Supports .csv, .xls, and .xlsx files up to 10MB
										</p>
									</div>
								</div>
							</div>
						</>
					) : (
						<>
							{/* Section Selection */}
							<div className="mb-4">
								<div className="flex items-center mb-2 space-x-2">
									<Users className="w-5 h-5 text-blue-500 dark:text-blue-400" />
									<label className="font-medium text-gray-900 dark:text-white">
										{teacherSectionId
											? "Section (Auto-selected):"
											: "Select Section for All Students:"}
									</label>
								</div>
								<select
									value={selectedSection}
									onChange={(e) => setSelectedSection(e.target.value)}
									className="px-3 py-2 w-full text-gray-900 bg-white rounded-md border border-gray-300 dark:text-white dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									disabled={loadingSections || !!teacherSectionId}
								>
									<option value="">
										{loadingSections
											? "Loading sections..."
											: teacherSectionId
											? "Section automatically selected"
											: "Select a section"}
									</option>
									{sections.map((section) => (
										<option key={section.id} value={section.id}>
											{section.name}
										</option>
									))}
								</select>
								<p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
									{teacherSectionId
										? "Section is automatically selected based on your teacher account."
										: "All imported students will be assigned to the selected section."}
								</p>
							</div>

							{/* School Year Selection */}
							<div className="mb-4">
								<div className="flex items-center mb-2 space-x-2">
									<Calendar className="w-5 h-5 text-blue-500 dark:text-blue-400" />
									<label className="font-medium text-gray-900 dark:text-white">
										Select School Year for All Students:
									</label>
								</div>
								<select
									value={selectedSchoolYear}
									onChange={(e) => setSelectedSchoolYear(e.target.value)}
									className="px-3 py-2 w-full text-gray-900 bg-white rounded-md border border-gray-300 dark:text-white dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									disabled={loadingSchoolYears}
								>
									<option value="">
										{loadingSchoolYears
											? "Loading school years..."
											: "Select a school year"}
									</option>
									{schoolYears.map((schoolYear) => (
										<option key={schoolYear.id} value={schoolYear.id}>
											{schoolYear.year}
										</option>
									))}
								</select>
								<p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
									All imported students will be assigned to the selected school
									year.
								</p>
							</div>

							{/* Strand Selection */}
							<div className="mb-4">
								<div className="flex items-center mb-2 space-x-2">
									<Users className="w-5 h-5 text-blue-500 dark:text-blue-400" />
									<label className="font-medium text-gray-900 dark:text-white">
										Select Strand for All Students:
									</label>
								</div>
								<select
									value={selectedStrand}
									onChange={(e) => setSelectedStrand(e.target.value)}
									className="px-3 py-2 w-full text-gray-900 bg-white rounded-md border border-gray-300 dark:text-white dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									disabled={loadingStrands}
								>
									<option value="">
										{loadingStrands ? "Loading strands..." : "Select a strand"}
									</option>
									{strands.map((strand) => (
										<option key={strand.id} value={strand.id}>
											{strand.name} ({strand.trackName})
										</option>
									))}
								</select>
							</div>

							{/* Grade Level Selection */}
							<div className="mb-4">
								<div className="flex items-center mb-2 space-x-2">
									<Users className="w-5 h-5 text-blue-500 dark:text-blue-400" />
									<label className="font-medium text-gray-900 dark:text-white">
										{teacherGradeLevelId
											? "Grade Level (Auto-selected):"
											: "Select Grade Level for All Students:"}
									</label>
								</div>
								<select
									value={selectedGradeLevel}
									onChange={(e) => setSelectedGradeLevel(e.target.value)}
									className="px-3 py-2 w-full text-gray-900 bg-white rounded-md border border-gray-300 dark:text-white dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									disabled={loadingGrades || !!teacherGradeLevelId}
								>
									<option value="">
										{loadingGrades
											? "Loading grade levels..."
											: teacherGradeLevelId
											? "Grade level automatically selected"
											: "Select a grade level"}
									</option>
									{gradeLevels.map((gl) => (
										<option key={gl.id} value={gl.id}>
											{gl.name}
										</option>
									))}
								</select>
								<p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
									{teacherGradeLevelId
										? "Grade level is automatically selected based on your teacher account."
										: "All imported students will be assigned to the selected grade level."}
								</p>
							</div>

							{/* Preview Table */}
							<div className="mb-4">
								<div className="flex justify-between items-center mb-2">
									<h3 className="font-medium text-green-600 dark:text-green-300">
										Preview Data ({previewData.length} rows)
									</h3>
									<div className="text-sm text-gray-600 dark:text-gray-400">
										Click on cells to edit • Click trash icon to remove rows
									</div>
								</div>

								{isParsing ? (
									<div className="text-center text-gray-600 dark:text-gray-400">
										Parsing file...
									</div>
								) : (
									<div className="overflow-x-auto max-h-[50vh] border border-gray-300 dark:border-gray-700 rounded-lg">
										<table className="min-w-full text-xs text-gray-700 dark:text-gray-200 lg:text-sm">
											<thead>
												<tr>
													<th className="px-3 py-2 w-16 font-semibold text-left bg-gray-100 dark:bg-gray-800">
														Actions
													</th>
													{headers.map((header, idx) => (
														<th
															key={idx}
															className="px-3 py-2 font-semibold text-left bg-gray-100 dark:bg-gray-800"
														>
															{header}
														</th>
													))}
												</tr>
											</thead>
											<tbody>
												{previewData.map((row, rIdx) => (
													<tr
														key={rIdx}
														className={
															rIdx % 2 === 0
																? "bg-white dark:bg-gray-900"
																: "bg-gray-50 dark:bg-gray-800"
														}
													>
														<td className="px-3 py-2">
															<button
																onClick={() => removeRow(rIdx)}
																className="p-1 text-red-500 rounded transition-colors dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/20"
																title="Remove this row"
															>
																<Trash2 className="w-4 h-4" />
															</button>
														</td>
														{headers.map((_, cIdx) => (
															<td
																key={cIdx}
																className="relative px-3 py-2 group"
															>
																{editingCell?.rowIndex === rIdx &&
																editingCell?.colIndex === cIdx ? (
																	<input
																		type="text"
																		defaultValue={row[cIdx] || ""}
																		onBlur={(e) => {
																			updateCellValue(
																				rIdx,
																				cIdx,
																				e.target.value
																			);
																			stopEditing();
																		}}
																		onKeyPress={(e) =>
																			handleCellKeyPress(e, rIdx, cIdx)
																		}
																		className="px-2 py-1 w-full text-sm text-gray-900 bg-white rounded border border-blue-500 dark:text-white dark:bg-gray-800 focus:outline-none focus:border-blue-400"
																		autoFocus
																	/>
																) : (
																	<div
																		onClick={() => startEditing(rIdx, cIdx)}
																		className="min-h-[24px] cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded px-1 py-1 flex items-center group"
																		title="Click to edit"
																	>
																		<span className="overflow-hidden flex-1 whitespace-nowrap text-ellipsis">
																			{row[cIdx] || ""}
																		</span>
																		<Edit3 className="ml-1 w-3 h-3 text-gray-500 opacity-0 transition-opacity dark:text-gray-500 group-hover:opacity-100" />
																	</div>
																)}
															</td>
														))}
													</tr>
												))}
											</tbody>
										</table>
									</div>
								)}
								{previewData.length === 0 && !isParsing && (
									<div className="py-8 text-center text-gray-600 dark:text-gray-400">
										No data to preview. All rows may have been removed.
									</div>
								)}
							</div>

							{/* Save Button */}
							<div className="flex justify-end mt-6 space-x-3">
								<button
									onClick={resetForm}
									className="px-4 py-2 text-gray-700 rounded-md border border-gray-300 transition-colors dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
								>
									Cancel
								</button>
								<button
									onClick={handleSave}
									disabled={
										isSaving ||
										isParsing ||
										!previewData.length ||
										!selectedSection ||
										!selectedSchoolYear ||
										!selectedStrand ||
										!selectedGradeLevel
									}
									className="flex items-center px-6 py-2 space-x-2 text-white bg-green-600 rounded-md transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{isSaving ? (
										<>
											<div className="w-4 h-4 rounded-full border-b-2 border-white animate-spin"></div>
											<span>Saving...</span>
										</>
									) : (
										<>
											<Save className="w-4 h-4" />
											<span>
												{!selectedSection ||
												!selectedSchoolYear ||
												!selectedStrand ||
												!selectedGradeLevel
													? "Select Required Fields to Save"
													: "Save to Database"}
											</span>
										</>
									)}
								</button>
							</div>

							{/* Save Result */}
							{saveResult && (
								<div className="mt-6">
									{saveResult.success ? (
										<div className="font-semibold text-green-600 dark:text-green-400">
											{saveResult.message}
										</div>
									) : (
										<div className="font-semibold text-red-600 dark:text-red-400">
											{saveResult.error}
										</div>
									)}
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default StudentImport;
