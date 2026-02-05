"use client";

import { Input, Select } from "./ui";

export type ActionTypeFilter =
	| "all"
	| "modal"
	| "form"
	| "navigation"
	| "interaction";
export type ActionSortOption = "recent" | "alphabetical" | "most-used" | "type";
export type ViewMode = "grid" | "list";

interface ActionFiltersProps {
	searchQuery: string;
	onSearchChange: (query: string) => void;
	typeFilter: ActionTypeFilter;
	onTypeFilterChange: (filter: ActionTypeFilter) => void;
	sortOption: ActionSortOption;
	onSortChange: (option: ActionSortOption) => void;
	viewMode: ViewMode;
	onViewModeChange: (mode: ViewMode) => void;
	resultCount: number;
}

export function ActionFilters({
	searchQuery,
	onSearchChange,
	typeFilter,
	onTypeFilterChange,
	sortOption,
	onSortChange,
	viewMode,
	onViewModeChange,
	resultCount,
}: ActionFiltersProps) {
	return (
		<div className="space-y-4">
			{/* Search and Type Filter */}
			<div className="flex flex-col sm:flex-row gap-3">
				<div className="flex-1">
					<Input
						type="search"
						value={searchQuery}
						onChange={onSearchChange}
						placeholder="Search actions by name, description, or category..."
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

				<Select
					value={typeFilter}
					onChange={(value) => onTypeFilterChange(value as ActionTypeFilter)}
					options={[
						{ value: "all", label: "All Types" },
						{ value: "modal", label: "🔲 Modal" },
						{ value: "form", label: "📝 Form" },
						{ value: "navigation", label: "🧭 Navigation" },
						{ value: "interaction", label: "👆 Interaction" },
					]}
					className="w-48"
				/>
			</div>

			{/* Sort and View Mode */}
			<div className="flex items-center justify-between">
				<div className="text-sm text-gray-600 dark:text-gray-400">
					{resultCount} {resultCount === 1 ? "action" : "actions"} found
				</div>

				<div className="flex items-center gap-3">
					{/* Sort */}
					<Select
						value={sortOption}
						onChange={(value) => onSortChange(value as ActionSortOption)}
						options={[
							{ value: "recent", label: "Recent" },
							{ value: "alphabetical", label: "Alphabetical" },
							{ value: "most-used", label: "Most Used" },
							{ value: "type", label: "Type" },
						]}
						className="w-40"
					/>

					{/* View Mode Toggle */}
					<div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
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
		</div>
	);
}
