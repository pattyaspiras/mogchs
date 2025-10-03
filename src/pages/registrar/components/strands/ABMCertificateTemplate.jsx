import React from "react";
import CertificateTemplate from "../CertificateTemplate";

export default function ABMCertificateTemplate({
	studentInfo,
	onSave,
	onCancel,
	isEditable = true,
	fetchStudentInfo,
	request,
}) {
	// ABM-specific default values
	const abmDefaults = {
		strand: "Accountancy, Business and Management (ABM)",
		strandDescription:
			"This strand is designed for students who are inclined toward or have the capability for advanced studies in business, finance, and entrepreneurship.",
		subjects: [
			"Fundamentals of Accountancy, Business and Management 1",
			"Fundamentals of Accountancy, Business and Management 2",
			"Business Mathematics",
			"Business Finance",
			"Organization and Management",
			"Principles of Marketing",
			"Applied Economics",
			"Business Ethics and Social Responsibility",
		],
		careerPaths: [
			"Accountancy",
			"Business Administration",
			"Finance",
			"Marketing",
			"Human Resource Management",
			"Entrepreneurship",
			"Economics",
			"Management Information Systems",
		],
	};

	return (
		<CertificateTemplate
			studentInfo={studentInfo}
			onSave={onSave}
			onCancel={onCancel}
			isEditable={isEditable}
			fetchStudentInfo={fetchStudentInfo}
			strandDefaults={abmDefaults}
			strandType="ABM"
			request={request}
		/>
	);
}
