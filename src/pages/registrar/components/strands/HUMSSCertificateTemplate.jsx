import React from "react";
import CertificateTemplate from "../CertificateTemplate";

export default function HUMSSCertificateTemplate({
	studentInfo,
	onSave,
	onCancel,
	isEditable = true,
	fetchStudentInfo,
	request,
}) {
	// HUMSS-specific default values
	const humssDefaults = {
		strand: "Humanities and Social Sciences (HUMSS)",
		strandDescription:
			"This strand is designed for students who are inclined toward or have the capability for advanced studies in humanities, social sciences, and education.",
		subjects: [
			"Creative Writing",
			"Creative Nonfiction",
			"World Religions and Belief Systems",
			"Disciplines and Ideas in the Social Sciences",
			"Disciplines and Ideas in Applied Social Sciences",
			"Philippine Politics and Governance",
			"Community Engagement, Solidarity, and Citizenship",
			"Trends, Networks, and Critical Thinking in the 21st Century",
		],
		careerPaths: [
			"Education",
			"Psychology",
			"Sociology",
			"Political Science",
			"History",
			"Philosophy",
			"Literature",
			"Social Work",
			"Journalism",
			"Law",
		],
	};

	return (
		<CertificateTemplate
			studentInfo={studentInfo}
			onSave={onSave}
			onCancel={onCancel}
			isEditable={isEditable}
			fetchStudentInfo={fetchStudentInfo}
			strandDefaults={humssDefaults}
			strandType="Humanities and Social Sciences (HUMSS)"
			request={request}
		/>
	);
}
