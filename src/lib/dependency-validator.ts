import type { DependencyNode, DependencyValidation } from "./types";

/**
 * Validate dependencies and detect circular references
 */
export class DependencyValidator {
	private readonly MAX_DEPTH = 5; // Maximum dependency depth to prevent DoS

	/**
	 * Validate a set of dependencies
	 */
	validate(
		id: string,
		dependencies: string[],
		allItems: Map<string, string[]>,
		type: "flow" | "action",
	): DependencyValidation {
		const errors: string[] = [];
		const warnings: string[] = [];

		// Check if dependencies exist
		for (const depId of dependencies) {
			if (!allItems.has(depId)) {
				errors.push(`${type} "${depId}" does not exist`);
			}
		}

		// Check for self-dependency
		if (dependencies.includes(id)) {
			errors.push(`${type} cannot depend on itself`);
		}

		// Create a temporary map with the new dependencies for circular check
		const tempMap = new Map(allItems);
		tempMap.set(id, dependencies);

		// Check for circular dependencies
		const circularPaths = this.detectCircularDependencies(
			id,
			dependencies,
			tempMap,
		);
		if (circularPaths) {
			errors.push(
				`Circular dependency detected: ${this.formatCircularPaths(circularPaths)}`,
			);
		}

		// Check dependency depth
		if (circularPaths === null && dependencies.length > 0) {
			const depth = this.calculateDepth(id, tempMap);
			if (depth > this.MAX_DEPTH) {
				warnings.push(
					`Dependency depth (${depth}) exceeds recommended maximum (${this.MAX_DEPTH})`,
				);
			}
		}

		// Check for redundant dependencies
		const redundant = this.findRedundantDependencies(
			id,
			dependencies,
			allItems,
		);
		if (redundant.length > 0) {
			warnings.push(
				`Redundant dependencies detected (already covered by transitive dependencies): ${redundant.join(", ")}`,
			);
		}

		return {
			valid: errors.length === 0,
			errors,
			warnings,
			circularPaths: circularPaths || undefined,
		};
	}

	/**
	 * Detect circular dependencies using DFS
	 * Returns an array of circular paths if found, null otherwise
	 */
	detectCircularDependencies(
		id: string,
		dependencies: string[],
		allItems: Map<string, string[]>,
	): string[][] | null {
		const visited = new Set<string>();
		const recursionStack = new Set<string>();
		const paths: string[][] = [];

		const dfs = (currentId: string, path: string[]): boolean => {
			visited.add(currentId);
			recursionStack.add(currentId);
			path.push(currentId);

			const deps = allItems.get(currentId) || [];

			for (const depId of deps) {
				if (!visited.has(depId)) {
					if (dfs(depId, [...path])) {
						return true;
					}
				} else if (recursionStack.has(depId)) {
					// Found a cycle
					const cycleStart = path.indexOf(depId);
					const cycle = [...path.slice(cycleStart), depId];
					paths.push(cycle);
					return true;
				}
			}

			recursionStack.delete(currentId);
			return false;
		};

		// Check each dependency
		for (const depId of dependencies) {
			if (!visited.has(depId)) {
				if (dfs(depId, [id])) {
					return paths;
				}
			} else if (recursionStack.has(depId)) {
				return [[id, depId, id]];
			}
		}

		return paths.length > 0 ? paths : null;
	}

	/**
	 * Build dependency graph from items
	 */
	buildGraph(
		items: Array<{ id: string; dependencies: string[] }>,
	): DependencyNode[] {
		const nodes = new Map<string, DependencyNode>();

		// Initialize all nodes
		for (const item of items) {
			nodes.set(item.id, {
				id: item.id,
				name: item.id,
				type: "flow", // This will be set by caller
				dependencies: item.dependencies,
				dependents: [],
			});
		}

		// Build dependents list
		for (const item of items) {
			for (const depId of item.dependencies) {
				const depNode = nodes.get(depId);
				if (depNode) {
					depNode.dependents.push(item.id);
				}
			}
		}

		return Array.from(nodes.values());
	}

