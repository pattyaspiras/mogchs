import React, { useRef, useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Edit3, Save, X, Download, Printer } from "lucide-react";
import toast from "react-hot-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { getStrands } from "../../../utils/registrar";

export default function CavTemplate({
	studentInfo,
	onSave,
	isEditable = true,
	strandDefaults,
	strandType,
	request,
	expectedReleaseDate,
	purposeText,
}) {
	const [isEditing, setIsEditing] = useState(false);
	const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
	const certificateRef = useRef(null);

	// Add global CSS to remove browser print elements
	useEffect(() => {
		const style = document.createElement("style");
		style.textContent = `
			@media print {
				@page {
					margin: 0 !important;
					size: A4 !important;
					margin-top: 0 !important;
					margin-bottom: 0 !important;
					margin-left: 0 !important;
					margin-right: 0 !important;
				}
				@page :first {
					margin-top: 0 !important;
				}
				@page :left {
					margin-left: 0 !important;
				}
				@page :right {
					margin-right: 0 !important;
				}
				body {
					margin: 0 !important;
					padding: 0 !important;
					-webkit-print-color-adjust: exact !important;
					color-adjust: exact !important;
					print-color-adjust: exact !important;
				}
				html {
					margin: 0 !important;
					padding: 0 !important;
				}
				* {
					-webkit-print-color-adjust: exact !important;
					color-adjust: exact !important;
					print-color-adjust: exact !important;
				}
			}
		`;
		document.head.appendChild(style);

		return () => {
			document.head.removeChild(style);
		};
	}, []);

	const [certificateData, setCertificateData] = useState({
		fullName: "",
		firstname: "",
		middlename: "",
		lastname: "",
		lrn: "",
		birthPlace: "",
		birthDate: "",
		gradeLevel: "Grade-12",
		strand: "Science, Technology, Engineering, and Mathematics (STEM)",
		semester: "Second Semester",
		schoolYear: "2022 - 2023",
		dateIssued: "",
		purpose: "Certification, Authentication, and Verification",
		principalName: "MELENDE B. CATID, PhD",
		principalTitle: "School Principal IV",
		strandId: "",
		// Page 1 editable fields
		page1SchoolYear: "2021 - 2022",
		// Page 2 editable fields
		page2StudentName: "",
		page2Date: "AUGUST 01, 2023",
		// Page 3 editable fields
		page3StudentName: "",
		page3SchoolName:
			"Misamis Oriental General Comprehensive High School (MOGCHS)",
		page3SchoolAddress: "Don Apolinar Velez St., Cagayan de Oro City",
		page3GradeLevel: "Grade 12",
		page3SchoolYearCompleted: "2022 - 2023",
		page3Track: "Academic",
		page3GraduationDate: "July 07, 2023",
		page3SchoolYearGraduated: "2022 - 2023",
		page3SpecialOrderNumber: "N/A",
		page3SpecialOrderDate: "N/A",
		page3IssueDate: "1st day of August 2023",
		// Page 4 editable fields
		page4ControlNo: "",
		page4DateOfApplication: "",
		page4DateOfRelease: "",
		page4StudentName: "",
		page4SchoolId: "",
		page4SchoolYearLastAttended: "",
		page4PresentAddress: "",
		page4ContactNo: "",
		page4Purposes: [],
	});

	const [strands, setStrands] = useState([]);

	useEffect(() => {
		if (studentInfo) {
			const fullName = `${studentInfo.firstname} ${
				studentInfo.middlename ? studentInfo.middlename + " " : ""
			}${studentInfo.lastname}`.trim();

			// Set default date to current date if not provided
			const currentDate = new Date();
			const day = currentDate.getDate();
			const month = currentDate.toLocaleString("en-US", { month: "long" });
			const year = currentDate.getFullYear();
			const ordinalSuffix = getOrdinalSuffix(day);

			// Use strandDefaults if provided, otherwise use studentInfo.strand or default
			const defaultStrand =
				strandDefaults?.strand ||
				studentInfo.strand ||
				"Science, Technology, Engineering, and Mathematics (STEM)";

			// Get purpose from request data or use default
			const requestPurpose =
				request?.purpose || "scholarship application purposes only";

			setCertificateData((prev) => ({
				...prev,
				// DB-driven or name display fields update from studentInfo
				fullName,
				firstname: studentInfo.firstname ?? prev.firstname ?? "",
				middlename: studentInfo.middlename ?? prev.middlename ?? "",
				lastname: studentInfo.lastname ?? prev.lastname ?? "",
				lrn: studentInfo.lrn ?? prev.lrn ?? "",
				birthPlace: studentInfo.birthPlace ?? prev.birthPlace ?? "",
				birthDate: studentInfo.birthDate
					? new Date(studentInfo.birthDate).toLocaleDateString("en-US", {
							month: "long",
							day: "numeric",
							year: "numeric",
					  })
					: prev.birthDate ?? "",
				strand: defaultStrand || prev.strand,
				strandId: studentInfo.strandId
					? String(studentInfo.strandId)
					: prev.strandId || "",
				// Non-DB fields are preserved if user edited them already
				gradeLevel: prev.gradeLevel || "Grade-12",
				semester: prev.semester || "Second Semester",
				schoolYear: prev.schoolYear || "2022 - 2023",
				dateIssued:
					prev.dateIssued || `${ordinalSuffix} day of ${month} ${year}`,
				purpose: prev.purpose || requestPurpose,
				principalName: prev.principalName || "MELENDE B. CATID, PhD",
				principalTitle: prev.principalTitle || "School Principal IV",
				// Page 1 editable fields
				page1SchoolYear: prev.page1SchoolYear || "2021 - 2022",
				// Page 2 editable fields
				page2StudentName: prev.page2StudentName || fullName,
				page2Date: prev.page2Date || "AUGUST 01, 2023",
				// Page 3 editable fields
				page3StudentName: prev.page3StudentName || fullName,
				page3SchoolName:
					prev.page3SchoolName ||
					"Misamis Oriental General Comprehensive High School (MOGCHS)",
				page3SchoolAddress:
					prev.page3SchoolAddress ||
					"Don Apolinar Velez St., Cagayan de Oro City",
				page3GradeLevel: prev.page3GradeLevel || "Grade 12",
				page3SchoolYearCompleted:
					prev.page3SchoolYearCompleted || "2022 - 2023",
				page3Track: prev.page3Track || "Academic",
				page3GraduationDate: prev.page3GraduationDate || "July 07, 2023",
				page3SchoolYearGraduated:
					prev.page3SchoolYearGraduated || "2022 - 2023",
				page3SpecialOrderNumber: prev.page3SpecialOrderNumber || "N/A",
				page3SpecialOrderDate: prev.page3SpecialOrderDate || "N/A",
				page3IssueDate: prev.page3IssueDate || "1st day of August 2023",
				// Page 4 editable fields
				page4ControlNo:
					prev.page4ControlNo ||
					(studentInfo.controlNo ? String(studentInfo.controlNo) : ""),
				page4DateOfApplication:
					prev.page4DateOfApplication ||
					(request?.dateRequested
						? new Date(request.dateRequested).toLocaleDateString("en-US", {
								year: "numeric",
								month: "long",
								day: "numeric",
						  })
						: ""),
				page4DateOfRelease:
					prev.page4DateOfRelease || expectedReleaseDate || "",
				page4StudentName: prev.page4StudentName || fullName,
				page4SchoolId: prev.page4SchoolId || studentInfo.lrn || "",
				page4SchoolYearLastAttended:
					prev.page4SchoolYearLastAttended || studentInfo.schoolYear || "",
				page4PresentAddress:
					prev.page4PresentAddress || studentInfo.completeAddress || "",
				page4ContactNo: prev.page4ContactNo || studentInfo.contactNo || "",
				page4Purposes:
					prev.page4Purposes ||
					(purposeText
						? [{ purposeName: purposeText }]
						: studentInfo.purposes || []),
			}));
		}

		// Fetch strands from backend
		const fetchStrands = async () => {
			try {
				const data = await getStrands();
				let strandsArray = data;
				if (typeof data === "string") {
					try {
						strandsArray = JSON.parse(data);
					} catch (e) {
						strandsArray = [];
					}
				}
				setStrands(Array.isArray(strandsArray) ? strandsArray : []);
			} catch (error) {
				toast.error("Failed to load strands");
			}
		};
		fetchStrands();
	}, [studentInfo, strandDefaults, request, expectedReleaseDate, purposeText]);

	// When strands load, if we don't yet have a strandId, try to derive it from the strand text/acronym
	useEffect(() => {
		if (strands && strands.length > 0 && !certificateData.strandId) {
			if (studentInfo?.strandId) {
				setCertificateData((prev) => ({
					...prev,
					strandId: String(studentInfo.strandId),
				}));
				return;
			}
			const acronymMatch = (certificateData.strand || "").match(/\(([^)]+)\)/);
			const target = acronymMatch ? acronymMatch[1] : certificateData.strand;
			const found = strands.find((s) =>
				String(s.name).toLowerCase().includes(String(target).toLowerCase())
			);
			if (found) {
				setCertificateData((prev) => ({ ...prev, strandId: String(found.id) }));
			}
		}
	}, [strands, certificateData.strand, studentInfo]);

	const getOrdinalSuffix = (day) => {
		if (day > 3 && day < 21) return day + "th";
		switch (day % 10) {
			case 1:
				return day + "st";
			case 2:
				return day + "nd";
			case 3:
				return day + "rd";
			default:
				return day + "th";
		}
	};

	const handleInputChange = (field, value) => {
		setCertificateData((prev) => ({ ...prev, [field]: value }));
	};

	const handleStrandChange = (strandId) => {
		const selectedStrand = strands.find(
			(s) => String(s.id) === String(strandId)
		);
		setCertificateData((prev) => ({
			...prev,
			strand: selectedStrand ? selectedStrand.name : "",
			strandId: strandId,
		}));
	};

	const isPurposeSelected = (purposeName) => {
		return certificateData.page4Purposes.some(
			(p) =>
				p.purposeName &&
				p.purposeName.toLowerCase().includes(purposeName.toLowerCase())
		);
	};

	const generatePDF = async () => {
		if (
			!certificateData.fullName ||
			!certificateData.lrn ||
			!certificateData.strand
		) {
			toast.error("Please complete all fields before exporting.");
			return;
		}

		setIsGeneratingPDF(true);
		try {
			// Create a temporary container for all three pages
			const tempContainer = document.createElement("div");
			tempContainer.style.position = "absolute";
			tempContainer.style.left = "-9999px";
			tempContainer.style.top = "0";
			tempContainer.style.width = "210mm";
			tempContainer.style.backgroundColor = "#ffffff";
			tempContainer.style.fontFamily = "Times New Roman, Times, serif";
			tempContainer.style.fontSize = "12pt";
			tempContainer.style.lineHeight = "1.5";
			document.body.appendChild(tempContainer);

			// Generate HTML content for all three pages
			const htmlContent = `
				<!-- PAGE 1: Current CAV Template Content -->
				<div style="width: 210mm; height: 297mm; padding: 18mm; page-break-after: always; position: relative;">
					<div style="text-align: center; margin-bottom: 8mm;">
						<div style="font-size: 12pt; margin-bottom: 2mm; font-style: italic; color: #222;">Republic of the Philippines</div>
						<div style="font-size: 16pt; font-weight: bold; margin-bottom: 2mm; color: #111;">Department of Education</div>
						<div style="font-size: 10pt; font-weight: bold; color: #222;">REGION - X NORTHERN MINDANAO</div>
						<div style="font-size: 10pt; font-weight: bold; color: #222;">SCHOOLS DIVISION OF MISAMIS ORIENTAL</div>
						<div style="font-size: 12pt; font-weight: bold; margin-top: 1mm; color: #111;">MISAMIS ORIENTAL GENERAL COMPREHENSIVE HIGH SCHOOL</div>
					</div>

					<div style="text-align: left; font-size: 10pt; margin-top: 6mm; margin-bottom: 1.5mm; color: #222;">Office of the School Principal</div>
					<div style="border-top: 1px solid #666; width: 100%; margin-bottom: 8mm;"></div>

					<div style="text-align: center; font-size: 20pt; font-weight: bold; margin-bottom: 8mm; text-transform: uppercase; letter-spacing: 0.5px; color: #111;">CERTIFICATION</div>

					<div style="font-size: 12pt; color: #222;">
						<p style="margin-bottom: 4.5mm;"><strong>TO WHOM IT MAY CONCERN:</strong></p>
						<p style="margin-bottom: 4.5mm; text-indent: 10mm;">This is to certify that, based on the available records in this school, the following information pertaining to <span style="font-weight: bold; text-transform: uppercase; text-decoration: underline;">${
							certificateData.fullName
						}</span> with Learner Reference Number <span style="font-weight: bold; text-decoration: underline;">${
				certificateData.lrn
			}</span> appear:</p>
						
						<div style="margin-left: 20mm; margin-top: 4mm; margin-bottom: 4mm;">
							<p style="margin-bottom: 2mm;">( / ) enrolled in <span style="font-weight: bold; text-decoration: underline;">Grade 11</span> during the School Year <span style="font-weight: bold; text-decoration: underline;">2021 - 2022</span></p>
							<p style="margin-bottom: 2mm;">( / ) completed <span style="font-weight: bold; text-decoration: underline;">Grade 12</span> during the School Year <span style="font-weight: bold; text-decoration: underline;">${
								certificateData.schoolYear
							}</span></p>
							<p style="margin-bottom: 2mm;">Track: <span style="font-weight: bold; text-decoration: underline;">Academic</span> Strand: <span style="font-weight: bold; text-decoration: underline;">${
								certificateData.strand
							}</span></p>
							<p style="margin-bottom: 2mm;">( / ) satisfactorily graduated <span style="font-weight: bold; text-decoration: underline;">from Senior High School</span> for the School Year <span style="font-weight: bold; text-decoration: underline;">2022-2023</span> per <span style="font-weight: bold; text-decoration: underline;">Special Order Number __N/A__</span> dated <span style="font-weight: bold; text-decoration: underline;">__N/A__</span> as prescribed by the Department of Education.</p>
						</div>
						
						<p style="margin-bottom: 4.5mm; text-indent: 10mm;">This certification is issued on <span style="font-weight: bold; text-decoration: underline;">${
							certificateData.dateIssued
						}</span> upon the request of <span style="font-weight: bold; text-transform: uppercase; text-decoration: underline;">${
				certificateData.fullName
			}</span>, in connection with the application for ${
				certificateData.purpose
			}.</p>
					</div>

					<div style="margin-top: 14mm;">
						<div style="font-weight: bold; text-transform: uppercase; margin-bottom: 1mm; color: #111;">${
							certificateData.principalName
						}</div>
						<div style="font-size: 10pt; margin-bottom: 1mm; color: #333;">${
							certificateData.principalTitle
						}</div>
					</div>
				</div>

				<!-- PAGE 2: 1st Indorsement -->
				<div style="width: 210mm; height: 297mm; padding: 18mm; page-break-after: always; position: relative;">
					<div style="text-align: center; margin-bottom: 8mm;">
						<div style="font-size: 12pt; margin-bottom: 2mm; font-style: italic; color: #222;">Republic of the Philippines</div>
						<div style="font-size: 16pt; font-weight: bold; margin-bottom: 2mm; color: #111;">Department of Education</div>
						<div style="font-size: 10pt; font-weight: bold; color: #222;">REGION - X NORTHERN MINDANAO</div>
						<div style="font-size: 10pt; font-weight: bold; color: #222;">SCHOOLS DIVISION OF MISAMIS ORIENTAL</div>
						<div style="font-size: 12pt; font-weight: bold; margin-top: 1mm; color: #111;">MISAMIS ORIENTAL GENERAL COMPREHENSIVE HIGH SCHOOL</div>
					</div>

					<div style="text-align: left; font-size: 10pt; margin-top: 6mm; margin-bottom: 1.5mm; color: #222;">Office of the School Principal</div>
					<div style="border-top: 1px solid #666; width: 100%; margin-bottom: 8mm;"></div>

					<div style="text-align: center; font-size: 18pt; font-weight: bold; margin-bottom: 4mm;">1st Indorsement</div>
					<div style="text-align: center; font-size: 14pt; font-weight: bold; margin-bottom: 8mm;">${
						certificateData.page2Date
					}</div>

					<div style="font-size: 12pt; color: #222;">
						<p style="margin-bottom: 4mm; text-align: justify;">Respectfully forwarded to the Regional Director, DepEd Regional Office Masterson Avenue, Upper Balulang, Zone 1, Cagayan de Oro City, the request of <span style="font-weight: bold; text-transform: uppercase; text-decoration: underline;">Mr. ${
							certificateData.page2StudentName
						}</span>, for Certification, Authentication and Verification (CAV) of his Academic School Records.</p>
						
						<p style="margin-bottom: 4mm; text-align: justify;">For ready reference and perusal, attached are the following documents / records (✓) below properly enclosed in sealed envelope:</p>
						
						<div style="margin: 8mm 0;">
							<p style="margin-bottom: 2mm;"><span style="color: #000; font-weight: bold;">✓</span> Certification of Enrollment/ Completion/Graduation</p>
							<p style="margin-bottom: 2mm;"><span style="color: #000; font-weight: bold;">✓</span> Certification of English as Medium of Instruction</p>
							<p style="margin-bottom: 2mm;"><span style="color: #000; font-weight: bold;">✓</span> Form - 137</p>
							<p style="margin-bottom: 2mm;"><span style="color: #000; font-weight: bold;">✓</span> Diploma</p>
						</div>
						
						<p style="margin-bottom: 4mm; text-align: justify;">For the preferential appropriate action of the Regional Director.</p>
					</div>

					<div style="margin-top: 14mm;">
						<div style="font-weight: bold; text-transform: uppercase; margin-bottom: 1mm; color: #111;">${
							certificateData.principalName
						}</div>
						<div style="font-size: 10pt; margin-bottom: 1mm; color: #333;">${
							certificateData.principalTitle
						}</div>
					</div>

					<div style="margin-top: 8mm; font-size: 9pt; text-align: left; color: #666;">
						Not Valid Without<br>School Dry Seal
					</div>

					<div style="border-top: 1px solid #666; margin-top: 10mm; margin-bottom: 4mm;"></div>
					<div style="display: flex; justify-content: space-between; align-items: flex-end; padding: 0 2mm;">
						<div style="display: flex; align-items: center; gap: 6mm;">
							<img style="width: 150px; height: auto; display: block;" src="/images/depedMatatag.png" alt="DepEd Matatag" />
							<img style="width: 60px; height: auto; display: block;" src="/images/mogchs.jpg" alt="MOGCHS" />
						</div>
						<div style="font-size: 9pt; text-align: right; color: #333;">
							Address: Velez Street, Brgy. 29, Cagayan de Oro City 9000<br>
							Telephone Nos.: (088) 856-3202<br>
							Website: www.depedmisor.com<br>
							Email: 304091@deped.gov.ph
						</div>
					</div>
				</div>

				<!-- PAGE 3: Certificate of Enrollment/CAV -->
				<div style="width: 210mm; height: 297mm; padding: 18mm; position: relative;">
					<div style="text-align: center; margin-bottom: 8mm;">
						<div style="font-size: 12pt; margin-bottom: 2mm; font-style: italic; color: #222;">Republic of the Philippines</div>
						<div style="font-size: 16pt; font-weight: bold; margin-bottom: 2mm; color: #111;">Department of Education</div>
						<div style="font-size: 10pt; font-weight: bold; color: #222;">REGION - X NORTHERN MINDANAO</div>
						<div style="font-size: 10pt; font-weight: bold; color: #222;">SCHOOLS DIVISION OF MISAMIS ORIENTAL</div>
						<div style="font-size: 12pt; font-weight: bold; margin-top: 1mm; color: #111;">MISAMIS ORIENTAL GENERAL COMPREHENSIVE HIGH SCHOOL</div>
					</div>

					<div style="text-align: left; font-size: 10pt; margin-top: 6mm; margin-bottom: 1.5mm; color: #222;">Office of the School Principal</div>
					<div style="border-top: 1px solid #666; width: 100%; margin-bottom: 8mm;"></div>

					<div style="text-align: center; font-size: 20pt; font-weight: bold; margin-bottom: 8mm; text-transform: uppercase; letter-spacing: 0.5px; color: #111;">CERTIFICATION</div>

					<div style="font-size: 11pt; color: #222;">
						<p style="margin-bottom: 3.5mm;"><strong>TO WHOM IT MAY CONCERN:</strong></p>
						<p style="margin-bottom: 3.5mm; text-indent: 8mm;">This is to Certify that <span style="font-weight: bold; text-transform: uppercase; text-decoration: underline;">Mr. ${
							certificateData.page3StudentName
						}</span>, with Learner Reference Number <span style="font-weight: bold; text-decoration: underline;">${
				certificateData.lrn
			}</span> has <strong>graduated</strong> Senior High School Course as prescribed by the Department of Education, with the following particulars:</p>
						
						<div style="margin-left: 12mm; margin-top: 2mm; margin-bottom: 2mm;">
							<p style="margin-bottom: 0.8mm;"><strong>1. Name of School:</strong> <span style="font-weight: bold; text-decoration: underline;">${
								certificateData.page3SchoolName
							}</span></p>
							<p style="margin-bottom: 0.8mm;"><strong>2. School Address:</strong> <span style="font-weight: bold; text-decoration: underline;">${
								certificateData.page3SchoolAddress
							}</span></p>
							<p style="margin-bottom: 0.8mm;"><strong>3. Grade Level Completed:</strong> <span style="font-weight: bold; text-decoration: underline;">${
								certificateData.page3GradeLevel
							}</span> <strong>School Year Completed:</strong> <span style="font-weight: bold; text-decoration: underline;">${
				certificateData.page3SchoolYearCompleted
			}</span></p>
							<p style="margin-bottom: 0.8mm;"><strong>Track:</strong> <span style="font-weight: bold; text-decoration: underline;">${
								certificateData.page3Track
							}</span></p>
							<p style="margin-bottom: 0.8mm;"><strong>Strand:</strong> <span style="font-weight: bold; text-decoration: underline;">${
								certificateData.strand
							}</span></p>
							<p style="margin-bottom: 0.8mm;"><strong>4. Graduated on:</strong> <span style="font-weight: bold; text-decoration: underline;">${
								certificateData.page3GraduationDate
							}</span> <strong>School Year graduated:</strong> <span style="font-weight: bold; text-decoration: underline;">${
				certificateData.page3SchoolYearGraduated
			}</span></p>
							<p style="margin-bottom: 0.8mm;"><strong>5. Special Order Number*:</strong> <span style="font-weight: bold; text-decoration: underline;">${
								certificateData.page3SpecialOrderNumber
							}</span></p>
							<p style="margin-bottom: 0.8mm;">&nbsp;&nbsp;&nbsp;&nbsp;<strong>Date:</strong> <span style="font-weight: bold; text-decoration: underline;">${
								certificateData.page3SpecialOrderDate
							}</span></p>
						</div>
						
						<p style="margin-bottom: 3.5mm; text-indent: 8mm;">This is to further certify that English Language was used as the medium of instruction in all subjects taught in the above-mentioned school, except for subjects that require the use of Filipino language only.</p>
						
						<p style="margin-bottom: 3.5mm; text-indent: 8mm;">This certification is issued on <span style="font-weight: bold; text-decoration: underline;">${
							certificateData.page3IssueDate
						}</span>, upon the request of <span style="font-weight: bold; text-transform: uppercase; text-decoration: underline;">${
				certificateData.page3StudentName
			}</span> in connection with his application for <strong>Certification, Authentication and Verification</strong>.</p>
					</div>

					<div style="margin-top: 10mm;">
						<div style="font-weight: bold; text-transform: uppercase; margin-bottom: 1mm; color: #111;">${
							certificateData.principalName
						}</div>
						<div style="font-size: 9pt; margin-bottom: 1mm; color: #333;">${
							certificateData.principalTitle
						}</div>
					</div>

					<div style="margin-top: 4mm; font-style: italic; font-size: 8pt; color: #666;">
						*If graduated from secondary course in private school, indicate Special Order Number and date.
					</div>

					<div style="margin-top: 6mm; font-size: 8pt; text-align: left; color: #666;">
						Not Valid Without<br>School Dry Seal
					</div>

					<div style="border-top: 1px solid #666; margin-top: 8mm; margin-bottom: 3mm;"></div>
					<div style="display: flex; justify-content: space-between; align-items: flex-end; padding: 0 2mm;">
						<div style="display: flex; align-items: center; gap: 6mm;">
							<img style="width: 150px; height: auto; display: block;" src="/images/depedMatatag.png" alt="DepEd Matatag" />
							<img style="width: 60px; height: auto; display: block;" src="/images/mogchs.jpg" alt="MOGCHS" />
						</div>
						<div style="font-size: 9pt; text-align: right; color: #333;">
							Address: Velez Street, Brgy. 29, Cagayan de Oro City 9000<br>
							Telephone Nos.: (088) 856-3202<br>
							Website: www.depedmisor.com<br>
							Email: 304091@deped.gov.ph
						</div>
					</div>
				</div>

				<!-- PAGE 4: Request Form -->
				<div style="width: 210mm; height: 297mm; padding: 18mm; position: relative;">
					<div style="text-align: center; margin-bottom: 8mm;">
						<div style="font-size: 12pt; margin-bottom: 2mm; font-style: italic; color: #222;">Republic of the Philippines</div>
						<div style="font-size: 16pt; font-weight: bold; margin-bottom: 2mm; color: #111;">Department of Education</div>
						<div style="font-size: 10pt; font-weight: bold; color: #222;">REGION - X NORTHERN MINDANAO</div>
						<div style="font-size: 10pt; font-weight: bold; color: #222;">SCHOOLS DIVISION OF MISAMIS ORIENTAL</div>
						<div style="font-size: 12pt; font-weight: bold; margin-top: 1mm; color: #111;">MISAMIS ORIENTAL GENERAL COMPREHENSIVE HIGH SCHOOL</div>
					</div>

					<div style="text-align: right; margin-bottom: 4mm;">
						<div style="font-size: 10pt; color: #222;">Control No.: <span style="font-weight: bold; text-decoration: underline;">${
							certificateData.page4ControlNo || "___"
						}</span></div>
					</div>

					<div style="text-align: right; margin-bottom: 4mm;">
						<div style="font-size: 10pt; color: #222;">Date of Application: <span style="font-weight: bold;">${
							certificateData.page4DateOfApplication
						}</span></div>
					</div>

					<div style="text-align: right; margin-bottom: 8mm;">
						<div style="font-size: 10pt; color: #222;">Date of Release: <span style="font-weight: bold;">${
							certificateData.page4DateOfRelease
						}</span></div>
					</div>

					<div style="text-align: left; margin-bottom: 4mm;">
						<div style="font-size: 11pt; font-weight: bold; text-decoration: underline; color: #111;">School Name: MISAMIS ORIENTAL GENERAL COMPREHENSIVE HIGH SCHOOL</div>
					</div>

					<div style="text-align: left; margin-bottom: 8mm;">
						<div style="font-size: 11pt; font-weight: bold; text-decoration: underline; color: #111;">School ID: ${
							certificateData.page4SchoolId
						}</div>
					</div>

					<div style="text-align: center; font-size: 14pt; font-weight: bold; margin-bottom: 8mm; text-transform: uppercase; letter-spacing: 0.5px; color: #111;">REQUEST FORM FOR ACADEMIC SCHOOL RECORDS</div>

					<div style="font-size: 11pt; color: #222; line-height: 1.6;">
						<div style="margin-bottom: 4mm;">
							<span style="font-weight: bold;">NAME OF LEARNER:</span> 
							<span style="border-bottom: 1px solid #000; display: inline-block; min-width: 300px; padding-bottom: 1px; margin-left: 5px; font-weight: bold;">
								${certificateData.page4StudentName}
							</span>
						</div>
						
						<div style="margin-bottom: 4mm;">
							<span style="font-weight: bold;">DATE & PLACE OF BIRTH:</span> 
							<span style="border-bottom: 1px solid #000; display: inline-block; min-width: 300px; padding-bottom: 1px; margin-left: 5px;">
								${
									certificateData.birthDate
										? `${certificateData.birthDate}, ${
												certificateData.birthPlace || ""
										  }`
										: "_________________________________"
								}
							</span>
						</div>
						
						<div style="margin-bottom: 4mm;">
							<span style="font-weight: bold;">SCHOOL YEAR LAST ATTENDED / GRADUATED:</span> 
							<span style="border-bottom: 1px solid #000; display: inline-block; min-width: 200px; padding-bottom: 1px; margin-left: 5px;">
								${certificateData.page4SchoolYearLastAttended || "_________________"}
							</span>
						</div>
						
						<div style="margin-bottom: 6mm;">
							<span style="font-weight: bold;">PRESENT ADDRESS:</span> 
							<span style="border-bottom: 1px solid #000; display: inline-block; min-width: 300px; padding-bottom: 1px; margin-left: 5px;">
								${certificateData.page4PresentAddress || "_________________________________"}
							</span>
						</div>
						
						<div style="margin-bottom: 6mm;">
							<span style="border-bottom: 1px solid #000; display: inline-block; min-width: 400px; padding-bottom: 1px;">
								_________________________________________________
							</span>
						</div>
						
						<div style="margin-bottom: 6mm;">
							<span style="font-weight: bold;">CONTACT NO.:</span> 
							<span style="border-bottom: 1px solid #000; display: inline-block; min-width: 200px; padding-bottom: 1px; margin-left: 5px;">
								${certificateData.page4ContactNo || "____________________"}
							</span>
						</div>

						<div style="margin-bottom: 6mm;">
							<div style="font-weight: bold; margin-bottom: 4mm;">PURPOSE:</div>
							<div style="margin-left: 10mm; font-size: 11pt;">
								${
									purposeText ||
									certificateData.page4Purposes
										.map((p) => p.purposeName)
										.join(", ") ||
									"No purpose specified"
								}
							</div>
						</div>
					</div>

					<div style="margin-top: 6mm; font-size: 8pt; text-align: left; color: #666;">
						Not Valid Without<br>School Dry Seal
					</div>

					<div style="border-top: 1px solid #666; margin-top: 8mm; margin-bottom: 3mm;"></div>
					<div style="display: flex; justify-content: space-between; align-items: flex-end; padding: 0 2mm;">
						<div style="display: flex; align-items: center; gap: 6mm;">
							<img style="width: 150px; height: auto; display: block;" src="/images/depedMatatag.png" alt="DepEd Matatag" />
							<img style="width: 60px; height: auto; display: block;" src="/images/mogchs.jpg" alt="MOGCHS" />
						</div>
						<div style="font-size: 9pt; text-align: right; color: #333;">
							Address: Velez Street, Brgy. 29, Cagayan de Oro City 9000<br>
							Telephone Nos.: (088) 856-3202<br>
							Website: www.depedmisor.com<br>
							Email: 304091@deped.gov.ph
						</div>
					</div>
				</div>
			`;

			tempContainer.innerHTML = htmlContent;

			// Generate PDF from the temporary container
			const canvas = await html2canvas(tempContainer, {
				scale: 2,
				useCORS: true,
				allowTaint: true,
				backgroundColor: "#ffffff",
				logging: false,
				removeContainer: true,
				foreignObjectRendering: false,
				imageTimeout: 0,
			});

			// Clean up temporary container
			document.body.removeChild(tempContainer);

			const imgData = canvas.toDataURL("image/png", 1.0);
			const pdf = new jsPDF("p", "mm", "a4");
			const imgWidth = 210;
			const pageHeight = 297;
			const imgHeight = (canvas.height * imgWidth) / canvas.width;
			let heightLeft = imgHeight;

			let position = 0;

			pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
			heightLeft -= pageHeight;

			while (heightLeft >= 0) {
				position = heightLeft - imgHeight;
				pdf.addPage();
				pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
				heightLeft -= pageHeight;
			}

			pdf.save(
				`CAV_Documents_${certificateData.fullName.replace(/\s+/g, "_")}.pdf`
			);
			toast.success("CAV documents exported successfully!");
		} catch (error) {
			console.error("Error generating PDF:", error);
			toast.error("Failed to generate PDF");
		} finally {
			setIsGeneratingPDF(false);
		}
	};

	const handlePrint = () => {
		const printWindow = window.open("", "_blank");
		printWindow.document.write(`
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>CAV Documents - ${certificateData.fullName}</title>
				<style>
					* { margin: 0; padding: 0; box-sizing: border-box; }
					@page { size: A4; margin: 0 !important; }
					html, body { height: 100%; }
					body {
						font-family: 'Times New Roman', Times, serif;
						background: #ffffff;
						line-height: 1.5;
						font-size: 12pt;
						-webkit-print-color-adjust: exact !important;
						print-color-adjust: exact !important;
					}
					.page-container {
						width: 210mm;
						height: 297mm;
						margin: 0 auto;
						padding: 18mm 18mm 16mm 18mm;
						position: relative;
						page-break-after: always;
					}
					.header { text-align: center; margin-bottom: 4mm; }
					.logo-img { width: 70px; height: 70px; object-fit: contain; margin: 0 auto 6px; display: block; }
					.republic { font-size: 12pt; margin-bottom: 2mm; font-style: italic; color: #222; }
					.department { font-size: 16pt; font-weight: bold; margin-bottom: 2mm; color: #111; }
					.region, .school-division { font-size: 10pt; font-weight: bold; color: #222; }
					.school-name { font-size: 12pt; font-weight: bold; margin-top: 1mm; color: #111; }
					.office { text-align: left; font-size: 10pt; margin-top: 6mm; margin-bottom: 1.5mm; color: #222; }
					.office-line { border-top: 1px solid #666; width: 100%; margin-bottom: 8mm; }
					.title { text-align: center; font-size: 18pt; font-weight: bold; margin-bottom: 6mm; text-transform: uppercase; letter-spacing: 0.5px; color: #111; }
					.content { font-size: 12pt; color: #222; }
					.content p { margin-bottom: 4.5mm; text-align: justify; text-justify: inter-word; }
					.content p.indent { text-indent: 10mm; }
					.student-name { font-weight: bold; text-transform: uppercase; text-decoration: underline; color: #111; }
					.lrn { font-weight: bold; text-decoration: underline; color: #111; }
					.grade-level, .strand, .school-year { font-weight: bold; color: #222; }
					.signature { margin-top: 12mm; }
					.signature-name { font-weight: bold; text-transform: uppercase; margin-bottom: 1mm; color: #111; }
					.signature-title { font-size: 10pt; margin-bottom: 1mm; color: #333; }
					.not-valid { margin-top: 8mm; font-size: 9pt; text-align: left; color: #666; }
					.footer-line { border-top: 1px solid #666; margin-top: 10mm; margin-bottom: 4mm; }
					.footer { display: flex; justify-content: space-between; align-items: flex-end; padding: 0 2mm; }
					.deped-logo { display: flex; align-items: center; gap: 6mm; }
					.matatag-logo { width: 150px; height: auto; display: block; }
					.mogchs-logo { width: 60px; height: auto; display: block; }
					.contact-info { font-size: 9pt; text-align: right; color: #333; }
					.indorsement-title { text-align: center; font-size: 18pt; font-weight: bold; margin-bottom: 4mm; }
					.indorsement-date { text-align: center; font-size: 14pt; font-weight: bold; margin-bottom: 8mm; }
					.indorsement-content { font-size: 12pt; color: #222; }
					.indorsement-content p { margin-bottom: 4mm; text-align: justify; }
					.checkmark-list { margin: 8mm 0; }
					.checkmark-list p { margin-bottom: 2mm; }
					.checkmark { color: #000; font-weight: bold; }
					@media print {
						html, body { margin: 0 !important; padding: 0 !important; }
					}
				</style>
			</head>
			<body>
				<!-- PAGE 1: Current CAV Template Content -->
				<div class="page-container">
					<div class="header">
						<img class="logo-img" src="/images/logo.png" alt="MOGCHS" />
						<div class="republic">Republic of the Philippines</div>
						<div class="department">Department of Education</div>
						<div class="region">REGION - X NORTHERN MINDANAO</div>
						<div class="school-division">SCHOOLS DIVISION OF MISAMIS ORIENTAL</div>
						<div class="school-name">MISAMIS ORIENTAL GENERAL COMPREHENSIVE HIGH SCHOOL</div>
					</div>

					<div class="title">CERTIFICATION</div>

										<div class="content">
						<p><strong>TO WHOM IT MAY CONCERN:</strong></p>
						<p class="indent">This is to certify that, based on the available records in this school, the following information pertaining to <span class="student-name">${
							certificateData.fullName
						}</span> with Learner Reference Number <span class="lrn">${
			certificateData.lrn
		}</span> appear:</p>
						
						<div style="margin-left: 20mm; margin-top: 4mm; margin-bottom: 4mm;">
							<p style="margin-bottom: 2mm;">( / ) enrolled in <span style="font-weight: bold; text-decoration: underline;">Grade 11</span> during the School Year <span style="font-weight: bold; text-decoration: underline;">${
								certificateData.page1SchoolYear
							}</span></p>
							<p style="margin-bottom: 2mm;">( / ) completed <span style="font-weight: bold; text-decoration: underline;">Grade 12</span> during the School Year <span style="font-weight: bold; text-decoration: underline;">${
								certificateData.schoolYear
							}</span></p>
							<p style="margin-bottom: 2mm;">Track: <span style="font-weight: bold; text-decoration: underline;">Academic</span> Strand: <span style="font-weight: bold; text-decoration: underline;">${
								certificateData.strand
							}</span></p>
							<p style="margin-bottom: 2mm;">( / ) satisfactorily graduated <span style="font-weight: bold; text-decoration: underline;">from Senior High School</span> for the School Year <span style="font-weight: bold; text-decoration: underline;">2022-2023</span> per <span style="font-weight: bold; text-decoration: underline;">Special Order Number __N/A__</span> dated <span style="font-weight: bold; text-decoration: underline;">__N/A__</span> as prescribed by the Department of Education.</p>
						</div>
						
						<p class="indent">This certification is issued on <span style="font-weight: bold; text-decoration: underline;">${
							certificateData.dateIssued
						}</span> upon the request of <span class="student-name">${
			certificateData.fullName
		}</span>, in connection with the application for ${
			certificateData.purpose
		}.</p>
					</div>

					<div class="signature">
						<div class="signature-name">${certificateData.principalName}</div>
						<div class="signature-title">${certificateData.principalTitle}</div>
					</div>

					<div class="not-valid">Not Valid Without<br>School Dry Seal</div>

					<div class="footer-line"></div>
					<div class="footer">
						<div class="deped-logo">
							<img class="matatag-logo" src="/images/depedMatatag.png" alt="DepEd Matatag" />
							<img class="mogchs-logo" src="/images/mogchs.jpg" alt="MOGCHS" />
						</div>
						<div class="contact-info">
							Address: Velez Street, Brgy. 29, Cagayan de Oro City 9000<br>
							Telephone Nos.: (088) 856-3202<br>
							Website: www.depedmisor.com<br>
							Email: 304091@deped.gov.ph
						</div>
					</div>
				</div>

				<!-- PAGE 2: 1st Indorsement -->
				<div class="page-container">
					<div class="header">
						<img class="logo-img" src="/images/logo.png" alt="MOGCHS" />
						<div class="republic">Republic of the Philippines</div>
						<div class="department">Department of Education</div>
						<div class="region">REGION - X NORTHERN MINDANAO</div>
						<div class="school-division">SCHOOLS DIVISION OF MISAMIS ORIENTAL</div>
						<div class="school-name">MISAMIS ORIENTAL GENERAL COMPREHENSIVE HIGH SCHOOL</div>
					</div>

					<div class="indorsement-title">1st Indorsement</div>
					<div class="indorsement-date">${certificateData.page2Date}</div>

					<div class="indorsement-content">
						<p>Respectfully forwarded to the Regional Director, DepEd Regional Office Masterson Avenue, Upper Balulang, Zone 1, Cagayan de Oro City, the request of <span class="student-name">Mr. ${
							certificateData.page2StudentName
						}</span>, for Certification, Authentication and Verification (CAV) of his Academic School Records.</p>
						
						<p>For ready reference and perusal, attached are the following documents / records (✓) below properly enclosed in sealed envelope:</p>
						
						<div class="checkmark-list">
							<p><span class="checkmark">✓</span> Certification of Enrollment/ Completion/Graduation</p>
							<p><span class="checkmark">✓</span> Certification of English as Medium of Instruction</p>
							<p><span class="checkmark">✓</span> Form - 137</p>
							<p><span class="checkmark">✓</span> Diploma</p>
						</div>
						
						<p>For the preferential appropriate action of the Regional Director.</p>
					</div>

					<div class="signature">
						<div class="signature-name">${certificateData.principalName}</div>
						<div class="signature-title">${certificateData.principalTitle}</div>
					</div>

					<div class="footer-line"></div>
					<div class="footer">
						<div class="deped-logo">
							<img class="matatag-logo" src="/images/depedMatatag.png" alt="DepEd Matatag" />
							<img class="mogchs-logo" src="/images/mogchs.jpg" alt="MOGCHS" />
						</div>
						<div class="contact-info">
							Address: Velez Street, Brgy. 29, Cagayan de Oro City 9000<br>
							Telephone Nos.: (088) 856-3202<br>
							Website: www.depedmisor.com<br>
							Email: 304091@deped.gov.ph
						</div>
					</div>
				</div>

				<!-- PAGE 3: Certificate of Enrollment/CAV -->
				<div class="page-container">
					<div class="header">
						<img class="logo-img" src="/images/logo.png" alt="MOGCHS" />
						<div class="republic">Republic of the Philippines</div>
						<div class="department">Department of Education</div>
						<div class="region">REGION - X NORTHERN MINDANAO</div>
						<div class="school-division">SCHOOLS DIVISION OF MISAMIS ORIENTAL</div>
						<div class="school-name">MISAMIS ORIENTAL GENERAL COMPREHENSIVE HIGH SCHOOL</div>
					</div>

					<div class="title">CERTIFICATION</div>

					<div class="content">
						<p><strong>TO WHOM IT MAY CONCERN:</strong></p>
						<p class="indent">This is to Certify that <span class="student-name">Mr. ${
							certificateData.page3StudentName
						}</span>, with Learner Reference Number <span class="lrn">${
			certificateData.lrn
		}</span> has <strong>graduated</strong> Senior High School Course as prescribed by the Department of Education, with the following particulars:</p>
						
						<div style="margin-left: 12mm; margin-top: 2mm; margin-bottom: 2mm;">
							<p style="margin-bottom: 0.8mm;"><strong>1. Name of School:</strong> <span style="font-weight: bold; text-decoration: underline;">${
								certificateData.page3SchoolName
							}</span></p>
							<p style="margin-bottom: 0.8mm;"><strong>2. School Address:</strong> <span style="font-weight: bold; text-decoration: underline;">${
								certificateData.page3SchoolAddress
							}</span></p>
							<p style="margin-bottom: 0.8mm;"><strong>3. Grade Level Completed:</strong> <span style="font-weight: bold; text-decoration: underline;">${
								certificateData.page3GradeLevel
							}</span> <strong>School Year Completed:</strong> <span style="font-weight: bold; text-decoration: underline;">${
			certificateData.page3SchoolYearCompleted
		}</span></p>
							<p style="margin-bottom: 0.8mm;"><strong>Track:</strong> <span style="font-weight: bold; text-decoration: underline;">${
								certificateData.page3Track
							}</span> <strong>Strand:</strong> <span style="font-weight: bold; text-decoration: underline;">${
			certificateData.strand
		}</span></p>
							<p style="margin-bottom: 0.8mm;"><strong>4. Graduated on:</strong> <span style="font-weight: bold; text-decoration: underline;">${
								certificateData.page3GraduationDate
							}</span> <strong>School Year graduated:</strong> <span style="font-weight: bold; text-decoration: underline;">${
			certificateData.page3SchoolYearGraduated
		}</span></p>
							<p style="margin-bottom: 0.8mm;"><strong>5. Special Order Number*:</strong> <span style="font-weight: bold; text-decoration: underline;">${
								certificateData.page3SpecialOrderNumber
							}</span></p>
							<p style="margin-bottom: 0.8mm;">&nbsp;&nbsp;&nbsp;&nbsp;<strong>Date:</strong> <span style="font-weight: bold; text-decoration: underline;">${
								certificateData.page3SpecialOrderDate
							}</span></p>
						</div>
						
						<p class="indent">This is to further certify that English Language was used as the medium of instruction in all subjects taught in the above-mentioned school, except for subjects that require the use of Filipino language only.</p>
						
						<p class="indent">This certification is issued on <span style="font-weight: bold; text-decoration: underline;">${
							certificateData.page3IssueDate
						}</span>, upon the request of <span class="student-name">${
			certificateData.page3StudentName
		}</span> in connection with his application for <strong>Certification, Authentication and Verification</strong>.</p>
					</div>

					<div class="signature">
						<div class="signature-name">${certificateData.principalName}</div>
						<div class="signature-title">${certificateData.principalTitle}</div>
					</div>

					<div style="margin-top: 4mm; font-style: italic; font-size: 8pt; color: #666;">
						*If graduated from secondary course in private school, indicate Special Order Number and date.
					</div>

					<div class="footer-line"></div>
					<div class="footer">
						<div class="deped-logo">
							<img class="matatag-logo" src="/images/depedMatatag.png" alt="DepEd Matatag" />
							<img class="mogchs-logo" src="/images/mogchs.jpg" alt="MOGCHS" />
						</div>
						<div class="contact-info">
							Address: Velez Street, Brgy. 29, Cagayan de Oro City 9000<br>
							Telephone Nos.: (088) 856-3202<br>
							Website: www.depedmisor.com<br>
							Email: 304091@deped.gov.ph
						</div>
					</div>
				</div>

				<!-- PAGE 4: Request Form -->
				<div class="page-container">
					<div class="header">
						<img class="logo-img" src="/images/logo.png" alt="MOGCHS" />
						<div class="republic">Republic of the Philippines</div>
						<div class="department">Department of Education</div>
						<div class="region">REGION - X NORTHERN MINDANAO</div>
						<div class="school-division">SCHOOLS DIVISION OF MISAMIS ORIENTAL</div>
						<div class="school-name">MISAMIS ORIENTAL GENERAL COMPREHENSIVE HIGH SCHOOL</div>
					</div>

					<div style="text-align: right; margin-bottom: 4mm;">
						<div style="font-size: 10pt; color: #222;">Control No.: <span style="font-weight: bold; text-decoration: underline;">${
							certificateData.page4ControlNo || "___"
						}</span></div>
					</div>

					<div style="text-align: right; margin-bottom: 4mm;">
						<div style="font-size: 10pt; color: #222;">Date of Application: <span style="font-weight: bold;">${
							certificateData.page4DateOfApplication
						}</span></div>
					</div>

					<div style="text-align: right; margin-bottom: 8mm;">
						<div style="font-size: 10pt; color: #222;">Date of Release: <span style="font-weight: bold;">${
							certificateData.page4DateOfRelease
						}</span></div>
					</div>

					<div style="text-align: left; margin-bottom: 4mm;">
						<div style="font-size: 11pt; font-weight: bold; text-decoration: underline; color: #111;">School Name: MISAMIS ORIENTAL GENERAL COMPREHENSIVE HIGH SCHOOL</div>
					</div>

					<div style="text-align: left; margin-bottom: 8mm;">
						<div style="font-size: 11pt; font-weight: bold; text-decoration: underline; color: #111;">School ID: ${
							certificateData.page4SchoolId
						}</div>
					</div>

					<div style="text-align: center; font-size: 14pt; font-weight: bold; margin-bottom: 8mm; text-transform: uppercase; letter-spacing: 0.5px; color: #111;">REQUEST FORM FOR ACADEMIC SCHOOL RECORDS</div>

					<div style="font-size: 11pt; color: #222; line-height: 1.6;">
						<div style="margin-bottom: 4mm;">
							<span style="font-weight: bold;">NAME OF LEARNER:</span> 
							<span style="border-bottom: 1px solid #000; display: inline-block; min-width: 300px; padding-bottom: 1px; margin-left: 5px; font-weight: bold;">
								${certificateData.page4StudentName}
							</span>
						</div>
						
						<div style="margin-bottom: 4mm;">
							<span style="font-weight: bold;">DATE & PLACE OF BIRTH:</span> 
							<span style="border-bottom: 1px solid #000; display: inline-block; min-width: 300px; padding-bottom: 1px; margin-left: 5px;">
								${
									certificateData.birthDate
										? `${certificateData.birthDate}, ${
												certificateData.birthPlace || ""
										  }`
										: "_________________________________"
								}
							</span>
						</div>
						
						<div style="margin-bottom: 4mm;">
							<span style="font-weight: bold;">SCHOOL YEAR LAST ATTENDED / GRADUATED:</span> 
							<span style="border-bottom: 1px solid #000; display: inline-block; min-width: 200px; padding-bottom: 1px; margin-left: 5px;">
								${certificateData.page4SchoolYearLastAttended || "_________________"}
							</span>
						</div>
						
						<div style="margin-bottom: 6mm;">
							<span style="font-weight: bold;">PRESENT ADDRESS:</span> 
							<span style="border-bottom: 1px solid #000; display: inline-block; min-width: 300px; padding-bottom: 1px; margin-left: 5px;">
								${certificateData.page4PresentAddress || "_________________________________"}
							</span>
						</div>
						
						<div style="margin-bottom: 6mm;">
							<span style="border-bottom: 1px solid #000; display: inline-block; min-width: 400px; padding-bottom: 1px;">
								_________________________________________________
							</span>
						</div>
						
						<div style="margin-bottom: 6mm;">
							<span style="font-weight: bold;">CONTACT NO.:</span> 
							<span style="border-bottom: 1px solid #000; display: inline-block; min-width: 200px; padding-bottom: 1px; margin-left: 5px;">
								${certificateData.page4ContactNo || "____________________"}
							</span>
						</div>

						<div style="margin-bottom: 6mm;">
							<div style="font-weight: bold; margin-bottom: 4mm;">PURPOSE:</div>
							<div style="margin-left: 10mm; font-size: 11pt;">
								${
									purposeText ||
									certificateData.page4Purposes
										.map((p) => p.purposeName)
										.join(", ") ||
									"No purpose specified"
								}
							</div>
						</div>
					</div>

					<div style="margin-top: 6mm; font-size: 8pt; text-align: left; color: #666;">
						Not Valid Without<br>School Dry Seal
					</div>

					<div class="footer-line"></div>
					<div class="footer">
						<div class="deped-logo">
							<img class="matatag-logo" src="/images/depedMatatag.png" alt="DepEd Matatag" />
							<img class="mogchs-logo" src="/images/mogchs.jpg" alt="MOGCHS" />
						</div>
						<div class="contact-info">
							Address: Velez Street, Brgy. 29, Cagayan de Oro City 9000<br>
							Telephone Nos.: (088) 856-3202<br>
							Website: www.depedmisor.com<br>
							Email: 304091@deped.gov.ph
						</div>
					</div>
				</div>
			</body>
			</html>
		`);
		printWindow.document.close();
		printWindow.focus();

		// Wait for content to load before printing
		printWindow.onload = function () {
			setTimeout(() => {
				printWindow.print();
				printWindow.close();
			}, 100);
		};
	};

	return (
		<div className="mx-auto w-full max-w-full sm:max-w-[297mm] bg-white p-2 sm:p-4 text-center font-serif text-black print:max-w-full print:border-none">
			<div className="overflow-x-auto">
				<div
					ref={certificateRef}
					className="relative p-3 sm:p-4 mb-20 min-w-[340px] sm:min-w-[800px] max-w-[297mm] mx-auto bg-white"
					style={{
						minHeight: "210mm",
						maxHeight: "297mm",
						// Ensure clean rendering
						WebkitPrintColorAdjust: "exact",
						colorAdjust: "exact",
						// Remove browser print elements
						pageBreakAfter: "always",
						pageBreakInside: "avoid",
					}}
				>
					{/* Decorative inner border */}
					<div className="absolute inset-1 border-2 border-gray-400 pointer-events-none"></div>

					{/* Header with seal */}
					<div className="mb-6 text-center">
						<img
							src="/images/logo.png"
							alt="MOGCHS"
							className="object-contain mx-auto mb-4 w-16 h-16"
						/>

						{/* Republic and Department with decorative styling */}
						<p className="mb-2 font-serif text-sm italic text-gray-700">
							Republic of the Philippines
						</p>
						<p className="mb-2 text-lg font-bold text-gray-900">
							Department of Education
						</p>
						<p className="mb-1 text-xs font-bold text-gray-800">
							REGION - X NORTHERN MINDANAO
						</p>
						<p className="mb-1 text-xs font-bold text-gray-800">
							SCHOOLS DIVISION OF MISAMIS ORIENTAL
						</p>
						<p className="mb-4 text-sm font-bold text-gray-900">
							MISAMIS ORIENTAL GENERAL COMPREHENSIVE HIGH SCHOOL
						</p>
					</div>

					{/* Office with horizontal line */}
					<div className="mb-6">
						<p className="mb-2 text-sm text-left text-gray-800">
							Office of the School Principal
						</p>
						<div className="w-full border-t border-gray-400"></div>
					</div>

					{/* Title */}
					<h1 className="mb-6 text-xl font-bold tracking-wide text-center text-gray-900">
						CERTIFICATION
					</h1>

					{/* Content */}
					<div className="mb-6 space-y-4 text-sm leading-relaxed text-left text-gray-800">
						<p className="mb-4 font-bold">TO WHOM IT MAY CONCERN:</p>

						<p className="mb-4 leading-6 text-justify">
							This is to certify that, based on the available records in this
							school, the following information pertaining to{" "}
							<span className="font-bold text-gray-900 underline uppercase">
								{certificateData.fullName}
							</span>{" "}
							with Learner Reference Number{" "}
							<span className="font-bold text-gray-900 underline">
								{certificateData.lrn}
							</span>{" "}
							appear:
						</p>

						<div className="mb-4 ml-8 space-y-2 text-sm">
							<p>
								( / ) enrolled in{" "}
								<span className="font-bold underline">Grade 11</span> during the
								School Year{" "}
								{isEditing ? (
									<Input
										value={certificateData.page1SchoolYear}
										onChange={(e) =>
											handleInputChange("page1SchoolYear", e.target.value)
										}
										className="inline-block mx-1 w-24 font-bold text-center text-gray-800 bg-transparent border-b-2 border-blue-400"
										placeholder="School year"
									/>
								) : (
									<span className="font-bold underline">
										{certificateData.page1SchoolYear}
									</span>
								)}
							</p>
							<p>
								( / ) completed{" "}
								<span className="font-bold underline">Grade 12</span> during the
								School Year{" "}
								{isEditing ? (
									<Input
										value={certificateData.schoolYear}
										onChange={(e) =>
											handleInputChange("schoolYear", e.target.value)
										}
										className="inline-block mx-1 w-24 font-bold text-center text-gray-800 bg-transparent border-b-2 border-gray-400"
									/>
								) : (
									<span className="font-bold text-gray-800 underline">
										{certificateData.schoolYear}
									</span>
								)}
							</p>
							<p>
								Track: <span className="font-bold underline">Academic</span>{" "}
								Strand:{" "}
								<span className="font-bold text-gray-800 underline">
									{certificateData.strand}
								</span>
							</p>
							<p>
								( / ) satisfactorily graduated{" "}
								<span className="font-bold underline">
									from Senior High School
								</span>{" "}
								for the School Year{" "}
								<span className="font-bold underline">2022-2023</span> per{" "}
								<span className="font-bold underline">
									Special Order Number __N/A__
								</span>{" "}
								dated <span className="font-bold underline">__N/A__</span> as
								prescribed by the Department of Education.
							</p>
						</div>

						<p className="mb-4 leading-6 text-justify">
							This certification is issued on{" "}
							{isEditing ? (
								<Input
									value={certificateData.dateIssued}
									onChange={(e) =>
										handleInputChange("dateIssued", e.target.value)
									}
									className="inline-block mx-1 w-40 text-center text-gray-800 bg-transparent border-b-2 border-gray-400"
								/>
							) : (
								<span className="font-bold text-gray-800 underline">
									{certificateData.dateIssued}
								</span>
							)}{" "}
							upon the request of{" "}
							<span className="font-bold text-gray-900 underline uppercase">
								{certificateData.fullName}
							</span>
							, in connection with the application for{" "}
							{isEditing ? (
								<Input
									value={certificateData.purpose}
									onChange={(e) => handleInputChange("purpose", e.target.value)}
									className="inline-block mx-1 w-48 text-center text-gray-800 bg-transparent border-b-2 border-gray-400"
								/>
							) : (
								<span className="text-gray-800">{certificateData.purpose}</span>
							)}
							.
						</p>
					</div>

					{/* Signature */}
					<div className="mb-6 text-left">
						{isEditing ? (
							<Input
								value={certificateData.principalName}
								onChange={(e) =>
									handleInputChange("principalName", e.target.value)
								}
								className="mb-2 w-56 font-bold text-center text-gray-900 uppercase bg-transparent border-b-2 border-gray-400"
							/>
						) : (
							<p className="mb-2 font-bold text-gray-900 uppercase">
								{certificateData.principalName}
							</p>
						)}
						{isEditing ? (
							<Input
								value={certificateData.principalTitle}
								onChange={(e) =>
									handleInputChange("principalTitle", e.target.value)
								}
								className="w-40 text-gray-800 bg-transparent border-b-2 border-gray-400"
							/>
						) : (
							<p className="text-gray-800">{certificateData.principalTitle}</p>
						)}
					</div>

					{/* Not Valid Without */}
					<div className="mb-6 text-xs text-left text-gray-600">
						<p>Not Valid Without</p>
						<p>School Dry Seal</p>
					</div>

					{/* Footer with horizontal line */}
					<div className="mb-4 border-t border-gray-400"></div>
					<div className="flex justify-between items-end p-4 bg-gray-50">
						<div className="flex gap-3 items-end text-center">
							<img
								src="/images/depedMatatag.png"
								alt="DepEd Matatag"
								className="object-contain mx-auto w-36 h-auto"
							/>
							<img
								src="/images/mogchs.jpg"
								alt="MOGCHS"
								className="object-contain w-16 h-auto"
							/>
						</div>
						<div className="text-xs text-right text-gray-700">
							<p>Address: Velez Street, Brgy. 29, Cagayan de Oro City 9000</p>
							<p>Telephone Nos.: (088) 856-3202</p>
							<p>Website: www.depedmisor.com</p>
							<p>Email: 304091@deped.gov.ph</p>
						</div>
					</div>
				</div>

				{/* Page 2 and Page 3 Editing Section */}
				{isEditing && (
					<div className="mt-8 space-y-8 print:hidden">
						{/* Page 2 Preview with Editing */}
						<div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
							<h3 className="mb-4 text-lg font-bold text-gray-900">
								Page 2 - 1st Indorsement
							</h3>

							<div className="p-6 bg-white rounded-lg border border-gray-300 shadow-sm">
								{/* Header with seal */}
								<div className="mb-6 text-center">
									<img
										src="/images/logo.png"
										alt="MOGCHS"
										className="object-contain mx-auto mb-4 w-16 h-16"
									/>

									{/* Republic and Department with decorative styling */}
									<p className="mb-2 font-serif text-sm italic text-gray-700">
										Republic of the Philippines
									</p>
									<p className="mb-2 text-lg font-bold text-gray-900">
										Department of Education
									</p>
									<p className="mb-1 text-xs font-bold text-gray-800">
										REGION - X NORTHERN MINDANAO
									</p>
									<p className="mb-1 text-xs font-bold text-gray-800">
										SCHOOLS DIVISION OF MISAMIS ORIENTAL
									</p>
									<p className="mb-4 text-sm font-bold text-gray-900">
										MISAMIS ORIENTAL GENERAL COMPREHENSIVE HIGH SCHOOL
									</p>
								</div>

								{/* Office with horizontal line */}
								<div className="mb-6">
									<p className="mb-2 text-sm text-left text-gray-800">
										Office of the School Principal
									</p>
									<div className="w-full border-t border-gray-400"></div>
								</div>

								{/* Title */}
								<h1 className="mb-6 text-xl font-bold tracking-wide text-center text-gray-900">
									1st Indorsement
								</h1>

								{/* Date */}
								<div className="mb-6 text-center">
									{isEditing ? (
										<Input
											value={certificateData.page2Date}
											onChange={(e) =>
												handleInputChange("page2Date", e.target.value)
											}
											className="text-lg font-bold text-center text-gray-900 bg-transparent border-b-2 border-blue-400"
											placeholder="Date"
										/>
									) : (
										<p className="text-lg font-bold text-gray-900">
											{certificateData.page2Date}
										</p>
									)}
								</div>

								{/* Content */}
								<div className="mb-6 space-y-4 text-sm leading-relaxed text-left text-gray-800">
									<p className="mb-4 leading-6 text-justify">
										Respectfully forwarded to the Regional Director, DepEd
										Regional Office Masterson Avenue, Upper Balulang, Zone 1,
										Cagayan de Oro City, the request of{" "}
										<span className="font-bold text-gray-900 underline uppercase">
											{certificateData.page2StudentName}
										</span>
										, for Certification, Authentication and Verification (CAV)
										of his Academic School Records.
									</p>

									<p className="mb-4 leading-6 text-justify">
										For ready reference and perusal, attached are the following
										documents / records (✓) below properly enclosed in sealed
										envelope:
									</p>

									<div className="mb-4 ml-8 space-y-2 text-sm">
										<p>
											<span className="font-bold text-black">✓</span>{" "}
											Certification of Enrollment/ Completion/Graduation
										</p>
										<p>
											<span className="font-bold text-black">✓</span>{" "}
											Certification of English as Medium of Instruction
										</p>
										<p>
											<span className="font-bold text-black">✓</span> Form - 137
										</p>
										<p>
											<span className="font-bold text-black">✓</span> Diploma
										</p>
									</div>

									<p className="mb-4 leading-6 text-justify">
										For the preferential appropriate action of the Regional
										Director.
									</p>
								</div>

								{/* Signature */}
								<div className="mb-6 text-left">
									{isEditing ? (
										<Input
											value={certificateData.principalName}
											onChange={(e) =>
												handleInputChange("principalName", e.target.value)
											}
											className="mb-2 w-56 font-bold text-center text-gray-900 uppercase bg-transparent border-b-2 border-blue-400"
											placeholder="Principal name"
										/>
									) : (
										<p className="mb-2 font-bold text-gray-900 uppercase">
											{certificateData.principalName}
										</p>
									)}
									{isEditing ? (
										<Input
											value={certificateData.principalTitle}
											onChange={(e) =>
												handleInputChange("principalTitle", e.target.value)
											}
											className="w-40 text-gray-800 bg-transparent border-b-2 border-blue-400"
											placeholder="Principal title"
										/>
									) : (
										<p className="text-gray-800">
											{certificateData.principalTitle}
										</p>
									)}
								</div>

								{/* Footer */}
								<div className="mb-4 border-t border-gray-400"></div>
								<div className="flex justify-between items-end p-4 bg-gray-50">
									<div className="flex gap-3 items-end text-center">
										<img
											src="/images/depedMatatag.png"
											alt="DepEd Matatag"
											className="object-contain mx-auto w-36 h-auto"
										/>
										<img
											src="/images/mogchs.jpg"
											alt="MOGCHS"
											className="object-contain w-16 h-auto"
										/>
									</div>
									<div className="text-xs text-right text-gray-700">
										<p>
											Address: Velez Street, Brgy. 29, Cagayan de Oro City 9000
										</p>
										<p>Telephone Nos.: (088) 856-3202</p>
										<p>Website: www.depedmisor.com</p>
										<p>Email: 304091@deped.gov.ph</p>
									</div>
								</div>
							</div>
						</div>

						{/* Page 3 Preview with Editing */}
						<div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
							<h3 className="mb-4 text-lg font-bold text-gray-900">
								Page 3 - Certificate Details
							</h3>

							<div className="p-6 bg-white rounded-lg border border-gray-300 shadow-sm">
								{/* Header with seal */}
								<div className="mb-6 text-center">
									<img
										src="/images/logo.png"
										alt="MOGCHS"
										className="object-contain mx-auto mb-4 w-16 h-16"
									/>

									{/* Republic and Department with decorative styling */}
									<p className="mb-2 font-serif text-sm italic text-gray-700">
										Republic of the Philippines
									</p>
									<p className="mb-2 text-lg font-bold text-gray-900">
										Department of Education
									</p>
									<p className="mb-1 text-xs font-bold text-gray-800">
										REGION - X NORTHERN MINDANAO
									</p>
									<p className="mb-1 text-xs font-bold text-gray-800">
										SCHOOLS DIVISION OF MISAMIS ORIENTAL
									</p>
									<p className="mb-4 text-sm font-bold text-gray-900">
										MISAMIS ORIENTAL GENERAL COMPREHENSIVE HIGH SCHOOL
									</p>
								</div>

								{/* Office with horizontal line */}
								<div className="mb-6">
									<p className="mb-2 text-sm text-left text-gray-800">
										Office of the School Principal
									</p>
									<div className="w-full border-t border-gray-400"></div>
								</div>

								{/* Title */}
								<h1 className="mb-6 text-xl font-bold tracking-wide text-center text-gray-900">
									CERTIFICATION
								</h1>

								{/* Content */}
								<div className="mb-6 space-y-4 text-sm leading-relaxed text-left text-gray-800">
									<p className="mb-4 font-bold">TO WHOM IT MAY CONCERN:</p>

									<p className="mb-4 leading-6 text-justify">
										This is to Certify that{" "}
										<span className="font-bold text-gray-900 underline uppercase">
											{certificateData.page3StudentName}
										</span>
										, with Learner Reference Number{" "}
										<span className="font-bold text-gray-900 underline">
											{certificateData.lrn}
										</span>{" "}
										has <strong>graduated</strong> Senior High School Course as
										prescribed by the Department of Education, with the
										following particulars:
									</p>

									<div className="mb-4 ml-8 space-y-2 text-sm">
										<p>
											<strong>1. Name of School:</strong>{" "}
											{isEditing ? (
												<Input
													value={certificateData.page3SchoolName}
													onChange={(e) =>
														handleInputChange("page3SchoolName", e.target.value)
													}
													className="inline-block mx-1 w-80 font-bold text-gray-900 bg-transparent border-b-2 border-blue-400"
													placeholder="School name"
												/>
											) : (
												<span className="font-bold underline">
													{certificateData.page3SchoolName}
												</span>
											)}
										</p>
										<p>
											<strong>2. School Address:</strong>{" "}
											{isEditing ? (
												<Input
													value={certificateData.page3SchoolAddress}
													onChange={(e) =>
														handleInputChange(
															"page3SchoolAddress",
															e.target.value
														)
													}
													className="inline-block mx-1 w-80 font-bold text-gray-900 bg-transparent border-b-2 border-blue-400"
													placeholder="School address"
												/>
											) : (
												<span className="font-bold underline">
													{certificateData.page3SchoolAddress}
												</span>
											)}
										</p>
										<p>
											<strong>3. Grade Level Completed:</strong>{" "}
											<span className="font-bold underline">
												{certificateData.page3GradeLevel}
											</span>{" "}
											<strong>School Year Completed:</strong>{" "}
											<span className="font-bold underline">
												{certificateData.page3SchoolYearCompleted}
											</span>
										</p>
										<p>
											<strong>Track:</strong>{" "}
											<span className="font-bold underline">
												{certificateData.page3Track}
											</span>{" "}
											<strong>Strand:</strong>{" "}
											<span className="font-bold underline">
												{certificateData.strand}
											</span>
										</p>
										<p>
											<strong>4. Graduated on:</strong>{" "}
											{isEditing ? (
												<Input
													value={certificateData.page3GraduationDate}
													onChange={(e) =>
														handleInputChange(
															"page3GraduationDate",
															e.target.value
														)
													}
													className="inline-block mx-1 w-32 font-bold text-gray-900 bg-transparent border-b-2 border-blue-400"
													placeholder="Graduation date"
												/>
											) : (
												<span className="font-bold underline">
													{certificateData.page3GraduationDate}
												</span>
											)}{" "}
											<strong>School Year graduated:</strong>{" "}
											<span className="font-bold underline">
												{certificateData.page3SchoolYearGraduated}
											</span>
										</p>
										<p>
											<strong>5. Special Order Number*:</strong>{" "}
											{isEditing ? (
												<Input
													value={certificateData.page3SpecialOrderNumber}
													onChange={(e) =>
														handleInputChange(
															"page3SpecialOrderNumber",
															e.target.value
														)
													}
													className="inline-block mx-1 w-32 font-bold text-gray-900 bg-transparent border-b-2 border-blue-400"
													placeholder="Special order number"
												/>
											) : (
												<span className="font-bold underline">
													{certificateData.page3SpecialOrderNumber}
												</span>
											)}
										</p>
										<p>
											&nbsp;&nbsp;&nbsp;&nbsp;<strong>Date:</strong>{" "}
											{isEditing ? (
												<Input
													value={certificateData.page3SpecialOrderDate}
													onChange={(e) =>
														handleInputChange(
															"page3SpecialOrderDate",
															e.target.value
														)
													}
													className="inline-block mx-1 w-32 font-bold text-gray-900 bg-transparent border-b-2 border-blue-400"
													placeholder="Special order date"
												/>
											) : (
												<span className="font-bold underline">
													{certificateData.page3SpecialOrderDate}
												</span>
											)}
										</p>
									</div>

									<p className="mb-4 leading-6 text-justify">
										This is to further certify that English Language was used as
										the medium of instruction in all subjects taught in the
										above-mentioned school, except for subjects that require the
										use of Filipino language only.
									</p>

									<p className="mb-4 leading-6 text-justify">
										This certification is issued on{" "}
										{isEditing ? (
											<Input
												value={certificateData.page3IssueDate}
												onChange={(e) =>
													handleInputChange("page3IssueDate", e.target.value)
												}
												className="inline-block mx-1 w-40 font-bold text-gray-900 bg-transparent border-b-2 border-blue-400"
												placeholder="Issue date"
											/>
										) : (
											<span className="font-bold underline">
												{certificateData.page3IssueDate}
											</span>
										)}
										, upon the request of{" "}
										<span className="font-bold text-gray-900 underline uppercase">
											{certificateData.page3StudentName}
										</span>{" "}
										in connection with his application for{" "}
										<strong>
											Certification, Authentication and Verification
										</strong>
										.
									</p>
								</div>

								{/* Signature */}
								<div className="mb-6 text-left">
									{isEditing ? (
										<Input
											value={certificateData.principalName}
											onChange={(e) =>
												handleInputChange("principalName", e.target.value)
											}
											className="mb-2 w-56 font-bold text-center text-gray-900 uppercase bg-transparent border-b-2 border-blue-400"
											placeholder="Principal name"
										/>
									) : (
										<p className="mb-2 font-bold text-gray-900 uppercase">
											{certificateData.principalName}
										</p>
									)}
									{isEditing ? (
										<Input
											value={certificateData.principalTitle}
											onChange={(e) =>
												handleInputChange("principalTitle", e.target.value)
											}
											className="w-40 text-gray-800 bg-transparent border-b-2 border-blue-400"
											placeholder="Principal title"
										/>
									) : (
										<p className="text-gray-800">
											{certificateData.principalTitle}
										</p>
									)}
								</div>

								{/* Note */}
								<div className="mb-4 text-xs italic text-gray-600">
									*If graduated from secondary course in private school,
									indicate Special Order Number and date.
								</div>

								{/* Footer */}
								<div className="mb-4 border-t border-gray-400"></div>
								<div className="flex justify-between items-end p-4 bg-gray-50">
									<div className="flex gap-3 items-end text-center">
										<img
											src="/images/depedMatatag.png"
											alt="DepEd Matatag"
											className="object-contain mx-auto w-36 h-auto"
										/>
										<img
											src="/images/mogchs.jpg"
											alt="MOGCHS"
											className="object-contain w-16 h-auto"
										/>
									</div>
									<div className="text-xs text-right text-gray-700">
										<p>
											Address: Velez Street, Brgy. 29, Cagayan de Oro City 9000
										</p>
										<p>Telephone Nos.: (088) 856-3202</p>
										<p>Website: www.depedmisor.com</p>
										<p>Email: 304091@deped.gov.ph</p>
									</div>
								</div>
							</div>
						</div>

						{/* Page 4 Preview with Editing */}
						<div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
							<h3 className="mb-4 text-lg font-bold text-gray-900">
								Page 4 - Request Form
							</h3>

							<div className="p-6 bg-white rounded-lg border border-gray-300 shadow-sm">
								{/* Header with seal */}
								<div className="mb-6 text-center">
									<img
										src="/images/logo.png"
										alt="MOGCHS"
										className="object-contain mx-auto mb-4 w-16 h-16"
									/>

									{/* Republic and Department with decorative styling */}
									<p className="mb-2 font-serif text-sm italic text-gray-700">
										Republic of the Philippines
									</p>
									<p className="mb-2 text-lg font-bold text-gray-900">
										Department of Education
									</p>
									<p className="mb-1 text-xs font-bold text-gray-800">
										REGION - X NORTHERN MINDANAO
									</p>
									<p className="mb-1 text-xs font-bold text-gray-800">
										SCHOOLS DIVISION OF MISAMIS ORIENTAL
									</p>
									<p className="mb-4 text-sm font-bold text-gray-900">
										MISAMIS ORIENTAL GENERAL COMPREHENSIVE HIGH SCHOOL
									</p>
								</div>

								{/* Control Number, Dates */}
								<div className="mb-6 text-right space-y-2">
									<div className="text-sm">
										<span className="font-medium">Control No.: </span>
										{isEditing ? (
											<Input
												value={certificateData.page4ControlNo}
												onChange={(e) =>
													handleInputChange("page4ControlNo", e.target.value)
												}
												className="inline-block mx-1 w-24 text-center text-gray-900 bg-transparent border-b-2 border-blue-400"
												placeholder="Control No."
											/>
										) : (
											<span className="font-bold underline">
												{certificateData.page4ControlNo || "___"}
											</span>
										)}
									</div>
									<div className="text-sm">
										<span className="font-medium">Date of Application: </span>
										<span className="font-bold">
											{certificateData.page4DateOfApplication}
										</span>
									</div>
									<div className="text-sm">
										<span className="font-medium">Date of Release: </span>
										{isEditing ? (
											<Input
												value={certificateData.page4DateOfRelease}
												onChange={(e) =>
													handleInputChange(
														"page4DateOfRelease",
														e.target.value
													)
												}
												className="inline-block mx-1 w-40 text-center text-gray-900 bg-transparent border-b-2 border-blue-400"
												placeholder="Date of Release"
											/>
										) : (
											<span className="font-bold">
												{certificateData.page4DateOfRelease}
											</span>
										)}
									</div>
								</div>

								{/* School Info */}
								<div className="mb-6 text-left space-y-2">
									<div className="text-sm font-bold underline">
										School Name: MISAMIS ORIENTAL GENERAL COMPREHENSIVE HIGH
										SCHOOL
									</div>
									<div className="text-sm font-bold underline">
										School ID: {certificateData.page4SchoolId}
									</div>
								</div>

								{/* Title */}
								<h1 className="mb-6 text-lg font-bold tracking-wide text-center text-gray-900">
									REQUEST FORM FOR ACADEMIC SCHOOL RECORDS
								</h1>

								{/* Form Fields */}
								<div className="mb-6 space-y-4 text-sm leading-relaxed text-left text-gray-800">
									<div className="flex items-center space-x-2">
										<span className="font-bold">NAME OF LEARNER:</span>
										<span className="flex-1 font-bold border-b border-gray-400">
											{certificateData.page4StudentName}
										</span>
									</div>

									<div className="flex items-center space-x-2">
										<span className="font-bold">DATE & PLACE OF BIRTH:</span>
										<span className="flex-1 border-b border-gray-400">
											_________________________________
										</span>
									</div>

									<div className="flex items-center space-x-2">
										<span className="font-bold">
											SCHOOL YEAR LAST ATTENDED / GRADUATED:
										</span>
										<span className="border-b border-gray-400">
											{certificateData.page4SchoolYearLastAttended ||
												"_________________"}
										</span>
									</div>

									<div className="flex items-center space-x-2">
										<span className="font-bold">PRESENT ADDRESS:</span>
										<span className="flex-1 border-b border-gray-400">
											{certificateData.page4PresentAddress ||
												"_________________________________"}
										</span>
									</div>

									<div className="border-b border-gray-400 w-full">
										_________________________________________________
									</div>

									<div className="flex items-center space-x-2">
										<span className="font-bold">CONTACT NO.:</span>
										<span className="border-b border-gray-400">
											{certificateData.page4ContactNo || "____________________"}
										</span>
									</div>

									{/* Purposes Section */}
									<div className="mt-6">
										<div className="mb-4 font-bold">PURPOSE:</div>
										<div className="ml-4 text-sm text-gray-700">
											{purposeText ||
												(certificateData.page4Purposes.length > 0
													? certificateData.page4Purposes
															.map((p) => p.purposeName)
															.join(", ")
													: "No purposes selected")}
										</div>
									</div>
								</div>

								{/* Not Valid Without */}
								<div className="mt-6 text-xs text-left text-gray-600">
									<p>Not Valid Without</p>
									<p>School Dry Seal</p>
								</div>

								{/* Footer */}
								<div className="mt-4 border-t border-gray-400"></div>
								<div className="flex justify-between items-end p-4 bg-gray-50">
									<div className="flex gap-3 items-end text-center">
										<img
											src="/images/depedMatatag.png"
											alt="DepEd Matatag"
											className="object-contain mx-auto w-36 h-auto"
										/>
										<img
											src="/images/mogchs.jpg"
											alt="MOGCHS"
											className="object-contain w-16 h-auto"
										/>
									</div>
									<div className="text-xs text-right text-gray-700">
										<p>
											Address: Velez Street, Brgy. 29, Cagayan de Oro City 9000
										</p>
										<p>Telephone Nos.: (088) 856-3202</p>
										<p>Website: www.depedmisor.com</p>
										<p>Email: 304091@deped.gov.ph</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Action buttons */}
			{isEditable && (
				<div className="flex sticky bottom-0 z-30 gap-2 justify-center py-2 w-full bg-white border-t border-gray-200 shadow-lg sm:gap-4 sm:py-4 print:hidden">
					{!isEditing ? (
						<>
							<Button
								onClick={() => setIsEditing(true)}
								className="text-white bg-blue-600 hover:bg-blue-700"
							>
								<Edit3 className="mr-2 w-4 h-4" /> Edit
							</Button>
							<Button
								onClick={generatePDF}
								disabled={isGeneratingPDF}
								className="text-white bg-purple-600 hover:bg-purple-700"
							>
								{isGeneratingPDF ? (
									"Generating..."
								) : (
									<>
										<Download className="mr-2 w-4 h-4" />
										Download CAV Package (4 Pages)
									</>
								)}
							</Button>
							<Button
								onClick={handlePrint}
								className="text-white bg-green-600 hover:bg-green-700"
							>
								<Printer className="mr-2 w-4 h-4" /> Print CAV Package (4 Pages)
							</Button>
						</>
					) : (
						<>
							<Button
								onClick={() => {
									onSave({
										lrn: certificateData.lrn,
										strandId: certificateData.strandId,
										firstname: certificateData.firstname,
										middlename: certificateData.middlename,
										lastname: certificateData.lastname,
									});
									setIsEditing(false);
								}}
								className="text-white bg-green-600 hover:bg-green-700"
							>
								<Save className="mr-2 w-4 h-4" /> Save
							</Button>
							<Button
								onClick={() => {
									setIsEditing(false);
								}}
								className="border border-gray-400"
							>
								<X className="mr-2 w-4 h-4" /> Cancel
							</Button>
						</>
					)}
				</div>
			)}
		</div>
	);
}
