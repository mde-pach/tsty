"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ActionFile } from "@/lib/types";
import { Card, ConfirmModal } from "./ui";

interface ActionCardProps {
	action: ActionFile;
	onDelete?: (actionId: string) => void;
	onQuickView?: (action: ActionFile) => void;
	isSelected?: boolean;
	onSelect?: (actionId: string) => void;
	selectionMode?: boolean;
	usageCount?: number;
}

const actionTypeConfig = {
	modal: {
		color:
			"bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800",
		icon: "🔲",
	},
	form: {
		color:
			"bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800",
		icon: "📝",
	},
	navigation: {
		color:
			"bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800",
		icon: "🧭",
	},
	interaction: {
		color:
			"bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800",
		icon: "👆",
	},
};

export function ActionCard({
	action,
	onDelete,
	onQuickView,
	isSelected = false,
	onSelect,
	selectionMode = false,
	usageCount = 0,
}: ActionCardProps) {
	const router = useRouter();
	const [showMenu, setShowMenu] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	const typeConfig = actionTypeConfig[action.definition.type];
	const actionCount = action.definition.primitives.length;
	const tags = action.definition.tags || [];

	const handleDelete = async () => {
		onDelete?.(action.id);
	};

	const handleClick = (e: React.MouseEvent) => {
		// In selection mode or with selection callback, handle selection
		if (selectionMode || onSelect) {
			e.preventDefault();
			onSelect?.(action.id);
			return;
		}

		// Cmd+Click or Ctrl+Click opens quick view
		if ((e.metaKey || e.ctrlKey) && onQuickView) {
			e.preventDefault();
			onQuickView(action);
		} else {
			router.push(`/actions/${encodeURIComponent(action.id)}`);
		}
	};

	return (
		<>
		<div onClick={handleClick}>
		<Card
			className={`group hover:shadow-lg transition-all cursor-grab active:cursor-grabbing relative border-l-4 ${
				isSelected
					? "ring-2 ring-primary-600 dark:ring-primary-400"
					: ""
			}`}
			padding="none"
			draggable
			onDragStart={(e: React.DragEvent) => {
				e.dataTransfer.effectAllowed = "move";
				e.dataTransfer.setData("itemId", action.id);
				e.dataTransfer.setData("itemType", "action");
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
			<div className={`absolute inset-y-0 left-0 w-1 ${typeConfig.color}`} />

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

			<div className="p-5">
				{/* Header */}
				<div className="flex items-start gap-3 mb-3">
					<span className="text-2xl flex-shrink-0">{typeConfig.icon}</span>

					<div className="flex-1 min-w-0">
						<h3 className="text-h3 text-gray-900 dark:text-white truncate mb-1">
							{action.name}
						</h3>
						<p className="text-sm text-gray-600 dark:text-gray-400 truncate">
							{action.definition.description || "No description"}
						</p>
					</div>

					{/* Menu Button */}
					<div className="relative flex-shrink-0">
						<button
							onClick={(e) => {
								e.stopPropagation();
								setShowMenu(!showMenu);
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

						{showMenu && (
							<>
								<div
									className="fixed inset-0 z-20"
									onClick={(e) => {
										e.stopPropagation();
										setShowMenu(false);
									}}
								/>
								<div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-30">
									<button
										onClick={(e) => {
											e.stopPropagation();
											router.push(`/actions/${encodeURIComponent(action.id)}/edit`);
											setShowMenu(false);
										}}
										className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
									>
										Edit
									</button>
									{onDelete && (
										<>
											<div className="border-t border-gray-200 dark:border-gray-700 my-1" />
											<button
												onClick={(e) => {
													e.stopPropagation();
													setShowDeleteConfirm(true);
													setShowMenu(false);
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

				{/* Type Badge & Usage */}
				<div className="mb-3 flex items-center gap-2">
					<span
						className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border ${typeConfig.color}`}
					>
						{action.definition.type}
					</span>
					{usageCount > 0 && (
						<span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded-md">
							<svg
								className="w-3 h-3"
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
							{usageCount} {usageCount === 1 ? "flow" : "flows"}
						</span>
					)}
				</div>

				{/* Compact Metadata */}
				<div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
					<span className="font-medium">
						{actionCount} {actionCount === 1 ? "action" : "actions"}
					</span>
					{action.definition.category && (
						<>
							<span className="text-gray-300 dark:text-gray-600">•</span>
							<span className="truncate">{action.definition.category}</span>
						</>
					)}
				</div>

				{/* Tags - Max 2 visible */}
				{tags.length > 0 && (
					<div className="flex flex-wrap gap-1.5 pt-3 border-t border-gray-200 dark:border-gray-700">
						{tags.slice(0, 2).map((tag) => (
							<span
								key={tag}
								className="inline-flex items-center px-2.5 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md"
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

				{/* Dependencies indicator */}
				{action.definition.dependencies &&
					action.definition.dependencies.length > 0 && (
						<div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
							<div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
								<svg
									className="w-3.5 h-3.5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
									/>
								</svg>
								<span className="font-medium">
									{action.definition.dependencies.length}{" "}
									{action.definition.dependencies.length === 1
										? "dependency"
										: "dependencies"}
								</span>
							</div>
						</div>
					)}
			</div>
		</Card>
		</div>

		{/* Delete Confirmation Modal */}
		<ConfirmModal
			isOpen={showDeleteConfirm}
			onClose={() => setShowDeleteConfirm(false)}
			onConfirm={handleDelete}
			title="Delete Action"
			message={`Are you sure you want to delete "${action.name}"? This action cannot be undone.`}
			confirmLabel="Delete"
			variant="danger"
		/>
		</>
	);
}
