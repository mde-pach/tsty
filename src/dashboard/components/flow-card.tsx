"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FlowFile } from "@/lib/types";
import { Card, ConfirmModal } from "./ui";
import { ExecutionModal } from "./execution-modal";

interface FlowCardProps {
	flow: FlowFile;
	onRun?: (flowId: string, device?: "desktop" | "mobile") => void;
	onDelete?: (flowId: string) => void;
	onQuickView?: (flow: FlowFile) => void;
	isSelected?: boolean;
	onSelect?: (flowId: string) => void;
	selectionMode?: boolean;
}

export function FlowCard({
	flow,
	onRun,
	onDelete,
	onQuickView,
	isSelected = false,
	onSelect,
	selectionMode = false,
}: FlowCardProps) {
	const router = useRouter();
	const [showMenu, setShowMenu] = useState<{ x: number; y: number } | false>(false);
	const [showRunOverlay, setShowRunOverlay] = useState(false);
	const [showExecutionModal, setShowExecutionModal] = useState(false);
	const [executionDevice, setExecutionDevice] = useState<
		"desktop" | "mobile"
	>("desktop");
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [showClearConfirm, setShowClearConfirm] = useState(false);
	const [clearing, setClearing] = useState(false);

	const stepCount = flow.flow.steps.length;
	const devices = flow.flow.devices || ["desktop"];
	const tags = flow.flow.tags || [];

	const getRelativeTime = (date: string) => {
		const now = new Date();
		const past = new Date(date);
		const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

		if (diffInSeconds < 60) return "just now";
		if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
		if (diffInSeconds < 86400)
			return `${Math.floor(diffInSeconds / 3600)}h ago`;
		if (diffInSeconds < 604800)
			return `${Math.floor(diffInSeconds / 86400)}d ago`;
		return past.toLocaleDateString();
	};

	const getStatusIcon = () => {
		if (!flow.lastRunStatus) {
			return (
				<div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600" />
			);
		}
		if (flow.lastRunStatus === "passed") {
			return (
				<svg
					className="w-5 h-5 text-success-600 dark:text-success-400"
					fill="currentColor"
					viewBox="0 0 20 20"
				>
					<path
						fillRule="evenodd"
						d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
						clipRule="evenodd"
					/>
				</svg>
			);
		}
		return (
			<svg
				className="w-5 h-5 text-error-600 dark:text-error-400"
				fill="currentColor"
				viewBox="0 0 20 20"
			>
				<path
					fillRule="evenodd"
					d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
					clipRule="evenodd"
				/>
			</svg>
		);
	};

	const handleRun = (device?: "desktop" | "mobile") => {
		setShowRunOverlay(false);
		setShowMenu(false);
		setExecutionDevice(device || "desktop");
		setShowExecutionModal(true);
	};

	const closeMenu = () => setShowMenu(false);

	const handleClearHistory = async () => {
		setClearing(true);
		try {
			const response = await fetch(
				`/api/reports?action=clear&flowId=${flow.id}`,
				{ method: "POST" }
			);
			const result = await response.json();
			if (result.success) {
				// Refresh the page or trigger a refetch
				window.location.reload();
			}
		} catch (error) {
			console.error("Error clearing history:", error);
		} finally {
			setClearing(false);
			setShowClearConfirm(false);
		}
	};

	const handleClick = (e: React.MouseEvent) => {
		// In selection mode or with selection callback, handle selection
		if (selectionMode || onSelect) {
			e.preventDefault();
			onSelect?.(flow.id);
			return;
		}

		// Cmd+Click or Ctrl+Click opens quick view
		if ((e.metaKey || e.ctrlKey) && onQuickView) {
			e.preventDefault();
			onQuickView(flow);
		} else {
			router.push(`/flows/${encodeURIComponent(flow.id)}`);
		}
	};

	return (
		<>
		<div onClick={handleClick}>
		<Card
			padding="none"
			hover
			className={`group relative overflow-hidden cursor-grab active:cursor-grabbing ${
				isSelected
					? "ring-2 ring-primary-600 dark:ring-primary-400"
					: ""
			}`}
			draggable
			onDragStart={(e: React.DragEvent) => {
				e.dataTransfer.effectAllowed = "move";
				e.dataTransfer.setData("itemId", flow.id);
				e.dataTransfer.setData("itemType", "flow");
				// Add drag image for better UX
				const target = e.currentTarget;
				if (target instanceof HTMLElement) {
					e.dataTransfer.setDragImage(target, target.offsetWidth / 2, 20);
				}
			}}
			onDragEnd={(e: React.DragEvent) => {
				e.preventDefault();
			}}
		>
			{/* Selection Checkbox */}
			{(selectionMode || onSelect) && (
				<div
					className={`absolute top-3 left-3 z-20 transition-opacity ${
						selectionMode ? "opacity-100" : "opacity-0 group-hover:opacity-100"
					}`}
				>
					<div
						className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
							isSelected
								? "bg-primary-600 border-primary-600"
								: "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
						}`}
					>
						{isSelected && (
							<svg
								className="w-3 h-3 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={3}
									d="M5 13l4 4L19 7"
								/>
							</svg>
						)}
					</div>
				</div>
			)}

			{/* Removed hover overlay - run button moved to menu */}

			{/* Card Content */}
			<div className="p-5">
				{/* Header */}
				<div className="flex items-start gap-3 mb-3">
					<div className="flex-shrink-0 mt-0.5">{getStatusIcon()}</div>

					<div className="flex-1 min-w-0">
						<h3 className="text-h3 text-gray-900 dark:text-white truncate mb-1">
							{flow.name}
						</h3>
					</div>

					{/* Menu Button - Always visible on mobile, hover on desktop */}
					<div className="relative flex-shrink-0">
						<button
							onClick={(e) => {
								e.stopPropagation();
								const rect = e.currentTarget.getBoundingClientRect();
								setShowMenu(showMenu ? false : { x: rect.right - 192, y: rect.bottom + 4 });
							}}
							className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors md:opacity-0 md:group-hover:opacity-100"
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
									d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
								/>
							</svg>
						</button>

						{/* Dropdown Menu */}
						{showMenu && (
							<>
								<div
									className="fixed inset-0 z-[60]"
									onClick={(e) => {
										e.stopPropagation();
										closeMenu();
									}}
								/>
								<div
									className="fixed mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-[70] py-1"
									style={{
										top: showMenu ? `${showMenu.y}px` : 0,
										left: showMenu ? `${showMenu.x}px` : 0,
									}}
								>
									{/* Run Options */}
									{devices.length === 1 ? (
										<button
											onClick={(e) => {
												e.stopPropagation();
												handleRun(devices[0] as "desktop" | "mobile");
												closeMenu();
											}}
											className="w-full px-4 py-2 text-left text-sm text-primary-600 dark:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
										>
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
											Run Test
										</button>
									) : (
										<>
											{devices.map((device) => (
												<button
													key={device}
													onClick={(e) => {
														e.stopPropagation();
														handleRun(device as "desktop" | "mobile");
														closeMenu();
													}}
													className="w-full px-4 py-2 text-left text-sm text-primary-600 dark:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
												>
													{device === "desktop" ? (
														<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
														</svg>
													) : (
														<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
														</svg>
													)}
													Run on {device.charAt(0).toUpperCase() + device.slice(1)}
												</button>
											))}
										</>
									)}
									<div className="border-t border-gray-200 dark:border-gray-700 my-1" />
									<button
										onClick={(e) => {
											e.stopPropagation();
											router.push(`/flows/${encodeURIComponent(flow.id)}/edit`);
											closeMenu();
										}}
										className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
									>
										Edit
									</button>
									<button
										onClick={(e) => {
											e.stopPropagation();
											setShowClearConfirm(true);
											closeMenu();
										}}
										className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
									>
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
										</svg>
										Clear History
									</button>
									{onDelete && (
										<>
											<div className="border-t border-gray-200 dark:border-gray-700 my-1" />
											<button
												onClick={(e) => {
													e.stopPropagation();
													setShowDeleteConfirm(true);
													closeMenu();
												}}
												className="w-full px-4 py-2 text-left text-sm text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20"
											>
												Delete
											</button>
										</>
									)}
								</div>
							</>
						)}
					</div>
				</div>

				{/* Description */}
				{flow.flow.description && (
					<p className="text-sm text-gray-600 dark:text-gray-400 mb-3 truncate">
						{flow.flow.description}
					</p>
				)}

				{/* Compact Metadata */}
				<div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
					<span className="font-medium">
						{stepCount} {stepCount === 1 ? "step" : "steps"}
					</span>
					<span className="text-gray-300 dark:text-gray-600">•</span>
					{flow.lastRun ? (
						<span>{getRelativeTime(flow.lastRun)}</span>
					) : (
						<span>Not run yet</span>
					)}
				</div>

				{/* Tags - Max 2 visible */}
				{tags.length > 0 && (
					<div className="flex flex-wrap gap-1.5">
						{tags.slice(0, 2).map((tag) => (
							<span
								key={tag}
								className="inline-flex items-center px-2.5 py-1 text-xs font-semibold bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-md"
							>
								{tag}
							</span>
						))}
						{tags.length > 2 && (
							<span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md">
								+{tags.length - 2}
							</span>
						)}
					</div>
				)}
			</div>
		</Card>
		</div>

		{/* Execution Modal */}
		{showExecutionModal && (
			<ExecutionModal
				flowId={flow.id}
				flowName={flow.name}
				device={executionDevice}
				onClose={() => setShowExecutionModal(false)}
			/>
		)}

		{/* Delete Confirmation Modal */}
		<ConfirmModal
			isOpen={showDeleteConfirm}
			onClose={() => setShowDeleteConfirm(false)}
			onConfirm={() => onDelete?.(flow.id)}
			title="Delete Flow"
			message={`Are you sure you want to delete "${flow.name}"? This action cannot be undone.`}
			confirmLabel="Delete"
			variant="danger"
		/>

		{/* Clear History Confirmation Modal */}
		<ConfirmModal
			isOpen={showClearConfirm}
			onClose={() => setShowClearConfirm(false)}
			onConfirm={handleClearHistory}
			title="Clear History"
			message={`This will keep only the most recent test run for "${flow.name}" and remove all older reports and screenshots. Continue?`}
			confirmLabel={clearing ? "Clearing..." : "Clear History"}
			variant="warning"
		/>
		</>
	);
}
