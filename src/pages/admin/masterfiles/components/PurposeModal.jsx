import React from "react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";

export default function PurposeModal({
	showModal,
	modalType,
	showEditModal,
	formData,
	documents,
	onFormDataChange,
	onSubmit,
	onCancel,
}) {
	if (!showModal || modalType !== "purpose") return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4">
				<h3 className="text-lg font-semibold mb-4">
					{showEditModal ? "Edit" : "Add"} Purpose
				</h3>
				<form onSubmit={onSubmit} className="space-y-4">
					<div>
						<Label htmlFor="name">Purpose Name</Label>
						<Input
							id="name"
							value={formData.name || ""}
							onChange={(e) =>
								onFormDataChange({ ...formData, name: e.target.value })
							}
							placeholder="Enter purpose name"
							required
						/>
					</div>
					<div>
						<Label htmlFor="documentId">Document</Label>
						<select
							id="documentId"
							value={formData.documentId || ""}
							onChange={(e) =>
								onFormDataChange({ ...formData, documentId: e.target.value })
							}
							className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-200"
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
					<div className="flex gap-3 justify-end">
						<Button type="button" variant="outline" onClick={onCancel}>
							Cancel
						</Button>
						<Button type="submit">{showEditModal ? "Update" : "Add"}</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
