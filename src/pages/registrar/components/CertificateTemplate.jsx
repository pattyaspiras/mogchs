import React, { useRef, useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Edit3, Save, X, Download, Printer } from "lucide-react";
import toast from "react-hot-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { getStrands } from "../../../utils/registrar";

export default function CertificateTemplate({
	studentInfo,
	onSave,
	isEditable = true,
	strandDefaults,
	strandType,
	request,
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
		gradeLevel: "Grade-12",
		strand: "Science, Technology, Engineering, and Mathematics (STEM)",
		semester: "Second Semester",
		schoolYear: "2024-2025",
		dateIssued: "",
		purpose: "",
		principalName: "MELENDE B. CATID, PhD",
		principalTitle: "School Principal IV",
		strandId: "",
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
				strand: defaultStrand || prev.strand,
				strandId: studentInfo.strandId
					? String(studentInfo.strandId)
					: prev.strandId || "",
				// Non-DB fields are preserved if user edited them already
				gradeLevel: prev.gradeLevel || "Grade-12",
				semester: prev.semester || "Second Semester",
				schoolYear: prev.schoolYear || "2024-2025",
				dateIssued:
					prev.dateIssued || `${ordinalSuffix} day of ${month} ${year}`,
				purpose: prev.purpose || requestPurpose,
				principalName: prev.principalName || "MELENDE B. CATID, PhD",
				principalTitle: prev.principalTitle || "School Principal IV",
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
	}, [studentInfo, strandDefaults, request]);

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
			if (!certificateRef.current) {
				throw new Error("Certificate element not found");
			}

			// Wait a bit for any animations or rendering to complete
			await new Promise((resolve) => setTimeout(resolve, 200));

			const canvas = await html2canvas(certificateRef.current, {
				scale: 3, // Higher scale for better quality
				useCORS: true,
				allowTaint: true,
				backgroundColor: "#ffffff",
				logging: false, // Disable logging
				removeContainer: true, // Remove temporary elements
				foreignObjectRendering: false, // Better compatibility
				imageTimeout: 0, // No timeout for images
			});

			const imgData = canvas.toDataURL("image/png", 1.0);
			const pdf = new jsPDF("p", "mm", "a4");
			const imgWidth = 210;
			const pageHeight = 295;
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
				`Certificate_of_Enrollment_${certificateData.fullName.replace(
					/\s+/g,
					"_"
				)}.pdf`
			);
			toast.success("Certificate exported successfully!");
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
				<title>Certificate of Enrollment</title>
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
					.certificate-container {
						width: 210mm;
						height: 297mm;
						margin: 0 auto;
						padding: 18mm 18mm 16mm 18mm; /* top, right, bottom, left */
						position: relative;
						page-break-after: always;
					}
					.header { text-align: center; margin-bottom: 8mm; }
					.logo-img { width: 70px; height: 70px; object-fit: contain; margin: 0 auto 6px; display: block; }
					.republic { font-size: 12pt; margin-bottom: 2mm; font-style: italic; color: #222; }
					.department { font-size: 16pt; font-weight: bold; margin-bottom: 2mm; color: #111; }
					.region, .school-division { font-size: 10pt; font-weight: bold; color: #222; }
					.school-name { font-size: 12pt; font-weight: bold; margin-top: 1mm; color: #111; }
					.office { text-align: left; font-size: 10pt; margin-top: 6mm; margin-bottom: 1.5mm; color: #222; }
					.office-line { border-top: 1px solid #666; width: 100%; margin-bottom: 8mm; }
					.title { text-align: center; font-size: 20pt; font-weight: bold; margin-bottom: 8mm; text-transform: uppercase; letter-spacing: 0.5px; color: #111; }
					.content { font-size: 12pt; color: #222; }
					.content p { margin-bottom: 4.5mm; text-align: justify; text-justify: inter-word; }
					.content p.indent { text-indent: 10mm; }
					.student-name { font-weight: bold; text-transform: uppercase; text-decoration: underline; color: #111; }
					.lrn { font-weight: bold; text-decoration: underline; color: #111; }
					.lrn-label { font-weight: bold; text-decoration: underline; color: #222; }
					.grade-level, .strand, .school-year { font-weight: bold; color: #222; }
					.signature { margin-top: 14mm; }
					.signature-name { font-weight: bold; text-transform: uppercase; margin-bottom: 1mm; color: #111; }
					.signature-title { font-size: 10pt; margin-bottom: 1mm; color: #333; }
					.not-valid { margin-top: 8mm; font-size: 9pt; text-align: left; color: #666; }
					.footer-line { border-top: 1px solid #666; margin-top: 10mm; margin-bottom: 4mm; }
					.footer { display: flex; justify-content: space-between; align-items: flex-end; padding: 0 2mm; }
					.deped-logo { display: flex; align-items: center; gap: 6mm; }
					.matatag-logo { width: 150px; height: auto; display: block; }
					.mogchs-logo { width: 60px; height: auto; display: block; }
					.contact-info { font-size: 9pt; text-align: right; color: #333; }
					@media print {
						html, body { margin: 0 !important; padding: 0 !important; }
					}
				</style>
			</head>
			<body>
				<div class="certificate-container">
					<div class="header">
						<img class="logo-img" src="/images/logo.png" alt="MOGCHS" />
						<div class="republic">Republic of the Philippines</div>
						<div class="department">Department of Education</div>
						<div class="region">REGION - X NORTHERN MINDANAO</div>
						<div class="school-division">SCHOOLS DIVISION OF MISAMIS ORIENTAL</div>
						<div class="school-name">MISAMIS ORIENTAL GENERAL COMPREHENSIVE HIGH SCHOOL</div>
					</div>

					<div class="office">Office of the School Principal</div>
					<div class="office-line"></div>

					<div class="title">CERTIFICATION</div>

					<div class="content">
						<p>To whom it may concern:</p>
						<p class="indent">This is to certify that <span class="student-name">${certificateData.fullName}</span> with <span class="lrn-label">Learner's Reference Number (LRN)</span> <span class="lrn">${certificateData.lrn}</span> is officially enrolled as a Senior High School <span class="grade-level">${certificateData.gradeLevel}</span> learner under the <span class="strand">${certificateData.strand}</span> track of this institution for the <span class="semester">${certificateData.semester}</span> of the School Year <span class="school-year">${certificateData.schoolYear}</span>.</p>
						<p class="indent">This further certifies that the aforementioned learner has exhibited good moral character and exemplified a role model of this institution.</p>
						<p class="indent">Given this ${certificateData.dateIssued}, at Misamis Oriental General Comprehensive High School, Don Apolinar Velez St. Cagayan de Oro City, Philippines to the request of the interested party for ${certificateData.purpose}.</p>
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
					<div className="mb-6 space-y-3 text-sm leading-relaxed text-left text-gray-800">
						<p className="mb-3">To whom it may concern:</p>

						<p className="mb-3 leading-6">
							This is to certify that{" "}
							{isEditing ? (
								<Input
									value={certificateData.fullName}
									onChange={(e) =>
										handleInputChange("fullName", e.target.value)
									}
									className="inline-block mx-2 w-56 font-bold text-center text-gray-900 uppercase bg-transparent border-b-2 border-gray-400"
								/>
							) : (
								<span className="font-bold text-gray-900 underline uppercase">
									{certificateData.fullName}
								</span>
							)}{" "}
							with{" "}
							<span className="font-bold underline">
								Learner's Reference Number (LRN)
							</span>{" "}
							{isEditing ? (
								<Input
									value={certificateData.lrn}
									onChange={(e) => handleInputChange("lrn", e.target.value)}
									className="inline-block mx-2 w-28 font-bold text-center text-gray-900 bg-transparent border-b-2 border-gray-400"
								/>
							) : (
								<span className="font-bold text-gray-900 underline">
									{certificateData.lrn}
								</span>
							)}{" "}
							is officially enrolled as a Senior High School{" "}
							<span className="font-bold">{certificateData.gradeLevel}</span>{" "}
							learner under the{" "}
							{isEditing ? (
								<select
									value={certificateData.strandId || ""}
									onChange={(e) => handleStrandChange(e.target.value)}
									className="inline-block mx-2 text-center text-gray-800 bg-transparent border-b-2 border-gray-400"
								>
									{strands.length > 0 ? (
										strands.map((strand) => (
											<option key={strand.id} value={strand.id}>
												{strand.name}
											</option>
										))
									) : (
										<option value="">Loading strands...</option>
									)}
								</select>
							) : (
								<span className="font-bold text-gray-800">
									{certificateData.strand}
								</span>
							)}{" "}
							track of this institution for the{" "}
							{isEditing ? (
								<Input
									value={certificateData.semester}
									onChange={(e) =>
										handleInputChange("semester", e.target.value)
									}
									className="inline-block mx-2 w-28 text-center text-gray-800 bg-transparent border-b-2 border-gray-400"
								/>
							) : (
								<span className="text-gray-800">
									{certificateData.semester}
								</span>
							)}{" "}
							of the School Year{" "}
							{isEditing ? (
								<Input
									value={certificateData.schoolYear}
									onChange={(e) =>
										handleInputChange("schoolYear", e.target.value)
									}
									className="w-20 font-bold text-center text-gray-800 bg-transparent border-b-2 border-gray-400"
								/>
							) : (
								<span className="font-bold text-gray-800">
									{certificateData.schoolYear}
								</span>
							)}
							.
						</p>

						<p className="mb-3 leading-6">
							This further certifies that the aforementioned learner has
							exhibited good moral character and exemplified a role model of
							this institution.
						</p>

						<p className="mb-3 leading-6">
							Given this{" "}
							{isEditing ? (
								<Input
									value={certificateData.dateIssued}
									onChange={(e) =>
										handleInputChange("dateIssued", e.target.value)
									}
									className="inline-block mx-2 w-40 text-center text-gray-800 bg-transparent border-b-2 border-gray-400"
								/>
							) : (
								<span className="text-gray-800">
									{certificateData.dateIssued}
								</span>
							)}
							, at Misamis Oriental General Comprehensive High School, Don
							Apolinar Velez St. Cagayan de Oro City, Philippines to the request
							of the interested party for{" "}
							{isEditing ? (
								<Input
									value={certificateData.purpose}
									onChange={(e) => handleInputChange("purpose", e.target.value)}
									className="inline-block mx-2 w-40 text-center text-gray-800 bg-transparent border-b-2 border-gray-400"
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
										Download
									</>
								)}
							</Button>
							<Button
								onClick={handlePrint}
								className="text-white bg-green-600 hover:bg-green-700"
							>
								<Printer className="mr-2 w-4 h-4" /> Print
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
