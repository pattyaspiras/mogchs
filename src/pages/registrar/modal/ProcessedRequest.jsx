import React, { useState, useEffect, useRef } from "react";
import { Button } from "../../../components/ui/button";
import {
	X,
	FileText,
	User,
	Calendar,
	MessageSquare,
	Clock,
} from "lucide-react";
import {
	processRequest,
	processRelease,
	getRequestAttachments,
	getStudentDocuments,
	getStudentInfo,
	updateStudentInfo,
	getReleaseSchedule,
	getRequestOwner,
} from "../../../utils/registrar";
import { getUserRequests } from "../../../utils/student";
import toast from "react-hot-toast";
import StudentDocumentsSection from "../components/StudentDocumentsSection";
import AttachmentsSection from "../components/AttachmentsSection";
import ImageZoomModal from "../components/ImageZoomModal";
import DiplomaTemplateModal from "../components/DiplomaTemplateModal";
import CertificateTemplateModal from "../components/CertificateTemplateModal";
import CavTemplateModal from "../components/CavTemplateModal";
import ReleaseScheduleModal from "./ReleaseScheduleModal";
import RequirementCommentModal from "./RequirementCommentModal";
import RequirementCommentsSection from "../components/RequirementCommentsSection";

export default function ProcessedRequest({
	request,
	isOpen,
	onClose,
	onSuccess,
	userId,
}) {
	const [processing, setProcessing] = useState(false);
	const [attachments, setAttachments] = useState([]);
	const [studentDocuments, setStudentDocuments] = useState([]);
	const [selectedImage, setSelectedImage] = useState(null);
	const [imageZoom, setImageZoom] = useState(1);
	const [groupByType, setGroupByType] = useState(false);
	const [studentInfo, setStudentInfo] = useState(null);
	const [showDiplomaTemplate, setShowDiplomaTemplate] = useState(false);
	const [showCertificateTemplate, setShowCertificateTemplate] = useState(false);
	const [showCavTemplate, setShowCavTemplate] = useState(false);
	const [showReleaseSchedule, setShowReleaseSchedule] = useState(false);
	const [currentRequest, setCurrentRequest] = useState(request);
	const [releaseSchedule, setReleaseSchedule] = useState(null);
	const [doubleRequestNote, setDoubleRequestNote] = useState(null);
	const [requestOwner, setRequestOwner] = useState(null);

	// Requirement comment modal state
	const [showCommentModal, setShowCommentModal] = useState(false);
	const [selectedRequirement, setSelectedRequirement] = useState(null);

	// Update currentRequest when request prop changes
	useEffect(() => {
		setCurrentRequest(request);
	}, [request]);

	// Check if this is a diploma request
	const isDiplomaRequest = () => {
		return currentRequest?.document?.toLowerCase().includes("diploma");
	};

	// Check if this is a certificate of enrollment request
	const isCertificateRequest = () => {
		return (
			currentRequest?.document?.toLowerCase().includes("certificate") &&
			currentRequest?.document?.toLowerCase().includes("enrollment")
		);
	};

	// Check if this is a CAV request
	const isCavRequest = () => {
		return currentRequest?.document?.toLowerCase().includes("cav");
	};

	// Function to get file extension
	const getFileExtension = (filename) => {
		return filename.split(".").pop().toLowerCase();
	};

	// Function to check if file is an image
	const isImageFile = (filename) => {
		const imageExtensions = ["jpg", "jpeg", "png", "gif"];
		return imageExtensions.includes(getFileExtension(filename));
	};

	// Image zoom handlers - updated to work with attachment objects
	const openImageZoom = (attachment) => {
		setSelectedImage(attachment);
		setImageZoom(1);
	};

	const closeImageZoom = () => {
		setSelectedImage(null);
		setImageZoom(1);
	};

	const zoomIn = () => {
		setImageZoom((prev) => Math.min(prev + 0.25, 3));
	};

	const zoomOut = () => {
		setImageZoom((prev) => Math.max(prev - 0.25, 0.5));
	};

	const resetZoom = () => {
		setImageZoom(1);
	};

	const fetchStudentInfo = async () => {
		if (isDiplomaRequest() || isCertificateRequest() || isCavRequest()) {
			try {
				const studentData = await getStudentInfo(currentRequest.id);
				if (studentData && !studentData.error) {
					setStudentInfo(studentData);
				}
			} catch (error) {
				console.error("Failed to fetch student info:", error);
			}
		}
	};

	const fetchReleaseSchedule = async () => {
		try {
			const scheduleData = await getReleaseSchedule(currentRequest.id);
			if (scheduleData && !scheduleData.error) {
				setReleaseSchedule(scheduleData);
			} else {
				setReleaseSchedule(null);
			}
		} catch (error) {
			console.error("Failed to fetch release schedule:", error);
			setReleaseSchedule(null);
		}
	};

	const fetchRequestOwner = async () => {
		try {
			console.log("Fetching request owner for request ID:", currentRequest.id);
			const ownerData = await getRequestOwner(currentRequest.id);
			console.log("Owner data received:", ownerData);
			if (ownerData && ownerData.success) {
				setRequestOwner(ownerData);
				console.log("Request owner set:", ownerData);
			} else {
				setRequestOwner(null);
				console.log("No owner data, setting to null");
			}
		} catch (error) {
			console.error("Failed to fetch request owner:", error);
			setRequestOwner(null);
		}
	};

	// Detect if this CAV request is part of a combined request with Diploma on the same date (no attachments yet)
	const detectCombinedCavDiploma = async () => {
		try {
			if (!currentRequest || !isCavRequest()) {
				setDoubleRequestNote(null);
				return;
			}

			// Load all requests for this student
			// We need the studentId, but currentRequest only has requestId. The API getUserRequests expects userId (studentId)
			// currentRequest does not include studentId here, so we infer via getStudentInfo endpoint we already called (which returned student data)
			// However getStudentInfo in registrar utils takes requestId and returns student info including id, strand, etc.
			// We already set studentInfo in fetchStudentInfo(). Use it if available.

			// If studentInfo not yet loaded, skip
			if (!studentInfo || !studentInfo.id) {
				setDoubleRequestNote(null);
				return;
			}

			const allRequests = await getUserRequests(studentInfo.id);
			if (!Array.isArray(allRequests)) {
				setDoubleRequestNote(null);
				return;
			}

			// Find requests on the same date for Diploma and CAV
			const sameDay = (a, b) =>
				String(a.dateRequested) === String(b.dateRequested);
			const isDiploma = (r) =>
				(r.document || "").toLowerCase().includes("diploma");
			const isCav = (r) => (r.document || "").toLowerCase().includes("cav");

			const thisReq = allRequests.find(
				(r) => Number(r.id) === Number(currentRequest.id)
			);
			if (!thisReq) {
				setDoubleRequestNote(null);
				return;
			}

			const pairedDiploma = allRequests.find(
				(r) => isDiploma(r) && sameDay(r, thisReq)
			);

			// Show note only when attachments of current CAV are empty AND there is a paired Diploma same-day
			if (pairedDiploma && attachments.length === 0) {
				setDoubleRequestNote({
					pairedDiplomaId: pairedDiploma.id,
					date: thisReq.dateRequested,
				});
			} else {
				setDoubleRequestNote(null);
			}
		} catch (e) {
			console.error("Failed to detect combined CAV+Diploma request", e);
			setDoubleRequestNote(null);
		}
	};

	// Fetch attachments when modal opens
	useEffect(() => {
		if (isOpen && currentRequest) {
			const fetchAttachments = async () => {
				try {
					const attachmentsData = await getRequestAttachments(
						currentRequest.id
					);
					if (Array.isArray(attachmentsData)) {
						// Store the full attachment objects with requirement types
						setAttachments(attachmentsData);
					}
				} catch (error) {
					console.error("Failed to fetch attachments:", error);
					// Fallback to single attachment if available
					if (currentRequest.attachment) {
						setAttachments([
							{
								filepath: currentRequest.attachment,
								requirementType: "Unknown",
							},
						]);
					}
				}
			};

			const fetchStudentDocuments = async () => {
				try {
					const documentsData = await getStudentDocuments(currentRequest.id);
					if (Array.isArray(documentsData)) {
						setStudentDocuments(documentsData);
					}
				} catch (error) {
					console.error("Failed to fetch student documents:", error);
					setStudentDocuments([]);
				}
			};

			fetchAttachments();
			fetchStudentDocuments();
			fetchStudentInfo();
			fetchReleaseSchedule();
			fetchRequestOwner();
			detectCombinedCavDiploma(); // Call detectCombinedCavDiploma here
		}
	}, [isOpen, currentRequest]);

	// Re-run detection when data changes
	useEffect(() => {
		if (isOpen) {
			detectCombinedCavDiploma();
		}
	}, [isOpen, currentRequest, attachments, studentInfo]);

	const handleProcess = async () => {
		setProcessing(true);
		try {
			const currentStatus = currentRequest.status.toLowerCase();
			let response;
			let newStatus;

			// Check ownership before proceeding
			const isOwner =
				!requestOwner || !requestOwner.owner || requestOwner.ownerId === userId;
			const isPending = currentStatus === "pending";

			// If not the owner and not pending, show access denied
			if (!isOwner && !isPending) {
				toast.error(
					`Access denied. This request is being processed by ${
						requestOwner?.owner || "another registrar"
					}`
				);
				setProcessing(false);
				onClose();
				return;
			}

			if (currentStatus === "signatory") {
				// For Signatory status, directly show release schedule modal
				// Don't change status yet - wait for user to set release date
				setShowReleaseSchedule(true);
				setProcessing(false);
				return;
			} else {
				// For other statuses, use the regular processRequest
				response = await processRequest(currentRequest.id, userId);
				if (response.success) {
					toast.success(response.message);

					// Update the local request status based on current status
					switch (currentStatus) {
						case "pending":
							newStatus = "Processed";
							break;
						case "processed":
							newStatus = "Signatory";
							break;
						case "release":
							newStatus = "Completed";
							break;
						default:
							newStatus = currentRequest.status;
					}

					// Update the local currentRequest state
					setCurrentRequest((prev) => ({
						...prev,
						status: newStatus,
					}));

					// Refresh data for status changes
					onSuccess();
				} else {
					// Handle error from processRequest
					if (response.processedBy) {
						toast.error(
							`${response.error} (Processed by: ${response.processedBy})`
						);
						onSuccess();
						setProcessing(false);
						onClose(); // Close the modal when access is denied
					} else {
						toast.error(response.error || "Failed to process request");
					}
				}
			}
		} catch (error) {
			console.error("Failed to process request:", error);
			toast.error("Failed to process request");
		} finally {
			setProcessing(false);
		}
	};

	const handleDiplomaSave = async (diplomaData) => {
		try {
			const updateResponse = await updateStudentInfo(
				currentRequest.id,
				diplomaData.lrn,
				diplomaData.strandId,
				diplomaData.firstname,
				diplomaData.middlename,
				diplomaData.lastname,
				userId
			);

			if (updateResponse.success) {
				toast.success("Diploma information saved successfully!");
				// Refresh the student information to show updated data
				await fetchStudentInfo();
				onSuccess();
			} else {
				if (updateResponse.processedBy) {
					toast.error(
						`${updateResponse.error} (Processed by: ${updateResponse.processedBy})`
					);
					onClose(); // Close the modal when access is denied
				} else {
					toast.error(
						updateResponse.error || "Failed to save diploma information"
					);
				}
			}
		} catch (error) {
			console.error("Failed to save diploma:", error);
			toast.error("Failed to save diploma information");
		} finally {
			setProcessing(false);
		}
	};

	const handleCertificateSave = async (certificateData) => {
		try {
			const updateResponse = await updateStudentInfo(
				currentRequest.id,
				certificateData.lrn,
				certificateData.strandId,
				certificateData.firstname,
				certificateData.middlename,
				certificateData.lastname,
				userId
			);

			if (updateResponse.success) {
				toast.success("Certificate information saved successfully!");
				// Refresh the student information to show updated data
				await fetchStudentInfo();
				onSuccess();
			} else {
				if (updateResponse.processedBy) {
					toast.error(
						`${updateResponse.error} (Processed by: ${updateResponse.processedBy})`
					);
					onClose(); // Close the modal when access is denied
				} else {
					toast.error(
						updateResponse.error || "Failed to save certificate information"
					);
				}
			}
		} catch (error) {
			console.error("Failed to save certificate:", error);
			toast.error("Failed to save certificate information");
		} finally {
			setProcessing(false);
		}
	};

	const handleCavSave = async (cavData) => {
		try {
			const updateResponse = await updateStudentInfo(
				currentRequest.id,
				cavData.lrn,
				cavData.strandId,
				cavData.firstname,
				cavData.middlename,
				cavData.lastname,
				userId
			);

			if (updateResponse.success) {
				toast.success("CAV information saved successfully!");
				// Refresh the student information to show updated data
				await fetchStudentInfo();
				onSuccess();
			} else {
				if (updateResponse.processedBy) {
					toast.error(
						`${updateResponse.error} (Processed by: ${updateResponse.processedBy})`
					);
					onClose(); // Close the modal when access is denied
				} else {
					toast.error(updateResponse.error || "Failed to save CAV information");
				}
			}
		} catch (error) {
			console.error("Failed to save CAV:", error);
			toast.error("Failed to save CAV information");
		} finally {
			setProcessing(false);
		}
	};

	const handleDiplomaCancel = () => {
		setShowDiplomaTemplate(false);
	};

	const handleCertificateCancel = () => {
		setShowCertificateTemplate(false);
	};

	const handleCavCancel = () => {
		setShowCavTemplate(false);
	};

	const handleReleaseScheduleClose = () => {
		setShowReleaseSchedule(false);
	};

	const handleReleaseScheduleSuccess = async () => {
		try {
			// First, change the status to Release
			const response = await processRelease(currentRequest.id, userId);
			if (response.success) {
				toast.success("Document released successfully!");

				// Update local status to Release
				setCurrentRequest((prev) => ({
					...prev,
					status: "Release",
				}));

				// Fetch the release schedule
				await fetchReleaseSchedule();

				// Close the release schedule modal
				setShowReleaseSchedule(false);

				// Refresh the parent data
				onSuccess();
			} else {
				if (response.processedBy) {
					toast.error(
						`${response.error} (Processed by: ${response.processedBy})`
					);
					onClose(); // Close the modal when access is denied
				} else {
					toast.error(response.error || "Failed to release document");
				}
			}
		} catch (error) {
			console.error("Failed to release document:", error);
			toast.error("Failed to release document");
		}
	};

	// Requirement comment handlers
	const handleAddComment = (requirement) => {
		setSelectedRequirement(requirement);
		setShowCommentModal(true);
	};

	const handleCommentSuccess = () => {
		// Close the comment modal first
		setShowCommentModal(false);
		setSelectedRequirement(null);

		// Force refresh of comments section by updating a key
		setCommentsRefreshKey((prev) => prev + 1);

		// Also try to refresh via ref if available
		if (
			commentsRefreshRef.current &&
			commentsRefreshRef.current.fetchComments
		) {
			commentsRefreshRef.current.fetchComments();
		}

		onSuccess();
	};

	const handleCommentClose = () => {
		setShowCommentModal(false);
		setSelectedRequirement(null);
	};

	// Ref for refreshing comments
	const commentsRefreshRef = useRef();

	// Key to force refresh of comments section
	const [commentsRefreshKey, setCommentsRefreshKey] = useState(0);

	// Function to get button text and color based on status
	const getButtonConfig = () => {
		if (!currentRequest || !currentRequest.status) {
			return {
				text: processing ? "Processing..." : "Process Request",
				bgColor: "bg-green-600 hover:bg-green-700",
				disabled: false,
			};
		}

		const statusName = currentRequest.status.toLowerCase();

		// Check ownership - if request has an owner and current user is not the owner, disable button
		const isOwner =
			!requestOwner || !requestOwner.owner || requestOwner.ownerId === userId;
		const isPending = statusName === "pending";

		// Check if student documents are required and available for pending status
		// For diploma, certificate, and CAV requests, we don't need existing documents since we generate a template
		const hasRequiredDocuments =
			statusName !== "pending" ||
			studentDocuments.length > 0 ||
			isDiplomaRequest() ||
			isCertificateRequest() ||
			isCavRequest();

		// If not the owner and not pending, show access denied
		if (!isOwner && !isPending) {
			return {
				text: "Access Denied",
				bgColor: "bg-red-600 hover:bg-red-700",
				disabled: true,
			};
		}

		switch (statusName) {
			case "cancelled":
				return {
					text: "Request Cancelled",
					bgColor: "bg-gray-400",
					disabled: true,
				};
			case "pending":
				// Always show 'Mark as Processed' for diploma, certificate, and CAV requests
				const buttonText = isDiplomaRequest()
					? "Mark as Processed"
					: isCertificateRequest()
					? "Mark as Processed"
					: isCavRequest()
					? "Mark as Processed"
					: "Mark as Processed";

				return {
					text: processing ? "Processing..." : buttonText,
					bgColor: hasRequiredDocuments
						? "bg-green-600 hover:bg-green-700"
						: "bg-gray-400",
					disabled: !hasRequiredDocuments || processing,
				};
			case "processed":
				return {
					text: processing ? "Processing..." : "Proceed to Signatory",
					bgColor: "bg-blue-600 hover:bg-blue-700",
					disabled: processing,
				};
			case "signatory":
				return {
					text: processing ? "Processing..." : "Set Release Schedule",
					bgColor: "bg-green-600 hover:bg-green-700",
					disabled: processing,
				};
			case "release":
				return {
					text: processing ? "Processing..." : "Mark as Completed",
					bgColor: "bg-orange-600 hover:bg-orange-700",
					disabled: processing,
				};
			case "completed":
				return {
					text: "Document Completed",
					bgColor: "bg-gray-400",
					disabled: true,
				};
			default:
				return {
					text: processing ? "Processing..." : "Process Request",
					bgColor: hasRequiredDocuments
						? "bg-green-600 hover:bg-green-700"
						: "bg-gray-400",
					disabled: !hasRequiredDocuments || processing,
				};
		}
	};

	const buttonConfig = getButtonConfig();

	// Function to get status styling based on status
	const getStatusStyling = () => {
		if (!currentRequest || !currentRequest.status) {
			return {
				bgColor: "bg-gray-50",
				borderColor: "border-gray-200",
				dotColor: "bg-gray-500",
				textColor: "text-gray-700",
				titleColor: "text-gray-800",
			};
		}

		const statusName = currentRequest.status.toLowerCase();

		switch (statusName) {
			case "pending":
				return {
					bgColor: "bg-yellow-50",
					borderColor: "border-yellow-200",
					dotColor: "bg-yellow-500",
					textColor: "text-yellow-700",
					titleColor: "text-yellow-800",
				};
			case "processed":
				return {
					bgColor: "bg-green-50",
					borderColor: "border-green-200",
					dotColor: "bg-green-500",
					textColor: "text-green-700",
					titleColor: "text-green-800",
				};
			case "signatory":
				return {
					bgColor: "bg-blue-50",
					borderColor: "border-blue-200",
					dotColor: "bg-blue-500",
					textColor: "text-blue-700",
					titleColor: "text-blue-800",
				};
			case "release":
			case "completed":
				return {
					bgColor: "bg-purple-50",
					borderColor: "border-purple-200",
					dotColor: "bg-purple-500",
					textColor: "text-purple-700",
					titleColor: "text-purple-800",
				};
			default:
				return {
					bgColor: "bg-gray-50",
					borderColor: "border-gray-200",
					dotColor: "bg-gray-500",
					textColor: "text-gray-700",
					titleColor: "text-gray-800",
				};
		}
	};

	// Format release date
	const formatReleaseDate = (dateString) => {
		if (!dateString) return "";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	// Friendly short date-time (e.g., "Aug 20, 08:13 AM")
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

	if (!isOpen || !currentRequest) return null;

	return (
		<>
			<div className="flex fixed inset-0 z-50 justify-center items-center p-1 backdrop-blur-sm bg-black/50 sm:p-4">
				<div className="relative w-full max-w-md sm:max-w-2xl lg:max-w-4xl bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl shadow-2xl max-h-[98vh] sm:max-h-[90vh] overflow-hidden">
					{/* Header */}
					<div className="flex justify-between items-center px-4 py-3 text-white bg-[#5409DA] sm:px-6 sm:py-4">
						<div className="flex gap-2 items-center sm:gap-3">
							<FileText className="w-5 h-5 sm:w-6 sm:h-6" />
							<h2 className="text-base font-semibold sm:text-xl">
								Document Request Details
							</h2>
						</div>
						<button
							onClick={onClose}
							className="p-1.5 sm:p-2 text-white bg-transparent hover:text-gray-200 rounded-full transition-colors"
							aria-label="Close"
						>
							<X className="w-5 h-5" />
						</button>
					</div>

					{/* Scrollable Content */}
					<div className="overflow-y-auto max-h-[calc(98vh-120px)] sm:max-h-[calc(90vh-140px)]">
						<div className="p-4 space-y-4 sm:p-6 sm:space-y-6">
							{/* Request Information */}
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								{/* Student Info */}
								<div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700">
									<div className="flex gap-3 items-center mb-3">
										<User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
										<span className="text-sm font-medium text-slate-600 dark:text-slate-300">
											Student
										</span>
									</div>
									<p className="text-lg font-semibold break-words text-slate-900 dark:text-white">
										{currentRequest.student}
									</p>
								</div>

								{/* Document Info */}
								<div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700">
									<div className="flex gap-3 items-center mb-3">
										<FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
										<span className="text-sm font-medium text-slate-600 dark:text-slate-300">
											Document
										</span>
									</div>
									<p className="text-lg font-semibold break-words text-slate-900 dark:text-white">
										{currentRequest.document}
									</p>
								</div>

								{/* Date Requested */}
								<div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700">
									<div className="flex gap-3 items-center mb-3">
										<Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
										<span className="text-sm font-medium text-slate-600 dark:text-slate-300">
											Date Requested
										</span>
									</div>
									<p className="text-lg font-semibold text-slate-900 dark:text-white">
										{formatShortDateTime(currentRequest.dateRequested)}
									</p>
								</div>

								{/* Current Status */}
								<div
									className={`rounded-lg p-4 border ${
										getStatusStyling().bgColor
									} ${getStatusStyling().borderColor}`}
								>
									<div className="flex gap-3 items-center mb-3">
										<div
											className={`w-3 h-3 rounded-full ${
												getStatusStyling().dotColor
											}`}
										></div>
										<span
											className={`text-sm font-medium ${
												getStatusStyling().textColor
											}`}
										>
											Current Status
										</span>
									</div>
									<p
										className={`text-lg font-semibold ${
											getStatusStyling().titleColor
										}`}
									>
										{currentRequest.status}
									</p>
								</div>
							</div>

							{/* Request Owner Information */}
							{requestOwner && requestOwner.owner ? (
								<div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700">
									<div className="flex gap-3 items-center mb-3">
										<User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
										<span className="text-sm font-medium text-blue-700 dark:text-blue-300">
											Processed by
										</span>
									</div>
									<div className="mb-2 text-sm text-blue-600 dark:text-blue-400">
										<strong>Registrar:</strong> {requestOwner.owner}
									</div>
									{requestOwner.processedAt && (
										<div className="text-xs text-blue-600 dark:text-blue-400">
											<strong>Started processing:</strong>{" "}
											{formatShortDateTime(requestOwner.processedAt)}
										</div>
									)}
									{/* Show if current user is the owner or not */}
									<div className="mt-2 text-xs">
										{requestOwner.ownerId === userId ? (
											<span className="inline-flex items-center gap-1 px-2 py-1 text-green-800 bg-green-100 rounded-full dark:text-green-400 dark:bg-green-900/20">
												✅ You are processing this request
											</span>
										) : (
											<span className="inline-flex items-center gap-1 px-2 py-1 text-orange-800 bg-orange-100 rounded-full dark:text-orange-400 dark:bg-orange-900/20">
												⚠️ This request is being processed by another registrar
											</span>
										)}
									</div>
								</div>
							) : currentRequest?.status?.toLowerCase() === "pending" ? (
								<div className="p-4 bg-green-50 rounded-lg border-2 border-green-200 dark:bg-green-900/20 dark:border-green-700">
									<div className="flex gap-3 items-center mb-3">
										<User className="w-5 h-5 text-green-600 dark:text-green-400" />
										<span className="text-sm font-medium text-green-700 dark:text-green-300">
											Available for Processing
										</span>
									</div>
									<div className="mb-2 text-sm text-green-600 dark:text-green-400">
										This request is available for any registrar to process.
									</div>
									<div className="text-xs">
										<span className="inline-flex items-center gap-1 px-2 py-1 text-green-800 bg-green-100 rounded-full dark:text-green-400 dark:bg-green-900/20">
											🆕 Ready to be processed
										</span>
									</div>
								</div>
							) : null}

							{/* Expected Release Date Information - Show different wording for Completed status */}
							{currentRequest?.expectedReleaseDateFormatted && (
								<div
									className={`p-4 rounded-lg border-2 ${
										currentRequest.status?.toLowerCase() === "completed"
											? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700"
											: currentRequest.daysRemaining >= 0
											? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
											: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700"
									}`}
								>
									<div className="flex gap-3 items-center mb-3">
										<Clock
											className={`w-5 h-5 ${
												currentRequest.status?.toLowerCase() === "completed"
													? "text-green-600 dark:text-green-400"
													: currentRequest.daysRemaining >= 0
													? "text-blue-600 dark:text-blue-400"
													: "text-red-600 dark:text-red-400"
											}`}
										/>
										<span
											className={`text-sm font-medium ${
												currentRequest.status?.toLowerCase() === "completed"
													? "text-green-700 dark:text-green-300"
													: currentRequest.daysRemaining >= 0
													? "text-blue-700 dark:text-blue-300"
													: "text-red-700 dark:text-red-300"
											}`}
										>
											{currentRequest.status?.toLowerCase() === "completed"
												? "Released Date"
												: "Expected Release Date"}
										</span>
									</div>
									<div
										className={`mb-3 text-sm ${
											currentRequest.status?.toLowerCase() === "completed"
												? "text-green-600 dark:text-green-400"
												: currentRequest.daysRemaining >= 0
												? "text-blue-600 dark:text-blue-400"
												: "text-red-600 dark:text-red-400"
										}`}
									>
										<strong>
											{currentRequest.status?.toLowerCase() === "completed"
												? "Released Date:"
												: "Expected Date:"}{" "}
										</strong>
										{currentRequest.expectedReleaseDateFormatted}
									</div>
									{currentRequest.status?.toLowerCase() !== "completed" && (
										<>
											<div
												className={`text-sm ${
													currentRequest.daysRemaining >= 0
														? "text-blue-600 dark:text-blue-400"
														: "text-red-600 dark:text-red-400"
												}`}
											>
												{currentRequest.daysRemaining === 0 ? (
													<span className="font-medium">
														📅 Expected release: Today!
													</span>
												) : currentRequest.daysRemaining > 0 ? (
													<span>
														⏱️{" "}
														<span className="font-medium">
															{currentRequest.daysRemaining}{" "}
															{currentRequest.daysRemaining === 1
																? "day"
																: "days"}{" "}
															remaining
														</span>
													</span>
												) : (
													<span className="font-medium">
														⚠️ {Math.abs(currentRequest.daysRemaining)}{" "}
														{Math.abs(currentRequest.daysRemaining) === 1
															? "day"
															: "days"}{" "}
														overdue
													</span>
												)}
											</div>
											<div
												className={`mt-3 text-xs ${
													currentRequest.daysRemaining >= 0
														? "text-blue-600 dark:text-blue-400"
														: "text-red-600 dark:text-red-400"
												}`}
											>
												<strong>Note:</strong> Based on{" "}
												{currentRequest.expectedDays || 7} days processing time
												from request date.
												{!releaseSchedule &&
													currentRequest.daysRemaining < 0 && (
														<span className="block mt-1 font-medium">
															⚠️ This request is overdue. Please prioritize or
															schedule release date.
														</span>
													)}
											</div>
										</>
									)}
								</div>
							)}

							{/* Release Schedule Information - Hide for Completed status since we show actual completion date above */}
							{releaseSchedule &&
								currentRequest?.status?.toLowerCase() !== "completed" && (
									<div className="p-4 bg-green-50 rounded-lg border-2 border-green-200 dark:bg-green-900/20 dark:border-green-700">
										<div className="flex gap-3 items-center mb-3">
											<Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
											<span className="text-sm font-medium text-green-700 dark:text-green-300">
												{currentRequest?.status?.toLowerCase() === "completed"
													? "Release Information"
													: "Release Schedule"}
											</span>
										</div>
										<div className="mb-3 text-sm text-green-600 dark:text-green-400">
											<strong>
												{currentRequest?.status?.toLowerCase() === "completed"
													? "Released Date:"
													: "Release Date:"}{" "}
											</strong>
											{formatReleaseDate(releaseSchedule.dateSchedule)}
										</div>
										{currentRequest?.status?.toLowerCase() !== "completed" && (
											<>
												<div className="text-xs text-green-600 dark:text-green-400">
													<strong>Office Hours:</strong> 8:00 AM - 5:00 PM
													(Monday to Friday)
												</div>
												<div className="mt-3 text-xs text-green-600 dark:text-green-400">
													<strong>Note:</strong> Student has been notified via
													email about the release schedule.
												</div>
											</>
										)}
									</div>
								)}

							{/* Purpose */}
							{currentRequest?.displayPurpose &&
								currentRequest.displayPurpose !== "No purpose specified" && (
									<div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700">
										<div className="flex gap-3 items-center mb-3">
											<MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
											<span className="text-sm font-medium text-slate-600 dark:text-slate-300">
												Purpose
											</span>
										</div>
										<p className="text-base leading-relaxed break-words text-slate-900 dark:text-white">
											{currentRequest.displayPurpose}
										</p>
										{/* Show source of purpose information */}
										{currentRequest.purpose ? (
											<p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
												📝 Custom purpose entered by student
											</p>
										) : (
											<p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
												✅ Predefined purposes from document requirements
											</p>
										)}
									</div>
								)}

							{/* Student Documents */}
							{!isDiplomaRequest() &&
								!isCertificateRequest() &&
								!isCavRequest() && (
									<StudentDocumentsSection
										studentDocuments={studentDocuments}
										request={currentRequest}
									/>
								)}

							{/* Diploma Template Info - Show for diploma requests */}
							{isDiplomaRequest() && (
								<div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200 border-dashed dark:bg-blue-900/20 dark:border-blue-700">
									<div className="flex gap-3 items-center mb-3">
										<FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
										<span className="text-sm font-medium text-blue-700 dark:text-blue-300">
											Diploma Template Ready
										</span>
									</div>
									<div className="mb-2 text-sm text-blue-600 dark:text-blue-400">
										A diploma template will be generated for this student. Click
										"Generate Diploma Template" to review and edit the student
										information before processing.
									</div>
									{studentInfo && (
										<div className="p-3 mt-3 bg-white rounded border border-blue-200 dark:bg-slate-800 dark:border-blue-600">
											<div className="mb-2 text-xs font-medium text-blue-600 dark:text-blue-400">
												Current Student Information:
											</div>
											<div className="grid grid-cols-2 gap-2 text-xs text-slate-900 dark:text-white">
												<div>
													<span className="font-medium">Name:</span>{" "}
													{studentInfo.firstname} {studentInfo.middlename}{" "}
													{studentInfo.lastname}
												</div>
												<div>
													<span className="font-medium">LRN:</span>{" "}
													{studentInfo.lrn || "Not set"}
												</div>
												<div>
													<span className="font-medium">Track:</span>{" "}
													{studentInfo.track || "Not set"}
												</div>
												<div>
													<span className="font-medium">Strand:</span>{" "}
													{studentInfo.strand || "Not set"}
												</div>
											</div>
										</div>
									)}
									{/* Generate Diploma Template Button */}
									<Button
										onClick={() => setShowDiplomaTemplate(true)}
										className="mt-3 text-white bg-blue-600 hover:bg-blue-700"
									>
										Generate Diploma Template
									</Button>
								</div>
							)}

							{/* Certificate Template Info - Show for certificate requests */}
							{isCertificateRequest() && (
								<div className="p-4 bg-green-50 rounded-lg border-2 border-green-200 border-dashed dark:bg-green-900/20 dark:border-green-700">
									<div className="flex gap-3 items-center mb-3">
										<FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
										<span className="text-sm font-medium text-green-700 dark:text-green-300">
											Certificate of Enrollment Template Ready
										</span>
									</div>
									<div className="mb-2 text-sm text-green-600 dark:text-green-400">
										A certificate of enrollment template will be generated for
										this student. Click "Generate Certificate Template" to
										review and edit the student information before processing.
									</div>
									{studentInfo && (
										<div className="p-3 mt-3 bg-white rounded border border-green-200 dark:bg-slate-800 dark:border-green-600">
											<div className="mb-2 text-xs font-medium text-green-600 dark:text-green-400">
												Current Student Information:
											</div>
											<div className="grid grid-cols-2 gap-2 text-xs text-slate-900 dark:text-white">
												<div>
													<span className="font-medium">Name:</span>{" "}
													{studentInfo.firstname} {studentInfo.middlename}{" "}
													{studentInfo.lastname}
												</div>
												<div>
													<span className="font-medium">LRN:</span>{" "}
													{studentInfo.lrn || "Not set"}
												</div>
												<div>
													<span className="font-medium">Track:</span>{" "}
													{studentInfo.track || "Not set"}
												</div>
												<div>
													<span className="font-medium">Strand:</span>{" "}
													{studentInfo.strand || "Not set"}
												</div>
											</div>
										</div>
									)}
									{/* Generate Certificate Template Button */}
									<Button
										onClick={() => setShowCertificateTemplate(true)}
										className="mt-3 text-white bg-green-600 hover:bg-green-700"
									>
										Generate Certificate Template
									</Button>
								</div>
							)}

							{/* CAV Template Info - Show for CAV requests */}
							{isCavRequest() && (
								<div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200 border-dashed dark:bg-purple-900/20 dark:border-purple-700">
									<div className="flex gap-3 items-center mb-3">
										<FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
										<span className="text-sm font-medium text-purple-700 dark:text-purple-300">
											CAV Template Ready
										</span>
									</div>
									<div className="mb-2 text-sm text-purple-600 dark:text-purple-400">
										A CAV template will be generated for this student. Click
										"Generate CAV Template" to review and edit the student
										information before processing.
									</div>
									{studentInfo && (
										<div className="p-3 mt-3 bg-white rounded border border-purple-200 dark:bg-slate-800 dark:border-purple-600">
											<div className="mb-2 text-xs font-medium text-purple-600 dark:text-purple-400">
												Current Student Information:
											</div>
											<div className="grid grid-cols-2 gap-2 text-xs text-slate-900 dark:text-white">
												<div>
													<span className="font-medium">Name:</span>{" "}
													{studentInfo.firstname} {studentInfo.middlename}{" "}
													{studentInfo.lastname}
												</div>
												<div>
													<span className="font-medium">LRN:</span>{" "}
													{studentInfo.lrn || "Not set"}
												</div>
												<div>
													<span className="font-medium">Track:</span>{" "}
													{studentInfo.track || "Not set"}
												</div>
												<div>
													<span className="font-medium">Strand:</span>{" "}
													{studentInfo.strand || "Not set"}
												</div>
											</div>
										</div>
									)}
									{/* Generate CAV Template Button */}
									<Button
										onClick={() => setShowCavTemplate(true)}
										className="mt-3 text-white bg-purple-600 hover:bg-purple-700"
									>
										Generate CAV Template
									</Button>
								</div>
							)}

							{/* Attachments */}
							<AttachmentsSection
								attachments={attachments}
								groupByType={groupByType}
								setGroupByType={setGroupByType}
								openImageZoom={openImageZoom}
								isImageFile={isImageFile}
								requestId={currentRequest.id}
								registrarId={userId}
								onAddComment={handleAddComment}
								note={
									isCavRequest() &&
									attachments.length === 0 &&
									doubleRequestNote
										? `Note: This looks like a combined request (Diploma + CAV) submitted on ${formatShortDateTime(
												currentRequest.dateRequested
										  )}. Please process the Diploma first; once completed, proceed with the CAV.`
										: undefined
								}
							/>

							{/* Requirement Comments Section */}
							<RequirementCommentsSection
								requestId={currentRequest.id}
								onRefresh={onSuccess}
								refreshRef={commentsRefreshRef}
								refreshKey={commentsRefreshKey} // Pass the refresh key
								key={commentsRefreshKey} // Add key to force re-render
							/>
						</div>
					</div>

					{/* Actions Footer */}
					<div className="flex flex-col gap-3 px-4 py-4 border-t sm:flex-row sm:px-6 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600">
						{/* Warning message when documents are missing */}
						{buttonConfig.reason && (
							<div className="flex gap-2 items-center p-3 text-sm text-amber-700 bg-amber-50 rounded-lg border border-amber-200 dark:text-amber-300 dark:bg-amber-900/20 dark:border-amber-700">
								<span className="text-amber-600 dark:text-amber-400">⚠️</span>
								<span>{buttonConfig.reason}</span>
							</div>
						)}

						<div className="flex flex-col gap-3 w-full sm:flex-row">
							<Button
								onClick={handleProcess}
								disabled={buttonConfig.disabled}
								className={`w-full sm:flex-1 py-3 text-base font-medium text-white ${
									buttonConfig.bgColor
								} ${
									buttonConfig.disabled ? "cursor-not-allowed opacity-75" : ""
								}`}
								title={buttonConfig.reason || ""}
							>
								{buttonConfig.text}
							</Button>
							<Button
								onClick={onClose}
								variant="outline"
								className="py-3 w-full text-base font-medium sm:flex-1 bg-white dark:bg-gray-900 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-gray-800 hover:text-slate-100"
							>
								Cancel
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Image Zoom Modal */}
			{selectedImage && (
				<ImageZoomModal
					selectedImage={selectedImage}
					imageZoom={imageZoom}
					zoomIn={zoomIn}
					zoomOut={zoomOut}
					resetZoom={resetZoom}
					closeImageZoom={closeImageZoom}
				/>
			)}

			{/* Diploma Template Modal */}
			{showDiplomaTemplate && (
				<DiplomaTemplateModal
					isOpen={showDiplomaTemplate}
					onClose={handleDiplomaCancel}
					request={currentRequest}
					studentInfo={studentInfo}
					onSave={handleDiplomaSave}
					fetchStudentInfo={fetchStudentInfo}
				/>
			)}

			{/* Certificate Template Modal */}
			{showCertificateTemplate && (
				<CertificateTemplateModal
					isOpen={showCertificateTemplate}
					onClose={handleCertificateCancel}
					request={currentRequest}
					studentInfo={studentInfo}
					onSave={handleCertificateSave}
					fetchStudentInfo={fetchStudentInfo}
				/>
			)}

			{/* CAV Template Modal */}
			{showCavTemplate && (
				<CavTemplateModal
					isOpen={showCavTemplate}
					onClose={handleCavCancel}
					request={currentRequest}
					studentInfo={studentInfo}
					onSave={handleCavSave}
					fetchStudentInfo={fetchStudentInfo}
					expectedReleaseDate={currentRequest?.expectedReleaseDateFormatted}
					purposeText={currentRequest?.displayPurpose}
				/>
			)}

			{/* Release Schedule Modal */}
			{showReleaseSchedule && (
				<ReleaseScheduleModal
					isOpen={showReleaseSchedule}
					onClose={handleReleaseScheduleClose}
					request={currentRequest}
					onSuccess={handleReleaseScheduleSuccess}
					userId={userId}
				/>
			)}

			{/* Requirement Comment Modal */}
			{showCommentModal && selectedRequirement && (
				<RequirementCommentModal
					isOpen={showCommentModal}
					onClose={handleCommentClose}
					requestId={currentRequest.id}
					requirement={selectedRequirement}
					onSuccess={handleCommentSuccess}
					userId={userId}
				/>
			)}
		</>
	);
}
