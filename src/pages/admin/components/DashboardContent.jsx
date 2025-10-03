import React from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Bar, Doughnut } from "react-chartjs-2";

export default function DashboardContent({
	dashboardData,
	dashboardLoading,
	requestStatusChartData,
	userDistributionChartData,
	onRefreshData,
}) {
	return (
		<>
			{/* Stats Cards */}
			<div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6 lg:mb-8">
				<Card className="dark:bg-slate-800 dark:border-slate-700">
					<CardContent className="p-4 lg:p-6">
						<div className="text-xs lg:text-sm text-slate-500 dark:text-slate-400">
							Total Users
						</div>
						<div className="mt-2 text-xl font-bold lg:text-2xl text-slate-900 dark:text-white">
							{dashboardLoading ? "..." : dashboardData.totalUsers.totalUsers}
						</div>
						<div className="mt-1 text-xs text-green-600">
							{dashboardData.totalUsers.adminUsers} Admin,{" "}
							{dashboardData.totalUsers.studentUsers} Students
						</div>
					</CardContent>
				</Card>
				<Card className="dark:bg-slate-800 dark:border-slate-700">
					<CardContent className="p-4 lg:p-6">
						<div className="text-xs lg:text-sm text-slate-500 dark:text-slate-400">
							Total Requests
						</div>
						<div className="mt-2 text-xl font-bold lg:text-2xl text-slate-900 dark:text-white">
							{dashboardLoading
								? "..."
								: dashboardData.requestStats.reduce(
										(sum, stat) => sum + stat.count,
										0
								  )}
						</div>
						<div className="mt-1 text-xs text-blue-600">All time requests</div>
					</CardContent>
				</Card>
				<Card className="dark:bg-slate-800 dark:border-slate-700">
					<CardContent className="p-4 lg:p-6">
						<div className="text-xs lg:text-sm text-slate-500 dark:text-slate-400">
							Completed Requests
						</div>
						<div className="mt-2 text-xl font-bold lg:text-2xl text-slate-900 dark:text-white">
							{dashboardLoading
								? "..."
								: dashboardData.completedRequests.length}
						</div>
						<div className="mt-1 text-xs text-green-600">
							Successfully processed
						</div>
					</CardContent>
				</Card>
				<Card className="dark:bg-slate-800 dark:border-slate-700">
					<CardContent className="p-4 lg:p-6">
						<div className="text-xs lg:text-sm text-slate-500 dark:text-slate-400">
							Pending Requests
						</div>
						<div className="mt-2 text-xl font-bold lg:text-2xl text-slate-900 dark:text-white">
							{dashboardLoading
								? "..."
								: dashboardData.requestStats.find(
										(stat) => stat.status === "Pending"
								  )?.count || 0}
						</div>
						<div className="mt-1 text-xs text-orange-600">
							Awaiting processing
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Charts Section */}
			<div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-2">
				<Card className="dark:bg-slate-800 dark:border-slate-700">
					<CardContent className="p-4 lg:p-6">
						<div className="mb-4 text-base font-semibold lg:text-lg text-slate-900 dark:text-white">
							Request Status Distribution
						</div>
						{dashboardLoading ? (
							<div className="py-8 text-center text-slate-500 dark:text-slate-400">
								Loading chart...
							</div>
						) : (
							<Bar
								data={requestStatusChartData}
								options={{
									responsive: true,
									plugins: {
										legend: {
											position: "top",
										},
										title: {
											display: false,
										},
									},
								}}
							/>
						)}
					</CardContent>
				</Card>

				<Card className="dark:bg-slate-800 dark:border-slate-700">
					<CardContent className="p-4 lg:p-6">
						<div className="mb-4 text-base font-semibold lg:text-lg text-slate-900 dark:text-white">
							User Distribution
						</div>
						{dashboardLoading ? (
							<div className="py-8 text-center text-slate-500 dark:text-slate-400">
								Loading chart...
							</div>
						) : (
							<Doughnut
								data={userDistributionChartData}
								options={{
									responsive: true,
									plugins: {
										legend: {
											position: "bottom",
										},
										title: {
											display: false,
										},
									},
								}}
							/>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Recent Activity and Completed Requests */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<Card className="dark:bg-slate-800 dark:border-slate-700">
					<CardContent className="p-4 lg:p-6">
						<div className="mb-4 text-base font-semibold lg:text-lg text-slate-900 dark:text-white">
							Recent Activity
						</div>
						{dashboardLoading ? (
							<div className="py-8 text-center text-slate-500 dark:text-slate-400">
								Loading activities...
							</div>
						) : dashboardData.recentActivity.length === 0 ? (
							<div className="py-8 text-center text-slate-500 dark:text-slate-400">
								No recent activity
							</div>
						) : (
							<div className="space-y-3">
								{dashboardData.recentActivity.map((activity, index) => (
									<div
										key={index}
										className="flex justify-between items-start p-3 rounded-lg bg-slate-50 dark:bg-slate-700"
									>
										<div className="flex-1">
											<div className="text-sm font-medium text-slate-900 dark:text-white">
												{activity.student}
											</div>
											<div className="text-xs text-slate-600 dark:text-slate-300">
												{activity.document}
											</div>
											<div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
												{activity.formattedDate}
											</div>
										</div>
										<span
											className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${
												activity.status === "Released"
													? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
													: activity.status === "Pending"
													? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
													: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
											}`}
										>
											{activity.status}
										</span>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				<Card className="dark:bg-slate-800 dark:border-slate-700">
					<CardContent className="p-4 lg:p-6">
						<div className="mb-4 text-base font-semibold lg:text-lg text-slate-900 dark:text-white">
							Recently Completed Requests
						</div>
						{dashboardLoading ? (
							<div className="py-8 text-center text-slate-500 dark:text-slate-400">
								Loading completed requests...
							</div>
						) : dashboardData.completedRequests.length === 0 ? (
							<div className="py-8 text-center text-slate-500 dark:text-slate-400">
								No completed requests
							</div>
						) : (
							<div className="space-y-3">
								{dashboardData.completedRequests
									.slice(0, 5)
									.map((request, index) => (
										<div key={index} className="p-3 bg-green-50 rounded-lg">
											<div className="flex justify-between items-start">
												<div>
													<div className="text-sm font-medium text-slate-900">
														{request.student}
													</div>
													<div className="text-xs text-slate-600">
														{request.document} - {request.purpose}
													</div>
												</div>
												<div className="text-xs text-right text-slate-500">
													<div>Requested: {request.dateRequested}</div>
													<div>Completed: {request.dateCompleted}</div>
												</div>
											</div>
										</div>
									))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</>
	);
}
