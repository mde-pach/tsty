"use client";

import { useCallback, useEffect, useState } from "react";
import ReactFlow, {
	Background,
	Controls,
	type Edge,
	MarkerType,
	MiniMap,
	type Node,
	Position,
	useEdgesState,
	useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";

interface DependencyGraphProps {
	type: "flow" | "action";
	items: Array<{ id: string; name: string; dependencies?: string[] }>;
	onNodeClick?: (id: string) => void;
	highlightedId?: string;
}

export function DependencyGraph({
	type,
	items,
	onNodeClick,
	highlightedId,
}: DependencyGraphProps) {
	const [nodes, setNodes, onNodesChange] = useNodesState([]);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		try {
			const { nodes: newNodes, edges: newEdges } = buildGraph(
				items,
				type,
				highlightedId,
			);
			setNodes(newNodes);
			setEdges(newEdges);
			setError(null);
		} catch (err) {
			console.error("Error building dependency graph:", err);
			setError(err instanceof Error ? err.message : "Failed to build graph");
		}
	}, [items, type, highlightedId, setNodes, setEdges]);

	const handleNodeClick = useCallback(
		(_event: React.MouseEvent, node: Node) => {
			if (onNodeClick) {
				onNodeClick(node.id);
			}
		},
		[onNodeClick],
	);

	if (error) {
		return (
			<div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
				<div className="text-center max-w-md">
					<div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="32"
							height="32"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="text-red-600 dark:text-red-400"
						>
							<circle cx="12" cy="12" r="10" />
							<line x1="12" x2="12" y1="8" y2="12" />
							<line x1="12" x2="12.01" y1="16" y2="16" />
						</svg>
					</div>
					<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
						Failed to build graph
					</h3>
					<p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
				</div>
			</div>
		);
	}

	if (items.length === 0) {
		return (
			<div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
				<div className="text-center max-w-sm">
					<div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="32"
							height="32"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="text-gray-400 dark:text-gray-600"
						>
							<circle cx="12" cy="5" r="1" />
							<circle cx="12" cy="12" r="1" />
							<circle cx="12" cy="19" r="1" />
						</svg>
					</div>
					<h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
						No {type}s to display
					</h3>
					<p className="text-xs text-gray-500 dark:text-gray-400">
						Create some {type}s to see their dependency graph
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="h-full w-full bg-gray-50 dark:bg-gray-900">
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onNodeClick={handleNodeClick}
				fitView
				minZoom={0.1}
				maxZoom={2}
				defaultEdgeOptions={{
					type: "smoothstep",
					animated: true,
					markerEnd: {
						type: MarkerType.ArrowClosed,
						width: 20,
						height: 20,
					},
				}}
			>
				<Background className="bg-gray-50 dark:bg-gray-900" />
				<Controls className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700" />
				<MiniMap
					className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
					nodeColor={(node) => {
						if (node.data?.highlighted) return "#3b82f6"; // blue-500
						if (node.data?.hasCircular) return "#ef4444"; // red-500
						if (node.data?.isRoot) return "#10b981"; // green-500
						return "#6b7280"; // gray-500
					}}
				/>
			</ReactFlow>
		</div>
	);
}

function buildGraph(
	items: Array<{ id: string; name: string; dependencies?: string[] }>,
	type: "flow" | "action",
	highlightedId?: string,
): { nodes: Node[]; edges: Edge[] } {
	const nodes: Node[] = [];
	const edges: Edge[] = [];

	// Build dependency map
	const dependencyMap = new Map<string, string[]>();
	items.forEach((item) => {
		dependencyMap.set(item.id, item.dependencies || []);
	});

	// Detect circular dependencies
	const circularItems = new Set<string>();
	items.forEach((item) => {
		if (hasCircularDependency(item.id, dependencyMap, new Set())) {
			circularItems.add(item.id);
		}
	});

	// Find root nodes (no dependencies)
	const rootIds = items
		.filter((item) => !item.dependencies || item.dependencies.length === 0)
		.map((item) => item.id);

	// Calculate levels for layout
	const levels = calculateLevels(items);

	// Create nodes
	items.forEach((item) => {
		const level = levels.get(item.id) || 0;
		const isHighlighted = item.id === highlightedId;
		const hasCircular = circularItems.has(item.id);
		const isRoot = rootIds.includes(item.id);

		nodes.push({
			id: item.id,
			type: "default",
			position: { x: level * 300, y: items.indexOf(item) * 100 },
			data: {
				label: item.name,
				highlighted: isHighlighted,
				hasCircular,
				isRoot,
			},
			style: {
				background: isHighlighted
					? "#dbeafe" // blue-100
					: hasCircular
						? "#fee2e2" // red-100
						: isRoot
							? "#d1fae5" // green-100
							: "#f3f4f6", // gray-100
				border: `2px solid ${
					isHighlighted
						? "#3b82f6" // blue-500
						: hasCircular
							? "#ef4444" // red-500
							: isRoot
								? "#10b981" // green-500
								: "#d1d5db" // gray-300
				}`,
				borderRadius: "8px",
				padding: "10px 20px",
				fontSize: "14px",
				fontWeight: isHighlighted ? "600" : "500",
				color: "#111827", // gray-900
			},
			sourcePosition: Position.Right,
			targetPosition: Position.Left,
		});
	});

	// Create edges
	items.forEach((item) => {
		if (item.dependencies && item.dependencies.length > 0) {
			item.dependencies.forEach((depId) => {
				// Only create edge if dependency exists
				if (items.find((i) => i.id === depId)) {
					edges.push({
						id: `${depId}-${item.id}`,
						source: depId,
						target: item.id,
						type: "smoothstep",
						animated: true,
						style: {
							stroke: circularItems.has(item.id) ? "#ef4444" : "#6b7280",
							strokeWidth: 2,
						},
						markerEnd: {
							type: MarkerType.ArrowClosed,
							width: 20,
							height: 20,
							color: circularItems.has(item.id) ? "#ef4444" : "#6b7280",
						},
					});
				}
			});
		}
	});

	return { nodes, edges };
}

function calculateLevels(
	items: Array<{ id: string; dependencies?: string[] }>,
): Map<string, number> {
	const levels = new Map<string, number>();
	const visited = new Set<string>();

	function getLevel(id: string): number {
		if (levels.has(id)) {
			return levels.get(id)!;
		}

		if (visited.has(id)) {
			// Circular dependency, return 0
			return 0;
		}

		visited.add(id);

		const item = items.find((i) => i.id === id);
		if (!item || !item.dependencies || item.dependencies.length === 0) {
			levels.set(id, 0);
			return 0;
		}

		const maxDepLevel = Math.max(
			...item.dependencies.map((depId) => getLevel(depId)),
		);
		const level = maxDepLevel + 1;
		levels.set(id, level);

		return level;
	}

	items.forEach((item) => {
		visited.clear();
		getLevel(item.id);
	});

	return levels;
}

function hasCircularDependency(
	id: string,
	dependencyMap: Map<string, string[]>,
	visiting: Set<string>,
): boolean {
	if (visiting.has(id)) {
		return true;
	}

	visiting.add(id);

	const dependencies = dependencyMap.get(id) || [];
	for (const depId of dependencies) {
		if (hasCircularDependency(depId, dependencyMap, new Set(visiting))) {
			return true;
		}
	}

	return false;
}
