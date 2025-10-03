import React, { useRef, useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Edit3, Save, X, Download, Printer } from "lucide-react";
import toast from "react-hot-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { getStrands } from "../../../utils/registrar";

export default function DiplomaTemplate({
	studentInfo,
	onSave,
	isEditable = true,
}) {
	const [isEditing, setIsEditing] = useState(false);
	const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
	const diplomaRef = useRef(null);

	const [diplomaData, setDiplomaData] = useState({
		fullName: "",
		firstname: "",
		middlename: "",
		lastname: "",
		lrn: "",
		track: "",
		strand: "",
		strandId: "",
	});

	const [strands, setStrands] = useState([]);
	const [principalName, setPrincipalName] = useState("ABDON R. BACAYANA, PhD");
	const [superintendentName, setSuperintendentName] = useState(
		"EDILBERTO L. OPLENARIA, EdD, CESO V"
	);

	useEffect(() => {
		if (studentInfo) {
			const fullName = `${studentInfo.firstname} ${
				studentInfo.middlename ? studentInfo.middlename + " " : ""
			}${studentInfo.lastname}`.trim();
			setDiplomaData({
				fullName,
				firstname: studentInfo.firstname || "",
				middlename: studentInfo.middlename || "",
				lastname: studentInfo.lastname || "",
				lrn: studentInfo.lrn || "",
				track: studentInfo.track || "",
				strand: studentInfo.strand || "",
				strandId: studentInfo.strandId || "",
			});
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
	}, [studentInfo]);

	const handleInputChange = (field, value) => {
		setDiplomaData((prev) => ({ ...prev, [field]: value }));
	};

	const handleStrandChange = (strandId) => {
		const selectedStrand = strands.find(
			(s) => String(s.id) === String(strandId)
		);
		setDiplomaData((prev) => ({
			...prev,
			strand: selectedStrand ? selectedStrand.name : "",
			track: selectedStrand ? selectedStrand.trackName : "",
			strandId: strandId,
		}));
	};

	const generatePDF = async () => {
		if (
			!diplomaData.fullName ||
			!diplomaData.lrn ||
			!diplomaData.track ||
			!diplomaData.strand
		) {
			toast.error("Please complete all fields before exporting.");
			return;
		}

		setIsGeneratingPDF(true);
		try {
			// Ensure the diploma element exists
			if (!diplomaRef.current) {
				throw new Error("Diploma element not found");
			}

			// Small delay to ensure DOM is fully rendered
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Get the actual dimensions of the diploma element
			const diplomaElement = diplomaRef.current;
			const rect = diplomaElement.getBoundingClientRect();

			// Generate canvas from the diploma element with better options
			const canvas = await html2canvas(diplomaElement, {
				scale: 2,
				useCORS: true,
				allowTaint: true,
				backgroundColor: "#ffffff",
				logging: false,
				width: rect.width,
				height: rect.height,
				scrollX: 0,
				scrollY: 0,
				windowWidth: window.innerWidth,
				windowHeight: window.innerHeight,
			});

			// Convert canvas to image data
			const imgData = canvas.toDataURL("image/png");

			// Create PDF in landscape orientation
			const pdf = new jsPDF("l", "mm", "a4");

			// A4 landscape dimensions in mm
			const pdfWidth = 297;
			const pdfHeight = 210;

			// Calculate scaling to fit the image properly
			const canvasAspectRatio = canvas.width / canvas.height;
			const pdfAspectRatio = pdfWidth / pdfHeight;

			let imgWidth, imgHeight, xOffset, yOffset;

			if (canvasAspectRatio > pdfAspectRatio) {
				// Image is wider relative to PDF
				imgWidth = pdfWidth;
				imgHeight = pdfWidth / canvasAspectRatio;
				xOffset = 0;
				yOffset = (pdfHeight - imgHeight) / 2;
			} else {
				// Image is taller relative to PDF
				imgHeight = pdfHeight;
				imgWidth = pdfHeight * canvasAspectRatio;
				xOffset = (pdfWidth - imgWidth) / 2;
				yOffset = 0;
			}

			// Add image to PDF with proper positioning
			pdf.addImage(imgData, "PNG", xOffset, yOffset, imgWidth, imgHeight);

			// Save the PDF
			const filename = `Diploma_${diplomaData.fullName.replace(
				/\s+/g,
				"_"
			)}.pdf`;
			pdf.save(filename);

			toast.success("PDF generated successfully!");
		} catch (err) {
			console.error("PDF generation error:", err);
			toast.error(`Failed to generate PDF: ${err.message || "Unknown error"}`);
		} finally {
			setIsGeneratingPDF(false);
		}
	};

	const handlePrint = () => {
		if (
			!diplomaData.fullName ||
			!diplomaData.lrn ||
			!diplomaData.track ||
			!diplomaData.strand
		) {
			toast.error("Please complete all fields before printing.");
			return;
		}
		const printWindow = window.open("", "_blank");
		printWindow.document.write(`
        <html>
          <head>
            <title>Diploma - ${diplomaData.fullName}</title>
            <style>
              @page { 
                size: A4 landscape; 
                margin: 6mm; 
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
              }
              @media print {
                @page { 
                  size: landscape; 
                  margin: 6mm; 
                }
                body { 
                  -webkit-print-color-adjust: exact;
                  color-adjust: exact;
                }
              }
              * {
                box-sizing: border-box;
              }
              body { 
                font-family: 'Times New Roman', serif; 
                color: #000; 
                background: white; 
                margin: 0; 
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
              }
              .diploma-container {
                max-width: 275mm;
                width: 100%;
                background: white;
                padding: 10px;
                text-align: center;
                font-family: serif;
                color: black;
              }
              .diploma-content {
                position: relative;
                padding: 12px;
                height: 100%;
                border: 3px solid #2563eb;
              }
              .decorative-border {
                position: absolute;
                top: 4px;
                left: 4px;
                right: 4px;
                bottom: 4px;
                border: 1px solid #2563eb;
                pointer-events: none;
              }
              .header-logos {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 6px;
              }
              .logo {
                width: 55px;
                height: 55px;
                border-radius: 50%;
                border: 2px solid #2563eb;
                object-fit: cover;
              }
              .header-center {
                flex: 1;
                margin: 0 18px;
              }
              .header-center h1 {
                font-size: 15px;
                font-weight: bold;
                margin: 0;
                text-align: center;
              }
              .header-center p {
                font-size: 12px;
                margin: 1px 0;
                text-align: center;
              }
              .header-center .italic {
                font-style: italic;
              }
              .header-center .small {
                font-size: 12px;
              }
              .header-center .medium {
                font-size: 12px;
                margin-top: 1px;
              }
              .school-name {
                margin-bottom: 6px;
                font-size: 16px;
                font-weight: bold;
                text-transform: uppercase;
                text-align: center;
              }
              .certifies {
                margin-bottom: 1px;
                font-style: italic;
                text-align: center;
                font-size: 14px;
              }
              .certifies-small {
                margin-bottom: 5px;
                font-size: 12px;
                text-align: center;
              }
              .student-name {
                display: inline-block;
                padding: 0 8px;
                margin: 5px 0;
                font-size: 22px;
                font-weight: bold;
                text-transform: uppercase;
                border-bottom: 2px solid black;
                text-align: center;
              }
              .lrn {
                margin-bottom: 5px;
                text-align: center;
                font-size: 12px;
              }
              .lrn-number {
                font-weight: bold;
              }
              .completion-text {
                margin-bottom: 2px;
                font-style: italic;
                text-align: center;
                font-size: 12px;
              }
              .completion-text-small {
                margin-bottom: 6px;
                font-size: 12px;
                font-style: italic;
                text-align: center;
              }
              .track-strand {
                display: flex;
                gap: 18px;
                justify-content: center;
                align-items: center;
                margin-bottom: 6px;
              }
              .track-item, .strand-item {
                text-align: center;
              }
              .track-value, .strand-value {
                padding: 0 4px;
                margin-bottom: 2px;
                font-size: 13px;
                font-weight: bold;
                border-bottom: 2px solid black;
                display: inline-block;
              }
              .track-label, .strand-label {
                font-size: 10px;
                font-weight: bold;
              }
              .additional-text {
                margin-bottom: 2px;
                text-align: center;
                font-size: 10px;
              }
              .additional-text-small {
                margin-bottom: 6px;
                font-size: 9px;
                font-style: italic;
                text-align: center;
              }
              .diploma-title {
                margin-bottom: 2px;
                font-size: 26px;
                font-weight: bold;
                text-align: center;
              }
              .diploma-subtitle {
                margin-bottom: 1px;
                font-size: 15px;
                font-style: italic;
                font-weight: bold;
                text-align: center;
              }
              .diploma-issuance {
                margin-bottom: 6px;
                font-size: 10px;
                font-style: italic;
                text-align: center;
              }
              .date-location {
                margin-bottom: 2px;
                text-align: center;
                font-size: 10px;
              }
              .date-location-small {
                margin-bottom: 8px;
                font-size: 9px;
                font-style: italic;
                text-align: center;
              }
              .signatures {
                display: flex;
                justify-content: space-between;
                margin-top: 15px;
              }
              .signature-item {
                text-align: center;
              }
              .signature-line {
                margin: 0 auto 4px;
                width: 140px;
                border-top: 1px solid black;
              }
              .signature-name {
                font-size: 10px;
                font-weight: bold;
                margin-bottom: 1px;
              }
              .signature-title {
                font-size: 9px;
                margin-bottom: 0;
              }
              .signature-title-italic {
                font-size: 9px;
                font-style: italic;
                margin-bottom: 0;
              }
            </style>
          </head>
          <body>
            <div class="diploma-container">
              <div class="diploma-content">
                
                <!-- Header with logos -->
                <div class="header-logos">
                  <img src="/images/logo.png" alt="MOGCHS" class="logo" />
                  
                  <div class="header-center">
                    <h1>Republika ng Pilipinas</h1>
                    <p class="italic small">Republic of the Philippines</p>
                    <h1 class="medium">Kagawaran ng Edukasyon</h1>
                    <p class="italic small">Department of Education</p>
                    <h2 class="small" style="font-weight: 600; margin-top: 1px;">REHIYON 10</h2>
                    <p class="small">REGION X</p>
                    <h2 class="small" style="font-weight: 600; margin-top: 1px;">SANGAY NG MISAMIS ORIENTAL</h2>
                    <p class="italic small">DIVISION OF MISAMIS ORIENTAL</p>
                  </div>
                  
                  <img src="/images/deped.png" alt="DEPED" class="logo" />
                </div>

                <!-- School name -->
                <h1 class="school-name">MISAMIS ORIENTAL GENERAL COMPREHENSIVE HIGH SCHOOL</h1>

                <p class="certifies">Pinatutunayan nito na si</p>
                <p class="certifies-small">This certifies that</p>

                <!-- Student Name -->
                <h2 class="student-name">${
									diplomaData.fullName || "PATTY ASPIRAS"
								}</h2>

                <!-- LRN -->
                <p class="lrn">Learners Reference Number (LRN): <span class="lrn-number">${
									diplomaData.lrn || "127995090705"
								}</span></p>

                <!-- Completion text -->
                <p class="completion-text">ay kasiya-siyang nakatupad sa mga kinakailangan sa pagtatapos ng Senior High School</p>
                <p class="completion-text-small">has satisfactorily completed the requirements for graduation in Senior High School</p>

                <!-- Track and Strand -->
                <div class="track-strand">
                  <div class="track-item">
                    <p class="track-value">${diplomaData.track || "SPORTS"}</p>
                    <p class="track-label">TRACK</p>
                  </div>
                  <div class="strand-item">
                    <p class="strand-value">${diplomaData.strand || "ABM"}</p>
                    <p class="strand-label">STRAND</p>
                  </div>
                </div>

                <!-- Additional text -->
                <p class="additional-text">na itinakda para sa Mataas na Paaralan ng Kagawaran ng Edukasyon noong kaya pinagkalooban siya nitong</p>
                <p class="additional-text-small">prescribed for Secondary Schools of the Department of Education and is therefore awarded this</p>

                <!-- Diploma title -->
                <h1 class="diploma-title">KATIBAYAN</h1>
                <p class="diploma-subtitle">DIPLOMA</p>
                <p class="diploma-issuance">(Second Issuance)</p>

                <!-- Date and location -->
                <p class="date-location">Nilagdaan sa Lungsod ng Cagayan de Oro, Pilipinas nitong ika-24 ng Hunyo 2022.</p>
                <p class="date-location-small">Signed in Cagayan de Oro City, Philippines on the 24th day of June 2022.</p>

                <!-- Signatures -->
                <div class="signatures">
                  <div class="signature-item">
                    <div class="signature-line"></div>
                    <p class="signature-name">${principalName}</p>
                    <p class="signature-title">Punong Guro</p>
                    <p class="signature-title-italic">(Principal)</p>
                  </div>
                  <div class="signature-item">
                    <div class="signature-line"></div>
                    <p class="signature-name">${superintendentName}</p>
                    <p class="signature-title">Pansangay na Tagapamahala ng mga Paaralan</p>
                    <p class="signature-title-italic">Schools Division Superintendent</p>
                  </div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `);
		printWindow.document.close();
		printWindow.focus();
		setTimeout(() => {
			printWindow.print();
			printWindow.close();
		}, 500);
	};

	return (
		<div className="mx-auto w-full max-w-full sm:max-w-[297mm] bg-white p-2 sm:p-6 text-center font-serif text-black print:max-w-full print:border-none">
			<div className="overflow-x-auto">
				<div
					ref={diplomaRef}
					className="relative p-4 sm:p-6 mb-28 min-w-[340px] sm:min-w-[800px] max-w-[297mm] mx-auto bg-white"
					style={{ minHeight: "210mm" }}
				>
					{/* Decorative inner border */}
					<div className="absolute inset-1 border-4 border-blue-600 pointer-events-none"></div>

					{/* Header with logos */}
					<div className="flex justify-between items-start mb-4">
						<img
							src="/images/logo.png"
							alt="MOGCHS"
							className="object-cover w-20 h-20 rounded-full border-2 border-blue-600"
						/>

						<div className="flex-1 mx-6">
							<h1 className="text-lg font-bold">Republika ng Pilipinas</h1>
							<p className="text-sm italic">Republic of the Philippines</p>
							<h1 className="mt-1 text-base font-bold">
								Kagawaran ng Edukasyon
							</h1>
							<p className="text-sm italic">Department of Education</p>
							<h2 className="mt-1 text-sm font-semibold">REHIYON 10</h2>
							<p className="text-xs">REGION X</p>
							<h2 className="mt-1 text-sm font-semibold">
								SANGAY NG MISAMIS ORIENTAL
							</h2>
							<p className="text-xs italic">DIVISION OF MISAMIS ORIENTAL</p>
						</div>

						<img
							src="/images/deped.png"
							alt="DEPED"
							className="object-cover w-20 h-20 rounded-full border-2 border-blue-600"
						/>
					</div>

					{/* School name */}
					<h1 className="mb-4 text-lg font-bold uppercase">
						MISAMIS ORIENTAL GENERAL COMPREHENSIVE HIGH SCHOOL
					</h1>

					<p className="mb-1 italic">Pinatutunayan nito na si</p>
					<p className="mb-3 text-xs">This certifies that</p>

					{/* Student Name */}
					{isEditing ? (
						<div className="flex flex-col gap-2 justify-center items-center mb-3 sm:flex-row">
							<Input
								value={diplomaData.firstname}
								onChange={(e) =>
									setDiplomaData((prev) => ({
										...prev,
										firstname: e.target.value,
									}))
								}
								placeholder="First Name"
								className="max-w-xs text-center"
							/>
							<Input
								value={diplomaData.middlename}
								onChange={(e) =>
									setDiplomaData((prev) => ({
										...prev,
										middlename: e.target.value,
									}))
								}
								placeholder="Middle Name"
								className="max-w-xs text-center"
							/>
							<Input
								value={diplomaData.lastname}
								onChange={(e) =>
									setDiplomaData((prev) => ({
										...prev,
										lastname: e.target.value,
									}))
								}
								placeholder="Last Name"
								className="max-w-xs text-center"
							/>
						</div>
					) : (
						<h2 className="inline-block px-4 my-3 text-2xl font-bold uppercase border-b-2 border-black">
							{diplomaData.firstname} {diplomaData.middlename}{" "}
							{diplomaData.lastname}
						</h2>
					)}

					{/* LRN */}
					<p className="mb-3">
						Learners Reference Number (LRN):{" "}
						{isEditing ? (
							<Input
								value={diplomaData.lrn}
								onChange={(e) => handleInputChange("lrn", e.target.value)}
								className="inline-block w-48 text-sm font-bold text-center"
							/>
						) : (
							<span className="font-bold">
								{diplomaData.lrn || "127995090705"}
							</span>
						)}
					</p>

					{/* Completion text */}
					<p className="mb-2 italic">
						ay kasiya-siyang nakatupad sa mga kinakailangan sa pagtatapos ng
						Senior High School
					</p>
					<p className="mb-4 text-xs italic">
						has satisfactorily completed the requirements for graduation in
						Senior High School
					</p>

					{/* Track and Strand - horizontal layout */}
					<div className="flex gap-8 justify-center items-center mb-4">
						<div className="text-center">
							<p className="px-2 mb-1 text-lg font-bold border-b-2 border-black">
								{diplomaData.track || "TRACK"}
							</p>
							<p className="text-sm font-bold">TRACK</p>
						</div>
						<div className="text-center">
							{isEditing ? (
								<select
									value={diplomaData.strandId || ""}
									onChange={(e) => handleStrandChange(e.target.value)}
									className="mb-1 w-32 font-bold text-center rounded border border-gray-300"
								>
									<option value="">Select Strand</option>
									{strands.map((strand) => (
										<option key={strand.id} value={strand.id}>
											{strand.name} ({strand.trackName})
										</option>
									))}
								</select>
							) : (
								<p className="px-2 mb-1 text-lg font-bold border-b-2 border-black">
									{diplomaData.strand || "STRAND"}
								</p>
							)}
							<p className="text-sm font-bold">STRAND</p>
						</div>
					</div>

					{/* Additional text */}
					<p className="mb-2">
						na itinakda para sa Mataas na Paaralan ng Kagawaran ng Edukasyon
						noong kaya pinagkalooban siya nitong
					</p>
					<p className="mb-4 text-xs italic">
						prescribed for Secondary Schools of the Department of Education and
						is therefore awarded this
					</p>

					{/* Diploma title */}
					<h1 className="mb-2 text-4xl font-bold">KATIBAYAN</h1>
					<p className="mb-1 text-xl italic font-bold">DIPLOMA</p>
					<p className="mb-4 text-sm italic">(Second Issuance)</p>

					{/* Date and location */}
					<p className="mb-2">
						Nilagdaan sa Lungsod ng Cagayan de Oro, Pilipinas nitong ika-24 ng
						Hunyo 2022.
					</p>
					<p className="mb-6 text-xs italic">
						Signed in Cagayan de Oro City, Philippines on the 24th day of June
						2022.
					</p>

					{/* Signatures */}
					<div className="flex justify-between mt-8">
						<div className="text-center">
							<div className="mx-auto mb-2 w-48 border-t border-black"></div>
							{isEditing ? (
								<Input
									value={principalName}
									onChange={(e) => setPrincipalName(e.target.value)}
									className="mb-1 font-bold text-center"
								/>
							) : (
								<p className="text-sm font-bold">{principalName}</p>
							)}
							<p className="text-xs">Punong Guro</p>
							<p className="text-xs italic">(Principal)</p>
						</div>
						<div className="text-center">
							<div className="mx-auto mb-2 w-48 border-t border-black"></div>
							{isEditing ? (
								<Input
									value={superintendentName}
									onChange={(e) => setSuperintendentName(e.target.value)}
									className="mb-1 font-bold text-center"
								/>
							) : (
								<p className="text-sm font-bold">{superintendentName}</p>
							)}
							<p className="text-xs">
								Pansangay na Tagapamahala ng mga Paaralan
							</p>
							<p className="text-xs italic">Schools Division Superintendent</p>
						</div>
					</div>
				</div>
			</div>

			{/* Move the button bar inside the scrollable modal content and use sticky positioning */}
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
										lrn: diplomaData.lrn,
										strandId: diplomaData.strandId,
										firstname: diplomaData.firstname,
										middlename: diplomaData.middlename,
										lastname: diplomaData.lastname,
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
