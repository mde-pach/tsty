"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { PageNode } from "../../lib/types";

interface PageTreeViewProps {
	onPageSelect?: (page: PageNode) => void;
	selectedPath?: string;
}

export function PageTreeView({
	onPageSelect,
	selectedPath,
}: PageTreeViewProps) {
	const router = useRouter();
	const [tree, setTree] = useState<PageNode | null>(null);
	const [expandedPaths, setExpandedPaths] = useState<Set<string>>(
		new Set(["/"]),
	);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		fetchTree();
	}, []);

	const fetchTree = async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/tsty/pages/tree");
			const data = await response.json();

			if (data.success && data.data) {
				setTree(data.data);
				setError(null);
			} else {
				setError(data.error || "Failed to load page tree");
			}
		} catch (err) {
			setError(String(err));
		} finally {
			setLoading(false);
		}
	};

	const toggleExpand = (path: string) => {
		const newExpanded = new Set(expandedPaths);
		if (newExpanded.has(path)) {
			newExpanded.delete(path);
		} else {
			newExpanded.add(path);
		}
		setExpandedPaths(newExpanded);
	};

	const expandAll = () => {
		const allPaths = new Set<string>();
		const collectPaths = (node: PageNode) => {
			allPaths.add(node.path);
			node.children.forEach(collectPaths);
		};
		if (tree) {
			collectPaths(tree);
		}
		setExpandedPaths(allPaths);
	};

	const collapseAll = () => {
		setExpandedPaths(new Set(["/"]));
	};

	const matchesSearch = (node: PageNode, query: string): boolean => {
		if (!query) return true;
		const lowerQuery = query.toLowerCase();
		if (node.name.toLowerCase().includes(lowerQuery)) return true;
		if (node.path.toLowerCase().includes(lowerQuery)) return true;
		return node.children.some((child) => matchesSearch(child, query));
	};

	const renderNode = (node: PageNode, depth: number = 0): React.ReactNode => {
		if (!matchesSearch(node, searchQuery)) {
			return null;
		}

		const hasChildren = node.children.length > 0;
		const isExpanded = expandedPaths.has(node.path);
		const isSelected = selectedPath === node.path;
		const isRoot = node.path === "/";

		return (
			<div key={node.path}>
				<div
					className={`flex items-center gap-1 py-1.5 px-2 rounded transition-colors cursor-pointer ${
						isSelected
							? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
							: "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
					}`}
					style={{ paddingLeft: `${depth * 20 + 8}px` }}
					onClick={() => {
						onPageSelect?.(node);
						// Navigate to the flows page filtered by this page path
						if (node.flows.length > 0) {
							router.push(`/?page=${encodeURIComponent(node.path)}`);
						}
					}}
				>
					{hasChildren && (
						<button
							onClick={(e) => {
								e.stopPropagation();
								toggleExpand(node.path);
							}}
							className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}
							>
								<polyline points="9 18 15 12 9 6" />
							</svg>
						</button>
					)}
					{!hasChildren && <div className="w-[18px]" />}

					{!isRoot && (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="text-gray-400 dark:text-gray-500 flex-shrink-0"
						>
							<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
						</svg>
					)}

					<span className="text-sm flex-1 min-w-0 truncate" title={node.path}>
						{node.name}
					</span>

					{node.flows.length > 0 && (
						<span
							className="text-xs px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 flex-shrink-0 hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors"
							title={`${node.flows.length} flow${node.flows.length !== 1 ? "s" : ""} - click to view`}
						>
							{node.flows.length}
						</span>
					)}
				</div>

				{hasChildren && isExpanded && (
					<div>
						{node.children.map((child) => renderNode(child, depth + 1))}
					</div>
				)}
			</div>
		);
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center p-4">
				<div className="text-sm text-gray-600 dark:text-gray-400">
					Loading pages...
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-4">
				<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-3 rounded-md text-sm">
					Error: {error}
				</div>
			</div>
		);
	}

	if (!tree) {
		return (
			<div className="p-4 text-center">
				<div className="text-sm text-gray-600 dark:text-gray-400">
					No pages found
				</div>
			</div>
		);
	}

	const totalFlowCount = tree.children.reduce((sum, child) => {
		const countFlows = (node: PageNode): number => {
			return (
				node.flows.length + node.children.reduce((s, c) => s + countFlows(c), 0)
			);
		};
		return sum + countFlows(child);
	}, tree.flows.length);

	return (
		<div className="flex flex-col h-full">
			{/* Header */}
			<div className="px-3 py-3 border-b border-gray-200 dark:border-gray-700">
				<div className="flex items-center justify-between mb-2">
					<h3 className="text-sm font-semibold text-gray-900 dark:text-white">
						Pages
					</h3>
					<div className="flex gap-1">
						<button
							onClick={expandAll}
							className="text-xs px-2 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
							title="Expand all"
						>
							Expand
						</button>
						<button
							onClick={collapseAll}
							className="text-xs px-2 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
							title="Collapse all"
						>
							Collapse
						</button>
					</div>
				</div>

				{/* Search */}
				<div className="relative">
					<div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<circle cx="11" cy="11" r="8" />
							<path d="m21 21-4.3-4.3" />
						</svg>
					</div>
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search pages..."
						className="w-full pl-7 pr-3 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				<div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
					{tree.children.length === 0 && tree.flows.length > 0
						? `${tree.flows.length} flow${tree.flows.length !== 1 ? "s" : ""} on root page`
						: `${totalFlowCount} flow${totalFlowCount !== 1 ? "s" : ""} across ${tree.children.length} page${tree.children.length !== 1 ? "s" : ""}`}
				</div>
			</div>

			{/* Tree */}
			<div className="flex-1 overflow-y-auto p-2">
				{tree.children.length === 0 ? (
					tree.flows.length > 0 ? (
						<div className="space-y-0.5">{renderNode(tree, 0)}</div>
					) : (
						<div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
							No pages found.
							<div className="mt-1 text-xs">
								Flows will appear here after adding page URLs
							</div>
						</div>
					)
				) : (
					<div className="space-y-0.5">
						{tree.children.map((child) => renderNode(child, 0))}
					</div>
				)}
			</div>
		</div>
	);
}
