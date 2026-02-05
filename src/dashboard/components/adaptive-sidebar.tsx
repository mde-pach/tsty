"use client";

import { useState, useEffect } from "react";
import { FolderTree } from "./folder-tree";
import { PageTreeView } from "./page-tree-view";
import type { ViewFilter } from "./flow-filters";
import type { FlowFile } from "@/lib/types";

interface Tag {
	id: string;
	name: string;
	category?: string;
	color?: string;
	parent?: string;
}

interface AdaptiveSidebarProps {
	viewFilter: ViewFilter;
	flows: FlowFile[];
	allFolders?: string[];
	selectedFolder: string | null;
	onFolderSelect: (path: string | null) => void;
	onFolderCreate: (parentPath: string | null, name: string) => Promise<void>;
	onFolderRename: (path: string, newName: string) => Promise<void>;
	onFolderDelete: (path: string) => Promise<void>;
	onItemMove: (itemId: string, targetFolder: string | null) => Promise<void>;
	onFolderMove?: (folderPath: string, targetFolder: string | null) => Promise<void>;
}

export function AdaptiveSidebar({
	viewFilter,
	flows,
	allFolders = [],
	selectedFolder,
	onFolderSelect,
	onFolderCreate,
	onFolderRename,
	onFolderDelete,
	onItemMove,
	onFolderMove,
}: AdaptiveSidebarProps) {
	const [tags, setTags] = useState<Tag[]>([]);
	const [expandedTags, setExpandedTags] = useState<Set<string>>(new Set());

	// Extract tags from flows
	useEffect(() => {
		if (viewFilter === "by-tag") {
			// Extract unique tags from all flows
			const tagSet = new Set<string>();
			flows.forEach(flow => {
				flow.flow.tags?.forEach(tag => tagSet.add(tag));
			});

			// Convert to Tag objects
			const extractedTags: Tag[] = Array.from(tagSet).map(tagName => ({
				id: tagName.toLowerCase().replace(/\s+/g, '-'),
				name: tagName,
				color: '#3B82F6', // Default blue color
			}));

			setTags(extractedTags);
		}
	}, [viewFilter, flows]);

	// Build hierarchical tag structure
	const buildTagTree = () => {
		type TagNode = Tag & { children: TagNode[] };
		const rootTags: TagNode[] = [];
		const tagMap = new Map<string, TagNode>();

		// Initialize all tags in the map
		tags.forEach((tag) => {
			tagMap.set(tag.id, { ...tag, children: [] });
		});

		// Build hierarchy
		tags.forEach((tag) => {
			const node = tagMap.get(tag.id);
			if (!node) return;

			if (tag.parent) {
				const parent = tagMap.get(tag.parent);
				if (parent) {
					parent.children.push(node);
				} else {
					rootTags.push(node);
				}
			} else {
				rootTags.push(node);
			}
		});

		return rootTags;
	};

	const toggleTag = (tagId: string) => {
		setExpandedTags((prev) => {
			const next = new Set(prev);
			if (next.has(tagId)) {
				next.delete(tagId);
			} else {
				next.add(tagId);
			}
			return next;
		});
	};

	const renderTagNode = (tag: Tag & { children: any[] }, depth: number = 0): React.ReactNode => {
		const hasChildren = tag.children.length > 0;
		const isExpanded = expandedTags.has(tag.id);
		const isSelected = selectedFolder === tag.name;

		// Count flows with this tag
		const flowCount = flows.filter((f) => f.flow.tags?.includes(tag.name)).length;

		return (
			<div key={tag.id}>
				<div
					className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors group ${
						isSelected
							? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
							: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
					}`}
					style={{ paddingLeft: `${depth * 1.5 + 0.75}rem` }}
					onClick={() => onFolderSelect(tag.name)}
				>
					{/* Expand/collapse arrow */}
					{hasChildren && (
						<button
							onClick={(e) => {
								e.stopPropagation();
								toggleTag(tag.id);
							}}
							className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors flex-shrink-0"
						>
							<svg
								className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
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
						</button>
					)}

					{/* Tag color indicator */}
					<div
						className="w-3 h-3 rounded-full flex-shrink-0"
						style={{ backgroundColor: tag.color || "#3B82F6" }}
					/>

					{/* Tag name */}
					<span className="flex-1 text-sm font-medium truncate">{tag.name}</span>

					{/* Flow count */}
					<span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full flex-shrink-0">
						{flowCount}
					</span>
				</div>

				{/* Render children */}
				{isExpanded && hasChildren && (
					<div>
						{tag.children.map((child) => renderTagNode(child, depth + 1))}
					</div>
				)}
			</div>
		);
	};

	// Render based on view mode
	switch (viewFilter) {
		case "by-tag":
			const tagTree = buildTagTree();
			return (
				<div className="w-64 flex-shrink-0">
					<div className="sticky top-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-sm font-semibold text-gray-900 dark:text-white">
								Tags
							</h3>
							<button
								onClick={() => onFolderSelect(null)}
								className={`text-xs px-2 py-1 rounded transition-colors ${
									!selectedFolder
										? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
										: "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
								}`}
							>
								All
							</button>
						</div>
						<div className="space-y-1 max-h-[600px] overflow-y-auto">
							{tagTree.length === 0 ? (
								<div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
									No tags found
								</div>
							) : (
								tagTree.map((tag) => renderTagNode(tag))
							)}
						</div>
					</div>
				</div>
			);

		case "all":
		default:
			return (
				<div className="w-64 flex-shrink-0">
					<div className="sticky top-6">
						<FolderTree
							items={flows.map((f) => ({ id: f.id, name: f.name }))}
							allFolders={allFolders}
							selectedFolder={selectedFolder}
							onFolderSelect={onFolderSelect}
							onFolderCreate={onFolderCreate}
							onFolderRename={onFolderRename}
							onFolderDelete={onFolderDelete}
							onItemMove={onItemMove}
							onFolderMove={onFolderMove}
							rootLabel="All Flows"
						/>
					</div>
				</div>
			);
	}
}
