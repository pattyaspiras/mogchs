import React, { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Search, X } from "lucide-react";
import toast from "react-hot-toast";

export default function ProcessLrnModal({
	isOpen,
	onClose,
	request,
	onProcess,
	students,
}) {
	const [loading, setLoading] = useState(false);
	const [searchResults, setSearchResults] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [loadingType, setLoadingType] = useState(null); // 'searching' or 'processing'

	// Initialize search term with request name
	useEffect(() => {
		if (request) {
			setSearchTerm(`${request.firstname} ${request.lastname}`);
			handleSearch(`${request.firstname} ${request.lastname}`);
		}
	}, [request]);

	const handleSearch = (term) => {
		if (!term.trim()) {
			setSearchResults([]);
			return;
		}

		setLoadingType("searching");

		// Filter students locally
		const searchTerms = term.toLowerCase().split(" ");
		const results = students.filter((student) => {
			const fullName = `${student.firstname} ${student.lastname}`.toLowerCase();
			return searchTerms.every((term) => fullName.includes(term));
		});

		setSearchResults(results.slice(0, 10)); // Limit to 10 results
		setLoadingType(null);
	};

	const handleSelectStudent = async (studentId, lrn) => {
		setLoadingType("processing");
		try {
			await onProcess(request.id, studentId, lrn);
			onClose();
		} catch (error) {
			console.error("Failed to process request:", error);
			toast.error("Failed to process request");
		} finally {
			setLoadingType(null);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black/50 backdrop-blur-sm"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="relative z-50 w-full max-w-[600px] bg-white dark:bg-slate-900 rounded-lg shadow-xl p-6">
				{/* Close button */}
				<button
					onClick={onClose}
					className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
				>
					<X className="w-5 h-5" />
				</button>

				{/* Header */}
				<div className="mb-6">
					<h2 className="text-2xl font-bold text-slate-900 dark:text-white">
						Process LRN Request
					</h2>
				</div>

				{/* Content */}
				<div>
					{/* Request Details */}
					<div className="mb-6">
						<h3 className="text-lg font-semibold text-slate-900 dark:text-white">
							Request Details
						</h3>
						<div className="mt-2 space-y-2 text-slate-700 dark:text-slate-300">
							<p>
								<span className="font-medium">Name:</span> {request?.firstname}{" "}
								{request?.lastname}
							</p>
							<p>
								<span className="font-medium">Email:</span> {request?.email}
							</p>
							<p>
								<span className="font-medium">Requested:</span>{" "}
								{request?.created_at &&
									new Date(request.created_at).toLocaleDateString()}
							</p>
						</div>
					</div>

					{/* Search Section */}
					<div className="mb-6">
						<div className="flex items-center gap-2 mb-4">
							<Input
								placeholder="Search student by name..."
								value={searchTerm}
								onChange={(e) => {
									setSearchTerm(e.target.value);
									handleSearch(e.target.value);
								}}
								className="flex-1"
							/>
							<Button
								variant="outline"
								onClick={() => handleSearch(searchTerm)}
								disabled={loading}
							>
								<Search className="w-4 h-4" />
							</Button>
						</div>

						{loadingType === "searching" ? (
							<div className="text-center py-4 text-slate-600 dark:text-slate-400">
								Searching...
							</div>
						) : loadingType === "processing" ? (
							<div className="text-center py-4 text-slate-600 dark:text-slate-400">
								Processing request...
							</div>
						) : searchResults.length === 0 ? (
							<div className="text-center py-4 text-slate-500 dark:text-slate-400">
								No matching students found
							</div>
						) : (
							<div className="max-h-[300px] overflow-y-auto border rounded-lg dark:border-slate-700">
								<table className="w-full">
									<thead className="bg-slate-50 dark:bg-slate-800 sticky top-0">
										<tr>
											<th className="py-2 px-4 text-left font-semibold text-slate-900 dark:text-white">
												Name
											</th>
											<th className="py-2 px-4 text-left font-semibold text-slate-900 dark:text-white">
												LRN
											</th>
											<th className="py-2 px-4 text-left font-semibold text-slate-900 dark:text-white">
												Action
											</th>
										</tr>
									</thead>
									<tbody>
										{searchResults.map((student) => (
											<tr
												key={student.id}
												className="border-t dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
											>
												<td className="py-2 px-4">
													{student.firstname} {student.lastname}
												</td>
												<td className="py-2 px-4">{student.lrn}</td>
												<td className="py-2 px-4">
													<Button
														size="sm"
														onClick={() =>
															handleSelectStudent(student.id, student.lrn)
														}
													>
														Select
													</Button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>

					{/* Footer */}
					<div className="flex justify-end gap-2 pt-4 border-t dark:border-slate-700">
						<Button variant="outline" onClick={onClose}>
							Cancel
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
