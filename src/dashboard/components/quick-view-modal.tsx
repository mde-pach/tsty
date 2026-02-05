"use client";

import { useRouter } from "next/navigation";
import type { ActionFile, FlowFile } from "@/lib/types";
import { Badge } from "./ui";

interface QuickViewModalProps {
	isOpen: boolean;
	onClose: () => void;
	item: FlowFile | ActionFile | null;
	type: "flow" | "action";
	onRun?: (id: string) => void;
}

export function QuickViewModal({
	isOpen,
	onClose,
	item,
	type,
	onRun,
}: QuickViewModalProps) {
	const router = useRouter();

	if (!isOpen || !item) return null;

	const handleEdit = () => {
		if (type === "flow") {
			router.push(`/flows/${encodeURIComponent(item.id)}/edit`);
		} else {
			router.push(`/actions/${encodeURIComponent(item.id)}/edit`);
		}
		onClose();
	};

	const handleView = () => {
		if (type === "flow") {
			router.push(`/flows/${encodeURIComponent(item.id)}`);
		} else {
			router.push(`/actions/${encodeURIComponent(item.id)}`);
		}
		onClose();
	};

	const handleRun = () => {
		onRun?.(item.id);
		onClose();
	};

	return (
		<>
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="fixed inset-0 z-50 overflow-y-auto">
				<div className="flex min-h-full items-center justify-center p-4">
					<div
						className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] overflow-hidden"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Header */}
						<div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
							<div className="flex items-center gap-3 flex-1 min-w-0">
								{type === "flow" ? (
									<div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
										<svg
											className="w-6 h-6 text-primary-600 dark:text-primary-400"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
											/>
										</svg>
									</div>
								) : (
									<div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
										<svg
											className="w-6 h-6 text-purple-600 dark:text-purple-400"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M13 10V3L4 14h7v7l9-11h-7z"
											/>
										</svg>
									</div>
								)}
								<div className="flex-1 min-w-0">
									<h2 className="text-h2 text-gray-900 dark:text-white truncate">
										{item.name}
									</h2>
									<p className="text-sm text-gray-600 dark:text-gray-400">
										Quick View • {type === "flow" ? "Flow" : "Action"}
									</p>
								</div>
							</div>
							<button
								onClick={onClose}
								className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
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
						<div className="px-6 py-4 overflow-y-auto max-h-[calc(85vh-180px)] space-y-4">
							{/* Description */}
							{type === "flow" && (item as FlowFile).flow.description && (
								<div>
									<h3 className="text-h3 text-gray-900 dark:text-white mb-2">
										Description
									</h3>
									<p className="text-gray-700 dark:text-gray-300">
										{(item as FlowFile).flow.description}
									</p>
								</div>
							)}
							{type === "action" &&
								(item as ActionFile).definition.description && (
									<div>
										<h3 className="text-h3 text-gray-900 dark:text-white mb-2">
											Description
										</h3>
										<p className="text-gray-700 dark:text-gray-300">
											{(item as ActionFile).definition.description}
										</p>
									</div>
								)}

							{/* Stats */}
							<div className="grid grid-cols-3 gap-3">
								{type === "flow" && (
									<>
										<div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
											<div className="text-2xl font-bold text-gray-900 dark:text-white">
												{(item as FlowFile).flow.steps.length}
											</div>
											<div className="text-xs text-gray-600 dark:text-gray-400">
												Steps
											</div>
										</div>
										<div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
											<div className="text-2xl font-bold text-gray-900 dark:text-white">
												{(item as FlowFile).flow.devices?.length || 1}
											</div>
											<div className="text-xs text-gray-600 dark:text-gray-400">
												Devices
											</div>
										</div>
										<div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
											<div className="text-2xl font-bold text-gray-900 dark:text-white">
												{(item as FlowFile).flow.dependencies?.length || 0}
											</div>
											<div className="text-xs text-gray-600 dark:text-gray-400">
												Dependencies
											</div>
										</div>
									</>
								)}
								{type === "action" && (
									<>
										<div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
											<div className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
												{(item as ActionFile).definition.type}
											</div>
											<div className="text-xs text-gray-600 dark:text-gray-400">
												Type
											</div>
										</div>
										<div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
											<div className="text-2xl font-bold text-gray-900 dark:text-white">
												{(item as ActionFile).definition.primitives.length}
											</div>
											<div className="text-xs text-gray-600 dark:text-gray-400">
												Actions
											</div>
										</div>
										<div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
											<div className="text-2xl font-bold text-gray-900 dark:text-white">
												{(item as ActionFile).definition.dependencies?.length ||
													0}
											</div>
											<div className="text-xs text-gray-600 dark:text-gray-400">
												Dependencies
											</div>
										</div>
									</>
								)}
							</div>

							{/* Tags */}
							{((type === "flow" && (item as FlowFile).flow.tags?.length) ||
								(type === "action" &&
									(item as ActionFile).definition.tags?.length)) && (
								<div>
									<h3 className="text-h3 text-gray-900 dark:text-white mb-2">
										Tags
									</h3>
									<div className="flex flex-wrap gap-2">
										{type === "flow"
											? (item as FlowFile).flow.tags?.map((tag) => (
													<Badge key={tag} variant="neutral" size="sm">
														{tag}
													</Badge>
												))
											: (item as ActionFile).definition.tags?.map((tag) => (
													<Badge key={tag} variant="neutral" size="sm">
														{tag}
													</Badge>
												))}
									</div>
								</div>
							)}

							{/* Metadata */}
							<div>
								<h3 className="text-h3 text-gray-900 dark:text-white mb-2">
									Metadata
								</h3>
								<div className="grid grid-cols-2 gap-3 text-sm">
									<div>
										<span className="text-gray-600 dark:text-gray-400">
											Created:
										</span>
										<span className="ml-2 text-gray-900 dark:text-white">
											{new Date(item.createdAt).toLocaleDateString()}
										</span>
									</div>
									<div>
										<span className="text-gray-600 dark:text-gray-400">
											Updated:
										</span>
										<span className="ml-2 text-gray-900 dark:text-white">
											{new Date(item.updatedAt).toLocaleDateString()}
										</span>
									</div>
									{type === "flow" && (item as FlowFile).lastRun && (
										<div>
											<span className="text-gray-600 dark:text-gray-400">
												Last Run:
											</span>
											<span className="ml-2 text-gray-900 dark:text-white">
												{new Date((item as FlowFile).lastRun!).toLocaleDateString()}
											</span>
										</div>
									)}
									{type === "flow" && (item as FlowFile).lastRunStatus && (
										<div>
											<span className="text-gray-600 dark:text-gray-400">
												Status:
											</span>
											<span className="ml-2">
												<Badge
													variant={
														(item as FlowFile).lastRunStatus === "passed"
															? "success"
															: "error"
													}
													size="sm"
												>
													{(item as FlowFile).lastRunStatus}
												</Badge>
											</span>
										</div>
									)}
								</div>
							</div>
						</div>

						{/* Footer */}
						<div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
							<div className="text-xs text-gray-600 dark:text-gray-400">
								Press <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">ESC</kbd> to close
							</div>
							<div className="flex items-center gap-2">
								<button
									onClick={handleView}
									className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium rounded-lg transition-colors"
								>
									View Details
								</button>
								<button
									onClick={handleEdit}
									className="px-4 py-2 bg-gray-700 dark:bg-gray-600 hover:bg-gray-800 dark:hover:bg-gray-500 text-white font-medium rounded-lg transition-colors"
								>
									Edit
								</button>
								{type === "flow" && onRun && (
									<button
										onClick={handleRun}
										className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
									>
										<svg
											className="w-4 h-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
											/>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
										Run
									</button>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
