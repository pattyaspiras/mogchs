import React from "react";
import CertificateTemplate from "../CertificateTemplate";

export default function GASCertificateTemplate({
	studentInfo,
	onSave,
	onCancel,
	isEditable = true,
	fetchStudentInfo,
	request,
}) {
	// GAS-specific default values
	const gasDefaults = {
		strand: "General Academic Strand (GAS)",
		strandDescription:
			"This strand is designed for students who are inclined toward or have the capability for advanced studies in various academic fields and are still exploring their career options.",
		subjects: [
			"Humanities 1",
			"Humanities 2",
			"Social Science 1",
			"Applied Economics",
			"Organization and Management",
			"Disaster Readiness and Risk Reduction",
			"Elective 1 (from any strand)",
			"Elective 2 (from any strand)",
		],
		careerPaths: [
			"Education",
			"Social Sciences",
			"Business",
			"Arts and Humanities",
			"Communication",
			"Psychology",
			"Political Science",
			"Economics",
			"Law",
			"Public Administration",
		],
	};

	return (
		<CertificateTemplate
			studentInfo={studentInfo}
			onSave={onSave}
			onCancel={onCancel}
			isEditable={isEditable}
			fetchStudentInfo={fetchStudentInfo}
			strandDefaults={gasDefaults}
			strandType="General Academic Strand (GAS)"
			request={request}
		/>
	);
}
