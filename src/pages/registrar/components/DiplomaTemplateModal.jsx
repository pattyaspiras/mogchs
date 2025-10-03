import React from "react";
import { X } from "lucide-react";
import DiplomaTemplate from "./DiplomaTemplate";

export default function DiplomaTemplateModal({
	isOpen,
	onClose,
	request,
	studentInfo,
	onSave,
	fetchStudentInfo,
}) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-sm bg-black/50">
			<div className="relative w-full max-w-7xl bg-white rounded-lg shadow-2xl max-h-[95vh] overflow-hidden">
				{/* Header */}
				<div className="flex justify-between items-center px-6 py-4 text-white bg-[#5409DA] border-b">
					<h2 className="text-xl font-semibold">
						Diploma Template - {request?.student}
					</h2>
					<button
						onClick={onClose}
						className="p-2 text-gray-200 bg-transparent rounded-full transition-colors dark:text-gray-200 dark:hover:text-gray-200"
						aria-label="Close"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Scrollable Content */}
				<div className="overflow-y-auto max-h-[calc(95vh-80px)]">
					<div className="p-6">
						<div className="mb-4 text-center">
							<p className="text-gray-600">
								Upload your PDF diploma template or use the default canvas-based
								template. Edit the student information and print when ready.
							</p>
						</div>

						<DiplomaTemplate
							studentInfo={studentInfo}
							onSave={onSave}
							onCancel={onClose}
							isEditable={true}
							fetchStudentInfo={fetchStudentInfo}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
