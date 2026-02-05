"use client";

import { useState } from "react";

interface ScreenshotGalleryProps {
	screenshots: string[];
}

export function ScreenshotGallery({ screenshots }: ScreenshotGalleryProps) {
	const [selectedIndex, setSelectedIndex] = useState(0);

	if (screenshots.length === 0) {
		return null;
	}

	return (
		<div className="space-y-2">
			{/* Main Image */}
			<div className="border rounded-lg overflow-hidden bg-gray-50">
				<img
					src={`/api/screenshots?filename=${screenshots[selectedIndex]}`}
					alt={screenshots[selectedIndex]}
					className="w-full h-auto"
				/>
			</div>

			{/* Thumbnails */}
			{screenshots.length > 1 && (
				<div className="flex gap-2 overflow-x-auto">
					{screenshots.map((screenshot, index) => (
						<button
							key={screenshot}
							onClick={() => setSelectedIndex(index)}
							className={`flex-shrink-0 border-2 rounded overflow-hidden ${
								index === selectedIndex
									? "border-blue-500"
									: "border-transparent hover:border-gray-300"
							}`}
						>
							<img
								src={`/api/screenshots?filename=${screenshot}`}
								alt={screenshot}
								className="w-20 h-20 object-cover"
							/>
						</button>
					))}
				</div>
			)}

			{/* Filename */}
			<p className="text-xs text-gray-500 text-center">
				{screenshots[selectedIndex]}
			</p>
		</div>
	);
}
