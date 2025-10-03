import React from "react";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function PurposeTab({
	purposes,
	documents,
	loading,
	onAdd,
	onEdit,
	onDelete,
}) {
	if (loading) {
		return (
			<div className="flex justify-center items-center py-8">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Header with Add Button */}
			<div className="flex justify-between items-center">
				<h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
					Purposes
				</h3>
				<button
					onClick={() => onAdd("purpose")}
					className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
				>
					<Plus className="h-4 w-4 mr-2" />
					Add Purpose
				</button>
			</div>

			{/* Table */}
			<div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg overflow-hidden">
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
						<thead className="bg-slate-50 dark:bg-slate-700">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
									Purpose Name
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
									Document
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
									Created On
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
							{purposes.length === 0 ? (
								<tr>
									<td
										colSpan="4"
										className="px-6 py-4 text-center text-sm text-slate-500 dark:text-slate-400"
									>
										No purposes found. Click "Add Purpose" to get started.
									</td>
								</tr>
							) : (
								purposes.map((purpose) => (
									<tr
										key={purpose.id}
										className="hover:bg-slate-50 dark:hover:bg-slate-700"
									>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
											{purpose.name}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
											{purpose.documentName}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
											{new Date(purpose.createdAt).toLocaleDateString()}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
											<div className="flex justify-end space-x-2">
												<button
													onClick={() => onEdit(purpose, "purpose")}
													className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
												>
													<Edit className="h-4 w-4" />
												</button>
												<button
													onClick={() => onDelete(purpose.id, "purpose")}
													className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
												>
													<Trash2 className="h-4 w-4" />
												</button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
