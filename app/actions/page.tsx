"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ActionCard } from "@/dashboard/components/action-card";
import { FolderTree } from "@/dashboard/components/folder-tree";
import {
	ActionFilters,
	type ActionSortOption,
	type ActionTypeFilter,
	type ViewMode,
} from "@/dashboard/components/action-filters";
import { PageLayout } from "@/dashboard/components/page-layout";
import { Button, EmptyState, LoadingState } from "@/dashboard/components/ui";
import { useActions } from "@/dashboard/hooks/use-actions";
import { useFolders } from "@/dashboard/hooks/use-folders";
import { ActionFile } from "@/lib/types";
import { ActionTemplates } from "@/dashboard/components/action-templates";

export default function ActionsPage() {
	const router = useRouter();
	const { actions, loading, deleteAction, refetch } = useActions();
	const { createFolder, renameFolder, deleteFolder, moveItem, moveFolder } = useFolders();

	const [searchQuery, setSearchQuery] = useState("");
	const [typeFilter, setTypeFilter] = useState<ActionTypeFilter>("all");
	const [sortOption, setSortOption] = useState<ActionSortOption>("recent");
	const [viewMode, setViewMode] = useState<ViewMode>("grid");
	const [usageStats, setUsageStats] = useState<Record<string, number>>({});
	const [showTemplates, setShowTemplates] = useState(false);
	const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

	// Load usage stats
	useEffect(() => {
		const loadUsageStats = async () => {
			try {
				const response = await fetch("/api/qa-testing/usage/all-actions");
				if (response.ok) {
					const data = await response.json();
					setUsageStats(data.data || {});
				}
			} catch (error) {
				console.error("Failed to load usage stats:", error);
			}
		};

		loadUsageStats();
	}, []);

	// Filter and sort actions
	const filteredAndSortedActions = useMemo(() => {
		let result = [...actions];

		// Folder filter
		if (selectedFolder) {
			result = result.filter((action) =>
				action.id.startsWith(selectedFolder + "/"),
			);
		} else {
			// Root - show only items without folder structure
			result = result.filter((action) => !action.id.includes("/"));
		}

		// Apply search filter
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				(action) =>
					action.name.toLowerCase().includes(query) ||
					action.definition.description?.toLowerCase().includes(query) ||
					action.definition.category?.toLowerCase().includes(query) ||
					action.definition.type.toLowerCase().includes(query),
			);
		}

		// Apply type filter
		if (typeFilter !== "all") {
			result = result.filter((action) => action.definition.type === typeFilter);
		}

		// Apply sort
		switch (sortOption) {
			case "recent":
				result.sort((a, b) => {
					const dateA = new Date(a.updatedAt).getTime();
					const dateB = new Date(b.updatedAt).getTime();
					return dateB - dateA;
				});
				break;
			case "alphabetical":
				result.sort((a, b) => a.name.localeCompare(b.name));
				break;
			case "type":
				result.sort((a, b) =>
					a.definition.type.localeCompare(b.definition.type),
				);
				break;
			case "most-used":
				result.sort((a, b) => {
					const usageA = usageStats[a.id] || 0;
					const usageB = usageStats[b.id] || 0;
					return usageB - usageA;
				});
				break;
		}

		return result;
	}, [actions, searchQuery, typeFilter, sortOption, usageStats, selectedFolder]);

	const handleDeleteAction = async (actionId: string) => {
		await deleteAction(actionId);
	};

	const handleExportAction = (action: ActionFile) => {
		const dataStr = JSON.stringify(action, null, 2);
		const dataBlob = new Blob([dataStr], { type: "application/json" });
		const url = URL.createObjectURL(dataBlob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `${action.id}.action.json`;
		link.click();
		URL.revokeObjectURL(url);
	};

	const handleExportAll = () => {
		const dataStr = JSON.stringify(filteredAndSortedActions, null, 2);
		const dataBlob = new Blob([dataStr], { type: "application/json" });
		const url = URL.createObjectURL(dataBlob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `actions-export-${new Date().toISOString().split("T")[0]}.json`;
		link.click();
		URL.revokeObjectURL(url);
	};

	const handleImport = () => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = ".json";
		input.onchange = async (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (!file) return;

			try {
				const text = await file.text();
				const data = JSON.parse(text);

				// Check if it's a single action or array of actions
				const actionsToImport = Array.isArray(data) ? data : [data];

				// Import each action
				for (const actionData of actionsToImport) {
					await fetch("/api/actions", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							id: actionData.id || `imported-${Date.now()}`,
							definition: actionData.definition || actionData,
						}),
					});
				}

				// Reload actions
				refetch();
			} catch (error) {
				alert("Failed to import actions. Please check the file format.");
				console.error("Import error:", error);
			}
		};
		input.click();
	};

	const handleFolderCreate = async (
		parentPath: string | null,
		name: string,
	) => {
		const success = await createFolder("actions", parentPath, name);
		if (success) {
			refetch();
		}
	};

	const handleFolderRename = async (path: string, newName: string) => {
		const success = await renameFolder("actions", path, newName);
		if (success) {
			refetch();
			if (selectedFolder === path) {
				const parts = path.split("/");
				parts[parts.length - 1] = newName;
				setSelectedFolder(parts.join("/"));
			}
		}
	};

	const handleFolderDelete = async (path: string) => {
		const success = await deleteFolder("actions", path);
		if (success) {
			refetch();
			if (
				selectedFolder === path ||
				selectedFolder?.startsWith(path + "/")
			) {
				setSelectedFolder(null);
			}
		}
	};

	const handleItemMove = async (
		itemId: string,
		targetFolder: string | null,
	) => {
		const success = await moveItem("actions", itemId, targetFolder);
		if (success) {
			refetch();
		}
	};

	const handleFolderMove = async (folderPath: string, targetFolder: string | null) => {
		const success = await moveFolder("actions", folderPath, targetFolder);
		if (success) {
			refetch();
			// Update selected folder if it was moved
			if (selectedFolder === folderPath) {
				const folderName = folderPath.split("/").pop();
				if (folderName) {
					const newPath = targetFolder ? `${targetFolder}/${folderName}` : folderName;
					setSelectedFolder(newPath);
				}
			}
		}
	};

	if (loading) {
		return (
			<div className="py-8">
				<LoadingState message="Loading actions..." />
			</div>
		);
	}

	// Get breadcrumb for current folder
	const breadcrumb = selectedFolder
		? selectedFolder.split("/").map((part, index, arr) => ({
				name: part,
				path: arr.slice(0, index + 1).join("/"),
		  }))
		: [];

	return (
		<PageLayout
			title="Actions"
			description="Reusable action sequences for your test flows"
			action={
				<div className="flex items-center gap-2">
					{/* Templates Button */}
					<button
						onClick={() => setShowTemplates(true)}
						className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
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
								d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
							/>
						</svg>
						Templates
					</button>

					{/* Import/Export Dropdown */}
					<div className="relative group">
						<button className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
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
									d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
								/>
							</svg>
							Import/Export
						</button>

						{/* Dropdown Menu */}
						<div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
							<button
								onClick={handleImport}
								className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
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
										d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
									/>
								</svg>
								Import Actions
							</button>
							<button
								onClick={handleExportAll}
								className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
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
										d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3v-12"
									/>
								</svg>
								Export All ({filteredAndSortedActions.length})
							</button>
						</div>
					</div>

					{/* New Action Button */}
					<Button
						onClick={() => router.push("/actions/new")}
						className="flex items-center gap-2"
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
								d="M12 4v16m8-8H4"
							/>
						</svg>
						New Action
					</Button>
				</div>
			}
			filters={
				<ActionFilters
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					typeFilter={typeFilter}
					onTypeFilterChange={setTypeFilter}
					sortOption={sortOption}
					onSortChange={setSortOption}
					viewMode={viewMode}
					onViewModeChange={setViewMode}
					resultCount={filteredAndSortedActions.length}
				/>
			}
		>
			<div className="flex gap-6">
				{/* Folder Tree Sidebar */}
				<div className="w-64 flex-shrink-0">
					<div className="sticky top-6">
						<FolderTree
							items={actions.map((a) => ({ id: a.id, name: a.name }))}
							selectedFolder={selectedFolder}
							onFolderSelect={setSelectedFolder}
							onFolderCreate={handleFolderCreate}
							onFolderRename={handleFolderRename}
							onFolderDelete={handleFolderDelete}
							onItemMove={handleItemMove}
							onFolderMove={handleFolderMove}
							rootLabel="All Actions"
						/>
					</div>
				</div>

				{/* Main Content Area */}
				<div className="flex-1 min-w-0">
					{/* Breadcrumb */}
					{breadcrumb.length > 0 && (
						<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
							<button
								onClick={() => setSelectedFolder(null)}
								className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
							>
								All Actions
							</button>
							{breadcrumb.map((crumb, index) => (
								<div key={crumb.path} className="flex items-center gap-2">
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
											d="M9 5l7 7-7 7"
										/>
									</svg>
									<button
										onClick={() => setSelectedFolder(crumb.path)}
										className={`hover:text-gray-900 dark:hover:text-gray-100 transition-colors ${
											index === breadcrumb.length - 1
												? "font-semibold text-gray-900 dark:text-gray-100"
												: ""
										}`}
									>
										{crumb.name}
									</button>
								</div>
							))}
						</div>
					)}

					{/* Action Cards Grid */}
					{filteredAndSortedActions.length === 0 ? (
						actions.length === 0 ? (
							<EmptyState
								icon={
									<svg
										className="w-8 h-8 text-gray-400"
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
								}
								title="No actions yet"
								description="Create your first reusable action to get started"
								action={{
									label: "Create Action",
									onClick: () => router.push("/actions/new"),
								}}
							/>
						) : (
							<EmptyState
								icon={
									<svg
										className="w-8 h-8 text-gray-400"
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
								title="No actions found"
								description="Try adjusting your search or filters, or select a different folder"
								action={{
									label: "Clear Filters",
									onClick: () => {
										setSearchQuery("");
										setTypeFilter("all");
									},
								}}
							/>
						)
					) : (
						<div
							className={
								viewMode === "grid"
									? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
									: "space-y-3"
							}
						>
							{filteredAndSortedActions.map((action) => (
								<ActionCard
									key={action.id}
									action={action}
									onDelete={handleDeleteAction}
									usageCount={usageStats[action.id] || 0}
								/>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Action Templates Modal */}
			<ActionTemplates
				isOpen={showTemplates}
				onClose={() => setShowTemplates(false)}
			/>
		</PageLayout>
	);
}
