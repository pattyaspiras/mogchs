import React from "react";
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { getDecryptedApiUrl } from "../../../utils/apiConfig";

const ImageZoomModal = ({
	selectedImage,
	imageZoom,
	closeImageZoom,
	zoomIn,
	zoomOut,
	resetZoom,
}) => {
	if (!selectedImage) return null;
	const apiUrl = getDecryptedApiUrl();

	return (
		<div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm">
			<div className="flex relative justify-center items-center p-2 w-full h-full sm:p-4">
				{/* Zoom Controls */}
				<div className="flex absolute top-2 right-2 z-10 gap-1 sm:top-4 sm:right-4 sm:gap-2">
					<button
						onClick={zoomOut}
						className="p-2 rounded-full shadow-lg transition-colors bg-white/90 hover:bg-white"
						title="Zoom Out"
					>
						<ZoomOut className="w-5 h-5 text-slate-700" />
					</button>
					<button
						onClick={resetZoom}
						className="p-2 rounded-full shadow-lg transition-colors bg-white/90 hover:bg-white"
						title="Reset Zoom"
					>
						<RotateCcw className="w-5 h-5 text-slate-700" />
					</button>
					<button
						onClick={zoomIn}
						className="p-2 rounded-full shadow-lg transition-colors bg-white/90 hover:bg-white"
						title="Zoom In"
					>
						<ZoomIn className="w-5 h-5 text-slate-700" />
					</button>
					<button
						onClick={closeImageZoom}
						className="p-2 rounded-full shadow-lg transition-colors bg-white/90 hover:bg-white"
						title="Close"
					>
						<X className="w-5 h-5 text-slate-700" />
					</button>
				</div>

				{/* Zoom Level Indicator */}
				<div className="absolute top-2 left-2 px-3 py-1 rounded-full shadow-lg sm:top-4 sm:left-4 bg-white/90">
					<span className="text-sm font-medium text-slate-700">
						{Math.round(imageZoom * 100)}%
					</span>
				</div>

				{/* Image Container */}
				<div className="overflow-auto max-w-full max-h-full touch-pan-x touch-pan-y">
					<img
						src={`${apiUrl}/requirements/${selectedImage.filepath}`}
						alt={selectedImage.filepath}
						className="max-w-none transition-transform duration-200"
						style={{
							transform: `scale(${imageZoom})`,
							cursor: imageZoom > 1 ? "grab" : "default",
							minWidth: "100px",
							minHeight: "100px",
						}}
						onError={(e) => {
							e.target.style.display = "none";
						}}
					/>
				</div>

				{/* Image Name and Type */}
				<div className="absolute bottom-2 sm:bottom-4 left-1/2 px-4 py-3 rounded-lg shadow-lg transform -translate-x-1/2 bg-white/95 max-w-[90%] backdrop-blur-sm">
					<div className="text-center">
						<span className="block mb-1 text-sm font-medium truncate text-slate-700">
							{selectedImage.filepath}
						</span>
						<span className="block text-xs font-semibold tracking-wide text-blue-600 uppercase">
							{selectedImage.requirementType || "Unknown Type"}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ImageZoomModal;
