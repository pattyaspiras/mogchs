import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import { X, Clock, User, FileText, ChevronDown } from "lucide-react";
import { scheduleRelease } from "../../../utils/registrar";
import toast from "react-hot-toast";

export default function ReleaseScheduleModal({
	isOpen,
	onClose,
	request,
	onSuccess,
	userId,
}) {
	const [releaseDate, setReleaseDate] = useState("");
	const [processing, setProcessing] = useState(false);

	// Get minimum date (tomorrow)
	const getMinDate = () => {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		return tomorrow.toISOString().split("T")[0];
	};

	// Get maximum date (30 days from now)
	const getMaxDate = () => {
		const maxDate = new Date();
		maxDate.setDate(maxDate.getDate() + 30);
		return maxDate.toISOString().split("T")[0];
	};

	// Handle calendar button click
	const handleCalendarClick = () => {
		const dateInput = document.getElementById("releaseDate");
		if (dateInput && typeof dateInput.showPicker === "function") {
			// Modern browsers support showPicker()
			dateInput.showPicker();
		} else {
			// Fallback: focus the input to show the native date picker
			dateInput.focus();
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!releaseDate) {
			toast.error("Please select a release date");
			return;
		}

		if (!userId) {
			toast.error("User ID is missing. Please refresh the page and try again.");
			return;
		}

		if (!request || !request.id) {
			toast.error(
				"Request information is missing. Please refresh the page and try again."
			);
			return;
		}

		console.log("Submitting release schedule:", {
			requestId: request.id,
			releaseDate: releaseDate,
			userId: userId,
		});

		setProcessing(true);
		try {
			const response = await scheduleRelease(request.id, releaseDate, userId);
			console.log("scheduleRelease response:", response);

			if (response.success) {
				toast.success(response.message);
				onSuccess();
				onClose();
			} else {
				console.error("scheduleRelease failed:", response);
				toast.error(response.error || "Failed to schedule release");
			}
		} catch (error) {
			console.error("Failed to schedule release:", error);
			toast.error("Failed to schedule release: " + error.message);
		} finally {
			setProcessing(false);
		}
	};

	const formatDate = (dateString) => {
		if (!dateString) return "";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	if (!isOpen || !request) return null;

	return (
		<div className="flex fixed inset-0 z-50 justify-center items-center p-4 backdrop-blur-sm bg-black/50">
			<div className="relative w-full max-w-md bg-white rounded-lg shadow-2xl dark:bg-slate-800">
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-4 text-white bg-[#5409DA] rounded-t-lg">
					<div className="flex gap-3 items-center">
						<h2 className="text-lg font-semibold">Schedule Document Release</h2>
					</div>
					<button
						onClick={onClose}
						className="p-1.5 text-white bg-transparent hover:text-gray-200 rounded-full transition-colors"
						aria-label="Close"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Content */}
				<div className="p-6 space-y-6">
					{/* Request Information */}
					<div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700">
						<h3 className="mb-3 text-sm font-medium text-slate-600 dark:text-slate-300">
							Request Details
						</h3>
						<div className="space-y-2">
							<div className="flex gap-2 items-center">
								<User className="w-4 h-4 text-blue-600" />
								<span className="text-sm text-slate-900 dark:text-white">
									{request.student}
								</span>
							</div>
							<div className="flex gap-2 items-center">
								<FileText className="w-4 h-4 text-blue-600" />
								<span className="text-sm text-slate-900 dark:text-white">
									{request.document}
								</span>
							</div>
							{request.purpose && (
								<div className="text-sm text-slate-600 dark:text-slate-400">
									Purpose: {request.purpose}
								</div>
							)}
						</div>
					</div>

					{/* Release Date Selection */}
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label
								htmlFor="releaseDate"
								className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
							>
								Select Release Date
							</label>
							<div className="relative">
								<input
									type="date"
									id="releaseDate"
									value={releaseDate}
									onChange={(e) => setReleaseDate(e.target.value)}
									min={getMinDate()}
									max={getMaxDate()}
									className="px-3 py-2 pr-10 w-full rounded-lg border cursor-pointer border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white"
									required
									placeholder="Select a date"
									onClick={handleCalendarClick}
								/>
							</div>
							<div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
								{releaseDate ? (
									<span>
										Selected: <strong>{formatDate(releaseDate)}</strong>
									</span>
								) : (
									<span>
										Click anywhere on the date field to open the calendar picker
									</span>
								)}
							</div>
						</div>

						{/* Office Hours Info */}
						<div className="p-3 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700">
							<div className="flex gap-2 items-center mb-2">
								<Clock className="w-4 h-4 text-blue-600" />
								<span className="text-sm font-medium text-blue-700 dark:text-blue-300">
									Office Hours
								</span>
							</div>
							<p className="text-sm text-blue-600 dark:text-blue-400">
								8:00 AM - 5:00 PM (Monday to Friday)
							</p>
						</div>

						{/* Important Notes */}
						<div className="p-3 bg-amber-50 rounded-lg border border-amber-200 dark:bg-amber-900/20 dark:border-amber-700">
							<h4 className="mb-2 text-sm font-medium text-amber-700 dark:text-amber-300">
								Important Notes
							</h4>
							<ul className="space-y-1 text-xs text-amber-600 dark:text-amber-400">
								<li>• Student must bring valid ID for verification</li>
								<li>
									• Documents not claimed within 30 days may be disposed of
								</li>
								<li>• Email notification will be sent to the student</li>
							</ul>
						</div>

						{/* Action Buttons */}
						<div className="flex gap-3 pt-4">
							<Button
								type="submit"
								disabled={processing || !releaseDate}
								className="flex-1 bg-[#5409DA] hover:bg-[#4A08C4] text-white"
							>
								{processing ? "Scheduling..." : "Schedule Release"}
							</Button>
							<Button
								type="button"
								onClick={onClose}
								variant="outline"
								className="flex-1 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-700"
							>
								Cancel
							</Button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
