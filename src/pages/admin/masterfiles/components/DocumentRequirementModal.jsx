import React from "react";
import { X, Check } from "lucide-react";

export default function DocumentRequirementModal({
	showModal,
	documents,
	requirementTypes,
	formData,
	onFormDataChange,
	onSubmit,
	onCancel,
}) {
	if (!showModal) return null;

	const handleRequirementTypeToggle = (reqTypeId) => {
		const currentSelected = formData.requirementTypeIds || [];
		let newSelected;

		if (currentSelected.includes(reqTypeId)) {
			// Remove if already selected
			newSelected = currentSelected.filter((id) => id !== reqTypeId);
		} else {
			// Add if not selected
			newSelected = [...currentSelected, reqTypeId];
		}

		onFormDataChange({
			...formData,
			requirementTypeIds: newSelected,
		});
	};

	const isRequirementTypeSelected = (reqTypeId) => {
		return (formData.requirementTypeIds || []).includes(reqTypeId);
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
					<h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
						Add Document Requirements
					</h3>
					<button
						onClick={onCancel}
						className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				{/* Form */}
				<form onSubmit={onSubmit} className="p-6 space-y-4">
					{/* Document Selection */}
					<div>
						<label
							htmlFor="documentId"
							className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
						>
							Document *
						</label>
						<select
							id="documentId"
							value={formData.documentId}
							onChange={(e) =>
								onFormDataChange({
									...formData,
									documentId: e.target.value,
								})
							}
							className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100"
							required
						>
							<option value="">Select a document</option>
							{documents.map((doc) => (
								<option key={doc.id} value={doc.id}>
									{doc.name}
								</option>
							))}
						</select>
					</div>

					{/* Requirement Types Selection */}
					<div>
						<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
							Requirement Types *
						</label>
						<div className="max-h-48 overflow-y-auto border border-slate-300 dark:border-slate-600 rounded-md p-2">
							{requirementTypes.map((reqType) => (
								<div
									key={reqType.id}
									className="flex items-center p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded cursor-pointer"
									onClick={() => handleRequirementTypeToggle(reqType.id)}
								>
									<div
										className={`w-5 h-5 border-2 rounded flex items-center justify-center mr-3 ${
											isRequirementTypeSelected(reqType.id)
												? "bg-blue-500 border-blue-500"
												: "border-slate-300 dark:border-slate-600"
										}`}
									>
										{isRequirementTypeSelected(reqType.id) && (
											<Check className="w-3 h-3 text-white" />
										)}
									</div>
									<span className="text-sm text-slate-700 dark:text-slate-300">
										{reqType.nameType}
									</span>
								</div>
							))}
						</div>
						{formData.requirementTypeIds &&
							formData.requirementTypeIds.length > 0 && (
								<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
									{formData.requirementTypeIds.length} requirement type(s)
									selected
								</p>
							)}
					</div>

					{/* Buttons */}
					<div className="flex justify-end space-x-3 pt-4">
						<button
							type="button"
							onClick={onCancel}
							className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={
								!formData.documentId ||
								!formData.requirementTypeIds ||
								formData.requirementTypeIds.length === 0
							}
							className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Add{" "}
							{formData.requirementTypeIds
								? formData.requirementTypeIds.length
								: 0}{" "}
							Requirement(s)
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
