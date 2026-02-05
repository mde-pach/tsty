"use client";

interface BulkActionToolbarProps {
	selectedCount: number;
	totalCount: number;
	onSelectAll: () => void;
	onDeselectAll: () => void;
	onDelete?: () => void;
	onTag?: () => void;
	onMoveCategory?: () => void;
	onExport?: () => void;
	onRun?: () => void;
	type: "flow" | "action";
}

export function BulkActionToolbar({
	selectedCount,
	totalCount,
	onSelectAll,
	onDeselectAll,
	onDelete,
	onTag,
	onMoveCategory,
	onExport,
	onRun,
	type,
}: BulkActionToolbarProps) {
	if (selectedCount === 0) return null;

	return (
		<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
			<div className="bg-gray-900 dark:bg-gray-800 text-white rounded-lg shadow-2xl border border-gray-700 dark:border-gray-600 overflow-hidden">
				<div className="flex items-center divide-x divide-gray-700">
					{/* Selection Info */}
					<div className="px-4 py-3">
						<div className="flex items-center gap-3">
							<div className="w-6 h-6 bg-primary-600 rounded flex items-center justify-center text-xs font-bold">
								{selectedCount}
							</div>
							<span className="text-sm font-medium">
								{selectedCount} {type}
								{selectedCount !== 1 ? "s" : ""} selected
							</span>
						</div>
					</div>

					{/* Select/Deselect All */}
					<div className="px-3 py-3">
						{selectedCount === totalCount ? (
							<button
								onClick={onDeselectAll}
								className="text-sm text-gray-300 hover:text-white transition-colors"
							>
								Deselect All
							</button>
						) : (
							<button
								onClick={onSelectAll}
								className="text-sm text-gray-300 hover:text-white transition-colors"
							>
								Select All ({totalCount})
							</button>
						)}
					</div>

					{/* Actions */}
					<div className="flex items-center">
						{onRun && type === "flow" && (
							<button
								onClick={onRun}
								className="px-4 py-3 hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
								title="Run selected"
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
								<span className="text-sm">Run</span>
							</button>
						)}

						{onTag && (
							<button
								onClick={onTag}
								className="px-4 py-3 hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
								title="Add/remove tags"
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
										d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
									/>
								</svg>
								<span className="text-sm">Tag</span>
							</button>
						)}

						{onMoveCategory && (
							<button
								onClick={onMoveCategory}
								className="px-4 py-3 hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
								title="Move to category"
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
										d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
									/>
								</svg>
								<span className="text-sm">Move</span>
							</button>
						)}

						{onExport && (
							<button
								onClick={onExport}
								className="px-4 py-3 hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
								title="Export selected"
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
										d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
									/>
								</svg>
								<span className="text-sm">Export</span>
							</button>
						)}

						{onDelete && (
							<button
								onClick={onDelete}
								className="px-4 py-3 hover:bg-red-900/50 text-red-400 hover:text-red-300 transition-colors flex items-center gap-2"
								title="Delete selected"
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
										d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
									/>
								</svg>
								<span className="text-sm">Delete</span>
							</button>
						)}
					</div>
				</div>

				{/* Hint */}
				<div className="px-4 py-2 bg-gray-800 dark:bg-gray-900 border-t border-gray-700">
					<p className="text-xs text-gray-400">
						<kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs">
							⌘ Click
						</kbd>{" "}
						individual •{" "}
						<kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs">
							⇧ Click
						</kbd>{" "}
						range • <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs">
							ESC
						</kbd>{" "}
						clear
					</p>
				</div>
			</div>
		</div>
	);
}
