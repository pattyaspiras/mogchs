import React from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Users, FileText, Upload } from "lucide-react";

export default function DashboardStats({
	totalStudents,
	totalFiles,
	studentsWithFiles,
}) {
	return (
		<div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 lg:mb-8">
			<Card className="dark:bg-slate-800 dark:border-slate-700">
				<CardContent className="p-4 lg:p-6">
					<div className="flex gap-2 items-center text-xs lg:text-sm text-slate-500 dark:text-slate-400">
						<Users className="w-4 h-4" />
						<span className="truncate">Total Students</span>
					</div>
					<div className="mt-2 text-xl font-bold lg:text-2xl text-slate-900 dark:text-white">
						{totalStudents}
					</div>
					<div className="mt-1 text-xs text-blue-600">Active students</div>
				</CardContent>
			</Card>
			<Card className="dark:bg-slate-800 dark:border-slate-700">
				<CardContent className="p-4 lg:p-6">
					<div className="flex gap-2 items-center text-xs lg:text-sm text-slate-500 dark:text-slate-400">
						<FileText className="w-4 h-4" />
						<span className="truncate">Total Files</span>
					</div>
					<div className="mt-2 text-xl font-bold lg:text-2xl text-slate-900 dark:text-white">
						{totalFiles}
					</div>
					<div className="mt-1 text-xs text-green-600">Files uploaded</div>
				</CardContent>
			</Card>
			<Card className="dark:bg-slate-800 dark:border-slate-700">
				<CardContent className="p-4 lg:p-6">
					<div className="flex gap-2 items-center text-xs lg:text-sm text-slate-500 dark:text-slate-400">
						<Upload className="w-4 h-4" />
						<span className="truncate">Students with Files</span>
					</div>
					<div className="mt-2 text-xl font-bold lg:text-2xl text-slate-900 dark:text-white">
						{studentsWithFiles}
					</div>
					<div className="mt-1 text-xs text-purple-600">
						Have uploaded files
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
