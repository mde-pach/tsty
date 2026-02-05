"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ExecutionProgress } from "./execution-progress";

interface ExecutionModalProps {
	flowId: string;
	flowName: string;
	device?: "desktop" | "mobile";
	onClose: () => void;
}

export function ExecutionModal({
	flowId,
	flowName,
	device = "desktop",
	onClose,
}: ExecutionModalProps) {
	const router = useRouter();

	// ESC key listener
	useEffect(() => {
		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			}
		};
		window.addEventListener("keydown", handleEsc);
		return () => window.removeEventListener("keydown", handleEsc);
	}, [onClose]);

	const handleComplete = (reportId: string) => {
		// Auto-close after a brief delay and navigate to report
		setTimeout(() => {
			onClose();
			router.push(`/runs/${reportId}`);
		}, 2000);
	};

	const handleError = (error: string) => {
		console.error("Test execution error:", error);
		// Keep modal open on error so user can see what happened
	};

	return (
		<>
			{/* Backdrop - Only close on click when complete/error */}
			<div
				className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
				onClick={(e) => {
					// Allow closing by clicking backdrop after completion
					e.stopPropagation();
				}}
			/>

			{/* Modal */}
			<div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-3xl">
				<div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
					{/* Header */}
					<div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
						<h2 className="text-h2 text-gray-900 dark:text-white">
							Running Test
						</h2>
						<button
							onClick={onClose}
							className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
							title="Close (ESC)"
						>
							<svg
								className="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>

					{/* Content */}
					<div className="p-6">
						<ExecutionProgress
							flowId={flowId}
							device={device}
							onComplete={handleComplete}
							onError={handleError}
						/>
					</div>
				</div>
			</div>
		</>
	);
}
