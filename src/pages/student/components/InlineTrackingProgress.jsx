import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getRequestTracking } from "../../../utils/student";

const InlineTrackingProgress = ({ requestId }) => {
	const [tracking, setTracking] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showFullTimeline, setShowFullTimeline] = useState(false);

	const STATUS_STEPS = [
		{ key: "Pending", label: "Pending", shortLabel: "P", color: "yellow" },
		{ key: "Processed", label: "Processed", shortLabel: "Pr", color: "blue" },
		{ key: "Signatory", label: "Signatory", shortLabel: "S", color: "purple" },
		{ key: "Release", label: "Release", shortLabel: "R", color: "orange" },
		{ key: "Completed", label: "Completed", shortLabel: "✓", color: "green" },
	];

	useEffect(() => {
		if (requestId) {
			getRequestTracking(requestId)
				.then((data) => {
					setTracking(Array.isArray(data) ? data : []);
				})
				.catch((err) => {
					console.error("Failed to fetch tracking:", err);
				})
				.finally(() => setLoading(false));
		}
	}, [requestId]);

	if (loading) {
		return (
			<div className="flex flex-col space-y-2">
				<div className="flex overflow-x-auto items-center pb-1 space-x-1">
					{STATUS_STEPS.map((_, idx) => (
						<div key={idx} className="flex flex-shrink-0 items-center">
							<div className="flex justify-center items-center w-7 h-7 bg-gray-200 rounded-full animate-pulse dark:bg-slate-700 sm:w-8 sm:h-8">
								<div className="w-2 h-2 bg-gray-300 rounded-full dark:bg-slate-700"></div>
							</div>
							{idx < STATUS_STEPS.length - 1 && (
								<div className="w-3 sm:w-4 h-0.5 bg-gray-200 animate-pulse flex-shrink-0 dark:bg-slate-700"></div>
							)}
						</div>
					))}
				</div>
				<div className="text-xs text-gray-400 dark:text-slate-400">
					Loading timeline...
				</div>
			</div>
		);
	}

	// Find the latest status and determine current step
	const latestStatus = tracking.length
		? tracking[tracking.length - 1].status
		: null;

	const getStepIndex = (status) => {
		const normalizedStatus = status?.toLowerCase();
		return STATUS_STEPS.findIndex(
			(step) =>
				step.key.toLowerCase() === normalizedStatus ||
				(normalizedStatus === "processing" && step.key === "Processed") ||
				(normalizedStatus === "signatories" && step.key === "Signatory")
		);
	};

	const currentStep = getStepIndex(latestStatus);

	// Get tracking data for each step
	const getStepData = (stepIndex) => {
		const step = STATUS_STEPS[stepIndex];
		const trackingEntry = tracking.find(
			(t) => getStepIndex(t.status) === stepIndex
		);
		return {
			...step,
			completed: stepIndex <= currentStep,
			isCurrent: stepIndex === currentStep,
			date: trackingEntry?.createdAt || trackingEntry?.dateFormatted,
			trackingData: trackingEntry,
		};
	};

	const formatDate = (dateString) => {
		if (!dateString) return null;
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			});
		} catch {
			return dateString;
		}
	};

	const getStatusColor = (step, completed, isCurrent) => {
		if (!completed) return "bg-gray-100 border-gray-300 text-gray-400";

		if (step.color === "green") {
			return "bg-green-100 border-green-500 text-green-700";
		} else if (isCurrent) {
			return "bg-blue-100 border-blue-500 text-blue-700 ring-2 ring-blue-200";
		} else {
			return "bg-blue-50 border-blue-400 text-blue-600";
		}
	};

	return (
		<div className="flex flex-col space-y-2 w-full">
			{/* Compact Progress Steps - Horizontally Scrollable on Mobile */}
			<div className="flex overflow-x-auto items-center pb-1 space-x-1 scrollbar-hide">
				<div className="flex flex-shrink-0 items-center space-x-1">
					{STATUS_STEPS.map((step, idx) => {
						const stepData = getStepData(idx);
						return (
							<div key={step.key} className="flex flex-shrink-0 items-center">
								<div
									className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-all duration-200 flex items-center justify-center text-xs sm:text-sm font-medium border-2 cursor-pointer ${getStatusColor(
										step,
										stepData.completed,
										stepData.isCurrent
									)}`}
									onClick={() => setShowFullTimeline(!showFullTimeline)}
									title={`${step.label} - Click to ${
										showFullTimeline ? "hide" : "show"
									} full timeline`}
								>
									<span className="text-xs font-semibold">
										{step.shortLabel}
									</span>
								</div>
								{idx < STATUS_STEPS.length - 1 && (
									<div
										className={`w-3 sm:w-4 h-0.5 transition-colors duration-200 flex-shrink-0 ${
											idx < currentStep ? "bg-blue-400" : "bg-gray-200"
										}`}
									></div>
								)}
							</div>
						);
					})}
				</div>
			</div>

			{/* Toggle Timeline Button */}
			<div className="flex justify-between items-center">
				<button
					onClick={() => setShowFullTimeline(!showFullTimeline)}
					className="flex gap-1 items-center text-xs text-blue-600 transition-colors sm:text-sm hover:text-blue-800"
				>
					{showFullTimeline ? (
						<>
							<ChevronUp className="w-3 h-3" />
							Hide Timeline
						</>
					) : (
						<>
							<ChevronDown className="w-3 h-3" />
							Show Timeline
						</>
					)}
				</button>

				{/* Current Status Badge */}
				{currentStep !== -1 && (
					<div className="flex flex-col gap-1 items-start">
						<span
							className={`px-2 py-1 rounded-full text-xs font-medium ${
								currentStep === STATUS_STEPS.length - 1
									? "bg-green-100 text-green-700"
									: "bg-blue-100 text-blue-700"
							}`}
						>
							{STATUS_STEPS[currentStep].label}
						</span>
						<span className="text-xs text-gray-500">
							{formatDate(
								tracking[tracking.length - 1]?.createdAt ||
									tracking[tracking.length - 1]?.dateFormatted
							)}
						</span>
					</div>
				)}
			</div>

			{/* Full Timeline View */}
			{showFullTimeline && (
				<div className="p-3 space-y-3 bg-gray-50 rounded-lg border dark:bg-slate-800/90 dark:border-slate-700/90 sm:p-4">
					<div className="flex justify-between items-center mb-3">
						<h4 className="text-sm font-semibold text-gray-700 dark:text-white">
							Document Processing Timeline
						</h4>
						<button
							onClick={() => setShowFullTimeline(false)}
							className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-600"
						>
							<ChevronUp className="w-4 h-4" />
						</button>
					</div>

					<div className="space-y-3">
						{STATUS_STEPS.map((step, idx) => {
							const stepData = getStepData(idx);
							return (
								<div
									key={step.key}
									className="flex gap-3 justify-between items-start py-2"
								>
									<div className="flex flex-1 gap-3 items-center min-w-0">
										<div
											className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
												stepData.completed
													? idx === STATUS_STEPS.length - 1
														? "bg-green-600 text-white dark:bg-green-600 dark:text-white"
														: "bg-blue-600 text-white dark:bg-blue-600 dark:text-white"
													: "bg-gray-300 text-gray-500 dark:bg-slate-700 dark:text-slate-400"
											}`}
										>
											{stepData.completed ? "✓" : idx + 1}
										</div>
										<div className="flex-1 min-w-0">
											<div className="flex flex-wrap gap-2 items-center">
												<span
													className={`text-sm font-medium ${
														stepData.isCurrent
															? "text-blue-700 dark:text-blue-400"
															: stepData.completed
															? "text-gray-700 dark:text-slate-400"
															: "text-gray-400 dark:text-slate-400"
													}`}
												>
													{step.label}
												</span>
												{stepData.isCurrent && (
													<span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full whitespace-nowrap dark:bg-blue-900/20 dark:text-blue-400">
														Current
													</span>
												)}
											</div>
										</div>
									</div>
									<div className="flex-shrink-0 text-xs text-right text-gray-500 dark:text-slate-400 sm:text-sm">
										{stepData.date
											? formatDate(stepData.date)
											: stepData.completed
											? "Completed"
											: "Pending"}
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
};

export default InlineTrackingProgress;
