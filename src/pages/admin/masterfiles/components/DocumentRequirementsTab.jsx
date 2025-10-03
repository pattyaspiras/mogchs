import React, { useState } from "react";
import { Trash2, Plus, Edit, X, Check } from "lucide-react";

export default function DocumentRequirementsTab({
	documentRequirements,
	documents,
	requirementTypes,
	loading,
	onAdd,
	onDelete,
	onUpdate,
	userId,
}) {
	const [showEditModal, setShowEditModal] = useState(false);
	const [editingDocument, setEditingDocument] = useState(null);
	const [editFormData, setEditFormData] = useState({
		documentId: "",
		requirementTypeIds: [],
	});

	if (loading) {
		return (
			<div className="flex justify-center items-center py-8">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	// Group requirements by document
	const groupedRequirements = documentRequirements.reduce((acc, item) => {
		if (!acc[item.documentId]) {
			acc[item.documentId] = {
				documentId: item.documentId,
				documentName: item.documentName,
				requirements: [],
				createdAt: item.createdAt,
			};
		}
		acc[item.documentId].requirements.push({
			id: item.id,
			requirementTypeName: item.requirementTypeName,
			createdAt: item.createdAt,
		});
		return acc;
	}, {});

	const groupedArray = Object.values(groupedRequirements);

	const handleRowClick = (group) => {
		setEditingDocument(group);
		setEditFormData({
			documentId: group.documentId,
			requirementTypeIds: group.requirements
				.map((req) => {
					// Find the requirement type ID from the requirementTypes array
					const reqType = requirementTypes.find(
						(rt) => rt.nameType === req.requirementTypeName
					);
					return reqType ? reqType.id : null;
				})
				.filter(Boolean),
		});
		setShowEditModal(true);
	};

	const handleEditSubmit = async (e) => {
		e.preventDefault();

		if (onUpdate) {
			const success = await onUpdate(
				editFormData.documentId,
				editFormData.requirementTypeIds,
				userId
			);

			if (success) {
				setShowEditModal(false);
				setEditingDocument(null);
			}
		} else {
			// Fallback - just close the modal
			setShowEditModal(false);
			setEditingDocument(null);
		}
	};

	const handleDeleteDocument = () => {
		if (
			editingDocument &&
			window.confirm(
				`Are you sure you want to delete all requirements for "${editingDocument.documentName}"?`
			)
		) {
			// Delete all requirements for this document
			editingDocument.requirements.forEach((req) => {
				onDelete(req.id);
			});
			setShowEditModal(false);
			setEditingDocument(null);
		}
	};

	return (
		<>
			<div className="space-y-4">
				{/* Header with Add Button */}
				<div className="flex justify-between items-center">
					<h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
						Document Requirements
					</h3>
					<button
						onClick={onAdd}
						className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
					>
						<Plus className="h-4 w-4 mr-2" />
						Add Requirements
					</button>
				</div>

				{/* Table */}
				<div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg overflow-hidden">
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
							<thead className="bg-slate-50 dark:bg-slate-700">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
										Document
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
										Requirement Types
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
										Added On
									</th>
								</tr>
							</thead>
							<tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
								{groupedArray.length === 0 ? (
									<tr>
										<td
											colSpan="3"
											className="px-6 py-4 text-center text-sm text-slate-500 dark:text-slate-400"
										>
											No document requirements found. Click "Add Requirements"
											to get started.
										</td>
									</tr>
								) : (
									groupedArray.map((group) => (
										<tr
											key={group.documentId}
											className="hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
											onClick={() => handleRowClick(group)}
										>
											<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
												{group.documentName}
											</td>
											<td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
												<div className="space-y-1">
													{group.requirements.map((req) => (
														<div key={req.id} className="flex items-center">
															<span className="flex-1">
																{req.requirementTypeName}
															</span>
														</div>
													))}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
												{new Date(group.createdAt).toLocaleDateString()}
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			{/* Edit Modal */}
			{showEditModal && editingDocument && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4">
						{/* Header */}
						<div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
							<h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
								Edit Requirements for {editingDocument.documentName}
							</h3>
							<button
								onClick={() => {
									setShowEditModal(false);
									setEditingDocument(null);
								}}
								className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						{/* Form */}
						<form onSubmit={handleEditSubmit} className="p-6 space-y-4">
							{/* Requirement Types Selection */}
							<div>
								<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
									Requirement Types
								</label>
								<div className="max-h-48 overflow-y-auto border border-slate-300 dark:border-slate-600 rounded-md p-2">
									{requirementTypes.map((reqType) => (
										<div
											key={reqType.id}
											className="flex items-center p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded cursor-pointer"
											onClick={() => {
												const currentSelected =
													editFormData.requirementTypeIds || [];
												let newSelected;

												if (currentSelected.includes(reqType.id)) {
													newSelected = currentSelected.filter(
														(id) => id !== reqType.id
													);
												} else {
													newSelected = [...currentSelected, reqType.id];
												}

												setEditFormData({
													...editFormData,
													requirementTypeIds: newSelected,
												});
											}}
										>
											<div
												className={`w-5 h-5 border-2 rounded flex items-center justify-center mr-3 ${
													editFormData.requirementTypeIds?.includes(reqType.id)
														? "bg-blue-500 border-blue-500"
														: "border-slate-300 dark:border-slate-600"
												}`}
											>
												{editFormData.requirementTypeIds?.includes(
													reqType.id
												) && <Check className="w-3 h-3 text-white" />}
											</div>
											<span className="text-sm text-slate-700 dark:text-slate-300">
												{reqType.nameType}
											</span>
										</div>
									))}
								</div>
							</div>

							{/* Buttons */}
							<div className="flex justify-between pt-4">
								<button
									type="button"
									onClick={handleDeleteDocument}
									className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
								>
									<Trash2 className="h-4 w-4 inline mr-2" />
									Delete All
								</button>
								<div className="flex space-x-3">
									<button
										type="button"
										onClick={() => {
											setShowEditModal(false);
											setEditingDocument(null);
										}}
										className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
									>
										Cancel
									</button>
									<button
										type="submit"
										className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
									>
										<Edit className="h-4 w-4 inline mr-2" />
										Update
									</button>
								</div>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	);
}
