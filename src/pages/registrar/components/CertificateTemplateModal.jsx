import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import CertificateTemplate from "./CertificateTemplate";
import STEMCertificateTemplate from "./strands/STEMCertificateTemplate";
import ABMCertificateTemplate from "./strands/ABMCertificateTemplate";
import HUMSSCertificateTemplate from "./strands/HUMSSCertificateTemplate";
import GASCertificateTemplate from "./strands/GASCertificateTemplate";
import TVLCertificateTemplate from "./strands/TVLCertificateTemplate";

export default function CertificateTemplateModal({
	isOpen,
	onClose,
	request,
	studentInfo,
	onSave,
	fetchStudentInfo,
}) {
	const [selectedStrand, setSelectedStrand] = useState(null);

	useEffect(() => {
		if (studentInfo && studentInfo.strand) {
			// Determine which strand template to use based on student's strand
			const strand = studentInfo.strand.toLowerCase();
			if (strand.includes("stem")) {
				setSelectedStrand("STEM");
			} else if (strand.includes("abm")) {
				setSelectedStrand("ABM");
			} else if (strand.includes("humss")) {
				setSelectedStrand("HUMSS");
			} else if (strand.includes("gas")) {
				setSelectedStrand("GAS");
			} else if (strand.includes("tvl")) {
				setSelectedStrand("TVL");
			} else {
				setSelectedStrand("GENERAL");
			}
		}
	}, [studentInfo]);

	if (!isOpen) return null;

	// Render the appropriate template based on strand
	const renderTemplate = () => {
		switch (selectedStrand) {
			case "STEM":
				return (
					<STEMCertificateTemplate
						studentInfo={studentInfo}
						onSave={onSave}
						onCancel={onClose}
						isEditable={true}
						fetchStudentInfo={fetchStudentInfo}
						request={request}
					/>
				);
			case "ABM":
				return (
					<ABMCertificateTemplate
						studentInfo={studentInfo}
						onSave={onSave}
						onCancel={onClose}
						isEditable={true}
						fetchStudentInfo={fetchStudentInfo}
						request={request}
					/>
				);
			case "HUMSS":
				return (
					<HUMSSCertificateTemplate
						studentInfo={studentInfo}
						onSave={onSave}
						onCancel={onClose}
						isEditable={true}
						fetchStudentInfo={fetchStudentInfo}
						request={request}
					/>
				);
			case "GAS":
				return (
					<GASCertificateTemplate
						studentInfo={studentInfo}
						onSave={onSave}
						onCancel={onClose}
						isEditable={true}
						fetchStudentInfo={fetchStudentInfo}
						request={request}
					/>
				);
			case "TVL":
				return (
					<TVLCertificateTemplate
						studentInfo={studentInfo}
						onSave={onSave}
						onCancel={onClose}
						isEditable={true}
						fetchStudentInfo={fetchStudentInfo}
						request={request}
					/>
				);
			default:
				return (
					<CertificateTemplate
						studentInfo={studentInfo}
						onSave={onSave}
						onCancel={onClose}
						isEditable={true}
						fetchStudentInfo={fetchStudentInfo}
						request={request}
					/>
				);
		}
	};

	return (
		<div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-sm bg-black/50">
			<div className="relative w-full max-w-7xl bg-white rounded-lg shadow-2xl max-h-[95vh] overflow-hidden">
				{/* Header */}
				<div className="flex justify-between items-center px-6 py-4 text-white bg-[#5409DA] border-b">
					<h2 className="text-xl font-semibold">
						Certificate of Enrollment Template - {request?.student}
						{selectedStrand && selectedStrand !== "GENERAL" && (
							<span className="ml-2 text-sm opacity-90">
								({selectedStrand})
							</span>
						)}
					</h2>
					<button
						onClick={onClose}
						className="p-2 text-gray-200 bg-transparent rounded-full transition-colors dark:text-gray-200 dark:hover:text-gray-200"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Scrollable Content */}
				<div className="overflow-y-auto max-h-[calc(95vh-80px)]">
					<div className="p-6">
						<div className="mb-4 text-center">
							<p className="text-gray-600">
								Review and edit the student information for the Certificate of
								Enrollment. Edit the details and print when ready.
								{selectedStrand && selectedStrand !== "GENERAL" && (
									<span className="block mt-2 text-sm text-blue-600">
										Using {selectedStrand} strand template
									</span>
								)}
							</p>
						</div>

						{renderTemplate()}
					</div>
				</div>
			</div>
		</div>
	);
}
