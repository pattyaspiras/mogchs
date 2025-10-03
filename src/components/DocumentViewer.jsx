import React, { useState } from "react";
import { Button } from "./ui/button";
import { X, Download, FileText, Eye } from "lucide-react";
import { getDecryptedApiUrl } from "../utils/apiConfig";

export default function DocumentViewer({ document, isOpen, onClose }) {
	const [loading, setLoading] = useState(false);

	if (!isOpen || !document) return null;

	const apiUrl = getDecryptedApiUrl();
	const fileUrl = `${apiUrl}/documents/${document.fileName}`;

	// Function to get file extension
	const getFileExtension = (filename) => {
		return filename.split(".").pop().toLowerCase();
	};

	// Function to check if file is viewable
	const isViewableFile = (filename) => {
		const extension = getFileExtension(filename);
		return ["pdf", "jpg", "jpeg", "png", "gif"].includes(extension);
	};

	// Function to check if file is PDF
	const isPdfFile = (filename) => {
		return getFileExtension(filename) === "pdf";
	};

	// Function to check if file is image
	const isImageFile = (filename) => {
		const imageExtensions = ["jpg", "jpeg", "png", "gif"];
		return imageExtensions.includes(getFileExtension(filename));
	};

	// Function to handle view in new tab
	const handleViewInNewTab = () => {
		window.open(fileUrl, "_blank");
	};

	return (
		<div className="flex fixed inset-0 z-50 justify-center items-center p-4 backdrop-blur-sm bg-black/50">
			<div className="relative w-full max-w-6xl bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-h-[90vh] overflow-hidden">
				{/* Header */}
				<div className="flex justify-between items-center px-6 py-4 text-white bg-[#5409DA] border-b">
					<div className="flex gap-3 items-center">
						<FileText className="w-6 h-6" />
						<div>
							<h2 className="text-xl font-semibold">Document Viewer</h2>
							<p className="text-sm text-blue-100">{document.fileName}</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="p-2 text-white bg-transparent rounded-full transition-colors hover:text-gray-200"
						aria-label="Close"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Document Info */}
				<div className="px-6 py-4 border-b bg-slate-50 dark:bg-slate-700">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
						<div>
							<span className="text-sm font-medium text-slate-600 dark:text-slate-400">
								Document Type:
							</span>
							<p className="text-slate-900 dark:text-white">
								{document.documentType || "Unknown"}
							</p>
						</div>
						<div>
							<span className="text-sm font-medium text-slate-600 dark:text-slate-400">
								Grade Level:
							</span>
							<p className="text-slate-900 dark:text-white">
								{document.gradeLevelName || "N/A"}
							</p>
						</div>
						<div>
							<span className="text-sm font-medium text-slate-600 dark:text-slate-400">
								Date Added:
							</span>
							<p className="text-slate-900 dark:text-white">
								{new Date(document.createdAt).toLocaleDateString()}
							</p>
						</div>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex gap-3 px-6 py-4 border-b">
					{isViewableFile(document.fileName) && (
						<Button
							onClick={handleViewInNewTab}
							className="flex gap-2 items-center text-white bg-blue-600 hover:bg-blue-700"
						>
							<Eye className="w-4 h-4" />
							View in New Tab
						</Button>
					)}
				</div>

				{/* Document Content */}
				<div className="flex-1 overflow-auto max-h-[60vh]">
					{isPdfFile(document.fileName) ? (
						<div className="p-6">
							<div className="w-full bg-gray-100 rounded-lg dark:bg-slate-700">
								<iframe
									src={fileUrl}
									className="w-full h-[500px] rounded-lg"
									title="PDF Viewer"
									onError={() => {
										console.error("Failed to load PDF");
									}}
								/>
							</div>
						</div>
					) : isImageFile(document.fileName) ? (
						<div className="p-6">
							<div className="flex justify-center">
								<img
									src={fileUrl}
									alt={document.fileName}
									className="max-w-full max-h-[500px] rounded-lg shadow-md"
									onError={(e) => {
										e.target.style.display = "none";
									}}
								/>
							</div>
						</div>
					) : (
						<div className="p-6 text-center">
							<div className="flex flex-col gap-4 justify-center items-center py-12">
								<FileText className="w-16 h-16 text-slate-400" />
								<div>
									<h3 className="text-lg font-medium text-slate-900 dark:text-white">
										Preview Not Available
									</h3>
									<p className="text-slate-600 dark:text-slate-400">
										This file type cannot be previewed in the browser.
										<br />
										Please download the file to view it.
									</p>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="flex gap-3 justify-end px-6 py-4 border-t bg-slate-50 dark:bg-slate-700">
					<Button
						onClick={onClose}
						variant="outline"
						className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
					>
						Close
					</Button>
				</div>
			</div>
		</div>
	);
}
