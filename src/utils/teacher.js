import axios from "axios";
import { getDecryptedApiUrl } from "./apiConfig";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";

export async function getStudent() {
	const formData = new FormData();
	formData.append("operation", "getStudent");

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/teacher.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getStudentRecords(
	teacherGradeLevelId = null,
	teacherSectionId = null
) {
	const formData = new FormData();
	formData.append("operation", "getStudentRecords");

	// Add teacher's grade level if provided
	if (teacherGradeLevelId) {
		formData.append("teacherGradeLevelId", teacherGradeLevelId);
	}

	// Add teacher's section ID if provided
	if (teacherSectionId) {
		formData.append("teacherSectionId", teacherSectionId);
	}

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/teacher.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getSectionsByGradeLevel(
	teacherGradeLevelId = null,
	teacherSectionId = null
) {
	const formData = new FormData();
	formData.append("operation", "getSectionsByGradeLevel");

	// Add teacher's grade level if provided
	if (teacherGradeLevelId) {
		formData.append("teacherGradeLevelId", teacherGradeLevelId);
	}

	// Add teacher's section ID if provided
	if (teacherSectionId) {
		formData.append("teacherSectionId", teacherSectionId);
	}

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/teacher.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getAvailableSections(gradeLevelId) {
	const formData = new FormData();
	formData.append("operation", "getAvailableSections");
	formData.append("gradeLevelId", gradeLevelId);

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/teacher.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function updateStudentSection(studentId, newSectionId) {
	const formData = new FormData();
	formData.append("operation", "updateStudentSection");
	formData.append("studentId", studentId);
	formData.append("newSectionId", newSectionId);

	const COOKIE_KEY = "mogchs_user";
	const SECRET_KEY = "mogchs_secret_key";
	let userId = "";
	const encrypted = Cookies.get(COOKIE_KEY);
	if (encrypted) {
		try {
			const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
			const user = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
			userId = user?.id;
		} catch {}
	}

	if (userId) {
		formData.append("userId", userId);
	}

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/teacher.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function updateMultipleStudentSections(studentIds, newSectionId) {
	const formData = new FormData();
	formData.append("operation", "updateMultipleStudentSections");
	formData.append("studentIds", JSON.stringify(studentIds));
	formData.append("newSectionId", newSectionId);

	// Get current user ID from session storage
	const userId = sessionStorage.getItem("userId");
	if (userId) {
		formData.append("userId", userId);
	}

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/teacher.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function downloadFile(fileName) {
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await fetch(
			`${apiUrl}/download.php?file=${encodeURIComponent(fileName)}`,
			{
				method: "GET",
			}
		);

		if (response.ok) {
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = fileName;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
		} else {
			throw new Error("File download failed");
		}
	} catch (error) {
		console.error("Download error:", error);
		throw error;
	}
}
