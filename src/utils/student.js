import axios from "axios";
import { getDecryptedApiUrl } from "./apiConfig";

export async function getDocuments() {
	const formData = new FormData();
	formData.append("operation", "GetDocuments");

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/student.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getRequirementsType() {
	const formData = new FormData();
	formData.append("operation", "getRequirementsType");

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/student.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getRequirementComments(requestId) {
	const formData = new FormData();
	formData.append("operation", "getRequirementComments");
	formData.append("json", JSON.stringify({ requestId }));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/student.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getDocumentRequirements(documentId) {
	const formData = new FormData();
	formData.append("operation", "getDocumentRequirements");
	formData.append("json", JSON.stringify({ documentId }));

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/student.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getDocumentPurposes(documentId) {
	const formData = new FormData();
	formData.append("operation", "getDocumentPurposes");
	formData.append("json", JSON.stringify({ documentId }));

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/student.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function addRequestDocument({
	userId,
	documentId,
	purpose,
	purposeIds,
	attachments = [],
	typeIds = [],
}) {
	const formData = new FormData();
	formData.append("operation", "addRequestDocument");
	formData.append(
		"json",
		JSON.stringify({ userId, documentId, purpose, purposeIds, typeIds })
	);

	// Add multiple file attachments if provided
	if (attachments && attachments.length > 0) {
		attachments.forEach((file, index) => {
			formData.append(`attachments[${index}]`, file);
		});
	}

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/student.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		console.log("response", response.data);
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getUserRequests(userId) {
	const formData = new FormData();
	formData.append("operation", "getUserRequests");
	formData.append("json", JSON.stringify({ userId }));

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/student.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function addCombinedRequestDocument({
	userId,
	primaryDocumentId,
	secondaryDocumentId,
	purpose,
	purposeIds,
	attachments = [],
	typeIds = [],
}) {
	const formData = new FormData();
	formData.append("operation", "addCombinedRequestDocument");
	formData.append(
		"json",
		JSON.stringify({
			userId,
			primaryDocumentId,
			secondaryDocumentId,
			purpose,
			purposeIds,
			typeIds,
		})
	);

	// Add multiple file attachments if provided
	if (attachments && attachments.length > 0) {
		attachments.forEach((file, index) => {
			formData.append(`attachments[${index}]`, file);
		});
	}

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/student.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		console.log("response", response.data);
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getRequestTracking(requestId) {
	const formData = new FormData();
	formData.append("operation", "getRequestTracking");
	formData.append("json", JSON.stringify({ requestId }));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/student.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getRequestAttachments(requestId) {
	const formData = new FormData();
	formData.append("operation", "getRequestAttachments");
	formData.append("json", JSON.stringify({ requestId }));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/student.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getStudentProfile(userId) {
	const formData = new FormData();
	formData.append("operation", "getProfile");
	formData.append("json", JSON.stringify({ userId }));

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/student.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function updateStudentProfile(userId, profileData) {
	const formData = new FormData();
	formData.append("operation", "updateProfile");
	formData.append("json", JSON.stringify({ userId, ...profileData }));

	// Get the encrypted API URL from session storage
	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/student.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function cancelRequest(requestId) {
	const formData = new FormData();
	formData.append("operation", "cancelRequest");
	formData.append("json", JSON.stringify({ requestId }));

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/student.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function getExpectedDays() {
	const formData = new FormData();
	formData.append("operation", "getExpectedDays");

	const apiUrl = getDecryptedApiUrl();

	try {
		const response = await axios.post(`${apiUrl}/student.php`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}
