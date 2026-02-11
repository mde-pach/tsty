"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFlows } from "../hooks/use-flows";
import { useActions } from "../hooks/use-actions";
import { LoadingState } from "../components/ui";

interface TestNode {
	id: string;
	name: string;
	type: "feature" | "flow" | "action";
	status?: "passed" | "failed" | "not-run";
	path?: string;
	icon: string;
	children?: TestNode[];
	flowCount?: number;
	lastRun?: string;
}

export function TestExplorerPage() {
	const router = useRouter();
	const { flows, loading: flowsLoading } = useFlows();
	const { actions, loading: actionsLoading } = useActions();
	const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
		new Set(["flows"]),
	);
	const [selectedNode, setSelectedNode] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [viewMode, setViewMode] = useState<"tree" | "grid">("tree");

	if (flowsLoading || actionsLoading) {
		return (
			<div className="h-screen flex items-center justify-center">
				<LoadingState message="Loading test suite..." />
			</div>
		);
	}

	// Group flows by category/feature
	const flowsByFeature = flows.reduce(
		(acc, flow) => {
			const feature = flow.flow.category || "Uncategorized";
			if (!acc[feature]) {
				acc[feature] = [];
			}
			acc[feature].push({
				id: flow.id,
				name: flow.name,
				type: "flow" as const,
				status: flow.lastRunStatus || "not-run",
				path: `/flows/${flow.id}`,
				icon: "📋",
				lastRun: flow.lastRun,
			});
			return acc;
		},
		{} as Record<string, TestNode[]>,
	);

	// Group actions by type
	const actionsByType = actions.reduce(
		(acc, action) => {
			const type = action.definition.type;
			if (!acc[type]) {
				acc[type] = [];
			}
			acc[type].push({
				id: action.id,
				name: action.name,
				type: "action" as const,
				path: `/actions/${action.id}`,
				icon: "⚡",
			});
			return acc;
		},
		{} as Record<string, TestNode[]>,
	);

	// Build tree structure
	const treeData: TestNode[] = [
		{
			id: "flows",
			name: `Test Flows (${flows.length})`,
			type: "feature",
			icon: "🧪",
			flowCount: flows.length,
			children: Object.entries(flowsByFeature)
				.sort(([a], [b]) => a.localeCompare(b))
				.map(([feature, items]) => ({
					id: `feature-${feature}`,
					name: `${feature} (${items.length})`,
					type: "feature" as const,
					icon: getFeatureIcon(feature),
					flowCount: items.length,
					children: items.sort((a, b) => a.name.localeCompare(b.name)),
				})),
		},
		{
			id: "actions",
			name: `Reusable Actions (${actions.length})`,
			type: "feature",
			icon: "⚡",
			flowCount: actions.length,
			children: Object.entries(actionsByType)
				.sort(([a], [b]) => a.localeCompare(b))
				.map(([type, items]) => ({
					id: `type-${type}`,
					name: `${type} (${items.length})`,
					type: "feature" as const,
					icon: getActionTypeIcon(type),
					flowCount: items.length,
					children: items.sort((a, b) => a.name.localeCompare(b.name)),
				})),
		},
	];

	// Filter tree based on search
	const filterTree = (nodes: TestNode[]): TestNode[] => {
		if (!searchQuery) return nodes;

		return nodes
			.map((node) => {
				const matchesSearch = node.name
					.toLowerCase()
					.includes(searchQuery.toLowerCase());
				const filteredChildren = node.children
					? filterTree(node.children)
					: [];

				if (matchesSearch || filteredChildren.length > 0) {
					return {
						...node,
						children: filteredChildren.length > 0 ? filteredChildren : node.children,
					};
				}
				return null as TestNode | null;
			})
			.filter((node): node is TestNode => node !== null);
	};

	const filteredTreeData = filterTree(treeData);

	const toggleNode = (nodeId: string) => {
		const newExpanded = new Set(expandedNodes);
		if (newExpanded.has(nodeId)) {
			newExpanded.delete(nodeId);
		} else {
			newExpanded.add(nodeId);
		}
		setExpandedNodes(newExpanded);
	};

	const handleNodeClick = (node: TestNode) => {
		if (node.type === "feature") {
			toggleNode(node.id);
		} else {
			setSelectedNode(node.id);
			if (node.path) {
				router.push(node.path);
			}
		}
	};

	const getStatusColor = (status?: string) => {
		switch (status) {
			case "passed":
				return "text-green-600 dark:text-green-400";
			case "failed":
				return "text-red-600 dark:text-red-400";
			default:
				return "text-gray-400 dark:text-gray-500";
		}
	};

	const getStatusIcon = (status?: string) => {
		switch (status) {
			case "passed":
				return (
					<svg
						className="w-4 h-4"
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
			case "failed":
				return (
					<svg
						className="w-4 h-4"
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
			default:
				return (
					<svg
						className="w-4 h-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						
					>
						<circle cx="12" cy="12" r="10" strokeWidth="2" />
					</svg>
				);
		}
	};

	const getRelativeTime = (date?: string) => {
		if (!date) return null;
		const now = new Date();
		const past = new Date(date);
		const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

		if (diffInSeconds < 60) return "just now";
		if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
		if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
		if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
		return past.toLocaleDateString();
	};

	const renderTree = (nodes: TestNode[], level = 0) => {
		return nodes.map((node) => {
			const isExpanded = expandedNodes.has(node.id);
			const hasChildren = node.children && node.children.length > 0;
			const isSelected = selectedNode === node.id;

			return (
				<div key={node.id} className="group">
					<div
						className={`
							flex items-center gap-2 px-2 py-1 cursor-pointer rounded transition-colors
							${isSelected ? "bg-primary-100 dark:bg-primary-900/30" : "hover:bg-gray-100 dark:hover:bg-gray-800"}
						`}
						style={{ paddingLeft: `${level * 16 + 8}px` }}
						onClick={() => handleNodeClick(node)}
					>
						{/* Expand/Collapse Arrow */}
						{hasChildren ? (
							<span
								className={`text-gray-400 text-xs transition-transform ${isExpanded ? "rotate-90" : ""}`}
							>
								▶
							</span>
						) : (
							<span className="w-2" />
						)}

						{/* Status Indicator for flows */}
						{node.type === "flow" ? (
							<div
								className={`${getStatusColor(node.status)} cursor-help`}
								title={`Status: ${node.status || "not run"}${node.lastRun ? ` • Last run: ${getRelativeTime(node.lastRun)}` : ""}`}
							>
								{getStatusIcon(node.status)}
							</div>
						) : (
							<span className="text-sm">{node.icon}</span>
						)}

						{/* Name */}
						<span
							className={`flex-1 text-sm truncate ${
								node.type === "feature"
									? "font-medium text-gray-700 dark:text-gray-300"
									: "text-gray-900 dark:text-white"
							}`}
						>
							{node.name}
						</span>

						{/* Last run time on hover */}
						{node.type === "flow" && node.lastRun && (
							<span className="opacity-0 group-hover:opacity-100 text-xs text-gray-500 dark:text-gray-400 transition-opacity">
								{getRelativeTime(node.lastRun)}
							</span>
						)}

						{/* Inline Actions for flows */}
						{node.type === "flow" && (
							<div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
								<button
									onClick={(e) => {
										e.stopPropagation();
										alert(`Run ${node.name}`);
									}}
									className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"
									
								>
									<svg
										className="w-3.5 h-3.5 text-green-600 dark:text-green-400"
										fill="currentColor"
										viewBox="0 0 24 24"
									>
										<path d="M8 5v14l11-7z" />
									</svg>
								</button>
								<button
									onClick={(e) => {
										e.stopPropagation();
										if (node.path) {
											router.push(`${node.path}/edit`);
										}
									}}
									className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
									
								>
									<svg
										className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
										/>
									</svg>
								</button>
								<button
									onClick={(e) => {
										e.stopPropagation();
										if (confirm(`Duplicate "${node.name}"?`)) {
											alert(`Duplicate ${node.name} (coming soon)`);
										}
									}}
									className="p-1 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded"
									
								>
									<svg
										className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
										/>
									</svg>
								</button>
								<button
									onClick={(e) => {
										e.stopPropagation();
										if (confirm(`Delete "${node.name}"?`)) {
											alert(`Delete ${node.name} (coming soon)`);
										}
									}}
									className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
									
								>
									<svg
										className="w-3.5 h-3.5 text-red-600 dark:text-red-400"
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
								</button>
							</div>
						)}
					</div>

					{/* Render children */}
					{hasChildren && isExpanded && renderTree(node.children!, level + 1)}
				</div>
			);
		});
	};

	// Calculate stats
	const passedCount = flows.filter((f) => f.lastRunStatus === "passed").length;
	const failedCount = flows.filter((f) => f.lastRunStatus === "failed").length;
	const notRunCount = flows.filter((f) => !f.lastRunStatus).length;
	const passRate =
		flows.length > 0 ? Math.round((passedCount / flows.length) * 100) : 0;

	return (
		<div className="flex h-screen bg-gray-50 dark:bg-gray-900 -m-6">
			{/* Left Sidebar - Test Navigator */}
			<div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
				{/* Header */}
				<div className="p-3 border-b border-gray-200 dark:border-gray-700">
					<div className="flex items-center justify-between mb-3">
						<h1 className="text-base font-bold text-gray-900 dark:text-white">
							Test Explorer
						</h1>
						<div className="flex items-center gap-2">
							<div className="text-xs font-medium text-gray-600 dark:text-gray-400">
								{passRate}% passing
							</div>
							{/* View Mode Toggle */}
							<div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded">
								<button
									onClick={() => setViewMode("tree")}
									className={`px-2 py-1 text-xs rounded transition-colors ${
										viewMode === "tree"
											? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
											: "text-gray-600 dark:text-gray-400"
									}`}
									
								>
									🌳
								</button>
								<button
									onClick={() => setViewMode("grid")}
									className={`px-2 py-1 text-xs rounded transition-colors ${
										viewMode === "grid"
											? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
											: "text-gray-600 dark:text-gray-400"
									}`}
									
								>
									⊞
								</button>
							</div>
						</div>
					</div>

					{/* Search */}
					<input
						type="text"
						placeholder="Search tests..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
					/>
				</div>

				{/* Quick Actions */}
				<div className="p-2 border-b border-gray-200 dark:border-gray-700 flex gap-2">
					<button
						onClick={() => router.push("/flows/new")}
						className="flex-1 px-2 py-1 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded transition-colors flex items-center justify-center gap-1"
					>
						<span>+</span> New Flow
					</button>
					<button
						onClick={() => alert("Run all tests")}
						className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors"
						
					>
						▶
					</button>
					{failedCount > 0 && (
						<button
							onClick={() => alert("Run failed tests")}
							className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors"
							
						>
							⟳
						</button>
					)}
				</div>

				{/* Stats Bar */}
				<div className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
					<div className="flex gap-3 text-xs">
						<div className="flex items-center gap-1">
							<span className="w-2 h-2 bg-green-500 rounded-full" />
							<span className="text-gray-600 dark:text-gray-400">
								{passedCount}
							</span>
						</div>
						<div className="flex items-center gap-1">
							<span className="w-2 h-2 bg-red-500 rounded-full" />
							<span className="text-gray-600 dark:text-gray-400">
								{failedCount}
							</span>
						</div>
						<div className="flex items-center gap-1">
							<span className="w-2 h-2 bg-gray-400 rounded-full" />
							<span className="text-gray-600 dark:text-gray-400">
								{notRunCount}
							</span>
						</div>
					</div>
				</div>

				{/* Tree Navigator */}
				<div className="flex-1 overflow-y-auto custom-scrollbar p-2">
					{filteredTreeData.length > 0 ? (
						renderTree(filteredTreeData)
					) : (
						<div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
							No tests found
						</div>
					)}
				</div>

				{/* Footer Actions */}
				<div className="p-2 border-t border-gray-200 dark:border-gray-700 space-y-1">
					<button
						onClick={() => router.push("/organize")}
						className="w-full px-2 py-1.5 text-xs text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex items-center gap-2"
					>
						<span>📁</span> Organize
					</button>
					<button
						onClick={() => router.push("/runs")}
						className="w-full px-2 py-1.5 text-xs text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex items-center gap-2"
					>
						<span>📊</span> Reports
					</button>
				</div>
			</div>

			{/* Main Content - Welcome/Getting Started */}
			<div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
				<div className="max-w-2xl text-center">
					<div className="text-6xl mb-4">🧪</div>
					<h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
						Tsty Test Explorer
					</h2>
					<p className="text-gray-600 dark:text-gray-400 mb-8">
						Navigate your tests like a file explorer. Select a test to view
						details or run it.
					</p>

					<div className="grid sm:grid-cols-3 gap-4 mb-8">
						<div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
							<div className="text-3xl mb-2">📋</div>
							<div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
								{flows.length}
							</div>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								Test Flows
							</p>
						</div>

						<div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
							<div className="text-3xl mb-2">⚡</div>
							<div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
								{actions.length}
							</div>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								Reusable Actions
							</p>
						</div>

						<div
							className={`bg-white dark:bg-gray-800 p-4 rounded-lg border ${
								failedCount > 0
									? "border-red-300 dark:border-red-700"
									: "border-green-300 dark:border-green-700"
							}`}
						>
							<div className="text-3xl mb-2">
								{failedCount > 0 ? "⚠️" : "✅"}
							</div>
							<div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
								{passRate}%
							</div>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								Pass Rate
							</p>
						</div>
					</div>

					<div className="flex gap-3 justify-center">
						<button
							onClick={() => router.push("/flows/new")}
							className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
						>
							+ Create Flow
						</button>
						<button
							onClick={() => router.push("/actions/new")}
							className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm font-medium rounded-lg transition-colors"
						>
							+ Create Action
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

function getFeatureIcon(feature: string): string {
	const iconMap: Record<string, string> = {
		Authentication: "🔐",
		Checkout: "🛒",
		Dashboard: "📊",
		Settings: "⚙️",
		Homepage: "🏠",
		Profile: "👤",
		Admin: "👑",
		Uncategorized: "📂",
	};
	return iconMap[feature] || "📁";
}

function getActionTypeIcon(type: string): string {
	const iconMap: Record<string, string> = {
		modal: "🔲",
		form: "📝",
		navigation: "🧭",
		interaction: "👆",
	};
	return iconMap[type] || "⚡";
}
