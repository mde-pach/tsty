import type { CollectionFilter, FlowFile, SmartCollection } from "./types";

/**
 * Match flows against smart collection filter rules
 */
export class CollectionMatcher {
	/**
	 * Check if a flow matches all filters in a collection
	 */
	matchesFilters(flow: FlowFile, filters: CollectionFilter[]): boolean {
		// Empty filters match everything
		if (filters.length === 0) {
			return true;
		}

		// All filters must match (AND logic)
		return filters.every((filter) => this.matchesFilter(flow, filter));
	}

	/**
	 * Check if a flow matches a single filter
	 */
	private matchesFilter(flow: FlowFile, filter: CollectionFilter): boolean {
		const { field, operator, value } = filter;

		switch (field) {
			case "name":
				return this.matchesStringField(
					flow.flow.name,
					operator,
					value as string,
				);

			case "description":
				return this.matchesStringField(
					flow.flow.description,
					operator,
					value as string,
				);

			case "tags":
				if (operator === "hasTag") {
					const tags = Array.isArray(value) ? value : [value];
					return tags.some((tag) => flow.flow.tags?.includes(tag));
				}
				return false;

			case "devices":
				if (operator === "hasDevice") {
					const devices = Array.isArray(value) ? value : [value];
					return devices.some((device) =>
						flow.flow.devices?.includes(device as "desktop" | "mobile"),
					);
				}
				return false;

			case "lastRunStatus":
				if (operator === "equals") {
					return flow.lastRunStatus === value;
				}
				return false;

			default:
				return false;
		}
	}

	/**
	 * Match string fields with various operators
	 */
	private matchesStringField(
		fieldValue: string | undefined,
		operator: string,
		filterValue: string,
	): boolean {
		if (!fieldValue) {
			return false;
		}

		const lowerFieldValue = fieldValue.toLowerCase();
		const lowerFilterValue = filterValue.toLowerCase();

		switch (operator) {
			case "equals":
				return lowerFieldValue === lowerFilterValue;

			case "contains":
				return lowerFieldValue.includes(lowerFilterValue);

			case "startsWith":
				return lowerFieldValue.startsWith(lowerFilterValue);

			case "endsWith":
				return lowerFieldValue.endsWith(lowerFilterValue);

			default:
				return false;
		}
	}

	/**
	 * Get all flows matching a collection's filters
	 */
	getMatchingFlows(flows: FlowFile[], collection: SmartCollection): FlowFile[] {
		return flows.filter((flow) =>
			this.matchesFilters(flow, collection.filters),
		);
	}

	/**
	 * Get count of flows matching each collection
	 */
	getCollectionCounts(
		flows: FlowFile[],
		collections: SmartCollection[],
	): Record<string, number> {
		const counts: Record<string, number> = {};

		for (const collection of collections) {
			counts[collection.id] = this.getMatchingFlows(flows, collection).length;
		}

		return counts;
	}

	/**
	 * Validate filter structure
	 */
	validateFilter(filter: CollectionFilter): { valid: boolean; error?: string } {
		// Check required fields
		if (!filter.field || !filter.operator || filter.value === undefined) {
			return {
				valid: false,
				error: "Filter must have field, operator, and value",
			};
		}

		// Validate field
		const validFields = [
			"name",
			"description",
			"tags",
			"devices",
			"lastRunStatus",
		];
		if (!validFields.includes(filter.field)) {
			return {
				valid: false,
				error: `Invalid field: ${filter.field}. Must be one of ${validFields.join(", ")}`,
			};
		}

		// Validate operator for field
		const validOperators = this.getValidOperators(filter.field);
		if (!validOperators.includes(filter.operator)) {
			return {
				valid: false,
				error: `Invalid operator "${filter.operator}" for field "${filter.field}". Valid operators: ${validOperators.join(", ")}`,
			};
		}

		// Validate value type
		if (filter.field === "tags" || filter.field === "devices") {
			if (!Array.isArray(filter.value) && typeof filter.value !== "string") {
				return {
					valid: false,
					error: `Value for ${filter.field} must be a string or array`,
				};
			}
		} else if (typeof filter.value !== "string") {
			return {
				valid: false,
				error: `Value for ${filter.field} must be a string`,
			};
		}

		return { valid: true };
	}

	/**
	 * Get valid operators for a field
	 */
	private getValidOperators(field: string): string[] {
		switch (field) {
			case "name":
			case "description":
				return ["equals", "contains", "startsWith", "endsWith"];
			case "tags":
				return ["hasTag"];
			case "devices":
				return ["hasDevice"];
			case "lastRunStatus":
				return ["equals"];
			default:
				return [];
		}
	}

	/**
	 * Suggest filters based on flow patterns
	 */
	suggestFilters(flows: FlowFile[]): CollectionFilter[] {
		const suggestions: CollectionFilter[] = [];

		// Get all unique tags
		const allTags = new Set<string>();
		flows.forEach((f) => {
			f.flow.tags?.forEach((tag) => allTags.add(tag));
		});

		// Suggest tag filters for common tags (used by >10% of flows)
		const tagThreshold = Math.ceil(flows.length * 0.1);
		allTags.forEach((tag) => {
			const count = flows.filter((f) => f.flow.tags?.includes(tag)).length;
			if (count >= tagThreshold) {
				suggestions.push({
					field: "tags",
					operator: "hasTag",
					value: tag,
				});
			}
		});

		// Suggest filters for flows with failures
		const failedCount = flows.filter(
			(f) => f.lastRunStatus === "failed",
		).length;
		if (failedCount > 0) {
			suggestions.push({
				field: "lastRunStatus",
				operator: "equals",
				value: "failed",
			});
		}

		return suggestions;
	}
}
