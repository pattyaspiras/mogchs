import React, { useState, useEffect } from "react";
import { Users, Upload, Plus, Search } from "lucide-react";
import StudentImport from "./StudentImport";
import axios from "axios";
import toast from "react-hot-toast";

const StudentManagement = () => {
	const [students, setStudents] = useState([]);
	const [showImport, setShowImport] = useState(false);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		fetchStudents();
	}, []);

	const fetchStudents = async () => {
		try {
			setLoading(true);
			const formData = new FormData();
			formData.append("operation", "getStudent");

			const response = await axios.post("/backend/teacher.php", formData);
			setStudents(response.data);
		} catch (error) {
			console.error("Error fetching students:", error);
			toast.error("Failed to fetch students");
		} finally {
			setLoading(false);
		}
	};

	const handleImportComplete = (results) => {
		// Refresh the student list after successful import
		fetchStudents();
		toast.success(`Import completed! ${results.imported} students added.`);
	};

	const filteredStudents = students.filter(
		(student) =>
			`${student.firstname} ${student.lastname}`
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			student.lrn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			student.email?.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<div className="p-6 mx-auto max-w-7xl">
			{/* Header */}
			<div className="flex justify-between items-center mb-6">
				<div className="flex items-center space-x-2">
					<Users className="w-8 h-8 text-blue-600" />
					<h1 className="text-2xl font-bold text-gray-900">
						Student Management
					</h1>
				</div>

				<div className="flex space-x-3">
					<button
						onClick={() => setShowImport(true)}
						className="flex items-center px-4 py-2 space-x-2 text-white bg-green-600 rounded-lg transition-colors hover:bg-green-700"
					>
						<Upload className="w-4 h-4" />
						<span>Import from Excel</span>
					</button>

					<button className="flex items-center px-4 py-2 space-x-2 text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700">
						<Plus className="w-4 h-4" />
						<span>Add Student</span>
					</button>
				</div>
			</div>

			{/* Search */}
			<div className="mb-6">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 w-5 h-5 text-gray-400 transform -translate-y-1/2" />
					<input
						type="text"
						placeholder="Search students by name, LRN, or email..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="py-2 pr-4 pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
				</div>
			</div>

			{/* Students Table */}
			<div className="overflow-hidden bg-white rounded-lg shadow">
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
									Student
								</th>
								<th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
									LRN
								</th>
								<th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
									Email
								</th>
								<th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
									Track & Strand
								</th>
								<th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{loading ? (
								<tr>
									<td colSpan="5" className="px-6 py-4 text-center">
										<div className="flex justify-center items-center">
											<div className="w-8 h-8 rounded-full border-b-2 border-blue-600 animate-spin"></div>
											<span className="ml-2 text-gray-500">
												Loading students...
											</span>
										</div>
									</td>
								</tr>
							) : filteredStudents.length === 0 ? (
								<tr>
									<td
										colSpan="5"
										className="px-6 py-4 text-center text-gray-500"
									>
										{searchTerm
											? "No students found matching your search."
											: "No students found. Import some students to get started."}
									</td>
								</tr>
							) : (
								filteredStudents.map((student) => (
									<tr key={student.id} className="hover:bg-gray-50">
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center">
												<div className="flex-shrink-0 w-10 h-10">
													<div className="flex justify-center items-center w-10 h-10 bg-blue-100 rounded-full">
														<span className="text-sm font-medium text-blue-600">
															{student.firstname?.[0]}
															{student.lastname?.[0]}
														</span>
													</div>
												</div>
												<div className="ml-4">
													<div className="text-sm font-medium text-gray-900">
														{student.firstname} {student.middlename}{" "}
														{student.lastname}
													</div>
												</div>
											</div>
										</td>
										<td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
											{student.lrn || "N/A"}
										</td>
										<td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
											{student.email || "N/A"}
										</td>
										<td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
											<div>
												<div className="font-medium">
													{student.track || "N/A"}
												</div>
												<div className="text-gray-500">
													{student.strand || "N/A"}
												</div>
											</div>
										</td>
										<td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
											<button className="mr-3 text-blue-600 hover:text-blue-900">
												Edit
											</button>
											<button className="text-red-600 hover:text-red-900">
												Delete
											</button>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Import Modal */}
			{showImport && (
				<StudentImport
					onClose={() => setShowImport(false)}
					onImportComplete={handleImportComplete}
				/>
			)}
		</div>
	);
};

export default StudentManagement;
