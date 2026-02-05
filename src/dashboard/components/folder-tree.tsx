"use client";

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { ConfirmModal, PromptModal } from "./ui";

interface FolderNode {
	path: string;
	name: string;
	children: FolderNode[];
	itemCount: number;
	isExpanded: boolean;
}

interface FolderTreeProps {
	items: Array<{ id: string; name: string }>;
	allFolders?: string[];
	selectedFolder: string | null;
	onFolderSelect: (path: string | null) => void;
	onFolderCreate: (parentPath: string | null, name: string) => Promise<void>;
	onFolderRename: (path: string, newName: string) => Promise<void>;
	onFolderDelete: (path: string) => Promise<void>;
	onItemMove: (itemId: string, targetFolder: string | null) => Promise<void>;
	onFolderMove?: (folderPath: string, targetFolder: string | null) => Promise<void>;
	rootLabel?: string;
	className?: string;
}

export function FolderTree({
	items,
	allFolders = [],
	selectedFolder,
	onFolderSelect,
	onFolderCreate,
	onFolderRename,
	onFolderDelete,
	onItemMove,
	onFolderMove,
	rootLabel = "All Items",
	className = "",
}: FolderTreeProps) {
	const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
		new Set(["/"]),
	);
	const [contextMenu, setContextMenu] = useState<{
		x: number;
		y: number;
		path: string;
	} | null>(null);
	const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
	const [isDraggingFolder, setIsDraggingFolder] = useState(false);
	const [showCreatePrompt, setShowCreatePrompt] = useState(false);
	const [createFolderParent, setCreateFolderParent] = useState<string | null>(null);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [deleteFolderPath, setDeleteFolderPath] = useState<string | null>(null);
	const [showRenamePrompt, setShowRenamePrompt] = useState(false);
	const [renameFolderPath, setRenameFolderPath] = useState<string | null>(null);
	const [newFolderName, setNewFolderName] = useState("");

	// Auto-expand parent folders when they have new children (like after a move)
	useEffect(() => {
		const newExpanded = new Set(expandedFolders);
		let hasChanges = false;

		// Auto-expand folders that have children
		allFolders.forEach((folderPath) => {
			if (folderPath.includes("/")) {
				// Has a parent, make sure parents are expanded
				const parts = folderPath.split("/");
				for (let i = 1; i < parts.length; i++) {
					const parentPath = parts.slice(0, i).join("/");
					if (parentPath && !newExpanded.has(parentPath)) {
						newExpanded.add(parentPath);
						hasChanges = true;
					}
				}
			}
		});

		if (hasChanges) {
			setExpandedFolders(newExpanded);
		}
	}, [allFolders]);

	// Build folder tree from items
	const folderTree = useMemo(() => {
		const root: FolderNode = {
			path: "/",
			name: "Root",
			children: [],
			itemCount: 0,
			isExpanded: true,
		};

		const folderMap = new Map<string, FolderNode>();
		folderMap.set("/", root);

		// Extract all folder paths from items
		const folderPaths = new Set<string>();
		items.forEach((item) => {
			const parts = item.id.split("/");
			if (parts.length > 1) {
				let currentPath = "";
				for (let i = 0; i < parts.length - 1; i++) {
					currentPath += (currentPath ? "/" : "") + parts[i];
					folderPaths.add(currentPath);
				}
			}
		});

		// Add empty folders from metadata
		allFolders.forEach((folderPath) => {
			folderPaths.add(folderPath);
			// Also add parent folders
			const parts = folderPath.split("/");
			for (let i = 1; i < parts.length; i++) {
				const parentPath = parts.slice(0, i).join("/");
				if (parentPath) {
					folderPaths.add(parentPath);
				}
			}
		});

		// Create folder nodes
		Array.from(folderPaths)
			.sort()
			.forEach((folderPath) => {
				const parts = folderPath.split("/");
				const name = parts[parts.length - 1];
				const parentPath = parts.slice(0, -1).join("/") || "/";

				const node: FolderNode = {
					path: folderPath,
					name,
					children: [],
					itemCount: 0,
					isExpanded: expandedFolders.has(folderPath),
				};

				folderMap.set(folderPath, node);

				const parent = folderMap.get(parentPath);
				if (parent) {
					parent.children.push(node);
				}
			});

		// Count items in each folder
		items.forEach((item) => {
			const folderPath = item.id.includes("/")
				? item.id.substring(0, item.id.lastIndexOf("/"))
				: "/";

			const node = folderMap.get(folderPath);
			if (node) {
				node.itemCount++;
			}
		});

		// Propagate counts to parents
		const propagateCounts = (node: FolderNode): number => {
			let total = node.itemCount;
			node.children.forEach((child) => {
				total += propagateCounts(child);
			});
			node.itemCount = total;
			return total;
		};
		propagateCounts(root);

		return root;
	}, [items, allFolders, expandedFolders]);

	const toggleFolder = (path: string) => {
		setExpandedFolders((prev) => {
			const next = new Set(prev);
			if (next.has(path)) {
				next.delete(path);
			} else {
				next.add(path);
			}
			return next;
		});
	};

	const handleContextMenu = (e: React.MouseEvent, path: string) => {
		e.preventDefault();
		e.stopPropagation();
		setContextMenu({ x: e.clientX, y: e.clientY, path });
	};

	const handleCreateFolder = async (parentPath: string | null) => {
		setCreateFolderParent(parentPath);
		setShowCreatePrompt(true);
		setContextMenu(null);
	};

	const handleCreateFolderConfirm = async (name: string) => {
		if (name && name.trim()) {
			try {
				await onFolderCreate(createFolderParent, name.trim());
				// Expand parent folder after creating
				if (createFolderParent) {
					setExpandedFolders((prev) => new Set(prev).add(createFolderParent));
				}
			} catch (error) {
				console.error("Failed to create folder:", error);
			}
		}
	};

	const handleRenameFolder = (path: string) => {
		setRenameFolderPath(path);
		const currentName = path.split("/").pop() || "";
		setNewFolderName(currentName);
		setShowRenamePrompt(true);
		setContextMenu(null);
	};

	const handleRenameFolderConfirm = async (newName: string) => {
		if (renameFolderPath && newName.trim() && newName !== renameFolderPath.split("/").pop()) {
			try {
				await onFolderRename(renameFolderPath, newName.trim());
			} catch (error) {
				console.error("Failed to rename folder:", error);
			}
		}
	};

	const handleDeleteFolder = async (path: string) => {
		setDeleteFolderPath(path);
		setShowDeleteConfirm(true);
		setContextMenu(null);
	};

	const handleDeleteFolderConfirm = async () => {
		if (deleteFolderPath) {
			try {
				await onFolderDelete(deleteFolderPath);
			} catch (error) {
				console.error("Failed to delete folder:", error);
			}
		}
	};

	const handleDrop = async (e: React.DragEvent, targetFolder: string | null) => {
		e.preventDefault();
		e.stopPropagation();

		const itemId = e.dataTransfer.getData("itemId");
		const itemType = e.dataTransfer.getData("itemType");
		const folderPath = e.dataTransfer.getData("folderPath");

		try {
			if (folderPath && onFolderMove) {
				// Dropping a folder
				const normalizedTarget = targetFolder === "/" ? null : targetFolder;
				if (folderPath !== normalizedTarget && !normalizedTarget?.startsWith(folderPath + "/")) {
					await onFolderMove(folderPath, normalizedTarget);
				}
			} else if (itemId) {
				// Dropping an item (flow/action)
				const normalizedTarget = targetFolder === "/" ? null : targetFolder;
				await onItemMove(itemId, normalizedTarget);
			}
		} catch (error) {
			console.error("Failed to move:", error);
		} finally {
			setDragOverFolder(null);
			setIsDraggingFolder(false);
		}
	};

	const renderNode = (node: FolderNode, depth: number = 0) => {
		const isSelected = selectedFolder === node.path || (selectedFolder === null && node.path === "/");
		const isDragOver = dragOverFolder === node.path;
		const isRoot = node.path === "/";
		const isExpanded = expandedFolders.has(node.path);

		return (
			<div key={node.path}>
				<div
					className={`
            flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer
            transition-colors group relative
            ${isSelected ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}
            ${isDragOver ? "bg-primary-100 dark:bg-primary-800/30 ring-2 ring-primary-500" : ""}
          `}
					style={{ paddingLeft: `${depth * 1.5 + 0.75}rem` }}
					onClick={() => onFolderSelect(node.path === "/" ? null : node.path)}
					onContextMenu={(e) => !isRoot && handleContextMenu(e, node.path)}
					draggable={!isRoot}
					onDragStart={(e) => {
						if (!isRoot) {
							e.stopPropagation();
							setIsDraggingFolder(true);
							e.dataTransfer.effectAllowed = "move";
							e.dataTransfer.setData("folderPath", node.path);
						}
					}}
					onDragEnd={(e) => {
						e.preventDefault();
						setIsDraggingFolder(false);
						setDragOverFolder(null);
					}}
					onDragOver={(e) => {
						e.preventDefault();
						e.stopPropagation();
						e.dataTransfer.dropEffect = "move";
						setDragOverFolder(node.path);
					}}
					onDragLeave={(e) => {
						e.preventDefault();
						e.stopPropagation();
						setDragOverFolder(null);
					}}
					onDrop={(e) => handleDrop(e, node.path === "/" ? null : node.path)}
				>
					{/* Expand/collapse arrow - always render for consistent alignment */}
					<div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
						{node.children.length > 0 ? (
							<button
								onClick={(e) => {
									e.stopPropagation();
									toggleFolder(node.path);
								}}
								className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
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
						) : (
							<div className="w-4 h-4" />
						)}
					</div>

					{/* Folder icon */}
					<svg
						className="w-5 h-5 text-gray-400 flex-shrink-0"
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

					{/* Folder name */}
					<span className="flex-1 text-sm font-medium truncate">
						{node.name === "Root" ? rootLabel : node.name}
					</span>

					{/* Item count */}
					<span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full flex-shrink-0">
						{node.itemCount}
					</span>

					{/* Actions (visible on hover) */}
					{!isRoot && (
						<button
							onClick={(e) => {
								e.stopPropagation();
								handleContextMenu(e, node.path);
							}}
							className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-opacity flex-shrink-0"
							title="More actions"
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
									d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
								/>
							</svg>
						</button>
					)}
				</div>

				{/* Render children */}
				{isExpanded &&
					node.children.map((child) => renderNode(child, depth + 1))}
			</div>
		);
	};

	return (
		<div className={`relative ${className}`}>
			{/* Folder tree */}
			<div className="space-y-1">
				{renderNode(folderTree)}

				{/* Create root folder button */}
				<button
					onClick={() => handleCreateFolder(null)}
					className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
				>
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 4v16m8-8H4"
						/>
					</svg>
					New Folder
				</button>
			</div>

			{/* Context menu */}
			{contextMenu && typeof document !== "undefined" && createPortal(
				<>
					<div
						className="fixed inset-0 z-[100]"
						onClick={() => setContextMenu(null)}
					/>
					<div
						className="fixed z-[101] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[160px]"
						style={{ left: contextMenu.x, top: contextMenu.y }}
					>
						<button
							onClick={() => handleCreateFolder(contextMenu.path)}
							className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 4v16m8-8H4"
								/>
							</svg>
							New Subfolder
						</button>
						<button
							onClick={() => handleRenameFolder(contextMenu.path)}
							className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
								/>
							</svg>
							Rename
						</button>
						<div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
						<button
							onClick={() => handleDeleteFolder(contextMenu.path)}
							className="w-full px-4 py-2 text-left text-sm text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 flex items-center gap-2"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
								/>
							</svg>
							Delete
						</button>
					</div>
				</>,
				document.body
			)}

			{/* Create Folder Modal */}
			<PromptModal
				isOpen={showCreatePrompt}
				onClose={() => setShowCreatePrompt(false)}
				onConfirm={handleCreateFolderConfirm}
				title="Create New Folder"
				message="Enter a name for the new folder:"
				placeholder="Folder name"
				confirmLabel="Create"
			/>

			{/* Rename Folder Modal */}
			<PromptModal
				isOpen={showRenamePrompt}
				onClose={() => setShowRenamePrompt(false)}
				onConfirm={handleRenameFolderConfirm}
				title="Rename Folder"
				message="Enter a new name for the folder:"
				placeholder="Folder name"
				defaultValue={newFolderName}
				confirmLabel="Rename"
			/>

			{/* Delete Folder Confirmation */}
			<ConfirmModal
				isOpen={showDeleteConfirm}
				onClose={() => setShowDeleteConfirm(false)}
				onConfirm={handleDeleteFolderConfirm}
				title="Delete Folder"
				message={`Are you sure you want to delete the folder "${deleteFolderPath}" and all its contents? This action cannot be undone.`}
				confirmLabel="Delete"
				variant="danger"
			/>
		</div>
	);
}
