import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
	Filter,
	ChevronLeft,
	ChevronRight,
	FileText,
	Download,
	Eye,
	Upload,
	GraduationCap,
} from "lucide-react";
import toast from "react-hot-toast";
import { getDocumentAllStudent } from "../../../utils/registrar";
import DocumentUpload from "./DocumentUpload";

export default function DocumentsTab() {
	const [documents, setDocuments] = useState([]);
	const [filteredDocuments, setFilteredDocuments] = useState([]);
	const [documentsLoading, setDocumentsLoading] = useState(true);
	const [showUploadModal, setShowUploadModal] = useState(false);

	// Pagination state
	const [currentPage, setCurrentPage] = useState(1);
	const [documentsPerPage] = useState(10);

	// Filter state
	const [selectedDocumentType, setSelectedDocumentType] = useState("");
	const [selectedTrack, setSelectedTrack] = useState("");
	const [selectedGradeLevel, setSelectedGradeLevel] = useState("");
	const [searchTerm, setSearchTerm] = useState("");

	// Get unique document types, tracks, and grade levels for filters
	const documentTypes = [...new Set(documents.map((doc) => doc.documentType))];
	const tracks = [
		...new Set(documents.map((doc) => doc.track).filter(Boolean)),
	];

	// Get unique grade levels using Map to avoid duplicates
	const gradeLevelsMap = new Map();
	documents.forEach((doc) => {
		if (doc.gradeLevelId) {
			gradeLevelsMap.set(doc.gradeLevelId, {
				id: doc.gradeLevelId,
				name: doc.gradeLevelName || `Grade ${doc.gradeLevelId}`,
			});
		}
	});
	const gradeLevels = Array.from(gradeLevelsMap.values());

	// Fetch documents when component mounts
	useEffect(() => {
		fetchDocuments();
	}, []);

	// Apply filters when documents or filter states change
	useEffect(() => {
		applyFilters();
	}, [
		documents,
		selectedDocumentType,
		selectedTrack,
		selectedGradeLevel,
		searchTerm,
	]);

	// Reset to page 1 when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [selectedDocumentType, selectedTrack, selectedGradeLevel, searchTerm]);

	const fetchDocuments = async () => {
		setDocumentsLoading(true);
		try {
			const data = await getDocumentAllStudent();
			console.log("Documents data:", data);
			let documentsArray = data;
			if (typeof data === "string") {
				try {
					documentsArray = JSON.parse(data);
				} catch (e) {
					documentsArray = [];
				}
			}
			setDocuments(Array.isArray(documentsArray) ? documentsArray : []);
		} catch (error) {
			console.error("Error fetching documents:", error);
			toast.error("Failed to load documents");
		} finally {
			setDocumentsLoading(false);
		}
	};

	const applyFilters = () => {
		let filtered = [...documents];

		// Apply document type filter
		if (selectedDocumentType && selectedDocumentType !== "") {
			filtered = filtered.filter(
				(doc) => doc.documentType === selectedDocumentType
			);
		}

		// Apply track filter
		if (selectedTrack && selectedTrack !== "") {
			filtered = filtered.filter((doc) => doc.track === selectedTrack);
		}

		// Apply grade level filter
		if (selectedGradeLevel && selectedGradeLevel !== "") {
			filtered = filtered.filter(
				(doc) => doc.gradeLevelId == selectedGradeLevel
			);
		}

		// Apply search term filter
		if (searchTerm && searchTerm.trim() !== "") {
			const searchLower = searchTerm.toLowerCase();
			filtered = filtered.filter(
				(doc) =>
					doc.firstname?.toLowerCase().includes(searchLower) ||
					doc.lastname?.toLowerCase().includes(searchLower) ||
					doc.middlename?.toLowerCase().includes(searchLower) ||
					doc.lrn?.toLowerCase().includes(searchLower) ||
					doc.documentType?.toLowerCase().includes(searchLower) ||
					(doc.gradeLevelName || `Grade ${doc.gradeLevelId}`)
						?.toLowerCase()
						.includes(searchLower)
			);
		}

		setFilteredDocuments(filtered);
	};

	const handleDownload = (fileName) => {
		// Create download link for the document
		const apiUrl = sessionStorage.getItem("api_url");
		if (apiUrl) {
			try {
				const decryptedUrl = atob(apiUrl);
				const downloadUrl = `${decryptedUrl}/documents/${fileName}`;
				window.open(downloadUrl, "_blank");
			} catch (error) {
				toast.error("Failed to download document");
			}
		}
	};

	const handleView = (fileName) => {
		// Open document in new tab for viewing
		const apiUrl = sessionStorage.getItem("api_url");
		if (apiUrl) {
			try {
				const decryptedUrl = atob(apiUrl);
				const viewUrl = `${decryptedUrl}/documents/${fileName}`;
				window.open(viewUrl, "_blank");
			} catch (error) {
				toast.error("Failed to view document");
			}
		}
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

	const handleUploadSuccess = () => {
		fetchDocuments(); // Refresh the documents list
		setShowUploadModal(false);
	};

	// Calculate pagination
	const indexOfLastDocument = currentPage * documentsPerPage;
	const indexOfFirstDocument = indexOfLastDocument - documentsPerPage;
	const currentDocuments = filteredDocuments.slice(
		indexOfFirstDocument,
		indexOfLastDocument
	);
	const totalPages = Math.ceil(filteredDocuments.length / documentsPerPage);

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

	return (
		<>
			<Card className="dark:bg-slate-800 dark:border-slate-700">
				<CardContent className="p-4 lg:p-6">
					<div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
						<div className="text-lg font-semibold text-slate-900 dark:text-white">
							Student Documents ({filteredDocuments.length})
						</div>
						<Button
							onClick={() => setShowUploadModal(true)}
							className="flex gap-2 items-center text-white bg-green-600 hover:bg-green-700"
						>
							<Upload className="w-4 h-4" /> Upload Documents
						</Button>
					</div>

					{/* Filter Controls */}
					<div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center">
						{/* Search Input */}
						<div className="flex gap-2 items-center">
							<input
								type="text"
								placeholder="Search by name, LRN, or document type..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="px-3 py-2 text-sm bg-white dark:bg-slate-800 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white min-w-[250px]"
							/>
						</div>

						{/* Document Type Filter */}
						<div className="flex gap-2 items-center">
							<Filter className="w-4 h-4 text-slate-500 dark:text-slate-400" />
							<select
								value={selectedDocumentType}
								onChange={(e) => setSelectedDocumentType(e.target.value)}
								className="px-3 py-2 text-sm bg-white rounded-md border dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
							>
								<option value="">All Document Types</option>
								{documentTypes.map((type) => (
									<option key={type} value={type}>
										{type}
									</option>
								))}
							</select>
						</div>

						{/* Track Filter */}
						<div className="flex gap-2 items-center">
							<select
								value={selectedTrack}
								onChange={(e) => setSelectedTrack(e.target.value)}
								className="px-3 py-2 text-sm bg-white rounded-md border dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
							>
								<option value="">All Tracks</option>
								{tracks.map((track) => (
									<option key={track} value={track}>
										{track}
									</option>
								))}
							</select>
						</div>

						{/* Grade Level Filter */}
						<div className="flex gap-2 items-center">
							<GraduationCap className="w-4 h-4 text-slate-500 dark:text-slate-400" />
							<select
								value={selectedGradeLevel}
								onChange={(e) => setSelectedGradeLevel(e.target.value)}
								className="px-3 py-2 text-sm bg-white rounded-md border dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
							>
								<option value="">All Grade Levels</option>
								{gradeLevels.map((level) => (
									<option key={level.id} value={level.id}>
										{level.name}
									</option>
								))}
							</select>
						</div>
					</div>

					{/* Active Filters Display */}
					{(selectedDocumentType ||
						selectedTrack ||
						selectedGradeLevel ||
						searchTerm) && (
						<div className="flex flex-wrap gap-2 mb-4 text-sm text-slate-600 dark:text-slate-400">
							<span>Active filters:</span>
							{selectedDocumentType && (
								<span className="px-2 py-1 text-blue-800 bg-blue-100 rounded dark:text-blue-300 dark:bg-blue-900/20">
									Type: {selectedDocumentType}
								</span>
							)}
							{selectedTrack && (
								<span className="px-2 py-1 text-green-800 bg-green-100 rounded dark:text-green-300 dark:bg-green-900/20">
									Track: {selectedTrack}
								</span>
							)}
							{selectedGradeLevel && (
								<span className="px-2 py-1 text-purple-800 bg-purple-100 rounded dark:text-purple-300 dark:bg-purple-900/20">
									Grade:{" "}
									{gradeLevels.find((level) => level.id == selectedGradeLevel)
										?.name || `Grade ${selectedGradeLevel}`}
								</span>
							)}
							{searchTerm && (
								<span className="px-2 py-1 text-purple-800 bg-purple-100 rounded dark:text-purple-300 dark:bg-purple-900/20">
									Search: "{searchTerm}"
								</span>
							)}
						</div>
					)}

					{documentsLoading ? (
						<div className="py-6 text-center lg:py-8">
							<p className="text-sm text-slate-500 dark:text-slate-400 lg:text-base">
								Loading documents...
							</p>
						</div>
					) : filteredDocuments.length === 0 ? (
						<div className="py-6 text-center lg:py-8">
							<p className="text-sm text-slate-500 dark:text-slate-400 lg:text-base">
								{documents.length === 0
									? "No documents found in the system."
									: "No documents match the current filters."}
							</p>
						</div>
					) : (
						<>
							{/* Pagination Info */}
							<div className="mb-4 text-sm text-slate-600 dark:text-slate-400">
								Showing {indexOfFirstDocument + 1} to{" "}
								{Math.min(indexOfLastDocument, filteredDocuments.length)} of{" "}
								{filteredDocuments.length} documents
								{totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
							</div>

							{/* Documents Table */}
							<div className="overflow-x-auto -mx-4 mb-6 lg:mx-0">
								<table className="min-w-full text-xs lg:text-sm text-slate-700 dark:text-slate-300">
									<thead>
										<tr className="border-b border-slate-200 dark:border-slate-700">
											<th className="px-3 py-2 font-semibold text-left lg:px-4">
												Student Name
											</th>
											<th className="px-3 py-2 font-semibold text-left lg:px-4">
												LRN
											</th>
											<th className="hidden px-3 py-2 font-semibold text-left lg:px-4 sm:table-cell">
												Track/Strand
											</th>
											<th className="px-3 py-2 font-semibold text-left lg:px-4">
												Document Type
											</th>
											<th className="px-3 py-2 font-semibold text-left lg:px-4">
												Grade Level
											</th>
											<th className="px-3 py-2 font-semibold text-left lg:px-4">
												File Name
											</th>
											<th className="px-3 py-2 font-semibold text-center lg:px-4">
												Actions
											</th>
										</tr>
									</thead>
									<tbody>
										{currentDocuments.map((doc, index) => (
											<tr
												key={`${doc.fileName}-${index}`}
												className="border-b transition-colors border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
											>
												<td className="px-3 py-3 lg:px-4 lg:py-2">
													<div className="font-medium dark:text-white">
														{`${doc.firstname} ${
															doc.middlename ? doc.middlename + " " : ""
														}${doc.lastname}`}
													</div>
												</td>
												<td className="px-3 py-3 lg:px-4 lg:py-2 dark:text-white">
													{doc.lrn || "N/A"}
												</td>
												<td className="hidden px-3 py-3 lg:px-4 lg:py-2 sm:table-cell">
													<div className="text-xs">
														{doc.track && (
															<div className="font-medium dark:text-white">
																{doc.track}
															</div>
														)}
														{doc.strand && (
															<div className="text-slate-500 dark:text-slate-400">
																{doc.strand}
															</div>
														)}
													</div>
												</td>
												<td className="px-3 py-3 lg:px-4 lg:py-2">
													<span className="inline-flex px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full dark:text-blue-300 dark:bg-blue-900/20">
														{doc.documentType}
													</span>
												</td>
												<td className="px-3 py-3 lg:px-4 lg:py-2">
													<div className="flex gap-1 items-center">
														<GraduationCap className="w-3 h-3 text-slate-500" />
														<span
															className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
																doc.gradeLevelId === 1
																	? "text-blue-800 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/20"
																	: doc.gradeLevelId === 2
																	? "text-green-800 bg-green-100 dark:text-green-300 dark:bg-green-900/20"
																	: "text-gray-800 bg-gray-100 dark:text-gray-300 dark:bg-gray-900/20"
															}`}
														>
															{doc.gradeLevelName ||
																`Grade ${doc.gradeLevelId}`}
														</span>
													</div>
												</td>
												<td className="px-3 py-3 lg:px-4 lg:py-2">
													<div className="flex gap-1 items-center max-w-[150px]">
														<FileText className="flex-shrink-0 w-4 h-4 text-slate-400 dark:text-slate-500" />
														<span className="text-xs truncate dark:text-white">
															{doc.fileName}
														</span>
													</div>
												</td>
												<td className="px-3 py-3 lg:px-4 lg:py-2">
													<div className="flex gap-1 justify-center">
														<Button
															size="sm"
															variant="ghost"
															onClick={() => handleView(doc.fileName)}
															className="p-1 w-8 h-8"
															title="View Document"
														>
															<Eye className="w-4 h-4" />
														</Button>
														<Button
															size="sm"
															variant="ghost"
															onClick={() => handleDownload(doc.fileName)}
															className="p-1 w-8 h-8"
															title="Download Document"
														>
															<Download className="w-4 h-4" />
														</Button>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							{/* Pagination */}
							{totalPages > 1 && (
								<div className="flex flex-col gap-4 items-center sm:flex-row sm:justify-between">
									<div className="text-sm text-slate-600 dark:text-slate-400">
										Page {currentPage} of {totalPages}
									</div>
									<div className="flex gap-2 items-center">
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

										<div className="flex gap-1">
											{getPageNumbers().map((pageNum, index) => (
												<React.Fragment key={index}>
													{pageNum === "..." ? (
														<span className="px-3 py-1 text-slate-400 dark:text-slate-500">
															...
														</span>
													) : (
														<Button
															variant={
																pageNum === currentPage ? "default" : "outline"
															}
															size="sm"
															onClick={() => handlePageChange(pageNum)}
															className="p-0 w-8 h-8"
														>
															{pageNum}
														</Button>
													)}
												</React.Fragment>
											))}
										</div>

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
			</Card>

			{/* Upload Modal */}
			<DocumentUpload
				isOpen={showUploadModal}
				onClose={() => setShowUploadModal(false)}
				onSuccess={handleUploadSuccess}
			/>
		</>
	);
}
