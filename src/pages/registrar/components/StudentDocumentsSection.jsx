import React, { useState } from "react";
import { FileText, GraduationCap } from "lucide-react";
import { getDecryptedApiUrl } from "../../../utils/apiConfig";
import ExcelPrintModal from "./ExcelPrintModal";

const StudentDocumentsSection = ({ studentDocuments, request }) => {
	const apiUrl = getDecryptedApiUrl();
	const [showExcelModal, setShowExcelModal] = useState(false);
	const [selectedExcelFile, setSelectedExcelFile] = useState(null);

	// Function to check if file is Excel
	const isExcelFile = (filename) => {
		const excelExtensions = ["xlsx", "xls"];
		const extension = filename.split(".").pop().toLowerCase();
		return excelExtensions.includes(extension);
	};

	// Function to handle printing based on file type
	const handlePrint = (document) => {
		if (isExcelFile(document.fileName)) {
			// For Excel files, open the Excel print modal
			setSelectedExcelFile(document.fileName);
			setShowExcelModal(true);
		} else {
			// For other file types, use the existing print method
			const printWindow = window.open(
				`${apiUrl}/documents/${document.fileName}`,
				"_blank"
			);
			if (printWindow) {
				printWindow.onload = () => {
					printWindow.print();
				};
			}
		}
	};

	const closeExcelModal = () => {
		setShowExcelModal(false);
		setSelectedExcelFile(null);
	};

	// Function to get grade level display text
	const getGradeLevelDisplay = (document) => {
		if (document.gradeLevelName) {
			return document.gradeLevelName;
		}
		if (document.gradeLevelId) {
			return `Grade ${document.gradeLevelId}`;
		}
		return "Unknown Grade";
	};

	// Function to get grade level badge styling
	const getGradeLevelBadgeStyle = (document) => {
		if (document.gradeLevelId === 1) {
			return "bg-blue-100 text-blue-800 border-blue-200";
		} else if (document.gradeLevelId === 2) {
			return "bg-green-100 text-green-800 border-green-200";
		}
		return "bg-gray-100 text-gray-800 border-gray-200";
	};

	if (studentDocuments.length > 0) {
		return (
			<>
				<div className="p-4 rounded-lg bg-slate-50">
					<div className="flex gap-3 items-center mb-4">
						<FileText className="w-5 h-5 text-green-600" />
						<span className="text-sm font-medium text-slate-600">
							Student {request.document} Documents ({studentDocuments.length})
						</span>
					</div>
					<div className="px-1 mb-3 text-xs text-slate-500">
						Showing documents that match the requested document type:{" "}
						<span className="font-medium text-slate-700">
							{request.document}
						</span>
					</div>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						{studentDocuments.map((document, index) => (
							<div
								key={index}
								className="overflow-hidden bg-white rounded-lg border shadow-sm border-slate-200"
							>
								{/* Document Type Header with Grade Level */}
								<div className="px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-slate-200">
									<div className="flex justify-between items-center">
										<p className="text-xs font-semibold tracking-wide text-green-800 uppercase">
											{document.documentType || "Document"}
										</p>
										{/* Grade Level Badge */}
										<div
											className={`flex gap-1 items-center px-2 py-1 text-xs font-medium rounded-full border ${getGradeLevelBadgeStyle( document )}`}
										>
											<GraduationCap className="w-3 h-3" />
											{getGradeLevelDisplay(document)}
										</div>
									</div>
								</div>

								<div className="flex gap-3 items-center p-4">
									<FileText className="flex-shrink-0 w-8 h-8 text-green-500" />
									<div className="flex-1 min-w-0">
										<p className="mb-1 text-sm font-medium truncate text-slate-700">
											{document.fileName}
										</p>
										<p className="mb-2 text-xs text-slate-500">
											Added: {new Date(document.createdAt).toLocaleDateString()}
										</p>
										{/* Grade Level Info */}
										<p className="mb-2 text-xs text-slate-600">
											📚 {getGradeLevelDisplay(document)}
										</p>
										<div className="flex gap-2">
											<a
												href={`${apiUrl}/documents/${document.fileName}`}
												target="_blank"
												rel="noopener noreferrer"
												className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded border border-blue-200 transition-colors hover:bg-blue-100"
												onClick={(e) => {
													// Check if file exists by attempting to access it
													const link = e.target.closest("a");
													const testImg = new Image();
													testImg.onerror = () => {
														e.preventDefault();
													};
													testImg.src = link.href;
												}}
											>
												📄 View
											</a>
											<a
												href={`${apiUrl}/documents/${document.fileName}`}
												download={document.fileName}
												target="_blank"
												rel="noopener noreferrer"
												className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-600 bg-green-50 rounded border border-green-200 transition-colors hover:bg-green-100"
												onClick={(e) => {
													// Check if file exists before download
													const link = e.target.closest("a");
													fetch(link.href, { method: "HEAD" })
														.then((response) => {
															if (!response.ok) {
																e.preventDefault();
															}
														})
														.catch(() => {
															e.preventDefault();
														});
												}}
											>
												⬇️ Download
											</a>
											<button
												onClick={() => handlePrint(document)}
												className="inline-flex items-center px-2 py-1 text-xs font-medium text-purple-600 bg-purple-50 rounded border border-purple-200 transition-colors hover:bg-purple-100"
											>
												🖨️ Print
											</button>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Excel Print Modal */}
				<ExcelPrintModal
					isOpen={showExcelModal}
					onClose={closeExcelModal}
					fileName={selectedExcelFile}
					apiUrl={apiUrl}
				/>
			</>
		);
	}

	return (
		<div className="p-4 bg-amber-50 rounded-lg border-2 border-amber-200 border-dashed">
			<div className="flex gap-3 items-center mb-3">
				<FileText className="w-5 h-5 text-amber-600" />
				<span className="text-sm font-medium text-amber-700">
					No Student {request.document} Documents Found
				</span>
			</div>
			<div className="mb-2 text-sm text-amber-600">
				No {request.document} documents are available for this student in the
				system. This includes checking both Grade 11 and Grade 12 records.
			</div>
			<div className="text-xs text-amber-500">
				Documents are stored with grade level information to distinguish between
				different academic years.
			</div>
		</div>
	);
};

export default StudentDocumentsSection;
