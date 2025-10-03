import React, { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
	X,
	User,
	Mail,
	Calendar,
	MapPin,
	Users,
	Shield,
	Edit,
	Save,
	XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import {
	getStudentProfile,
	updateStudentProfile,
} from "../../../utils/student";

export default function ProfileModal({ isOpen, onClose, userId }) {
	const [profile, setProfile] = useState(null);
	const [isEditing, setIsEditing] = useState(false);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [formData, setFormData] = useState({});

	// Fetch profile data when modal opens
	useEffect(() => {
		if (isOpen && userId) {
			fetchProfile();
		}
	}, [isOpen, userId]);

	const fetchProfile = async () => {
		setLoading(true);
		try {
			const data = await getStudentProfile(userId);
			if (data.error) {
				toast.error(data.error);
			} else {
				setProfile(data);
				setFormData({
					firstname: data.firstname || "",
					middlename: data.middlename || "",
					lastname: data.lastname || "",
					email: data.email || "",
					birthDate: data.birthDate || "",
					age: data.age || "",
					religion: data.religion || "",
					completeAddress: data.completeAddress || "",
					fatherName: data.fatherName || "",
					motherName: data.motherName || "",
					guardianName: data.guardianName || "",
					guardianRelationship: data.guardianRelationship || "",
					contactNo: data.contactNo || "",
				});
			}
		} catch (error) {
			console.error("Failed to fetch profile:", error);
			toast.error("Failed to load profile");
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleEdit = () => {
		setIsEditing(true);
	};

	const handleCancel = () => {
		setIsEditing(false);
		// Reset form data to original profile data
		if (profile) {
			setFormData({
				firstname: profile.firstname || "",
				middlename: profile.middlename || "",
				lastname: profile.lastname || "",
				email: profile.email || "",
				birthDate: profile.birthDate || "",
				age: profile.age || "",
				religion: profile.religion || "",
				completeAddress: profile.completeAddress || "",
				fatherName: profile.fatherName || "",
				motherName: profile.motherName || "",
				guardianName: profile.guardianName || "",
				guardianRelationship: profile.guardianRelationship || "",
				contactNo: profile.contactNo || "",
			});
		}
	};

	const handleSave = async () => {
		setSaving(true);
		try {
			const result = await updateStudentProfile(userId, formData);
			if (result.success) {
				toast.success("Profile updated successfully!");
				setIsEditing(false);
				// Refresh profile data
				await fetchProfile();
			} else {
				toast.error(result.error || "Failed to update profile");
			}
		} catch (error) {
			console.error("Failed to update profile:", error);
			toast.error("Failed to update profile");
		} finally {
			setSaving(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="flex fixed inset-0 z-50 justify-center items-center p-4">
			{/* Backdrop */}
			<div
				className="absolute inset-0 backdrop-blur-sm bg-black/50"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden transform transition-all duration-300 scale-100 dark:bg-gray-800">
				{/* Header */}
				<div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
					<div className="flex items-center space-x-3">
						<User className="w-6 h-6 text-blue-600" />
						<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
							Student Profile
						</h2>
					</div>
					<div className="flex items-center space-x-2">
						{!isEditing ? (
							<Button
								onClick={handleEdit}
								className="flex items-center space-x-2 text-white bg-blue-600 hover:bg-blue-700"
							>
								<Edit className="w-4 h-4" />
								<span>Edit Profile</span>
							</Button>
						) : (
							<>
								<Button
									onClick={handleCancel}
									variant="outline"
									className="flex items-center space-x-2"
								>
									<XCircle className="w-4 h-4" />
									<span>Cancel</span>
								</Button>
								<Button
									onClick={handleSave}
									disabled={saving}
									className="flex items-center space-x-2 text-white bg-green-600 hover:bg-green-700"
								>
									<Save className="w-4 h-4" />
									<span>{saving ? "Saving..." : "Save Changes"}</span>
								</Button>
							</>
						)}
						<button
							onClick={onClose}
							className="p-2 text-gray-400 rounded-full transition-colors hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
						>
							<X className="w-5 h-5" />
						</button>
					</div>
				</div>

				{/* Content */}
				<div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
					{loading ? (
						<div className="flex justify-center items-center py-12">
							<div className="w-12 h-12 rounded-full border-b-2 border-blue-600 animate-spin"></div>
						</div>
					) : profile ? (
						<div className="space-y-8">
							{/* Basic Information */}
							<div className="p-6 bg-gray-50 rounded-lg dark:bg-gray-700">
								<h3 className="flex items-center mb-4 text-lg font-semibold text-gray-900 dark:text-white">
									<User className="mr-2 w-5 h-5 text-blue-600" />
									Basic Information
								</h3>
								<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
									<div className="space-y-2">
										<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
											First Name
										</Label>
										{isEditing ? (
											<Input
												name="firstname"
												value={formData.firstname}
												onChange={handleInputChange}
												className="w-full"
											/>
										) : (
											<div className="p-3 bg-white rounded-md border border-gray-200 dark:bg-gray-600 dark:border-gray-500">
												{profile.firstname || "N/A"}
											</div>
										)}
									</div>
									<div className="space-y-2">
										<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
											Middle Name
										</Label>
										{isEditing ? (
											<Input
												name="middlename"
												value={formData.middlename}
												onChange={handleInputChange}
												className="w-full"
											/>
										) : (
											<div className="p-3 bg-white rounded-md border border-gray-200 dark:bg-gray-600 dark:border-gray-500">
												{profile.middlename || "N/A"}
											</div>
										)}
									</div>
									<div className="space-y-2">
										<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
											Last Name
										</Label>
										{isEditing ? (
											<Input
												name="lastname"
												value={formData.lastname}
												onChange={handleInputChange}
												className="w-full"
											/>
										) : (
											<div className="p-3 bg-white rounded-md border border-gray-200 dark:bg-gray-600 dark:border-gray-500">
												{profile.lastname || "N/A"}
											</div>
										)}
									</div>
									<div className="space-y-2">
										<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
											LRN
										</Label>
										<div className="p-3 text-gray-600 bg-gray-100 rounded-md border border-gray-200 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300">
											{profile.lrn || "N/A"}
										</div>
									</div>
									<div className="space-y-2">
										<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
											Email
										</Label>
										{isEditing ? (
											<Input
												name="email"
												type="email"
												value={formData.email}
												onChange={handleInputChange}
												className="w-full"
											/>
										) : (
											<div className="flex items-center p-3 bg-white rounded-md border border-gray-200 dark:bg-gray-600 dark:border-gray-500">
												<Mail className="mr-2 w-4 h-4 text-gray-500" />
												{profile.email || "N/A"}
											</div>
										)}
									</div>
									<div className="space-y-2">
										<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
											Birth Date
										</Label>
										{isEditing ? (
											<Input
												name="birthDate"
												type="date"
												value={formData.birthDate}
												onChange={handleInputChange}
												className="w-full"
											/>
										) : (
											<div className="flex items-center p-3 bg-white rounded-md border border-gray-200 dark:bg-gray-600 dark:border-gray-500">
												<Calendar className="mr-2 w-4 h-4 text-gray-500" />
												{profile.birthDate && profile.birthDate !== "0000-00-00"
													? new Date(profile.birthDate).toLocaleDateString()
													: "N/A"}
											</div>
										)}
									</div>
									<div className="space-y-2">
										<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
											Birth Place
										</Label>
										{isEditing ? (
											<Input
												name="birthPlace"
												value={formData.birthPlace}
												onChange={handleInputChange}
												className="w-full"
											/>
										) : (
											<div className="p-3 bg-white rounded-md border border-gray-200 dark:bg-gray-600 dark:border-gray-500">
												{profile.birthPlace || "N/A"}
											</div>
										)}
									</div>
									<div className="space-y-2">
										<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
											Age
										</Label>
										{isEditing ? (
											<Input
												name="age"
												type="number"
												value={formData.age}
												onChange={handleInputChange}
												className="w-full"
											/>
										) : (
											<div className="p-3 bg-white rounded-md border border-gray-200 dark:bg-gray-600 dark:border-gray-500">
												{profile.age || "N/A"}
											</div>
										)}
									</div>
									<div className="space-y-2">
										<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
											Contact Number
										</Label>
										{isEditing ? (
											<Input
												name="contactNo"
												value={formData.contactNo}
												onChange={handleInputChange}
												className="w-full"
											/>
										) : (
											<div className="p-3 bg-white rounded-md border border-gray-200 dark:bg-gray-600 dark:border-gray-500">
												{profile.contactNo || "N/A"}
											</div>
										)}
									</div>
								</div>
							</div>

							{/* Academic Information */}
							<div className="p-6 bg-gray-50 rounded-lg dark:bg-gray-700">
								<h3 className="flex items-center mb-4 text-lg font-semibold text-gray-900 dark:text-white">
									<Shield className="mr-2 w-5 h-5 text-green-600" />
									Academic Information
								</h3>
								<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
									<div className="space-y-2">
										<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
											Section
										</Label>
										<div className="p-3 text-gray-600 bg-gray-100 rounded-md border border-gray-200 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300">
											{profile.sectionName || "N/A"}
										</div>
									</div>
									<div className="space-y-2">
										<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
											Strand
										</Label>
										<div className="p-3 text-gray-600 bg-gray-100 rounded-md border border-gray-200 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300">
											{profile.strand || "N/A"}
										</div>
									</div>
									<div className="space-y-2">
										<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
											Track
										</Label>
										<div className="p-3 text-gray-600 bg-gray-100 rounded-md border border-gray-200 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300">
											{profile.track || "N/A"}
										</div>
									</div>
									<div className="space-y-2">
										<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
											School Year
										</Label>
										<div className="p-3 text-gray-600 bg-gray-100 rounded-md border border-gray-200 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300">
											{profile.schoolYear || "N/A"}
										</div>
									</div>
									<div className="space-y-2">
										<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
											Grade Level
										</Label>
										<div className="p-3 text-gray-600 bg-gray-100 rounded-md border border-gray-200 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300">
											{profile.gradeLevel || "N/A"}
										</div>
									</div>
								</div>
							</div>

							{/* Personal Information */}
							<div className="p-6 bg-gray-50 rounded-lg dark:bg-gray-700">
								<h3 className="flex items-center mb-4 text-lg font-semibold text-gray-900 dark:text-white">
									<User className="mr-2 w-5 h-5 text-purple-600" />
									Personal Information
								</h3>
								<div className="space-y-4">
									<div className="space-y-2">
										<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
											Religion
										</Label>
										{isEditing ? (
											<Input
												name="religion"
												value={formData.religion}
												onChange={handleInputChange}
												className="w-full"
											/>
										) : (
											<div className="p-3 bg-white rounded-md border border-gray-200 dark:bg-gray-600 dark:border-gray-500">
												{profile.religion || "N/A"}
											</div>
										)}
									</div>
									<div className="space-y-2">
										<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
											Complete Address
										</Label>
										{isEditing ? (
											<Textarea
												name="completeAddress"
												value={formData.completeAddress}
												onChange={handleInputChange}
												className="w-full"
												rows={3}
											/>
										) : (
											<div className="flex items-start p-3 bg-white rounded-md border border-gray-200 dark:bg-gray-600 dark:border-gray-500">
												<MapPin className="flex-shrink-0 mt-1 mr-2 w-4 h-4 text-gray-500" />
												<span>{profile.completeAddress || "N/A"}</span>
											</div>
										)}
									</div>
								</div>
							</div>

							{/* Family Information */}
							<div className="p-6 bg-gray-50 rounded-lg dark:bg-gray-700">
								<h3 className="flex items-center mb-4 text-lg font-semibold text-gray-900 dark:text-white">
									<Users className="mr-2 w-5 h-5 text-orange-600" />
									Family Information
								</h3>
								<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
									<div className="space-y-2">
										<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
											Father's Name
										</Label>
										{isEditing ? (
											<Input
												name="fatherName"
												value={formData.fatherName}
												onChange={handleInputChange}
												className="w-full"
											/>
										) : (
											<div className="p-3 bg-white rounded-md border border-gray-200 dark:bg-gray-600 dark:border-gray-500">
												{profile.fatherName || "N/A"}
											</div>
										)}
									</div>
									<div className="space-y-2">
										<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
											Mother's Name
										</Label>
										{isEditing ? (
											<Input
												name="motherName"
												value={formData.motherName}
												onChange={handleInputChange}
												className="w-full"
											/>
										) : (
											<div className="p-3 bg-white rounded-md border border-gray-200 dark:bg-gray-600 dark:border-gray-500">
												{profile.motherName || "N/A"}
											</div>
										)}
									</div>
									<div className="space-y-2">
										<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
											Guardian's Name
										</Label>
										{isEditing ? (
											<Input
												name="guardianName"
												value={formData.guardianName}
												onChange={handleInputChange}
												className="w-full"
											/>
										) : (
											<div className="p-3 bg-white rounded-md border border-gray-200 dark:bg-gray-600 dark:border-gray-500">
												{profile.guardianName || "N/A"}
											</div>
										)}
									</div>
									<div className="space-y-2">
										<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
											Guardian's Relationship
										</Label>
										{isEditing ? (
											<Input
												name="guardianRelationship"
												value={formData.guardianRelationship}
												onChange={handleInputChange}
												className="w-full"
											/>
										) : (
											<div className="p-3 bg-white rounded-md border border-gray-200 dark:bg-gray-600 dark:border-gray-500">
												{profile.guardianRelationship || "N/A"}
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					) : (
						<div className="py-12 text-center">
							<p className="text-gray-500 dark:text-gray-400">
								No profile data available
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
