import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { X, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

// You may need to adjust this import path based on your utils location
import { getRequestTracking } from "../../../utils/student";

const STATUS_STEPS = ["Pending", "Processing", "Signatories", "Completed"];

export default function TrackRequestModal({ isOpen, onClose, requestId }) {
	const [tracking, setTracking] = useState([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (isOpen && requestId) {
			setLoading(true);
			getRequestTracking(requestId)
				.then((data) => setTracking(Array.isArray(data) ? data : []))
				.finally(() => setLoading(false));
		}
	}, [isOpen, requestId]);

	// Find the latest status in the steps
	const latestStatus = tracking.length
		? tracking[tracking.length - 1].status
		: null;

	const getStepIndex = (status) =>
		STATUS_STEPS.findIndex(
			(step) => step.toLowerCase() === status?.toLowerCase()
		);

	const currentStep = getStepIndex(latestStatus);

	return (
		<Dialog open={isOpen} onOpenChange={onClose} className>
			<DialogContent>
				<div className="mb-4 text-lg font-semibold">Track Request</div>
				{loading ? (
					<div className="flex justify-center items-center py-8">
						<Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
					</div>
				) : (
					<div>
						<div className="mb-4 font-semibold">Request ID: {requestId}</div>
						<div className="flex justify-between items-center mb-6">
							{STATUS_STEPS.map((step, idx) => (
								<div key={step} className="flex flex-col flex-1 items-center">
									<div
										className={`w-8 h-8 rounded-full flex items-center justify-center mb-1
                      ${
												idx <= currentStep
													? "bg-blue-600 text-white"
													: "bg-gray-200 text-gray-400"
											}
                    `}
									>
										{idx + 1}
									</div>
									<div
										className={`text-xs font-medium ${
											idx <= currentStep ? "text-blue-700" : "text-gray-400"
										}`}
									>
										{step}
									</div>
									{/* Show date if available */}
									<div className="text-[10px] text-gray-500 mt-1">
										{tracking[idx]?.dateFormatted || ""}
									</div>
									{/* Connector line */}
									{idx < STATUS_STEPS.length - 1 && (
										<div
											className={`h-1 w-full mt-1 ${
												idx < currentStep ? "bg-blue-600" : "bg-gray-200"
											}`}
										/>
									)}
								</div>
							))}
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
