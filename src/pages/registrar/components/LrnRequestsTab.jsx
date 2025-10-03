import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import {
	getForgotLrnRequests,
	processLrnRequest,
} from "../../../utils/registrar";
import toast from "react-hot-toast";
import ProcessLrnModal from "./ProcessLrnModal";

export default function LrnRequestsTab({ userId, students }) {
	const [requests, setRequests] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selectedRequest, setSelectedRequest] = useState(null);
	const [showProcessModal, setShowProcessModal] = useState(false);

	useEffect(() => {
		fetchRequests();
	}, []);

	const fetchRequests = async () => {
		try {
			const data = await getForgotLrnRequests();
			if (Array.isArray(data)) {
				setRequests(data);
			}
		} catch (error) {
			console.error("Failed to fetch requests:", error);
			toast.error("Failed to load LRN requests");
		} finally {
			setLoading(false);
		}
	};

	const handleProcess = async (requestId, studentId, lrn) => {
		try {
			const response = await processLrnRequest(
				requestId,
				userId,
				studentId,
				lrn
			);
			if (response.success) {
				toast.success("LRN request processed successfully");
				fetchRequests(); // Refresh the list
			} else {
				toast.error(response.error || "Failed to process request");
			}
		} catch (error) {
			console.error("Failed to process request:", error);
			toast.error("Failed to process request");
		}
	};

	const handleRowClick = (request) => {
		setSelectedRequest(request);
		setShowProcessModal(true);
	};

	return (
		<Card className="dark:bg-slate-800 dark:border-slate-700">
			<CardContent className="p-4 lg:p-6">
				<div className="mb-6">
					<h2 className="text-xl font-semibold text-slate-900 dark:text-white">
						LRN Retrieval Requests
					</h2>
					<p className="text-sm text-slate-500 dark:text-slate-400">
						Manage student LRN retrieval requests
					</p>
				</div>

				{loading ? (
					<div className="text-center py-4">Loading requests...</div>
				) : requests.length === 0 ? (
					<div className="text-center py-4">No pending LRN requests</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b dark:border-slate-700">
									<th className="text-left py-2 px-4">Name</th>
									<th className="text-left py-2 px-4">Email</th>
									<th className="text-left py-2 px-4">Status</th>
									<th className="text-left py-2 px-4">Requested</th>
								</tr>
							</thead>
							<tbody>
								{requests.map((request) => (
									<tr
										key={request.id}
										onClick={() =>
											!request.is_processed && handleRowClick(request)
										}
										className={`border-b dark:border-slate-700 ${
											!request.is_processed
												? "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700"
												: ""
										}`}
									>
										<td className="py-2 px-4">
											{request.firstname} {request.lastname}
										</td>
										<td className="py-2 px-4">{request.email}</td>
										<td className="py-2 px-4">
											{request.is_processed ? (
												<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
													Processed
												</span>
											) : (
												<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
													Pending
												</span>
											)}
										</td>
										<td className="py-2 px-4">
											{new Date(request.created_at).toLocaleDateString()}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</CardContent>

			{/* Process LRN Modal */}
			<ProcessLrnModal
				isOpen={showProcessModal}
				onClose={() => {
					setShowProcessModal(false);
					setSelectedRequest(null);
				}}
				request={selectedRequest}
				onProcess={handleProcess}
				students={students}
			/>
		</Card>
	);
}
