import React, {
	useState,
	useEffect,
	useImperativeHandle,
	forwardRef,
} from "react";
import {
	MessageSquare,
	AlertTriangle,
	CheckCircle,
	Clock,
	User,
} from "lucide-react";
import {
	getRequirementComments,
	updateCommentStatus,
} from "../../../utils/registrar";
import toast from "react-hot-toast";

const RequirementCommentsSection = forwardRef(
	({ requestId, onRefresh, refreshKey = 0 }, ref) => {
		const [comments, setComments] = useState([]);
		const [loading, setLoading] = useState(false);

		useEffect(() => {
			if (requestId) {
				fetchComments();
			}
		}, [requestId, refreshKey]); // Add refreshKey to dependencies

		// Expose the fetchComments function to parent component
		useImperativeHandle(
			ref,
			() => ({
				fetchComments: () => {
					fetchComments();
				},
			}),
			[]
		);

		const fetchComments = async () => {
			setLoading(true);
			try {
				const response = await getRequirementComments(requestId);
				if (Array.isArray(response)) {
					setComments(response);
				} else {
					setComments([]);
				}
			} catch (error) {
				console.error("Failed to fetch comments:", error);
				setComments([]);
			} finally {
				setLoading(false);
			}
		};

		const handleStatusUpdate = async (commentId, newStatus) => {
			try {
				const response = await updateCommentStatus(commentId, newStatus);
				if (response.success) {
					toast.success("Comment status updated successfully");
					fetchComments(); // Refresh comments
					if (onRefresh) onRefresh();
				} else {
					toast.error(response.error || "Failed to update status");
				}
			} catch (error) {
				console.error("Failed to update comment status:", error);
				toast.error("Failed to update comment status");
			}
		};

		const getStatusIcon = (status) => {
			switch (status) {
				case "pending":
					return <Clock className="w-4 h-4 text-yellow-500" />;
				case "resolved":
					return <CheckCircle className="w-4 h-4 text-green-500" />;
				default:
					return <Clock className="w-4 h-4 text-gray-500" />;
			}
		};

		const getStatusColor = (status) => {
			switch (status) {
				case "pending":
					return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
				case "resolved":
					return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
				default:
					return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
			}
		};

		if (loading) {
			return (
				<div className="p-4 text-center text-gray-500 dark:text-gray-400">
					Loading comments...
				</div>
			);
		}

		if (comments.length === 0) {
			return null; // Don't show anything if no comments
		}

		return (
			<div className="space-y-4">
				<div className="flex gap-2 items-center">
					<MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
					<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
						Requirement Comments
					</h3>
				</div>

				<div className="space-y-3">
					{comments.map((comment) => (
						<div
							key={comment.id}
							className="p-4 border rounded-lg bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-600"
						>
							{/* Comment Header */}
							<div className="flex justify-between items-start mb-3">
								<div className="flex gap-2 items-center">
									<User className="w-4 h-4 text-gray-500" />
									<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
										{comment.registrarFirstName} {comment.registrarLastName}
									</span>
									<span className="text-xs text-gray-500">
										{new Date(comment.createdAt).toLocaleString()}
									</span>
								</div>
								<div className="flex gap-2 items-center">
									{getStatusIcon(comment.status)}
									<span
										className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
											comment.status
										)}`}
									>
										{comment.status}
									</span>
								</div>
							</div>

							{/* Requirement Info */}
							<div className="mb-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
								<div className="text-sm text-gray-600 dark:text-gray-300">
									<p>
										<span className="font-medium">File:</span>{" "}
										{comment.filepath}
									</p>
									<p>
										<span className="font-medium">Type:</span>{" "}
										{comment.requirementType}
									</p>
								</div>
							</div>

							{/* Comment Text */}
							<div className="mb-3">
								<div className="flex gap-2 items-start">
									<AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
									<p className="text-gray-700 dark:text-gray-300">
										{comment.comment}
									</p>
								</div>
							</div>

							{/* Actions */}
							<div className="flex justify-between items-center">
								<div className="text-xs text-gray-500">
									{comment.isNotified ? (
										<span className="text-green-600 dark:text-green-400">
											✓ Student notified
										</span>
									) : (
										<span className="text-yellow-600 dark:text-yellow-400">
											⏳ Notification pending
										</span>
									)}
								</div>

								{comment.status === "pending" && (
									<button
										onClick={() => handleStatusUpdate(comment.id, "resolved")}
										className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
									>
										Mark as Resolved
									</button>
								)}

								{comment.status === "resolved" && (
									<button
										onClick={() => handleStatusUpdate(comment.id, "pending")}
										className="px-3 py-1 text-xs bg-yellow-600 hover:bg-yellow-700 text-white rounded-md transition-colors"
									>
										Mark as Pending
									</button>
								)}
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}
);

export default RequirementCommentsSection;
