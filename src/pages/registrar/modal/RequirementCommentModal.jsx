import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import { X, AlertTriangle, MessageSquare } from "lucide-react";
import { addRequirementComment } from "../../../utils/registrar";
import toast from "react-hot-toast";

export default function RequirementCommentModal({
	isOpen,
	onClose,
	requirement,
	requestId,
	onSuccess,
	userId,
}) {
	const [comment, setComment] = useState("");
	const [submitting, setSubmitting] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!comment.trim()) {
			toast.error("Please enter a comment");
			return;
		}

		setSubmitting(true);
		try {
			const registrarId = userId;

			if (!registrarId) {
				toast.error("User ID not found. Please log in again.");
				return;
			}

			const response = await addRequirementComment(
				requirement.id,
				requestId,
				registrarId,
				comment.trim()
			);

			if (response.success) {
				toast.success(
					"Comment added successfully! Student will be notified via email."
				);
				setComment("");
				onSuccess();
				onClose();
			} else {
				toast.error(response.error || "Failed to add comment");
			}
		} catch (error) {
			console.error("Failed to add comment:", error);
			toast.error("Failed to add comment");
		} finally {
			setSubmitting(false);
		}
	};

	const handleClose = () => {
		setComment("");
		onClose();
	};

	if (!isOpen || !requirement) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/50">
			<div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-lg shadow-2xl">
				{/* Header */}
				<div className="flex justify-between items-center px-4 py-3 text-white bg-red-600 rounded-t-lg">
					<div className="flex gap-2 items-center">
						<AlertTriangle className="w-5 h-5" />
						<h2 className="text-lg font-semibold">Add Requirement Comment</h2>
					</div>
					<button
						onClick={handleClose}
						className="p-1.5 text-white bg-transparent hover:text-gray-200 rounded-full transition-colors"
						aria-label="Close"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Content */}
				<div className="p-4 space-y-4">
					{/* Requirement Info */}
					<div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
						<h3 className="font-medium text-gray-900 dark:text-white mb-2">
							Requirement Details:
						</h3>
						<div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
							<p>
								<span className="font-medium">Type:</span>{" "}
								{requirement.requirementType}
							</p>
							<p>
								<span className="font-medium">File:</span>{" "}
								{requirement.filepath}
							</p>
							<p>
								<span className="font-medium">Uploaded:</span>{" "}
								{new Date(requirement.createdAt).toLocaleDateString()}
							</p>
						</div>
					</div>

					{/* Comment Form */}
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label
								htmlFor="comment"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
							>
								Comment/Issue Description
							</label>
							<textarea
								id="comment"
								value={comment}
								onChange={(e) => setComment(e.target.value)}
								rows={4}
								className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-slate-700 dark:text-white"
								placeholder="Describe the issue with this requirement... (e.g., 'File is blurry', 'Wrong document type', 'Missing information')"
								required
							/>
						</div>

						<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
							<div className="flex gap-2 items-start">
								<MessageSquare className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
								<div className="text-sm text-yellow-700 dark:text-yellow-300">
									<strong>Note:</strong> The student will receive an email
									notification about this issue and will be asked to resubmit
									the corrected requirement.
								</div>
							</div>
						</div>
					</form>
				</div>

				{/* Actions Footer */}
				<div className="flex gap-3 px-4 py-4 border-t bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-gray-600 rounded-b-lg">
					<Button
						onClick={handleClose}
						variant="outline"
						className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
					>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={submitting || !comment.trim()}
						className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{submitting ? "Adding..." : "Add Comment"}
					</Button>
				</div>
			</div>
		</div>
	);
}
