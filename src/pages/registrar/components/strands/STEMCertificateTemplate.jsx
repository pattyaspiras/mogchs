import React from "react";
import CertificateTemplate from "../CertificateTemplate";

export default function STEMCertificateTemplate({
	studentInfo,
	onSave,
	onCancel,
	isEditable = true,
	fetchStudentInfo,
	request,
}) {
	// STEM-specific default values
	const stemDefaults = {
		strand: "Science, Technology, Engineering, and Mathematics (STEM)",
		strandDescription:
			"This strand is designed for students who are inclined toward or have the capability for advanced studies in science, technology, engineering, and mathematics.",
		subjects: [
			"General Mathematics",
			"Pre-Calculus",
			"Basic Calculus",
			"General Physics",
			"General Chemistry",
			"General Biology",
			"Earth and Life Science",
			"Physical Science",
		],
		careerPaths: [
			"Engineering",
			"Medicine",
			"Computer Science",
			"Mathematics",
			"Physics",
			"Chemistry",
			"Biology",
			"Architecture",
		],
	};

	return (
		<CertificateTemplate
			studentInfo={studentInfo}
			onSave={onSave}
			onCancel={onCancel}
			isEditable={isEditable}
			fetchStudentInfo={fetchStudentInfo}
			strandDefaults={stemDefaults}
			strandType="STEM"
			request={request}
		/>
	);
}
