"use client";

import { useEffect, useState } from "react";
import type { CollectionFilter, SmartCollection } from "../../lib/types";
import { useCollections } from "../hooks/use-collections";
import { useTags } from "../hooks/use-tags";

interface SmartCollectionBuilderProps {
	collection?: SmartCollection;
	onSave?: () => void;
	onCancel?: () => void;
}

const OPERATOR_BY_FIELD = {
	name: ["equals", "contains", "startsWith", "endsWith"],
	description: ["equals", "contains", "startsWith", "endsWith"],
	tags: ["hasTag"],
	devices: ["hasDevice"],
	lastRunStatus: ["equals"],
} as const;

const FIELD_LABELS = {
	name: "Flow Name",
	description: "Description",
	tags: "Tags",
	devices: "Devices",
	lastRunStatus: "Last Run Status",
};

const OPERATOR_LABELS = {
	equals: "equals",
	contains: "contains",
	startsWith: "starts with",
	endsWith: "ends with",
	hasTag: "has tag",
	hasDevice: "has device",
	lastRunStatus: "status is",
};

export function SmartCollectionBuilder({
	collection,
	onSave,
	onCancel,
}: SmartCollectionBuilderProps) {
	const { createCollection, updateCollection } = useCollections();
	const { tags } = useTags();
	const [name, setName] = useState(collection?.name || "");
	const [description, setDescription] = useState(collection?.description || "");
	const [filters, setFilters] = useState<CollectionFilter[]>(
		collection?.filters || [],
	);
	const [matchCount, setMatchCount] = useState<number | null>(null);
	const [isPreviewLoading, setIsPreviewLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Preview matching flows count
	useEffect(() => {
		if (filters.length === 0) {
			setMatchCount(null);
			return;
		}

		const previewFilters = async () => {
			setIsPreviewLoading(true);
			try {
				// Create a temporary collection to test
				const response = await fetch("/api/flows");
				const data = await response.json();

				if (data.success && data.data) {
					// Simple client-side filtering for preview
					const flows = data.data;
					const matchingFlows = flows.filter((flow: any) => {
						return filters.every((filter) => {
							switch (filter.field) {
								case "name":
									return matchStringField(
										flow.flow.name,
										filter.operator,
										filter.value as string,
									);
								case "description":
									return matchStringField(
										flow.flow.description,
										filter.operator,
										filter.value as string,
									);
								case "tags":
									return (
										filter.operator === "hasTag" &&
										(Array.isArray(filter.value)
											? filter.value.some((tag) =>
													flow.flow.tags?.includes(tag),
												)
											: flow.flow.tags?.includes(filter.value))
									);
								case "devices":
									return (
										filter.operator === "hasDevice" &&
										(Array.isArray(filter.value)
											? filter.value.some((device) =>
													flow.flow.devices?.includes(device),
												)
											: flow.flow.devices?.includes(filter.value))
									);
								case "lastRunStatus":
									return flow.lastRunStatus === filter.value;
								default:
									return true;
							}
						});
					});
					setMatchCount(matchingFlows.length);
				}
			} catch (err) {
				console.error("Preview error:", err);
			} finally {
				setIsPreviewLoading(false);
			}
		};

		const debounce = setTimeout(previewFilters, 500);
		return () => clearTimeout(debounce);
	}, [filters]);

	const matchStringField = (
		value: string | undefined,
		operator: string,
		filterValue: string,
	): boolean => {
		if (!value) return false;
		const lowerValue = value.toLowerCase();
		const lowerFilter = filterValue.toLowerCase();

		switch (operator) {
			case "equals":
				return lowerValue === lowerFilter;
			case "contains":
				return lowerValue.includes(lowerFilter);
			case "startsWith":
				return lowerValue.startsWith(lowerFilter);
			case "endsWith":
				return lowerValue.endsWith(lowerFilter);
			default:
				return false;
		}
	};

	const addFilter = () => {
		setFilters([
			...filters,
			{
				field: "name",
				operator: "contains",
				value: "",
			},
		]);
	};

	const updateFilter = (index: number, updates: Partial<CollectionFilter>) => {
		const newFilters = [...filters];
		const filter = { ...newFilters[index], ...updates };

		// Reset operator if field changed
		if (updates.field && updates.field !== newFilters[index].field) {
			filter.operator =
				OPERATOR_BY_FIELD[updates.field as keyof typeof OPERATOR_BY_FIELD][0];
			filter.value = "";
		}

		newFilters[index] = filter;
		setFilters(newFilters);
	};

	const removeFilter = (index: number) => {
		setFilters(filters.filter((_, i) => i !== index));
	};

	const handleSave = async () => {
		if (!name.trim()) {
			setError("Name is required");
			return;
		}

		if (filters.length === 0) {
			setError("At least one filter is required");
			return;
		}

		setIsSaving(true);
		setError(null);

		try {
			if (collection) {
				await updateCollection(collection.id, { name, description, filters });
			} else {
				await createCollection({ name, description, filters });
			}
			onSave?.();
		} catch (err) {
			setError(String(err));
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
					{collection ? "Edit Collection" : "Create Smart Collection"}
				</h2>
				<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
					Create dynamic collections that automatically include flows matching
					your filters
				</p>
			</div>

			{/* Error Message */}
			{error && (
				<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-3 rounded-md text-sm">
					{error}
				</div>
			)}

			{/* Basic Info */}
			<div className="space-y-4">
				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						Collection Name *
					</label>
					<input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="e.g., Critical Regression Tests"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						Description (optional)
					</label>
					<textarea
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
						rows={2}
						placeholder="Describe what this collection is for..."
					/>
				</div>
			</div>

			{/* Filters */}
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Filters
					</label>
					<button
						onClick={addFilter}
						className="text-sm px-3 py-1.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded font-medium transition-colors"
					>
						Add Filter
					</button>
				</div>

				{filters.length === 0 ? (
					<div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
						<p className="text-gray-600 dark:text-gray-400 mb-2">
							No filters yet
						</p>
						<button
							onClick={addFilter}
							className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
						>
							Add your first filter
						</button>
					</div>
				) : (
					<div className="space-y-2">
						{filters.map((filter, index) => (
							<div
								key={index}
								className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3"
							>
								<div className="flex gap-2">
									{/* Field */}
									<select
										value={filter.field}
										onChange={(e) =>
											updateFilter(index, { field: e.target.value as any })
										}
										className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
									>
										{Object.entries(FIELD_LABELS).map(([value, label]) => (
											<option key={value} value={value}>
												{label}
											</option>
										))}
									</select>

									{/* Operator */}
									<select
										value={filter.operator}
										onChange={(e) =>
											updateFilter(index, { operator: e.target.value as any })
										}
										className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
									>
										{OPERATOR_BY_FIELD[
											filter.field as keyof typeof OPERATOR_BY_FIELD
										].map((op) => (
											<option key={op} value={op}>
												{OPERATOR_LABELS[op]}
											</option>
										))}
									</select>

									{/* Value */}
									<div className="flex-1">
										{filter.field === "tags" ? (
											<select
												value={filter.value as string}
												onChange={(e) =>
													updateFilter(index, { value: e.target.value })
												}
												className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
											>
												<option value="">Select tag...</option>
												{tags.map((tag) => (
													<option key={tag.id} value={tag.name}>
														{tag.name}
													</option>
												))}
											</select>
										) : filter.field === "devices" ? (
											<select
												value={filter.value as string}
												onChange={(e) =>
													updateFilter(index, { value: e.target.value })
												}
												className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
											>
												<option value="">Select device...</option>
												<option value="desktop">Desktop</option>
												<option value="mobile">Mobile</option>
											</select>
										) : filter.field === "lastRunStatus" ? (
											<select
												value={filter.value as string}
												onChange={(e) =>
													updateFilter(index, { value: e.target.value })
												}
												className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
											>
												<option value="">Select status...</option>
												<option value="passed">Passed</option>
												<option value="failed">Failed</option>
											</select>
										) : (
											<input
												type="text"
												value={filter.value as string}
												onChange={(e) =>
													updateFilter(index, { value: e.target.value })
												}
												className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
												placeholder="Enter value..."
											/>
										)}
									</div>

									{/* Remove */}
									<button
										onClick={() => removeFilter(index)}
										className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
										title="Remove filter"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="18"
											height="18"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<line x1="18" y1="6" x2="6" y2="18" />
											<line x1="6" y1="6" x2="18" y2="18" />
										</svg>
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Preview */}
			{filters.length > 0 && (
				<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
					<div className="flex items-center gap-2">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="text-blue-600 dark:text-blue-400"
						>
							<circle cx="12" cy="12" r="10" />
							<path d="M12 16v-4" />
							<path d="M12 8h.01" />
						</svg>
						<span className="text-sm font-medium text-blue-900 dark:text-blue-300">
							Preview:
						</span>
						{isPreviewLoading ? (
							<span className="text-sm text-blue-700 dark:text-blue-400">
								Counting...
							</span>
						) : matchCount !== null ? (
							<span className="text-sm text-blue-700 dark:text-blue-400">
								{matchCount} flow{matchCount !== 1 ? "s" : ""} match
								{matchCount === 1 ? "es" : ""} these filters
							</span>
						) : null}
					</div>
				</div>
			)}

			{/* Actions */}
			<div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
				{onCancel && (
					<button
						onClick={onCancel}
						disabled={isSaving}
						className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md font-medium transition-colors disabled:opacity-50"
					>
						Cancel
					</button>
				)}
				<button
					onClick={handleSave}
					disabled={isSaving || !name.trim() || filters.length === 0}
					className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isSaving
						? "Saving..."
						: collection
							? "Save Changes"
							: "Create Collection"}
				</button>
			</div>
		</div>
	);
}
