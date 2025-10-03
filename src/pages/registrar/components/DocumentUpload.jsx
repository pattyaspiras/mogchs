import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
	Upload,
	FileText,
	X,
	CheckCircle,
	AlertCircle,
	Loader,
} from "lucide-react";
import toast from "react-hot-toast";
import { getDocuments, uploadStudentDocuments } from "../../../utils/registrar";
import { getStudent } from "../../../utils/teacher";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

export default function DocumentUpload({ isOpen, onClose, onSuccess }) {
	const [selectedFiles, setSelectedFiles] = useState([]);
	const [uploading, setUploading] = useState(false);
	const [selectedDocumentType, setSelectedDocumentType] = useState("");
	const [documentTypes, setDocumentTypes] = useState([]);
	const [students, setStudents] = useState([]);
	const [fileMatches, setFileMatches] = useState([]); // [{file, match: student or null, text}]
	const [uploadResults, setUploadResults] = useState(null);

	// Fetch document types and students on open
	useEffect(() => {
		if (isOpen) {
			getDocuments()
				.then((data) => {
					let docs = data;
					if (typeof docs === "string") {
						try {
							docs = JSON.parse(docs);
						} catch {
							docs = [];
						}
					}
					setDocumentTypes(Array.isArray(docs) ? docs : []);
				})
				.catch(() => setDocumentTypes([]));

			getStudent()
				.then((data) => {
					let arr = data;
					if (typeof arr === "string") {
						try {
							arr = JSON.parse(arr);
						} catch {
							arr = [];
						}
					}
					setStudents(Array.isArray(arr) ? arr : []);
				})
				.catch(() => setStudents([]));
		}
	}, [isOpen]);

	if (!isOpen) return null;

	// Try to match a student by name or LRN
	function normalize(str) {
		return (str || "")
			.toLowerCase()
			.replace(/[^a-z0-9]/g, " ") // remove punctuation
			.replace(/\s+/g, " ") // collapse whitespace
			.trim();
	}

	function fuzzyIncludes(haystack, needle) {
		// e.g., needle = 'patty' => /p\s*a\s*t\s*t\s*y/i
		const pattern = needle.split("").join("\\s*");
		const regex = new RegExp(pattern, "i");
		return regex.test(haystack);
	}

	function matchStudent(text) {
		const normText = normalize(text);
		for (const student of students) {
			const first = normalize(student.firstname);
			const last = normalize(student.lastname);
			const lrn = (student.lrn || "").toLowerCase();

			// Fuzzy match: both first and last name present, even with spaces
			if (
				first &&
				last &&
				fuzzyIncludes(normText, first) &&
				fuzzyIncludes(normText, last)
			) {
				return student;
			}
			if (lrn && normText.includes(lrn)) return student;
		}
		// Debug log
		console.log("No match for:", { normText, students });
		return null;
	}

	// PDF text extraction
	async function extractTextFromPDF(file) {
		const arrayBuffer = await file.arrayBuffer();
		const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
		let text = "";
		for (let i = 1; i <= pdf.numPages; i++) {
			const page = await pdf.getPage(i);
			const content = await page.getTextContent();
			text += content.items.map((item) => item.str).join(" ") + " ";
		}
		console.log("Extracted PDF text:", text); // Debug log
		return text;
	}

	const handleFileSelect = async (event) => {
		const files = Array.from(event.target.files);
		const pdfFiles = files.filter((file) => file.type === "application/pdf");

		if (pdfFiles.length !== files.length) {
			toast.error("Only PDF files are allowed");
			return;
		}
		if (pdfFiles.length > 10) {
			toast.error("Maximum 10 files allowed per upload");
			return;
		}

		// Extract text and match for each file
		const matches = [];
		for (const file of pdfFiles) {
			let text = "";
			let match = null;
			try {
				text = await extractTextFromPDF(file);
				match = matchStudent(text);
			} catch (e) {
				text = "(Could not extract text)";
			}
			matches.push({ file, match, text });
		}
		setFileMatches(matches);
		setSelectedFiles(pdfFiles);
	};

	const removeFile = (index) => {
		setSelectedFiles((files) => files.filter((_, i) => i !== index));
		setFileMatches((matches) => matches.filter((_, i) => i !== index));
	};

	const handleUpload = async () => {
		if (selectedFiles.length === 0) {
			toast.error("Please select at least one PDF file");
			return;
		}
		if (!selectedDocumentType) {
			toast.error("Please select a document type");
			return;
		}
		// Only upload files with a match
		const filesToUpload = fileMatches.filter((f) => f.match);
		if (filesToUpload.length === 0) {
			toast.error("No files matched to any student");
			return;
		}
		setUploading(true);
		setUploadResults(null);
		try {
			const formData = new FormData();
			formData.append("operation", "uploadStudentDocuments");
			formData.append("documentType", selectedDocumentType);
			filesToUpload.forEach(({ file, match }) => {
				formData.append(`documents[]`, file);
				formData.append(`studentIds[]`, match.id);
			});
			const result = await uploadStudentDocuments(formData);
			if (result.success) {
				setUploadResults(result);
				toast.success(
					`Successfully processed ${result.totalProcessed} documents`
				);
				if (onSuccess) onSuccess();
			} else {
				toast.error(result.message || "Upload failed");
				setUploadResults(result);
			}
		} catch (error) {
			console.error("Upload error:", error);
			toast.error("Failed to upload documents");
		} finally {
			setUploading(false);
		}
	};

	const formatFileSize = (bytes) => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	};

	const handleClose = () => {
		setSelectedFiles([]);
		setFileMatches([]);
		setSelectedDocumentType("");
		setUploadResults(null);
		onClose();
	};

	return (
		<div className="flex fixed inset-0 z-50 justify-center items-center bg-black/50">
			<div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
				<div className="flex justify-between items-center p-6 border-b">
					<h2 className="text-xl font-semibold text-slate-900">
						Upload Student Documents
					</h2>
					<button
						onClick={handleClose}
						className="p-2 rounded-full hover:bg-slate-100"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				<div className="p-6 space-y-6">
					{/* Document Type Selection */}
					<div>
						<label className="block mb-2 text-sm font-medium text-slate-700">
							Document Type *
						</label>
						<select
							value={selectedDocumentType}
							onChange={(e) => setSelectedDocumentType(e.target.value)}
							className="px-3 py-2 w-full bg-white rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							disabled={uploading}
						>
							<option value="">Select document type</option>
							{documentTypes.map((type) => (
								<option key={type.id} value={type.id}>
									{type.name}
								</option>
							))}
						</select>
					</div>

					{/* File Upload Area */}
					<div>
						<label className="block mb-2 text-sm font-medium text-slate-700">
							PDF Documents *
						</label>
						<div className="p-6 text-center rounded-lg border-2 border-dashed transition-colors border-slate-300 hover:border-slate-400">
							<input
								type="file"
								multiple
								accept=".pdf"
								onChange={handleFileSelect}
								className="hidden"
								id="file-upload"
								disabled={uploading}
							/>
							<label
								htmlFor="file-upload"
								className="flex flex-col items-center space-y-2 cursor-pointer"
							>
								<Upload className="w-8 h-8 text-slate-400" />
								<span className="text-sm text-slate-600">
									Click to select PDF files or drag and drop
								</span>
								<span className="text-xs text-slate-500">
									Maximum 10 files, PDF format only
								</span>
							</label>
						</div>
					</div>

					{/* Selected Files and Matches */}
					{fileMatches.length > 0 && (
						<div>
							<h3 className="mb-3 text-sm font-medium text-slate-700">
								Selected Files & Matches ({fileMatches.length})
							</h3>
							<div className="overflow-y-auto space-y-2 max-h-40">
								{fileMatches.map((fm, index) => (
									<div
										key={index}
										className="flex justify-between items-center p-3 rounded-lg bg-slate-50"
									>
										<div className="flex items-center space-x-3">
											<FileText className="w-5 h-5 text-red-500" />
											<div>
												<p className="text-sm font-medium text-slate-900">
													{fm.file.name}
												</p>
												<p className="text-xs text-slate-500">
													{formatFileSize(fm.file.size)}
												</p>
												{fm.match ? (
													<span className="px-2 py-1 ml-2 text-xs text-green-700 bg-green-100 rounded">
														Matched: {fm.match.firstname} {fm.match.lastname}
													</span>
												) : (
													<span className="px-2 py-1 ml-2 text-xs text-yellow-700 bg-yellow-100 rounded">
														No match found
													</span>
												)}
											</div>
										</div>
										{!uploading && (
											<button
												onClick={() => removeFile(index)}
												className="p-1 rounded-full hover:bg-slate-200"
											>
												<X className="w-4 h-4 text-slate-500" />
											</button>
										)}
									</div>
								))}
							</div>
						</div>
					)}

					{/* Upload Results */}
					{uploadResults && (
						<Card>
							<CardContent className="p-4">
								<h3 className="mb-3 text-sm font-medium text-slate-700">
									Upload Results
								</h3>
								<div className="space-y-2">
									<div className="flex items-center space-x-2">
										<CheckCircle className="w-4 h-4 text-green-500" />
										<span className="text-sm text-slate-600">
											Total processed: {uploadResults.totalProcessed || 0}
										</span>
									</div>
									<div className="flex items-center space-x-2">
										<CheckCircle className="w-4 h-4 text-green-500" />
										<span className="text-sm text-slate-600">
											Successfully assigned:{" "}
											{uploadResults.successfulAssignments || 0}
										</span>
									</div>
									{uploadResults.failedAssignments > 0 && (
										<div className="flex items-center space-x-2">
											<AlertCircle className="w-4 h-4 text-yellow-500" />
											<span className="text-sm text-slate-600">
												Could not assign: {uploadResults.failedAssignments}
											</span>
										</div>
									)}
								</div>

								{/* Detailed Results */}
								{uploadResults.details && uploadResults.details.length > 0 && (
									<div className="mt-4">
										<h4 className="mb-2 text-xs font-medium text-slate-700">
											Assignment Details:
										</h4>
										<div className="overflow-y-auto space-y-1 max-h-32">
											{uploadResults.details.map((detail, index) => (
												<div
													key={index}
													className={`text-xs p-2 rounded ${
														detail.success
															? "bg-green-50 text-green-700"
															: "bg-yellow-50 text-yellow-700"
													}`}
												>
													<strong>{detail.fileName}:</strong>{" "}
													{detail.success
														? `Assigned to ${detail.studentName}`
														: detail.reason ||
														  "Could not find matching student"}
												</div>
											))}
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					)}

					{/* Information */}
					<div className="p-4 bg-blue-50 rounded-lg">
						<h3 className="mb-2 text-sm font-medium text-blue-900">
							How it works:
						</h3>
						<ul className="space-y-1 text-xs text-blue-800">
							<li>• Upload PDF documents containing student information</li>
							<li>• The system will extract text from each PDF</li>
							<li>
								• Student names will be automatically detected and matched
							</li>
							<li>
								• Documents will be assigned to the corresponding students
							</li>
							<li>• Unmatched documents will be reported for manual review</li>
						</ul>
					</div>
				</div>

				{/* Actions */}
				<div className="flex justify-end items-center p-6 space-x-3 border-t bg-slate-50">
					<Button variant="outline" onClick={handleClose} disabled={uploading}>
						{uploadResults ? "Close" : "Cancel"}
					</Button>
					{!uploadResults && (
						<Button
							onClick={handleUpload}
							disabled={
								uploading || fileMatches.length === 0 || !selectedDocumentType
							}
							className="flex items-center space-x-2"
						>
							{uploading ? (
								<>
									<Loader className="w-4 h-4 animate-spin" />
									<span>Processing...</span>
								</>
							) : (
								<>
									<Upload className="w-4 h-4" />
									<span>Upload & Process</span>
								</>
							)}
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
