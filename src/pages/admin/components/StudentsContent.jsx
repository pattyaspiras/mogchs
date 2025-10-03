import React from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { Plus, Eye } from "lucide-react";

export default function StudentsContent({
	students,
	studentsLoading,
	sectionOptions,
	schoolYearOptions,
	selectedSectionFilter,
	selectedSchoolYearFilter,
	onSectionFilterChange,
	onSchoolYearFilterChange,
	onAddStudent,
	onViewProfile,
}) {
	return (
		<>
			{/* Students List */}
			<Card className="dark:bg-slate-800 dark:border-slate-700">
				<CardContent className="p-4 lg:p-6">
					<div className="mb-4 text-base font-semibold lg:text-lg text-slate-900 dark:text-white">
						Students Management
					</div>

					{/* Filters */}
					<div className="flex flex-col gap-4 mb-6 sm:flex-row sm:gap-6">
						<div className="flex-1">
							<Label
								htmlFor="sectionFilter"
								className="text-sm font-medium text-slate-700 dark:text-gray-200"
							>
								Filter by Section
							</Label>
							<select
								id="sectionFilter"
								value={selectedSectionFilter}
								onChange={onSectionFilterChange}
								className="px-3 py-2 mt-1 w-full bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-700 dark:text-white dark:border-gray-600"
							>
								<option value="">All Sections</option>
								{sectionOptions.map((section) => (
									<option key={section.id} value={section.id}>
										{section.name}
									</option>
								))}
							</select>
						</div>
						<div className="flex-1">
							<Label
								htmlFor="schoolYearFilter"
								className="text-sm font-medium text-slate-700 dark:text-gray-200"
							>
								Filter by School Year
							</Label>
							<select
								id="schoolYearFilter"
								value={selectedSchoolYearFilter}
								onChange={onSchoolYearFilterChange}
								className="px-3 py-2 mt-1 w-full bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-700 dark:text-white dark:border-gray-600"
							>
								<option value="">All School Years</option>
								{schoolYearOptions.map((sy) => (
									<option key={sy.id} value={sy.id}>
										{sy.year}
									</option>
								))}
							</select>
						</div>
					</div>

					<div className="flex justify-between items-center mb-4">
						<div className="text-sm text-slate-600 dark:text-slate-400">
							{students.length} student(s) found
						</div>
						<Button
							onClick={onAddStudent}
							className="text-white bg-green-600 hover:bg-green-700"
						>
							<Plus className="mr-2 w-4 h-4" />
							Add Student
						</Button>
					</div>

					{studentsLoading ? (
						<div className="py-8 text-center text-slate-500 dark:text-slate-400">
							Loading students...
						</div>
					) : students.length === 0 ? (
						<div className="py-8 text-center text-slate-500 dark:text-slate-400">
							No students found
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full border-collapse">
								<thead>
									<tr className="border-b border-slate-200 dark:border-slate-600">
										<th className="px-4 py-3 font-medium text-left text-slate-700 dark:text-white">
											LRN
										</th>
										<th className="px-4 py-3 font-medium text-left text-slate-700 dark:text-white">
											Name
										</th>
										<th className="px-4 py-3 font-medium text-left text-slate-700 dark:text-white">
											Email
										</th>
										<th className="px-4 py-3 font-medium text-left text-slate-700 dark:text-white">
											Section
										</th>
										<th className="px-4 py-3 font-medium text-left text-slate-700 dark:text-white">
											School Year
										</th>
										<th className="px-4 py-3 font-medium text-left text-slate-700 dark:text-white">
											Track/Strand
										</th>
										<th className="px-4 py-3 font-medium text-left text-slate-700 dark:text-white">
											Actions
										</th>
									</tr>
								</thead>
								<tbody>
									{students.map((student, index) => (
										<tr
											key={student.id}
											className={`border-b border-slate-100 dark:border-slate-600 ${
												index % 2 === 0
													? "bg-slate-50 dark:bg-slate-700"
													: "bg-white dark:bg-slate-700"
											}`}
										>
											<td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
												{student.lrn}
											</td>
											<td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
												{student.firstname} {student.middlename}{" "}
												{student.lastname}
											</td>
											<td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
												{student.email}
											</td>
											<td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
												{student.sectionName || "N/A"}
											</td>
											<td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
												{student.schoolYear || "N/A"}
											</td>
											<td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
												{student.track && student.strand
													? `${student.track} - ${student.strand}`
													: "N/A"}
											</td>
											<td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
												<Button
													onClick={() => onViewProfile(student.id, "student")}
													variant="outline"
													size="sm"
													className="flex items-center space-x-2 text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
												>
													<Eye className="w-4 h-4" />
													<span>View Profile</span>
												</Button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</CardContent>
			</Card>
		</>
	);
}
