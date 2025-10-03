import React, { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
	getUserLevel,
	addUser,
	getGradeLevel,
	getSection,
	checkUserExists,
} from "../../../utils/admin";
import { X, User, Mail, Lock, Shield, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

export default function AddUserModal({ isOpen, onClose, onSuccess }) {
	const [formData, setFormData] = useState({
		id: "",
		firstname: "",
		lastname: "",
		email: "",
		password: "",
		userLevel: "",
	});
	const [userLevels, setUserLevels] = useState([]);
	const [loading, setLoading] = useState(false);
	const [loadingLevels, setLoadingLevels] = useState(true);
	const [gradeLevels, setGradeLevels] = useState([]);
	const [loadingGrades, setLoadingGrades] = useState(false);
	const [sections, setSections] = useState([]);
	const [loadingSections, setLoadingSections] = useState(false);
	const [userIdValidation, setUserIdValidation] = useState({
		isValidating: false,
		exists: false,
		message: "",
	});

	// Fetch user levels when modal opens
	useEffect(() => {
		if (isOpen) {
			fetchUserLevels();
		}
	}, [isOpen]);

	// Fetch grade levels if userLevel is Teacher
	useEffect(() => {
		if (isOpen && formData.userLevel && getTeacherLevelId()) {
			fetchGradeLevels();
		}
	}, [isOpen, formData.userLevel]);

	// Fetch sections when grade level changes (for teachers)
	useEffect(() => {
		if (
			isOpen &&
			formData.userLevel === String(getTeacherLevelId()) &&
			formData.gradeLevel
		) {
			fetchSections(formData.gradeLevel);
		}
	}, [isOpen, formData.userLevel, formData.gradeLevel]);

	const getTeacherLevelId = () => {
		const teacher = userLevels.find(
			(level) => level.name.toLowerCase() === "teacher"
		);
		return teacher ? teacher.id : null;
	};

	const fetchUserLevels = async () => {
		try {
			setLoadingLevels(true);
			const data = await getUserLevel();
			setUserLevels(Array.isArray(data) ? data : []);
		} catch (error) {
			console.error("Failed to fetch user levels:", error);
			toast.error("Failed to load user levels");
			setUserLevels([]);
		} finally {
			setLoadingLevels(false);
		}
	};

	const fetchGradeLevels = async () => {
		try {
			setLoadingGrades(true);
			const data = await getGradeLevel();
			setGradeLevels(Array.isArray(data) ? data : []);
		} catch (error) {
			console.error("Failed to fetch grade levels:", error);
			setGradeLevels([]);
		} finally {
			setLoadingGrades(false);
		}
	};

	const fetchSections = async (gradeLevelId = null) => {
		try {
			setLoadingSections(true);
			const data = await getSection(gradeLevelId);
			setSections(Array.isArray(data) ? data : []);
		} catch (error) {
			console.error("Failed to fetch sections:", error);
			setSections([]);
		} finally {
			setLoadingSections(false);
		}
	};

	const validateUserId = async (userId) => {
		if (!userId || userId.length < 3) {
			setUserIdValidation({
				isValidating: false,
				exists: false,
				message: "",
			});
			return;
		}

		try {
			setUserIdValidation({
				isValidating: true,
				exists: false,
				message: "",
			});

			const response = await checkUserExists(userId);
			const data =
				typeof response === "string" ? JSON.parse(response) : response;

			setUserIdValidation({
				isValidating: false,
				exists: data.exists,
				message: data.message,
			});
		} catch (error) {
			console.error("Failed to validate User ID:", error);
			setUserIdValidation({
				isValidating: false,
				exists: false,
				message: "Failed to validate User ID",
			});
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => {
			const newData = {
				...prev,
				[name]: value,
			};

			// Automatically set password to lastname when lastname changes
			if (name === "lastname") {
				newData.password = value;
			}

			// Reset gradeLevel if userLevel changes and is not Teacher
			if (name === "userLevel" && value !== getTeacherLevelId()) {
				newData.gradeLevel = "";
				newData.sectionId = "";
			}

			// Reset sectionId when grade level changes
			if (name === "gradeLevel") {
				newData.sectionId = "";
			}

			return newData;
		});
	};

	const validateForm = () => {
		const { id, firstname, lastname, email, userLevel, gradeLevel, sectionId } =
			formData;

		if (!id.trim()) {
			toast.error("User ID is required");
			return false;
		}
		if (userIdValidation.exists) {
			toast.error("User ID already exists. Please use a different User ID.");
			return false;
		}
		if (userIdValidation.isValidating) {
			toast.error("Please wait for User ID validation to complete.");
			return false;
		}
		if (!firstname.trim()) {
			toast.error("First name is required");
			return false;
		}
		if (!lastname.trim()) {
			toast.error("Last name is required");
			return false;
		}
		if (!email.trim()) {
			toast.error("Email is required");
			return false;
		}
		if (!email.includes("@")) {
			toast.error("Please enter a valid email address");
			return false;
		}
		if (!userLevel) {
			toast.error("User level is required");
			return false;
		}
		// If Teacher, gradeLevel and sectionId are required
		if (userLevel === String(getTeacherLevelId())) {
			if (!gradeLevel) {
				toast.error("Grade level is required for teachers");
				return false;
			}
			if (!sectionId) {
				toast.error("Section is required for teachers");
				return false;
			}
		}

		return true;
	};

	const isFormValid = () => {
		const { id, firstname, lastname, email, userLevel, gradeLevel, sectionId } =
			formData;

		// Check if all required fields are filled
		const basicFieldsValid =
			id.trim() &&
			firstname.trim() &&
			lastname.trim() &&
			email.trim() &&
			email.includes("@") &&
			userLevel;

		// Check User ID validation
		const userIdValid =
			!userIdValidation.exists && !userIdValidation.isValidating;

		// Check teacher-specific fields
		const teacherFieldsValid =
			userLevel === String(getTeacherLevelId())
				? gradeLevel && sectionId
				: true;

		return basicFieldsValid && userIdValid && teacherFieldsValid;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		try {
			setLoading(true);

			const userData = {
				...formData,
				pinCode: formData.id.slice(-4), // Generate PIN from last 4 digits of User ID as string
			};
			// Only include gradeLevelId and sectionId if Teacher
			if (formData.userLevel === String(getTeacherLevelId())) {
				userData.gradeLevelId = formData.gradeLevel;
				userData.sectionId = formData.sectionId;
				delete userData.gradeLevel;
			} else {
				delete userData.gradeLevelId;
				delete userData.gradeLevel;
				delete userData.sectionId;
			}

			// Debug logging
			console.log("Sending user data:", userData);

			const response = await addUser(userData);
			console.log("Backend response:", response);

			// Parse the response
			const responseData =
				typeof response === "string" ? JSON.parse(response) : response;

			if (responseData.status === "success") {
				toast.success(responseData.message || "User added successfully!");

				// Reset form
				setFormData({
					id: "",
					firstname: "",
					lastname: "",
					email: "",
					password: "",
					userLevel: "",
				});

				// onClose();
				if (onSuccess) onSuccess();
			} else {
				toast.error(responseData.message || "Failed to add user");
			}
		} catch (error) {
			console.error("Failed to add user:", error);
			console.error("Error details:", error.response?.data);
			toast.error(
				"Failed to add user: " +
					(error.response?.data?.message || error.message)
			);
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		setFormData({
			id: "",
			firstname: "",
			lastname: "",
			email: "",
			password: "",
			userLevel: "",
		});
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="flex fixed inset-0 z-50 justify-center items-center p-4">
			{/* Overlay with animation */}
			<div
				className="absolute inset-0 backdrop-blur-sm transition-opacity duration-300 bg-black/80 dark:bg-black/90"
				onClick={handleClose}
			/>

			{/* Modal Content with enhanced design */}
			<div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden transform transition-all duration-300 scale-100 border border-gray-200 dark:border-gray-700">
				{/* Header with gradient background */}
				<div className="px-6 py-6 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 sm:px-8 sm:py-8">
					<div className="flex justify-between items-center">
						<div className="flex items-center space-x-3">
							<div className="flex justify-center items-center w-12 h-12 rounded-full backdrop-blur-sm bg-white/20 dark:bg-white/10">
								<UserPlus className="w-6 h-6 text-white" />
							</div>
							<div>
								<h2 className="text-2xl font-bold text-white">Add New User</h2>
								<p className="mt-1 text-sm text-blue-100 dark:text-blue-200">
									Create a new user account
								</p>
							</div>
						</div>
						<button
							onClick={handleClose}
							className="flex justify-center items-center w-10 h-10 rounded-full transition-all duration-200 text-white/80 bg-white/20 hover:bg-white/30 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 dark:bg-white/10 dark:hover:bg-white/20"
						>
							<X className="w-5 h-5" />
						</button>
					</div>
				</div>

				{/* Form with enhanced styling */}
				<div className="overflow-y-auto max-h-[calc(95vh-140px)]">
					<form onSubmit={handleSubmit} className="p-6 space-y-6 sm:p-8">
						{/* User ID and Level Row */}
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							<div className="space-y-2">
								<Label
									htmlFor="id"
									className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200"
								>
									<User className="mr-2 w-4 h-4 text-blue-500 dark:text-blue-400" />
									User ID
								</Label>
								<Input
									id="id"
									name="id"
									value={formData.id}
									onChange={handleInputChange}
									onBlur={() => validateUserId(formData.id)}
									placeholder="Enter user ID (must end with 4 digits)"
									className="px-4 py-3 w-full placeholder-gray-500 text-gray-900 bg-gray-50 rounded-xl border-2 border-gray-200 transition-colors duration-200 dark:bg-gray-800 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-0 focus:bg-white dark:focus:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
									required
									disabled={loadingLevels || userIdValidation.isValidating}
								/>
								{userIdValidation.isValidating && (
									<p className="text-xs text-blue-600 dark:text-blue-400">
										Validating User ID...
									</p>
								)}
								{userIdValidation.message && (
									<p
										className={`text-xs ${
											userIdValidation.exists
												? "text-red-600 dark:text-red-400"
												: "text-green-600 dark:text-green-400"
										}`}
									>
										{userIdValidation.message}
									</p>
								)}
							</div>
							<div className="space-y-2">
								<Label
									htmlFor="userLevel"
									className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200"
								>
									<Shield className="mr-2 w-4 h-4 text-purple-500 dark:text-purple-400" />
									User Level
								</Label>
								<select
									id="userLevel"
									name="userLevel"
									value={formData.userLevel}
									onChange={handleInputChange}
									className="px-4 py-3 w-full text-gray-900 bg-gray-50 rounded-xl border-2 border-gray-200 transition-colors duration-200 dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none focus:bg-white dark:focus:bg-gray-700"
									required
									disabled={loadingLevels}
								>
									<option value="">
										{loadingLevels ? "Loading..." : "Select user level"}
									</option>
									{userLevels.map((level) => (
										<option key={level.id} value={level.id}>
											{level.name}
										</option>
									))}
								</select>
							</div>
						</div>

						{/* Grade Level select for Teacher */}
						{formData.userLevel === String(getTeacherLevelId()) && (
							<div className="mt-2 space-y-2">
								<Label
									htmlFor="gradeLevel"
									className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200"
								>
									<Shield className="mr-2 w-4 h-4 text-green-500 dark:text-green-400" />
									Grade Level
								</Label>
								<select
									id="gradeLevel"
									name="gradeLevel"
									value={formData.gradeLevel || ""}
									onChange={handleInputChange}
									className="px-4 py-3 w-full text-gray-900 bg-gray-50 rounded-xl border-2 border-gray-200 transition-colors duration-200 dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600 focus:border-green-500 dark:focus:border-green-400 focus:outline-none focus:bg-white dark:focus:bg-gray-700"
									required
									disabled={loadingGrades}
								>
									<option value="">
										{loadingGrades ? "Loading..." : "Select grade level"}
									</option>
									{gradeLevels.map((level) => (
										<option key={level.id} value={level.id}>
											{level.name}
										</option>
									))}
								</select>
							</div>
						)}

						{/* Section select for Teacher */}
						{formData.userLevel === String(getTeacherLevelId()) && (
							<div className="mt-2 space-y-2">
								<Label
									htmlFor="sectionId"
									className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200"
								>
									<Shield className="mr-2 w-4 h-4 text-blue-500 dark:text-blue-400" />
									Section
								</Label>
								<select
									id="sectionId"
									name="sectionId"
									value={formData.sectionId || ""}
									onChange={handleInputChange}
									className="px-4 py-3 w-full text-gray-900 bg-gray-50 rounded-xl border-2 border-gray-200 transition-colors duration-200 dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:bg-white dark:focus:bg-gray-700"
									required
									disabled={loadingSections || !formData.gradeLevel}
								>
									<option value="">
										{!formData.gradeLevel
											? "Select grade level first"
											: loadingSections
											? "Loading..."
											: sections.length === 0
											? "No available sections for this grade level"
											: "Select section"}
									</option>
									{sections.map((section) => (
										<option key={section.id} value={section.id}>
											{section.name}
										</option>
									))}
								</select>

								{formData.gradeLevel && sections.length > 0 && (
									<div className="flex items-center space-x-2 text-xs text-blue-600 dark:text-blue-400">
										<Shield className="w-3 h-3" />
										<span>
											Showing only available sections (unassigned to teachers)
										</span>
									</div>
								)}
							</div>
						)}

						{/* Name Row */}
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							<div className="space-y-2">
								<Label
									htmlFor="firstname"
									className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200"
								>
									<User className="mr-2 w-4 h-4 text-green-500 dark:text-green-400" />
									First Name
								</Label>
								<Input
									id="firstname"
									name="firstname"
									value={formData.firstname}
									onChange={handleInputChange}
									placeholder="Enter first name"
									className="px-4 py-3 w-full placeholder-gray-500 text-gray-900 bg-gray-50 rounded-xl border-2 border-gray-200 transition-colors duration-200 dark:bg-gray-800 dark:border-gray-600 focus:border-green-500 dark:focus:border-green-400 focus:ring-0 focus:bg-white dark:focus:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
									required
								/>
							</div>
							<div className="space-y-2">
								<Label
									htmlFor="lastname"
									className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200"
								>
									<User className="mr-2 w-4 h-4 text-green-500 dark:text-green-400" />
									Last Name
								</Label>
								<Input
									id="lastname"
									name="lastname"
									value={formData.lastname}
									onChange={handleInputChange}
									placeholder="Enter last name"
									className="px-4 py-3 w-full placeholder-gray-500 text-gray-900 bg-gray-50 rounded-xl border-2 border-gray-200 transition-colors duration-200 dark:bg-gray-800 dark:border-gray-600 focus:border-green-500 dark:focus:border-green-400 focus:ring-0 focus:bg-white dark:focus:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
									required
								/>
							</div>
						</div>

						{/* Email Row */}
						<div className="grid grid-cols-1 gap-6">
							<div className="space-y-2">
								<Label
									htmlFor="email"
									className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200"
								>
									<Mail className="mr-2 w-4 h-4 text-orange-500 dark:text-orange-400" />
									Email Address
								</Label>
								<Input
									id="email"
									name="email"
									type="email"
									value={formData.email}
									onChange={handleInputChange}
									placeholder="Enter email address"
									className="px-4 py-3 w-full placeholder-gray-500 text-gray-900 bg-gray-50 rounded-xl border-2 border-gray-200 transition-colors duration-200 dark:bg-gray-800 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-0 focus:bg-white dark:focus:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
									required
								/>
								{formData.email && formData.email.includes("@") && (
									<p className="text-xs text-green-600 dark:text-green-400">
										✓ Email format is valid
									</p>
								)}
							</div>
						</div>

						{/* Password and PIN Info */}
						<div className="p-4 bg-blue-50 rounded-xl border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700">
							<div className="flex items-start space-x-3">
								<div className="flex justify-center items-center w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex-shrink-0 mt-0.5">
									<Lock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
								</div>
								<div>
									<p className="text-sm font-medium text-blue-800 dark:text-blue-200">
										Auto-Generation Features
									</p>
									<p className="mt-1 text-xs text-blue-600 dark:text-blue-300">
										• Password: Automatically set to the user's last name
										<br />
										• PIN Code: Auto-generated from the last 4 digits of User ID
										when form is submitted
										<br />
										Users can change both after their first login.
									</p>
								</div>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="flex flex-col justify-end pt-6 space-y-3 border-t border-gray-100 dark:border-gray-700 sm:flex-row sm:space-y-0 sm:space-x-4">
							<Button
								type="button"
								onClick={handleClose}
								disabled={loading}
								className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl border-2 border-gray-200 transition-all duration-200 dark:text-gray-200 dark:bg-gray-800 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={loading || !isFormValid()}
								className="flex justify-center items-center px-6 py-3 space-x-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl border-2 border-transparent transition-all duration-200 dark:from-blue-700 dark:to-purple-700 hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-800 dark:hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500 dark:disabled:from-gray-500 dark:disabled:to-gray-600"
							>
								{loading ? (
									<>
										<div className="w-4 h-4 rounded-full border-2 border-white animate-spin border-t-transparent" />
										<span>Adding User...</span>
									</>
								) : (
									<>
										<UserPlus className="w-4 h-4" />
										<span>Add User</span>
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
