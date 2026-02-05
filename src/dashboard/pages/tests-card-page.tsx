"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FlowCard } from "../components/flow-card";
import { AdaptiveSidebar } from "../components/adaptive-sidebar";
import {
	FlowFilters,
	type ViewFilter,
	type SortOption,
	type ViewMode,
} from "../components/flow-filters";
import { PageLayout } from "../components/page-layout";
import { Button, EmptyState, LoadingState } from "../components/ui";
import { useFlows } from "../hooks/use-flows";
import { useFolders } from "../hooks/use-folders";
import { useFolderList } from "../hooks/use-folder-list";

export default function TestsCardPage() {
	const router = useRouter();
	const { flows, loading, deleteFlow, refetch } = useFlows();
	const { createFolder, renameFolder, deleteFolder, moveItem, moveFolder } = useFolders();
	const { folders: allFolders, refetch: refetchFolders } = useFolderList();

	const [searchQuery, setSearchQuery] = useState("");
	const [viewFilter, setViewFilter] = useState<ViewFilter>("all");
	const [sortOption, setSortOption] = useState<SortOption>("recent");
	const [viewMode, setViewMode] = useState<ViewMode>("grid");
	const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

	// Filter and sort flows
	const filteredAndSortedFlows = useMemo(() => {
		let result = [...flows];

		// Filter by view mode
		if (viewFilter === "by-tag" && selectedFolder) {
			// Filter by tag
			result = result.filter((flow) => flow.flow.tags?.includes(selectedFolder));
		} else if (selectedFolder) {
			// Folder filter
			result = result.filter((flow) => flow.id.startsWith(selectedFolder + "/"));
		} else if (viewFilter === "all") {
			// Root - show only items without folder structure
			result = result.filter((flow) => !flow.id.includes("/"));
		}

		// Search filter
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				(flow) =>
					flow.name.toLowerCase().includes(query) ||
					flow.flow.description?.toLowerCase().includes(query) ||
					flow.flow.category?.toLowerCase().includes(query),
			);
		}

		// Sort
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
			case "most-run":
				// TODO: Sort by run count
				break;
			case "pass-rate":
				// TODO: Sort by pass rate
				break;
		}

		return result;
	}, [flows, searchQuery, sortOption, selectedFolder, viewFilter]);

	const handleDeleteFlow = async (flowId: string) => {
		await deleteFlow(flowId);
	};

	const handleFolderCreate = async (
		parentPath: string | null,
		name: string,
	) => {
		const success = await createFolder("flows", parentPath, name);
		if (success) {
			refetchFolders(); // Only refetch folders, not all flows
		}
	};

	const handleFolderRename = async (path: string, newName: string) => {
		const success = await renameFolder("flows", path, newName);
		if (success) {
			// Refetch both folders (metadata) and flows (IDs changed)
			await Promise.all([refetchFolders(), refetch()]);
			// Update selected folder if it was the one being renamed
			if (selectedFolder === path) {
				const parts = path.split("/");
				parts[parts.length - 1] = newName;
				setSelectedFolder(parts.join("/"));
			}
		}
	};

	const handleFolderDelete = async (path: string) => {
		const success = await deleteFolder("flows", path);
		if (success) {
			// Refetch both folders (removed from metadata) and flows (deleted)
			await Promise.all([refetchFolders(), refetch()]);
			// Clear selected folder if it was the one being deleted
			if (selectedFolder === path || selectedFolder?.startsWith(path + "/")) {
				setSelectedFolder(null);
			}
		}
	};

	const handleItemMove = async (itemId: string, targetFolder: string | null) => {
		const success = await moveItem("flows", itemId, targetFolder);
		if (success) {
			// Only refetch flows (folder structure unchanged)
			refetch();
		}
	};

	const handleFolderMove = async (folderPath: string, targetFolder: string | null) => {
		const success = await moveFolder("flows", folderPath, targetFolder);
		if (success) {
			// Silent refetch - no loading state, no flash
			await Promise.all([refetchFolders(), refetch()]);

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
				<LoadingState message="Loading flows..." />
			</div>
		);
	}

	// Calculate stats
	const totalFlows = flows.length;
	const passingFlows = flows.filter((f) => f.lastRunStatus === "passed").length;
	const passRate =
		totalFlows > 0 ? Math.round((passingFlows / totalFlows) * 100) : 0;

	// Get breadcrumb for current folder
	const breadcrumb = selectedFolder
		? selectedFolder.split("/").map((part, index, arr) => ({
				name: part,
				path: arr.slice(0, index + 1).join("/"),
		  }))
		: [];

	return (
		<PageLayout
			title="Tests"
			description="Browse and run your test flows"
			action={
				<div className="flex items-center gap-3">
					{/* Stats */}
					<div className="hidden sm:flex items-center gap-4 text-sm">
						<div className="flex items-center gap-2">
							<div className="w-2 h-2 bg-success-500 rounded-full" />
							<span className="text-gray-600 dark:text-gray-400">
								{passingFlows} passing
							</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-2 h-2 bg-error-500 rounded-full" />
							<span className="text-gray-600 dark:text-gray-400">
								{totalFlows - passingFlows} failing
							</span>
						</div>
						<div className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg font-semibold">
							{passRate}% pass rate
						</div>
					</div>

					<Button
						onClick={() => router.push("/flows/new")}
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
						New Flow
					</Button>
				</div>
			}
			filters={
				<FlowFilters
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					viewFilter={viewFilter}
					onViewFilterChange={setViewFilter}
					sortOption={sortOption}
					onSortChange={setSortOption}
					viewMode={viewMode}
					onViewModeChange={setViewMode}
					resultCount={filteredAndSortedFlows.length}
				/>
			}
		>
			<div className="flex gap-6">
				{/* Adaptive Sidebar */}
				<AdaptiveSidebar
					viewFilter={viewFilter}
					flows={flows}
					allFolders={allFolders}
					selectedFolder={selectedFolder}
					onFolderSelect={setSelectedFolder}
					onFolderCreate={handleFolderCreate}
					onFolderRename={handleFolderRename}
					onFolderDelete={handleFolderDelete}
					onItemMove={handleItemMove}
					onFolderMove={handleFolderMove}
				/>

				{/* Main Content Area */}
				<div className="flex-1 min-w-0">
					{/* Breadcrumb - Always display */}
					<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
						<button
							onClick={() => setSelectedFolder(null)}
							className={`hover:text-gray-900 dark:hover:text-gray-100 transition-colors ${
								!selectedFolder ? "font-semibold text-gray-900 dark:text-gray-100" : ""
							}`}
						>
							All Flows
						</button>
						{breadcrumb.map((crumb, index) => (
							<div key={crumb.path} className="flex items-center gap-2">
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

					{/* Flow Cards Grid or List */}
					{filteredAndSortedFlows.length === 0 ? (
						flows.length === 0 ? (
							<EmptyState
								icon={
									<svg
										className="w-12 h-12 text-gray-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
										/>
									</svg>
								}
								title="No test flows yet"
								description="Create your first flow to start testing your application"
								action={{
									label: "Create Flow",
									onClick: () => router.push("/flows/new"),
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
								title="No flows found"
								description="Try adjusting your search or filters, or select a different folder"
								action={{
									label: "Clear Filters",
									onClick: () => {
										setSearchQuery("");
										setViewFilter("all");
									},
								}}
							/>
						)
					) : viewMode === "grid" ? (
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{filteredAndSortedFlows.map((flow) => (
								<FlowCard
									key={flow.id}
									flow={flow}
									onDelete={handleDeleteFlow}
								/>
							))}
						</div>
					) : (
						<div className="space-y-2">
							{filteredAndSortedFlows.map((flow) => {
								const stepCount = flow.flow.steps.length;
								const tags = flow.flow.tags || [];
								return (
									<div
										key={flow.id}
										className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow cursor-pointer group"
										onClick={() => router.push(`/flows/${flow.id}`)}
									>
										{/* Status Icon */}
										<div className="flex-shrink-0">
											{!flow.lastRunStatus ? (
												<div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600" />
											) : flow.lastRunStatus === "passed" ? (
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
											) : (
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
											)}
										</div>

										{/* Flow Info */}
										<div className="flex-1 min-w-0">
											<h3 className="font-semibold text-gray-900 dark:text-white truncate">
												{flow.name}
											</h3>
											{flow.flow.description && (
												<p className="text-sm text-gray-600 dark:text-gray-400 truncate">
													{flow.flow.description}
												</p>
											)}
										</div>

										{/* Metadata */}
										<div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
											<span>{stepCount} {stepCount === 1 ? "step" : "steps"}</span>
											{tags.length > 0 && (
												<div className="flex gap-1">
													{tags.slice(0, 2).map((tag) => (
														<span
															key={tag}
															className="px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded"
														>
															{tag}
														</span>
													))}
													{tags.length > 2 && (
														<span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
															+{tags.length - 2}
														</span>
													)}
												</div>
											)}
										</div>

										{/* Actions */}
										<div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
											onClick={(e) => e.stopPropagation()}>
											<Button
												onClick={() => router.push(`/flows/${flow.id}/edit`)}
												variant="secondary"
												size="sm"
											>
												Edit
											</Button>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			</div>
		</PageLayout>
	);
}
