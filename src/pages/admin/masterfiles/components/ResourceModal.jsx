import React from "react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";

export default function ResourceModal({
	showModal,
	modalType,
	showEditModal,
	formData,
	onFormDataChange,
	onSubmit,
	onCancel,
}) {
	if (!showModal) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4">
				<h3 className="text-lg font-semibold mb-4">
					{showEditModal ? "Edit" : "Add"}{" "}
					{modalType === "document" ? "Document" : "Requirement Type"}
				</h3>
				<form onSubmit={onSubmit} className="space-y-4">
					<div>
						<Label htmlFor="name">
							{modalType === "document"
								? "Document Name"
								: "Requirement Type Name"}
						</Label>
						<Input
							id="name"
							value={formData.name}
							onChange={(e) =>
								onFormDataChange({ ...formData, name: e.target.value })
							}
							placeholder={`Enter ${
								modalType === "document" ? "document" : "requirement type"
							} name`}
							required
						/>
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
