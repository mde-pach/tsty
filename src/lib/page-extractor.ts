import type { FlowFile, PageNode } from "./types";

/**
 * Extract page hierarchy from flow URLs
 * Builds a tree structure from all flow steps
 */
export class PageExtractor {
	/**
	 * Build page tree from all flows
	 */
	buildPageTree(flows: FlowFile[]): PageNode {
		const root: PageNode = {
			path: "/",
			name: "Root",
			children: [],
			flows: [],
		};

		// Collect all unique URLs from all flow steps
		const urlMap = new Map<string, Set<string>>(); // path -> set of flow IDs

		for (const flow of flows) {
			for (const step of flow.flow.steps) {
				if (!step.url) continue;
				const pagePath = this.extractPagePath(step.url);
				if (!urlMap.has(pagePath)) {
					urlMap.set(pagePath, new Set());
				}
				urlMap.get(pagePath)!.add(flow.id);
			}
		}

		// Build tree from paths
		for (const [pagePath, flowIds] of urlMap.entries()) {
			this.insertPath(root, pagePath, Array.from(flowIds));
		}

		// Sort children alphabetically at each level
		this.sortTree(root);

		return root;
	}

	/**
	 * Extract page path from URL
	 * Normalizes URL to get the path component
	 */
	extractPagePath(url: string): string {
		try {
			const normalized = this.normalizeUrl(url);
			const urlObj = new URL(normalized);
			let path = urlObj.pathname;

			// Remove trailing slash unless it's the root
			if (path !== "/" && path.endsWith("/")) {
				path = path.slice(0, -1);
			}

			return path || "/";
		} catch (error) {
			// If URL parsing fails, try to extract path from relative URL
			const match = url.match(/^\/[^?#]*/);
			return match ? match[0] : "/";
		}
	}

	/**
	 * Normalize URL to ensure it's parseable
	 */
	normalizeUrl(url: string): string {
		// If it's already a full URL, return as-is
		if (url.startsWith("http://") || url.startsWith("https://")) {
			return url;
		}

		// If it starts with /, prepend a dummy domain
		if (url.startsWith("/")) {
			return `https://example.com${url}`;
		}

		// If it's a relative path, prepend / and domain
		return `https://example.com/${url}`;
	}

	/**
	 * Insert a path into the tree
	 */
	private insertPath(
		root: PageNode,
		pagePath: string,
		flowIds: string[],
	): void {
		if (pagePath === "/") {
			root.flows.push(...flowIds);
			return;
		}

		const parts = pagePath.split("/").filter(Boolean);
		let current = root;

		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];
			const partPath = "/" + parts.slice(0, i + 1).join("/");

			let child = current.children.find((c) => c.path === partPath);

			if (!child) {
				child = {
					path: partPath,
					name: this.formatName(part),
					children: [],
					flows: [],
				};
				current.children.push(child);
			}

			// If this is the last part, add the flow IDs
			if (i === parts.length - 1) {
				child.flows.push(...flowIds);
			}

			current = child;
		}
	}

	/**
	 * Format a path segment into a readable name
	 */
	private formatName(segment: string): string {
		// Remove common ID patterns
		const cleaned = segment.replace(/^\d+$/, "ID");

		// Convert kebab-case and snake_case to Title Case
		return cleaned
			.replace(/[-_]/g, " ")
			.split(" ")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join(" ");
	}

	/**
	 * Sort tree children alphabetically
	 */
	private sortTree(node: PageNode): void {
		node.children.sort((a, b) => a.name.localeCompare(b.name));
		node.children.forEach((child) => this.sortTree(child));
	}

	/**
	 * Get all pages as a flat list
	 */
	flattenTree(root: PageNode): PageNode[] {
		const result: PageNode[] = [];

		const traverse = (node: PageNode) => {
			if (node.path !== "/") {
				result.push(node);
			}
			node.children.forEach(traverse);
		};

		traverse(root);
		return result;
	}

	/**
	 * Find a specific page by path
	 */
	findPage(root: PageNode, pagePath: string): PageNode | null {
		if (root.path === pagePath) {
			return root;
		}

		for (const child of root.children) {
			const found = this.findPage(child, pagePath);
			if (found) {
				return found;
			}
		}

		return null;
	}

	/**
	 * Get all parent paths for a given path
	 */
	getParentPaths(pagePath: string): string[] {
		if (pagePath === "/") {
			return [];
		}

		const parts = pagePath.split("/").filter(Boolean);
		const parents: string[] = ["/"];

		for (let i = 1; i < parts.length; i++) {
			parents.push("/" + parts.slice(0, i).join("/"));
		}

		return parents;
	}

	/**
	 * Get breadcrumb trail for a path
	 */
	getBreadcrumbs(root: PageNode, pagePath: string): PageNode[] {
		const paths = ["/", ...this.getParentPaths(pagePath), pagePath];
		const breadcrumbs: PageNode[] = [];

		for (const path of paths) {
			const node = this.findPage(root, path);
			if (node) {
				breadcrumbs.push(node);
			}
		}

		return breadcrumbs;
	}
}
