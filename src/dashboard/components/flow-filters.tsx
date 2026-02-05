"use client";

import { Input, Select } from "./ui";

export type ViewFilter = "all" | "by-page" | "by-tag" | "by-status";
export type SortOption = "recent" | "alphabetical" | "most-run" | "pass-rate";
export type ViewMode = "grid" | "list";

interface FlowFiltersProps {
	searchQuery: string;
	onSearchChange: (query: string) => void;
	viewFilter: ViewFilter;
	onViewFilterChange: (filter: ViewFilter) => void;
	sortOption: SortOption;
	onSortChange: (sort: SortOption) => void;
	viewMode: ViewMode;
	onViewModeChange: (mode: ViewMode) => void;
	resultCount: number;
}

export function FlowFilters({
	searchQuery,
	onSearchChange,
	viewFilter,
	onViewFilterChange,
	sortOption,
	onSortChange,
	viewMode,
	onViewModeChange,
	resultCount,
}: FlowFiltersProps) {
	const viewFilterOptions = [
		{ value: "all", label: "📁 By Folder" },
		{ value: "by-tag", label: "🏷️ By Tag" },
	];

	const sortOptions = [
		{ value: "recent", label: "Recently Updated" },
		{ value: "alphabetical", label: "Alphabetical" },
		{ value: "most-run", label: "Most Run" },
		{ value: "pass-rate", label: "Pass Rate" },
	];

	return (
		<div className="space-y-4">
			{/* Search and Actions */}
			<div className="flex flex-col sm:flex-row gap-3">
				<div className="flex-1">
					<Input
						type="search"
						value={searchQuery}
						onChange={onSearchChange}
						placeholder="Search flows by name, description, or URL..."
						icon={
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
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
						}
					/>
				</div>
			</div>

			{/* Filters Bar */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
				<div className="flex items-center gap-3">
					<Select
						value={viewFilter}
						onChange={(value) => onViewFilterChange(value as ViewFilter)}
						options={viewFilterOptions}
						className="w-40"
					/>

					<Select
						value={sortOption}
						onChange={(value) => onSortChange(value as SortOption)}
						options={sortOptions}
						className="w-48"
					/>

					<div className="text-sm text-gray-600 dark:text-gray-400">
						{resultCount} {resultCount === 1 ? "flow" : "flows"}
					</div>
				</div>

				{/* View Mode Toggle */}
				<div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
					<button
						onClick={() => onViewModeChange("grid")}
						className={`p-2 rounded transition-colors ${
							viewMode === "grid"
								? "bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm"
								: "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
						}`}
						title="Grid view"
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
								d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
							/>
						</svg>
					</button>
					<button
						onClick={() => onViewModeChange("list")}
						className={`p-2 rounded transition-colors ${
							viewMode === "list"
								? "bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm"
								: "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
						}`}
						title="List view"
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
								d="M4 6h16M4 12h16M4 18h16"
							/>
						</svg>
					</button>
				</div>
			</div>
		</div>
	);
}
