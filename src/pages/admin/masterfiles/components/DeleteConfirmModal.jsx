import React from "react";
import { Button } from "../../../../components/ui/button";
import { Trash2 } from "lucide-react";

export default function DeleteConfirmModal({
	showModal,
	deletingItem,
	onConfirm,
	onCancel,
}) {
	if (!showModal) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4">
				<div className="text-center">
					<div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
						<Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
					</div>
					<h3 className="text-lg font-semibold mb-2">Confirm Deletion</h3>
					<p className="text-slate-600 dark:text-slate-400 mb-6">
						Are you sure you want to delete this{" "}
						{deletingItem?.type === "document"
							? "document"
							: "requirement type"}
						? This action cannot be undone.
					</p>
					<div className="flex gap-3 justify-center">
						<Button type="button" variant="outline" onClick={onCancel}>
							Cancel
						</Button>
						<Button
							type="button"
							onClick={onConfirm}
							className="bg-red-600 hover:bg-red-700"
						>
							Delete
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
