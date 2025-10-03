import React from "react";
import CertificateTemplate from "../CertificateTemplate";

export default function TVLCertificateTemplate({
	studentInfo,
	onSave,
	onCancel,
	isEditable = true,
	fetchStudentInfo,
	request,
}) {
	// TVL-specific default values
	const tvlDefaults = {
		strand: "Technical-Vocational-Livelihood (TVL)",
		strandDescription:
			"This strand is designed for students who are inclined toward or have the capability for technical and vocational skills development in various livelihood areas.",
		subjects: [
			"Technical Drawing",
			"Computer Programming",
			"Food and Beverage Services",
			"Housekeeping",
			"Tourism Promotion Services",
			"Travel Services",
			"Automotive Servicing",
			"Electrical Installation and Maintenance",
		],
		careerPaths: [
			"Automotive Technology",
			"Computer Programming",
			"Food and Beverage Management",
			"Tourism and Hospitality",
			"Electrical Technology",
			"Plumbing",
			"Welding",
			"Carpentry",
			"Cosmetology",
			"Agriculture",
		],
	};

	return (
		<CertificateTemplate
			studentInfo={studentInfo}
			onSave={onSave}
			onCancel={onCancel}
			isEditable={isEditable}
			fetchStudentInfo={fetchStudentInfo}
			strandDefaults={tvlDefaults}
			strandType="Technical-Vocational-Livelihood (TVL)"
			request={request}
		/>
	);
}