	/**
	 * Get execution order using topological sort (Kahn's algorithm)
	 */
	getExecutionOrder(items: DependencyNode[]): string[] {
		const graph = new Map<string, string[]>();
		const inDegree = new Map<string, number>();

		// Build adjacency list and in-degree map
		for (const item of items) {
			graph.set(item.id, [...item.dependencies]);
			inDegree.set(item.id, item.dependencies.length);
		}

		// Find all nodes with no dependencies
		const queue: string[] = [];
		for (const [id, degree] of inDegree.entries()) {
			if (degree === 0) {
				queue.push(id);
			}
		}

		const result: string[] = [];

		while (queue.length > 0) {
			const current = queue.shift()!;
			result.push(current);

			// Find all items that depend on current
			for (const item of items) {
				if (item.dependencies.includes(current)) {
					const currentDegree = inDegree.get(item.id)!;
					inDegree.set(item.id, currentDegree - 1);

					if (inDegree.get(item.id) === 0) {
						queue.push(item.id);
					}
				}
			}
		}

		// If result doesn't include all items, there's a cycle
		if (result.length !== items.length) {
			throw new Error(
				"Cannot determine execution order: circular dependencies detected",
			);
		}

		return result;
	}

	/**
	 * Calculate maximum depth of dependency tree
	 */
	private calculateDepth(id: string, allItems: Map<string, string[]>): number {
		const visited = new Set<string>();

		const dfs = (currentId: string): number => {
			if (visited.has(currentId)) {
				return 0; // Prevent infinite recursion
			}

			visited.add(currentId);
			const deps = allItems.get(currentId) || [];

			if (deps.length === 0) {
				return 0;
			}

			const depths = deps.map((depId) => dfs(depId));
			return 1 + Math.max(...depths);
		};

		return dfs(id);
	}

	/**
	 * Find redundant dependencies (already covered transitively)
	 */
	private findRedundantDependencies(
		id: string,
		dependencies: string[],
		allItems: Map<string, string[]>,
	): string[] {
		const redundant: string[] = [];

		// Get all transitive dependencies
		const transitive = new Set<string>();
		const visited = new Set<string>();

		const collectTransitive = (depId: string, skipFirst: boolean = false) => {
			if (visited.has(depId)) {
				return;
			}
			visited.add(depId);

			if (!skipFirst) {
				transitive.add(depId);
			}

			const deps = allItems.get(depId) || [];
			deps.forEach((d) => collectTransitive(d));
		};

		// Collect transitive dependencies for each direct dependency
		for (const depId of dependencies) {
			collectTransitive(depId, true);
		}

		// Check if any direct dependency is also in transitive set
		for (const depId of dependencies) {
			if (transitive.has(depId)) {
				redundant.push(depId);
			}
		}

		return redundant;
	}

	/**
	 * Format circular paths for error messages
	 */
	private formatCircularPaths(paths: string[][]): string {
		return paths.map((path) => path.join(" → ")).join("; ");
	}

	/**
	 * Get all dependencies (including transitive) for an item
	 */
	getAllDependencies(id: string, allItems: Map<string, string[]>): string[] {
		const all = new Set<string>();
		const visited = new Set<string>();

		const collect = (currentId: string) => {
			if (visited.has(currentId)) {
				return;
			}
			visited.add(currentId);

			const deps = allItems.get(currentId) || [];
			deps.forEach((depId) => {
				all.add(depId);
				collect(depId);
			});
		};

		collect(id);
		return Array.from(all);
	}

	/**
	 * Get all dependents (items that depend on this one, including transitive)
	 */
	getAllDependents(id: string, items: DependencyNode[]): string[] {
		const all = new Set<string>();
		const visited = new Set<string>();

		const collect = (currentId: string) => {
			if (visited.has(currentId)) {
				return;
			}
			visited.add(currentId);

			const node = items.find((item) => item.id === currentId);
			if (!node) {
				return;
			}

			node.dependents.forEach((depId) => {
				all.add(depId);
				collect(depId);
			});
		};

		collect(id);
		return Array.from(all);
	}
}
