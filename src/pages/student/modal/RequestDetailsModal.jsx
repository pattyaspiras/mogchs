import React, { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import {
	X,
	FileText,
	User,
	Calendar,
	MessageSquare,
	Clock,
	AlertTriangle,
	Upload,
	CheckCircle,
} from "lucide-react";
import {
	getRequestTracking,
	getRequestAttachments,
	getRequirementComments,
	getDocumentRequirements,
	cancelRequest,
} from "../../../utils/student";
import { getDecryptedApiUrl } from "../../../utils/apiConfig";
import toast from "react-hot-toast";

export default function RequestDetailsModal({
	isOpen,
	onClose,
	request,
	userId,
	onSuccess,
}) {
	const [tracking, setTracking] = useState([]);
	const [attachments, setAttachments] = useState([]);
	const [comments, setComments] = useState([]);
	const [documentRequirements, setDocumentRequirements] = useState([]);
	const [loading, setLoading] = useState(false);
	const [showUploadForm, setShowUploadForm] = useState(false);
	const [selectedFile, setSelectedFile] = useState(null);
	const [uploading, setUploading] = useState(false);
	const [cancelling, setCancelling] = useState(false);
	const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

	useEffect(() => {
		if (isOpen && request) {
			fetchRequestDetails();
		}
	}, [isOpen, request]);

	const fetchRequestDetails = async () => {
		setLoading(true);
		try {
			// Fetch tracking information
			const trackingData = await getRequestTracking(request.id);
			if (Array.isArray(trackingData)) {
				setTracking(trackingData);
			}

			// Fetch attachments
			const attachmentsData = await getRequestAttachments(request.id);
			if (Array.isArray(attachmentsData)) {
				setAttachments(attachmentsData);
			}

			// Fetch comments
			const commentsData = await getRequirementComments(request.id);
			if (Array.isArray(commentsData)) {
				setComments(commentsData);
			}

			// Fetch document requirements
			const documentRequirementsData = await getDocumentRequirements(
				request.documentId
			);
			if (Array.isArray(documentRequirementsData)) {
				setDocumentRequirements(documentRequirementsData);
			}
		} catch (error) {
			console.error("Failed to fetch request details:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			// Validate file type
			const allowedTypes = ["jpg", "jpeg", "png", "gif", "pdf"];
			const fileExtension = file.name.split(".").pop().toLowerCase();

			if (!allowedTypes.includes(fileExtension)) {
				toast.error(
					"Invalid file type. Only JPG, PNG, GIF, and PDF files are allowed."
				);
				return;
			}

			// Check file size (max 5MB)
			if (file.size > 5 * 1024 * 1024) {
				toast.error("File size too large. Maximum size is 5MB.");
				return;
			}

			setSelectedFile(file);
		}
	};

	const handleUpload = async () => {
		if (!selectedFile) {
			toast.error("Please select a file to upload.");
			return;
		}

		setUploading(true);
		try {
			// Get the requirement type - either from existing attachments or from document requirements
			let typeId = null;
			if (attachments.length > 0) {
				typeId = attachments[0].typeId;
			} else if (documentRequirements.length > 0) {
				// If no existing attachments, use the first document requirement type
				typeId = documentRequirements[0].requirementId;
			} else {
				// If no document requirements found, show error
				toast.error(
					"No requirement types found for this document. Please contact support."
				);
				setUploading(false);
				return;
			}

			const formData = new FormData();
			formData.append("operation", "uploadAdditionalRequirement");
			formData.append(
				"json",
				JSON.stringify({
					requestId: request.id,
					typeId: typeId,
				})
			);
			formData.append("attachment", selectedFile);

			const apiUrl = getDecryptedApiUrl();
			const response = await fetch(`${apiUrl}/student.php`, {
				method: "POST",
				body: formData,
			});

			const result = await response.json();
			if (result.success) {
				toast.success("Requirement uploaded successfully!");
				setShowUploadForm(false);
				setSelectedFile(null);
				fetchRequestDetails(); // Refresh the data
				// Also trigger parent refresh to update the table
				if (onSuccess) onSuccess();
			} else {
				toast.error(result.error || "Failed to upload requirement");
			}
		} catch (error) {
			console.error("Failed to upload requirement:", error);
			toast.error("Failed to upload requirement");
		} finally {
			setUploading(false);
		}
	};

	const handleCancelRequest = async () => {
		setShowCancelConfirmation(true);
	};

	const confirmCancelRequest = async () => {
		setShowCancelConfirmation(false);
		setCancelling(true);
		try {
			const result = await cancelRequest(request.id);
			if (result.success) {
				toast.success("Request cancelled successfully!");
				// Close the modal first
				onClose();
				// Then trigger the success callback to refresh the parent data
				if (onSuccess) onSuccess();
			} else {
				toast.error(result.error || "Failed to cancel request");
			}
		} catch (error) {
			console.error("Failed to cancel request:", error);
			toast.error("Failed to cancel request");
		} finally {
			setCancelling(false);
		}
	};

	const getStatusIcon = (status) => {
		switch (status.toLowerCase()) {
			case "pending":
				return <Clock className="w-4 h-4 text-yellow-500" />;
			case "processed":
				return <FileText className="w-4 h-4 text-blue-500" />;
			case "signatory":
				return <User className="w-4 h-4 text-purple-500" />;
			case "release":
				return <CheckCircle className="w-4 h-4 text-green-500" />;
			case "completed":
				return <CheckCircle className="w-4 h-4 text-green-600" />;
			case "cancelled":
				return <X className="w-4 h-4 text-red-500" />;
			default:
				return <Clock className="w-4 h-4 text-gray-500" />;
		}
	};

	const getStatusColor = (status) => {
		switch (status.toLowerCase()) {
			case "pending":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
			case "processed":
				return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
			case "signatory":
				return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
			case "release":
				return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
			case "completed":
				return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
			case "cancelled":
				return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
		}
	};

	if (!isOpen || !request) return null;

	return (
		<>
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
				<div className="relative w-full max-w-4xl bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-h-[90vh] flex flex-col">
					{/* Header */}
					<div className="flex justify-between items-center px-6 py-4 text-white bg-blue-600 rounded-t-lg">
						<div className="flex gap-3 items-center">
							<FileText className="w-6 h-6" />
							<h2 className="text-xl font-semibold">Request Details</h2>
						</div>
						<button
							onClick={onClose}
							className="p-2 text-white bg-transparent hover:text-gray-200 rounded-full transition-colors"
						>
							<X className="w-5 h-5" />
						</button>
					</div>

					{/* Content */}
					<div className="flex-1 overflow-y-auto p-6">
						{loading ? (
							<div className="flex justify-center items-center py-8">
								<div className="text-gray-500">Loading...</div>
							</div>
						) : (
							<div className="space-y-6">
								{/* Request Information */}
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700">
										<div className="flex gap-3 items-center mb-3">
											<User className="w-5 h-5 text-blue-600" />
											<span className="text-sm font-medium text-slate-600 dark:text-slate-300">
												Document
											</span>
										</div>
										<p className="text-lg font-semibold text-slate-900 dark:text-white">
											{request.document}
										</p>
									</div>

									<div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700">
										<div className="flex gap-3 items-center mb-3">
											<Calendar className="w-5 h-5 text-blue-600" />
											<span className="text-sm font-medium text-slate-600 dark:text-slate-300">
												Date Requested
											</span>
										</div>
										<p className="text-lg font-semibold text-slate-900 dark:text-white">
											{new Date(request.dateRequested).toLocaleDateString(
												"en-US",
												{
													month: "long",
													day: "numeric",
													year: "numeric",
												}
											)}
										</p>
									</div>

									<div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700">
										<div className="flex gap-3 items-center mb-3">
											<Clock className="w-5 h-5 text-blue-600" />
											<span className="text-sm font-medium text-slate-600 dark:text-slate-300">
												Current Status
											</span>
										</div>
										<div className="flex gap-2 items-center">
											{getStatusIcon(request.status)}
											<span
												className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
													request.status
												)}`}
											>
												{request.status}
											</span>
										</div>
									</div>

									{/* Release Date - Hide for Completed status since we show actual completion date below */}
									{request.releaseDate &&
										request.status?.toLowerCase() !== "completed" && (
											<div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700">
												<div className="flex gap-3 items-center mb-3">
													<Calendar className="w-5 h-5 text-green-600" />
													<span className="text-sm font-medium text-green-700 dark:text-green-300">
														Release Date
													</span>
												</div>
												<p className="text-lg font-semibold text-green-800 dark:text-green-200">
													{request.releaseDateFormatted}
												</p>
											</div>
										)}

									{/* Expected Release Date and Countdown - Show different wording for Completed status */}
									{request.expectedReleaseDateFormatted && (
										<div
											className={`p-4 rounded-lg border ${
												request.status?.toLowerCase() === "completed"
													? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700"
													: request.daysRemaining >= 0
													? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
													: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700"
											}`}
										>
											<div className="flex gap-3 items-center mb-3">
												<Calendar
													className={`w-5 h-5 ${
														request.status?.toLowerCase() === "completed"
															? "text-green-600"
															: request.daysRemaining >= 0
															? "text-blue-600"
															: "text-red-600"
													}`}
												/>
												<span
													className={`text-sm font-medium ${
														request.status?.toLowerCase() === "completed"
															? "text-green-700 dark:text-green-300"
															: request.daysRemaining >= 0
															? "text-blue-700 dark:text-blue-300"
															: "text-red-700 dark:text-red-300"
													}`}
												>
													{request.status?.toLowerCase() === "completed"
														? "Released Date"
														: "Expected Release Date"}
												</span>
											</div>
											<p
												className={`text-lg font-semibold ${
													request.status?.toLowerCase() === "completed"
														? "text-green-800 dark:text-green-200"
														: request.daysRemaining >= 0
														? "text-blue-800 dark:text-blue-200"
														: "text-red-800 dark:text-red-200"
												}`}
											>
												{request.expectedReleaseDateFormatted}
											</p>
											{request.status?.toLowerCase() !== "completed" && (
												<div
													className={`text-sm mt-2 ${
														request.daysRemaining >= 0
															? "text-blue-600 dark:text-blue-400"
															: "text-red-600 dark:text-red-400"
													}`}
												>
													{request.daysRemaining === 0 ? (
														<span className="font-medium">
															📅 Expected release: Today!
														</span>
													) : request.daysRemaining > 0 ? (
														<span>
															⏱️{" "}
															<span className="font-medium">
																{request.daysRemaining}{" "}
																{request.daysRemaining === 1 ? "day" : "days"}{" "}
																remaining
															</span>
														</span>
													) : (
														<span className="font-medium">
															⚠️ {Math.abs(request.daysRemaining)}{" "}
															{Math.abs(request.daysRemaining) === 1
																? "day"
																: "days"}{" "}
															overdue
														</span>
													)}
												</div>
											)}
										</div>
									)}
								</div>

								{/* Purpose */}
								{request.purpose && (
									<div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700">
										<div className="flex gap-3 items-center mb-3">
											<MessageSquare className="w-5 h-5 text-blue-600" />
											<span className="text-sm font-medium text-slate-600 dark:text-slate-300">
												Purpose
											</span>
										</div>
										<p className="text-slate-900 dark:text-white">
											{request.purpose}
										</p>
									</div>
								)}

								{/* Progress Timeline */}
								<div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700">
									<h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
										Progress Timeline
									</h3>
									<div className="space-y-3">
										{tracking.map((status, index) => (
											<div key={status.id} className="flex gap-3 items-center">
												<div className="flex-shrink-0">
													{getStatusIcon(status.status)}
												</div>
												<div className="flex-1">
													<div className="flex gap-2 items-center">
														<span
															className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
																status.status
															)}`}
														>
															{status.status}
														</span>
														<span className="text-sm text-slate-600 dark:text-slate-400">
															{new Date(status.createdAt).toLocaleDateString(
																"en-US",
																{
																	month: "long",
																	day: "numeric",
																	year: "numeric",
																}
															)}
														</span>
													</div>
												</div>
											</div>
										))}
									</div>
								</div>

								{/* Current Attachments */}
								{attachments.length > 0 && (
									<div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700">
										<h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
											Current Requirements
										</h3>
										<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
											{attachments.map((attachment, index) => (
												<div
													key={index}
													className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600"
												>
													<div className="flex gap-2 items-center mb-2">
														<FileText className="w-4 h-4 text-blue-600" />
														<span className="text-sm font-medium text-slate-700 dark:text-slate-300">
															{attachment.requirementType || "Unknown Type"}
														</span>
													</div>
													<p className="text-xs text-slate-600 dark:text-slate-400 break-all">
														{attachment.filepath}
													</p>
												</div>
											))}
										</div>
									</div>
								)}

								{/* Registrar Comments */}
								<div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
									<div className="flex gap-3 items-center mb-4">
										<AlertTriangle className="w-5 h-5 text-amber-600" />
										<h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200">
											Registrar Comments
										</h3>
									</div>

									{comments.length === 0 ? (
										<div className="text-sm text-amber-700 dark:text-amber-300">
											<p>No comments from registrars yet.</p>
										</div>
									) : (
										<div className="space-y-3">
											{comments.map((comment) => (
												<div
													key={comment.id}
													className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-amber-200 dark:border-amber-600"
												>
													<div className="flex justify-between items-start mb-2">
														<div className="flex gap-2 items-center">
															<User className="w-4 h-4 text-amber-600" />
															<span className="text-sm font-medium text-amber-800 dark:text-amber-200">
																{comment.registrarFirstName}{" "}
																{comment.registrarLastName}
															</span>
															<span className="text-xs text-amber-600 dark:text-amber-400">
																{new Date(comment.createdAt).toLocaleString()}
															</span>
														</div>
														<span
															className={`px-2 py-1 text-xs font-medium rounded-full ${
																comment.status === "pending"
																	? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
																	: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
															}`}
														>
															{comment.status}
														</span>
													</div>

													<div className="mb-2 p-2 bg-amber-100 dark:bg-amber-900/30 rounded text-xs text-amber-800 dark:text-amber-200">
														<span className="font-medium">File:</span>{" "}
														{comment.filepath}
														<br />
														<span className="font-medium">Type:</span>{" "}
														{comment.requirementType}
													</div>

													<div className="text-sm text-amber-700 dark:text-amber-300">
														{comment.comment}
													</div>
												</div>
											))}
										</div>
									)}
								</div>

								{/* Upload New Requirements */}
								<div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
									<div className="flex gap-3 items-center mb-4">
										<Upload className="w-5 h-5 text-blue-600" />
										<h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
											Upload New Requirements
										</h3>
									</div>

									{!showUploadForm ? (
										<div className="text-sm text-blue-700 dark:text-blue-300 mb-4">
											<p>
												If you need to upload additional requirements or respond
												to registrar comments, click the button below.
											</p>
											{attachments.length > 0 ? (
												<p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
													Requirement type:{" "}
													<strong>{attachments[0].requirementType}</strong>
												</p>
											) : documentRequirements.length > 0 ? (
												<p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
													Requirement type:{" "}
													<strong>
														{documentRequirements[0].requirementName}
													</strong>
												</p>
											) : (
												<p className="mt-2 text-xs text-orange-600 dark:text-orange-400">
													No requirements configured for this document type.
												</p>
											)}
										</div>
									) : (
										<div className="space-y-4">
											{attachments.length > 0 ? (
												<div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-md">
													<p className="text-sm text-blue-800 dark:text-blue-200">
														<strong>Requirement Type:</strong>{" "}
														{attachments[0].requirementType}
													</p>
													<p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
														This will be automatically set based on your
														original request.
													</p>
												</div>
											) : documentRequirements.length > 0 ? (
												<div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-md">
													<p className="text-sm text-blue-800 dark:text-blue-200">
														<strong>Requirement Type:</strong>{" "}
														{documentRequirements[0].requirementName}
													</p>
													<p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
														This will be automatically set based on your
														document type.
													</p>
												</div>
											) : (
												<div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-md">
													<p className="text-sm text-orange-800 dark:text-orange-200">
														<strong>No Requirement Types Available</strong>
													</p>
													<p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
														Please contact support to configure requirement
														types for this document.
													</p>
												</div>
											)}

											<div>
												<label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
													File
												</label>
												<input
													type="file"
													onChange={handleFileChange}
													accept=".jpg,.jpeg,.png,.gif,.pdf"
													className="w-full p-2 border border-blue-300 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
												/>
												<p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
													Max file size: 5MB. Allowed types: JPG, PNG, GIF, PDF
												</p>
											</div>

											<div className="flex gap-2">
												<Button
													onClick={handleUpload}
													disabled={!selectedFile || uploading}
													className="bg-blue-600 hover:bg-blue-700 text-white"
												>
													{uploading
														? "Uploading..."
														: "Upload New Requirement"}
												</Button>
												<Button
													onClick={() => setShowUploadForm(false)}
													variant="outline"
													className="border-blue-300 text-blue-700 hover:bg-blue-50"
												>
													Cancel
												</Button>
											</div>
										</div>
									)}

									{!showUploadForm && (
										<Button
											onClick={() => setShowUploadForm(true)}
											disabled={
												attachments.length === 0 &&
												documentRequirements.length === 0
											}
											className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
										>
											<Upload className="w-4 h-4 mr-2" />
											Upload New Requirement
										</Button>
									)}
								</div>
							</div>
						)}
					</div>

					{/* Footer */}
					<div className="flex justify-end gap-3 px-6 py-4 border-t bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-b-lg">
						{request.status.toLowerCase() === "pending" && (
							<Button
								onClick={handleCancelRequest}
								variant="outline"
								className="border-red-300 text-red-700 hover:bg-red-200 hover:text-red-700"
								disabled={cancelling}
							>
								{cancelling ? (
									<>
										<svg
											className="animate-spin h-4 w-4 text-red-700 mr-2"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
										>
											<circle
												className="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												strokeWidth="4"
											/>
											<path
												className="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											/>
										</svg>
										Cancelling...
									</>
								) : (
									<>
										<AlertTriangle className="w-4 h-4 mr-2" />
										Cancel Request
									</>
								)}
							</Button>
						)}
						<Button
							onClick={onClose}
							variant="outline"
							className="border-slate-300 text-slate-700 hover:bg-slate-300 hover:text-slate-700 dark:hover:text-slate-700"
						>
							Close
						</Button>
					</div>
				</div>
			</div>

			{/* Cancel Confirmation Modal */}
			{showCancelConfirmation && (
				<div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
					<div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-lg shadow-2xl">
						{/* Header */}
						<div className="flex justify-between items-center px-6 py-4 text-white bg-red-600 rounded-t-lg">
							<div className="flex gap-3 items-center">
								<AlertTriangle className="w-6 h-6" />
								<h3 className="text-lg font-semibold">Cancel Request</h3>
							</div>
							<button
								onClick={() => setShowCancelConfirmation(false)}
								className="p-2 text-white bg-transparent hover:text-red-200 rounded-full transition-colors"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						{/* Content */}
						<div className="p-6">
							<div className="mb-6">
								<p className="text-slate-700 dark:text-slate-300 mb-3">
									Are you sure you want to cancel this request?
								</p>
								<div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
									<div className="flex gap-2 items-start">
										<AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
										<div className="text-sm text-red-700 dark:text-red-300">
											<p className="font-medium mb-1">
												This action cannot be undone.
											</p>
											<p>
												Your request will be permanently marked as cancelled and
												you'll need to submit a new request if needed.
											</p>
										</div>
									</div>
								</div>
							</div>

							{/* Request Details */}
							<div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
								<h4 className="font-medium text-slate-900 dark:text-white mb-2">
									Request Details:
								</h4>
								<div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
									<p>
										<span className="font-medium">Document:</span>{" "}
										{request.document}
									</p>
									<p>
										<span className="font-medium">Date Requested:</span>{" "}
										{new Date(request.dateRequested).toLocaleDateString(
											"en-US",
											{ month: "long", day: "numeric", year: "numeric" }
										)}
									</p>
									{request.purpose && (
										<p>
											<span className="font-medium">Purpose:</span>{" "}
											{request.purpose}
										</p>
									)}
								</div>
							</div>
						</div>

						{/* Footer */}
						<div className="flex justify-end gap-3 px-6 py-4 border-t bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-b-lg">
							<Button
								onClick={() => setShowCancelConfirmation(false)}
								variant="outline"
								className="border-slate-300 text-slate-700 hover:bg-slate-100"
							>
								Keep Request
							</Button>
							<Button
								onClick={confirmCancelRequest}
								className="bg-red-600 hover:bg-red-700 text-white"
								disabled={cancelling}
							>
								{cancelling ? (
									<>
										<svg
											className="animate-spin h-4 w-4 text-white mr-2"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
										>
											<circle
												className="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												strokeWidth="4"
											/>
											<path
												className="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											/>
										</svg>
										Cancelling...
									</>
								) : (
									"Cancel Request"
								)}
							</Button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
