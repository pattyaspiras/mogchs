import React, { useState } from "react";
import {
	FileText,
	Paperclip,
	MessageSquare,
	AlertTriangle,
} from "lucide-react";
import { getDecryptedApiUrl } from "../../../utils/apiConfig";

const AttachmentsSection = ({
	attachments = [], // Default to empty array to prevent undefined errors
	groupByType,
	setGroupByType,
	openImageZoom,
	isImageFile,
	note,
	requestId,
	registrarId,
	onAddComment,
}) => {
	const apiUrl = getDecryptedApiUrl() || ""; // Fallback to empty string if undefined

	const groupAttachmentsByType = () => {
		const grouped = {};
		attachments.forEach((attachment) => {
			const type = attachment?.requirementType || "Unknown Type";
			if (!grouped[type]) {
				grouped[type] = [];
			}
			grouped[type].push(attachment);
		});
		return grouped;
	};

	const handleAddComment = (requirement) => {
		if (onAddComment) {
			onAddComment(requirement);
		}
	};

	// Return null if there are no attachments and no note
	if (!attachments.length && !note) return null;

	// Common component to render an attachment
	const renderAttachment = (attachment, index, type = null) => (
		<div
			key={type ? `${type}-${index}` : index}
			className="overflow-hidden bg-white rounded-lg border border-slate-200"
		>
			{isImageFile(attachment.filepath) ? (
				<div>
					<div
						className="flex overflow-hidden justify-center items-center transition-colors cursor-pointer aspect-video bg-slate-100 hover:bg-slate-200"
						onClick={() => openImageZoom(attachment)}
						title="Click to zoom"
					>
						<img
							src={`${apiUrl}/requirements/${attachment.filepath}`}
							alt={attachment.filepath}
							className="object-cover w-full h-full"
							onError={(e) => {
								e.target.style.display = "none";
								e.target.parentElement.innerHTML = `
                  <div class="flex flex-col justify-center items-center p-4 text-slate-500">
                    <svg class="mb-2 w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <span class="text-sm">Failed to load image</span>
                  </div>
                `;
							}}
						/>
					</div>
					<div className="p-2">
						<p className="mb-1 text-xs font-medium truncate text-slate-700">
							{attachment.filepath}
						</p>
						<div className="flex gap-2 items-center">
							<button
								onClick={() => openImageZoom(attachment)}
								className="text-xs font-medium text-blue-600 hover:text-blue-800"
							>
								🔍 Zoom
							</button>
							{requestId && registrarId && (
								<button
									onClick={() => handleAddComment(attachment)}
									className="text-xs font-medium text-red-600 hover:text-red-800 flex items-center gap-1"
									title="Add comment about this requirement"
								>
									<MessageSquare className="w-3 h-3" />
									Comment
								</button>
							)}
						</div>
					</div>
				</div>
			) : (
				<div className="flex gap-2 items-center p-3">
					<FileText className="flex-shrink-0 w-6 h-6 text-slate-500" />
					<div className="flex-1 min-w-0">
						<p className="mb-1 text-xs font-medium truncate text-slate-700">
							{attachment.filepath}
						</p>
						<div className="flex gap-2 items-center">
							<a
								href={`${apiUrl}/requirements/${attachment.filepath}`}
								target="_blank"
								rel="noopener noreferrer"
								className="text-xs font-medium text-blue-600 hover:text-blue-800"
							>
								📄 Open
							</a>
							{requestId && registrarId && (
								<button
									onClick={() => handleAddComment(attachment)}
									className="text-xs font-medium text-red-600 hover:text-red-800 flex items-center gap-1"
									title="Add comment about this requirement"
								>
									<MessageSquare className="w-3 h-3" />
									Comment
								</button>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);

	return (
		<>
			<div className="p-4 rounded-lg bg-slate-50">
				{note && (
					<div className="p-3 mb-3 text-sm text-purple-800 bg-purple-50 rounded-lg border border-purple-200">
						{note}
					</div>
				)}
				<div className="flex justify-between items-center mb-4">
					<div className="flex gap-3 items-center">
						<Paperclip className="w-5 h-5 text-blue-600" />
						<span className="text-sm font-medium text-slate-600">
							Attachments ({attachments.length})
						</span>
					</div>
					<div className="flex gap-2 items-center">
						{requestId && registrarId && (
							<div className="flex gap-1 items-center px-2 py-1 text-xs text-red-600 bg-red-50 rounded-full border border-red-200">
								<AlertTriangle className="w-3 h-3" />
								Add comments to notify students
							</div>
						)}
						<button
							onClick={() => setGroupByType(!groupByType)}
							className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full border border-blue-200 transition-colors hover:bg-blue-100"
						>
							{groupByType ? "List View" : "Group by Type"}
						</button>
					</div>
				</div>

				{groupByType ? (
					// Grouped view by requirement type
					<div className="space-y-4">
						{Object.entries(groupAttachmentsByType()).map(
							([type, typeAttachments]) => (
								<div
									key={type}
									className="overflow-hidden rounded-lg border border-slate-200"
								>
									<div className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-slate-200">
										<h4 className="text-sm font-semibold tracking-wide text-indigo-800 uppercase">
											{type} ({typeAttachments.length})
										</h4>
									</div>
									<div className="p-3">
										<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
											{typeAttachments.map((attachment, index) =>
												renderAttachment(attachment, index, type)
											)}
										</div>
									</div>
								</div>
							)
						)}
					</div>
				) : (
					// Regular grid view
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						{attachments.map((attachment, index) => (
							<div
								key={index}
								className="overflow-hidden bg-white rounded-lg border shadow-sm border-slate-200"
							>
								<div className="px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
									<p className="text-xs font-semibold tracking-wide text-blue-800 uppercase">
										{attachment?.requirementType || "Unknown Type"}
									</p>
								</div>
								{renderAttachment(attachment, index)}
							</div>
						))}
					</div>
				)}
			</div>
		</>
	);
};

export default AttachmentsSection;
