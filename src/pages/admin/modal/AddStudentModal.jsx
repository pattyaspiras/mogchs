import React, { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { addStudent } from "../../../utils/admin";
import { getStrands } from "../../../utils/registrar";
import { getGradeLevel as getAdminGradeLevel } from "../../../utils/admin";
import { X, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

export default function AddStudentModal({
	isOpen,
	onClose,
	onSuccess,
	sectionOptions = [],
	schoolYearOptions = [],
	createdBy,
	teacherSectionId,
	teacherGradeLevelId,
}) {
	const [strands, setStrands] = useState([]);
	const [gradeLevels, setGradeLevels] = useState([]);
	const [loading, setLoading] = useState(false);
	const [loadingGrades, setLoadingGrades] = useState(false);
	const [formData, setFormData] = useState({
		firstname: "",
		middlename: "",
		lastname: "",
		lrn: "",
		email: "",
		password: "",
		track: "",
		strand: "",
		strandId: "",
		birthDate: "",
		age: "",
		religion: "",
		completeAddress: "",
		fatherName: "",
		motherName: "",
		guardianName: "",
		guardianRelationship: "",
		sectionId: teacherSectionId || "", // Auto-set teacher section if available
		schoolYearId: "",
		gradeLevelId: teacherGradeLevelId || "", // Auto-set teacher grade level if available
		strandId: "", // Manual selection required
		userLevel: "4", // Add default userLevel for students
		createdBy: createdBy || "",
	});

	// Fetch strands when modal opens
	useEffect(() => {
		const fetchStrands = async () => {
			try {
				const data = await getStrands();
				let strandsArray = data;
				if (typeof data === "string") {
					try {
						strandsArray = JSON.parse(data);
					} catch (e) {
						strandsArray = [];
					}
				}
				setStrands(Array.isArray(strandsArray) ? strandsArray : []);
			} catch (error) {
				toast.error("Failed to load strands");
			}
		};
		const fetchGradeLevels = async () => {
			try {
				setLoadingGrades(true);
				const data = await getAdminGradeLevel();
				let glArray = data;
				if (typeof data === "string") {
					try {
						glArray = JSON.parse(data);
					} catch (e) {
						glArray = [];
					}
				}
				setGradeLevels(Array.isArray(glArray) ? glArray : []);
			} catch (error) {
				toast.error("Failed to load grade levels");
			} finally {
				setLoadingGrades(false);
			}
		};
		fetchStrands();
		fetchGradeLevels();
	}, []);

	// Auto-select teacher's section if provided
	useEffect(() => {
		if (teacherSectionId) {
			setFormData((prev) => ({
				...prev,
				sectionId: teacherSectionId,
			}));
		}
	}, [teacherSectionId]);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));

		// Auto-populate password with lastname when lastname changes
		if (name === "lastname") {
			setFormData((prev) => ({ ...prev, password: value }));
		}

		// Auto-fill track when strand is selected
		if (name === "strandId") {
			const selectedStrand = strands.find((s) => s.id === value);
			setFormData((prev) => ({
				...prev,
				strand: selectedStrand ? selectedStrand.name : "",
				track: selectedStrand ? selectedStrand.trackName : "",
				strandId: value,
			}));
		}
	};

	const validateForm = () => {
		const requiredFields = [
			"lrn",
			"firstname",
			"lastname",
			"email",
			"sectionId",
			"schoolYearId",
			"gradeLevelId",
		];
		for (const field of requiredFields) {
			const value = formData[field];
			// Check if the field has a value
			if (!value || value === "") {
				toast.error(
					`${field.charAt(0).toUpperCase() + field.slice(1)} is required`
				);
				return false;
			}
			// For string fields, also check if they're not just whitespace
			if (typeof value === "string" && !value.trim()) {
				toast.error(
					`${field.charAt(0).toUpperCase() + field.slice(1)} is required`
				);
				return false;
			}
		}
		if (!formData.email.includes("@")) {
			toast.error("Please enter a valid email address");
			return false;
		}
		return true;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validateForm()) return;
		try {
			setLoading(true);
			// Use LRN as the student ID
			const studentData = {
				...formData,
				id: formData.lrn, // Set the ID to be the same as LRN
			};
			console.log("studentData", studentData);
			await addStudent(studentData);
			toast.success("Student added successfully!");
			setFormData({
				firstname: "",
				middlename: "",
				lastname: "",
				lrn: "",
				email: "",
				password: "",
				strandId: "",
				birthDate: "",
				age: "",
				religion: "",
				completeAddress: "",
				fatherName: "",
				motherName: "",
				guardianName: "",
				guardianRelationship: "",
				sectionId: teacherSectionId || "", // Keep teacher section if available
				schoolYearId: "",
				gradeLevelId: teacherGradeLevelId || "", // Keep teacher grade level if available
				strandId: "", // Reset to empty for manual selection
				userLevel: "4", // Reset userLevel
				createdBy: createdBy || "",
			});
			onClose();
			if (onSuccess) onSuccess();
		} catch (error) {
			console.error("Failed to add student:", error);
			toast.error("Failed to add student");
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		setFormData({
			firstname: "",
			middlename: "",
			lastname: "",
			lrn: "",
			email: "",
			password: "",
			track: "",
			strand: "",
			strandId: "",
			birthDate: "",
			age: "",
			religion: "",
			completeAddress: "",
			fatherName: "",
			motherName: "",
			guardianName: "",
			guardianRelationship: "",
			sectionId: teacherSectionId || "", // Keep teacher section if available
			schoolYearId: "",
			gradeLevelId: teacherGradeLevelId || "", // Keep teacher grade level if available
			strandId: "", // Reset to empty for manual selection
			userLevel: "4", // Reset userLevel
			createdBy: createdBy || "",
		});
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="flex fixed inset-0 z-50 justify-center items-center p-4">
			<div
				className="absolute inset-0 backdrop-blur-sm transition-opacity duration-300 bg-black/60"
				onClick={handleClose}
			/>
			<div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden transform transition-all duration-300 scale-100 dark:bg-gray-800">
				<div className="px-6 py-6 bg-gradient-to-r from-blue-600 to-purple-600 sm:px-8 sm:py-8">
					<div className="flex justify-between items-center">
						<div className="flex items-center space-x-3">
							<div className="flex justify-center items-center w-12 h-12 rounded-full backdrop-blur-sm bg-white/20">
								<UserPlus className="w-6 h-6 text-white dark:text-white" />
							</div>
							<div>
								<h2 className="text-2xl font-bold text-white dark:text-white">
									Add New Student
								</h2>
								<p className="mt-1 text-sm text-blue-100 dark:text-white">
									Create a new student account
								</p>
							</div>
						</div>
						<button
							onClick={handleClose}
							className="flex justify-center items-center w-10 h-10 rounded-full transition-all duration-200 text-white/80 bg-white/20 hover:bg-white/30 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 dark:text-white/80 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-white/50"
						>
							<X className="w-5 h-5" />
						</button>
					</div>
				</div>
				<div className="overflow-y-auto max-h-[calc(95vh-140px)]">
					<form onSubmit={handleSubmit} className="p-6 space-y-6 sm:p-8">
						<div className="space-y-2">
							<Label htmlFor="lrn" className="text-gray-700 dark:text-gray-200">
								LRN
							</Label>
							<Input
								id="lrn"
								name="lrn"
								value={formData.lrn}
								onChange={handleInputChange}
								placeholder="Enter LRN"
								required
								className="bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
							/>
						</div>
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							<div className="space-y-2">
								<Label
									htmlFor="firstname"
									className="text-gray-700 dark:text-gray-200"
								>
									First Name
								</Label>
								<Input
									id="firstname"
									name="firstname"
									value={formData.firstname}
									onChange={handleInputChange}
									placeholder="Enter first name"
									required
									className="bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
								/>
							</div>
							<div className="space-y-2">
								<Label
									htmlFor="middlename"
									className="text-gray-700 dark:text-gray-200"
								>
									Middle Name
								</Label>
								<Input
									id="middlename"
									name="middlename"
									value={formData.middlename}
									onChange={handleInputChange}
									placeholder="Enter middle name"
									className="bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
								/>
							</div>
							<div className="space-y-2">
								<Label
									htmlFor="lastname"
									className="text-gray-700 dark:text-gray-200"
								>
									Last Name
								</Label>
								<Input
									id="lastname"
									name="lastname"
									value={formData.lastname}
									onChange={handleInputChange}
									placeholder="Enter last name"
									required
									className="bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label
								htmlFor="email"
								className="text-gray-700 dark:text-gray-200"
							>
								Email
							</Label>
							<Input
								id="email"
								name="email"
								value={formData.email}
								onChange={handleInputChange}
								placeholder="Enter email address"
								required
								className="bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
							/>
						</div>
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							<div className="space-y-2">
								<Label
									htmlFor="track"
									className="text-gray-700 dark:text-gray-200"
								>
									Track
								</Label>
								<Input
									id="track"
									name="track"
									value={formData.track}
									readOnly
									placeholder="Auto-filled from strand"
									className="bg-gray-100 border-gray-200 dark:bg-gray-600 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
								/>
							</div>
							<div className="space-y-2">
								<Label
									htmlFor="strandId"
									className="text-gray-700 dark:text-gray-200"
								>
									Strand
								</Label>
								<select
									id="strandId"
									name="strandId"
									value={formData.strandId}
									onChange={handleInputChange}
									className="flex px-3 py-2 w-full h-10 text-sm bg-gray-50 rounded-md border border-gray-200 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
								>
									<option value="">Select strand</option>
									{strands.map((strand) => (
										<option key={strand.id} value={strand.id}>
											{strand.name} ({strand.trackName})
										</option>
									))}
								</select>
							</div>
						</div>
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							<div className="space-y-2">
								<Label
									htmlFor="birthDate"
									className="text-gray-700 dark:text-gray-200"
								>
									Birth Date
								</Label>
								<Input
									id="birthDate"
									name="birthDate"
									type="date"
									value={formData.birthDate}
									onChange={handleInputChange}
									placeholder="YYYY-MM-DD"
									className="bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
								/>
							</div>
							<div className="space-y-2">
								<Label
									htmlFor="age"
									className="text-gray-700 dark:text-gray-200"
								>
									Age
								</Label>
								<Input
									id="age"
									name="age"
									value={formData.age}
									onChange={handleInputChange}
									placeholder="Enter age"
									className="bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label
								htmlFor="religion"
								className="text-gray-700 dark:text-gray-200"
							>
								Religion
							</Label>
							<Input
								id="religion"
								name="religion"
								value={formData.religion}
								onChange={handleInputChange}
								placeholder="Enter religion"
								className="bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
							/>
						</div>
						<div className="space-y-2">
							<Label
								htmlFor="completeAddress"
								className="text-gray-700 dark:text-gray-200"
							>
								Complete Address
							</Label>
							<Input
								id="completeAddress"
								name="completeAddress"
								value={formData.completeAddress}
								onChange={handleInputChange}
								placeholder="Enter address"
								className="bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
							/>
						</div>
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							<div className="space-y-2">
								<Label
									htmlFor="fatherName"
									className="text-gray-700 dark:text-gray-200"
								>
									Father's Name
								</Label>
								<Input
									id="fatherName"
									name="fatherName"
									value={formData.fatherName}
									onChange={handleInputChange}
									placeholder="Enter father's name"
									className="bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
								/>
							</div>
							<div className="space-y-2">
								<Label
									htmlFor="motherName"
									className="text-gray-700 dark:text-gray-200"
								>
									Mother's Name
								</Label>
								<Input
									id="motherName"
									name="motherName"
									value={formData.motherName}
									onChange={handleInputChange}
									placeholder="Enter mother's name"
									className="bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label
								htmlFor="guardianName"
								className="text-gray-700 dark:text-gray-200"
							>
								Guardian's Name
							</Label>
							<Input
								id="guardianName"
								name="guardianName"
								value={formData.guardianName}
								onChange={handleInputChange}
								placeholder="Enter guardian's name"
								className="bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
							/>
						</div>
						<div className="space-y-2">
							<Label
								htmlFor="guardianRelationship"
								className="text-gray-700 dark:text-gray-200"
							>
								Guardian Relationship
							</Label>
							<Input
								id="guardianRelationship"
								name="guardianRelationship"
								value={formData.guardianRelationship}
								onChange={handleInputChange}
								placeholder="Enter relationship"
								className="bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
							/>
						</div>
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							<div className="space-y-2">
								<Label
									htmlFor="sectionId"
									className="text-gray-700 dark:text-gray-200"
								>
									{teacherSectionId ? "Section (Auto-selected)" : "Section"}
								</Label>
								<select
									id="sectionId"
									name="sectionId"
									value={formData.sectionId}
									onChange={handleInputChange}
									required
									disabled={!!teacherSectionId}
									className="px-4 py-3 w-full bg-gray-50 rounded-xl border-2 border-gray-200 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
								>
									<option value="">
										{teacherSectionId
											? "Section automatically selected"
											: "Select section"}
									</option>
									{sectionOptions.map((section) => (
										<option key={section.id} value={section.id}>
											{section.name}
										</option>
									))}
								</select>
								{teacherSectionId && (
									<p className="text-xs text-gray-500 dark:text-gray-400">
										Section is automatically selected based on your teacher
										account.
									</p>
								)}
							</div>
							<div className="space-y-2">
								<Label
									htmlFor="schoolYearId"
									className="text-gray-700 dark:text-gray-200"
								>
									School Year
								</Label>
								<select
									id="schoolYearId"
									name="schoolYearId"
									value={formData.schoolYearId}
									onChange={handleInputChange}
									required
									className="px-4 py-3 w-full bg-gray-50 rounded-xl border-2 border-gray-200 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
								>
									<option value="">Select school year</option>
									{schoolYearOptions.map((sy) => (
										<option key={sy.id} value={sy.id}>
											{sy.year}
										</option>
									))}
								</select>
							</div>
						</div>
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							<div className="space-y-2">
								<Label
									htmlFor="gradeLevelId"
									className="text-gray-700 dark:text-gray-200"
								>
									{teacherGradeLevelId
										? "Grade Level (Auto-selected)"
										: "Grade Level"}
								</Label>
								<select
									id="gradeLevelId"
									name="gradeLevelId"
									value={formData.gradeLevelId}
									onChange={handleInputChange}
									required
									disabled={!!teacherGradeLevelId}
									className="px-4 py-3 w-full bg-gray-50 rounded-xl border-2 border-gray-200 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
								>
									<option value="">
										{loadingGrades
											? "Loading grade levels..."
											: teacherGradeLevelId
											? "Grade level automatically selected"
											: "Select grade level"}
									</option>
									{gradeLevels.map((gl) => (
										<option key={gl.id} value={gl.id}>
											{gl.name}
										</option>
									))}
								</select>
							</div>
						</div>
						<div className="flex flex-col justify-end pt-6 space-y-3 border-t border-gray-100 dark:border-gray-700 sm:flex-row sm:space-y-0 sm:space-x-4">
							<Button
								type="button"
								onClick={handleClose}
								disabled={loading}
								className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl border-2 border-gray-200 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={loading}
								className="flex justify-center items-center px-6 py-3 space-x-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl border-2 border-transparent transition-all duration-200 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{loading ? (
									<>
										<div className="w-4 h-4 rounded-full border-2 border-white animate-spin border-t-transparent" />
										<span>Adding Student...</span>
									</>
								) : (
									<>
										<UserPlus className="w-4 h-4" />
										<span>Add Student</span>
									</>
								)}
							</Button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
