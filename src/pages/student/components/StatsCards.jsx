import React from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Clock, FileText, CheckCircle2 } from "lucide-react";

const StatsCards = ({ userRequests }) => {
	return (
		<div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4 sm:gap-4 lg:gap-6 lg:mb-8">
			<Card className="transition-shadow hover:shadow-md dark:bg-slate-800 dark:border-slate-700">
				<CardContent className="p-3 sm:p-4 lg:p-6">
					<div className="flex gap-2 items-center text-xs lg:text-sm text-slate-500 dark:text-slate-400">
						<Clock className="flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4" />
						<span className="truncate">Pending</span>
					</div>
					<div className="mt-2 text-lg font-bold sm:text-xl lg:text-2xl text-slate-900 dark:text-white">
						{userRequests.filter((req) => req.status === "Pending").length}
					</div>
					<div className="mt-1 text-xs text-yellow-600">
						Awaiting processing
					</div>
				</CardContent>
			</Card>

			<Card className="transition-shadow hover:shadow-md dark:bg-slate-800 dark:border-slate-700">
				<CardContent className="p-3 sm:p-4 lg:p-6">
					<div className="flex gap-2 items-center text-xs lg:text-sm text-slate-500 dark:text-slate-400">
						<FileText className="flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4" />
						<span className="truncate">Processing</span>
					</div>
					<div className="mt-2 text-lg font-bold sm:text-xl lg:text-2xl text-slate-900 dark:text-white">
						{
							userRequests.filter((req) =>
								["Processing", "Processed", "Signatory"].includes(req.status)
							).length
						}
					</div>
					<div className="mt-1 text-xs text-blue-600">In progress</div>
				</CardContent>
			</Card>

			<Card className="transition-shadow hover:shadow-md dark:bg-slate-800 dark:border-slate-700">
				<CardContent className="p-3 sm:p-4 lg:p-6">
					<div className="flex gap-2 items-center text-xs lg:text-sm text-slate-500 dark:text-slate-400">
						<CheckCircle2 className="flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4" />
						<span className="truncate">Completed</span>
					</div>
					<div className="mt-2 text-lg font-bold sm:text-xl lg:text-2xl text-slate-900 dark:text-white">
						{userRequests.filter((req) => req.status === "Completed").length}
					</div>
					<div className="mt-1 text-xs text-green-600">Ready for pickup</div>
				</CardContent>
			</Card>

			<Card className="transition-shadow hover:shadow-md dark:bg-slate-800 dark:border-slate-700">
				<CardContent className="p-3 sm:p-4 lg:p-6">
					<div className="flex gap-2 items-center text-xs lg:text-sm text-slate-500 dark:text-slate-400">
						<FileText className="flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4" />
						<span className="truncate">Total</span>
					</div>
					<div className="mt-2 text-lg font-bold sm:text-xl lg:text-2xl text-slate-900 dark:text-white">
						{userRequests.length}
					</div>
					<div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
						All time
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default StatsCards;
