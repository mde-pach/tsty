"use client";

import { useEffect, useRef, useState } from "react";

interface DependencySelectorProps {
	type: "flow" | "action";
	currentId?: string;
	selectedDependencies: string[];
	availableItems: Array<{ id: string; name: string; dependencies?: string[] }>;
	onChange: (dependencies: string[]) => void;
	maxDependencies?: number;
}

export function DependencySelector({
	type,
	currentId,
	selectedDependencies,
	availableItems,
	onChange,
	maxDependencies,
}: DependencySelectorProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [validationErrors, setValidationErrors] = useState<string[]>([]);
	const containerRef = useRef<HTMLDivElement>(null);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen]);

	// Validate dependencies whenever they change
	useEffect(() => {
		const errors = validateDependencies(
			currentId || "",
			selectedDependencies,
			availableItems,
		);
		setValidationErrors(errors);
	}, [currentId, selectedDependencies, availableItems]);

	const handleToggleDependency = (id: string) => {
		if (selectedDependencies.includes(id)) {
			// Remove dependency
			onChange(selectedDependencies.filter((d) => d !== id));
		} else {
			// Check if adding would create circular dependency
			const wouldCreateCycle = checkCircularDependency(
				currentId || "",
				[...selectedDependencies, id],
				availableItems,
			);

			if (wouldCreateCycle) {
				setValidationErrors([
					"Adding this dependency would create a circular dependency",
				]);
				return;
			}

			// Check max dependencies limit
			if (maxDependencies && selectedDependencies.length >= maxDependencies) {
				setValidationErrors([
					`Maximum ${maxDependencies} dependencies allowed`,
				]);
				return;
			}

			// Add dependency
			onChange([...selectedDependencies, id]);
		}
	};

	const handleRemoveDependency = (id: string) => {
		onChange(selectedDependencies.filter((d) => d !== id));
	};

	// Filter available items
	const filteredItems = availableItems.filter((item) => {
		// Exclude current item
		if (item.id === currentId) return false;

		// Search filter
		if (
			searchQuery &&
			!item.name.toLowerCase().includes(searchQuery.toLowerCase())
		) {
			return false;
		}

		return true;
	});

	// Get selected items for display
	const selectedItems = availableItems.filter((item) =>
		selectedDependencies.includes(item.id),
	);

	return (
		<div ref={containerRef} className="relative">
			{/* Selected Dependencies */}
			{selectedItems.length > 0 && (
				<div className="mb-2 flex flex-wrap gap-2">
					{selectedItems.map((item) => (
						<span
							key={item.id}
							className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
						>
							{item.name}
							<button
								onClick={() => handleRemoveDependency(item.id)}
								className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded p-0.5 transition-colors"
								title="Remove dependency"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="12"
									height="12"
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
						</span>
					))}
				</div>
			)}

			{/* Input Field */}
			<div className="relative">
				<input
					type="text"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					onFocus={() => setIsOpen(true)}
					placeholder={`Search ${type}s to add as dependencies...`}
					className="w-full px-3 py-2 pr-10 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
				<div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
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
					>
						<circle cx="11" cy="11" r="8" />
						<path d="m21 21-4.3-4.3" />
					</svg>
				</div>
			</div>

			{/* Validation Errors */}
			{validationErrors.length > 0 && (
				<div className="mt-2">
					{validationErrors.map((error, index) => (
						<p key={index} className="text-xs text-red-600 dark:text-red-400">
							{error}
						</p>
					))}
				</div>
			)}

			{/* Dropdown */}
			{isOpen && (
				<div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto">
					{filteredItems.length === 0 ? (
						<div className="px-3 py-8 text-center">
							<p className="text-sm text-gray-500 dark:text-gray-400">
								{searchQuery
									? `No ${type}s found matching "${searchQuery}"`
									: `No ${type}s available`}
							</p>
						</div>
					) : (
						<div className="py-1">
							{filteredItems.map((item) => {
								const isSelected = selectedDependencies.includes(item.id);
								const wouldCreateCycle =
									!isSelected &&
									checkCircularDependency(
										currentId || "",
										[...selectedDependencies, item.id],
										availableItems,
									);

								return (
									<button
										key={item.id}
										onClick={() =>
											!wouldCreateCycle && handleToggleDependency(item.id)
										}
										disabled={wouldCreateCycle}
										className={`w-full text-left px-3 py-2 text-sm transition-colors ${
											isSelected
												? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
												: wouldCreateCycle
													? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
													: "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
										}`}
									>
										<div className="flex items-center justify-between">
											<span className="flex-1 truncate">{item.name}</span>
											{isSelected && (
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
													className="flex-shrink-0 ml-2"
												>
													<polyline points="20 6 9 17 4 12" />
												</svg>
											)}
											{wouldCreateCycle && (
												<span className="text-xs flex-shrink-0 ml-2">
													(circular)
												</span>
											)}
										</div>
										{item.dependencies && item.dependencies.length > 0 && (
											<span className="text-xs text-gray-500 dark:text-gray-400">
												Depends on {item.dependencies.length} other
												{item.dependencies.length !== 1 ? "s" : ""}
											</span>
										)}
									</button>
								);
							})}
						</div>
					)}

					{/* Footer */}
					<div className="border-t border-gray-200 dark:border-gray-700 px-3 py-2 bg-gray-50 dark:bg-gray-900">
						<p className="text-xs text-gray-600 dark:text-gray-400">
							{selectedDependencies.length} of{" "}
							{maxDependencies ? `${maxDependencies} max` : "unlimited"}{" "}
							selected
						</p>
					</div>
				</div>
			)}
		</div>
	);
}

// Validation helper
function validateDependencies(
	currentId: string,
	dependencies: string[],
	allItems: Array<{ id: string; dependencies?: string[] }>,
): string[] {
	const errors: string[] = [];

	// Check for circular dependencies
	if (checkCircularDependency(currentId, dependencies, allItems)) {
		errors.push("Circular dependency detected");
	}

	// Check for missing dependencies
	const availableIds = new Set(allItems.map((item) => item.id));
	const missingDeps = dependencies.filter((dep) => !availableIds.has(dep));
	if (missingDeps.length > 0) {
		errors.push(`Missing dependencies: ${missingDeps.join(", ")}`);
	}

	// Check depth (max 5 levels)
	const depth = calculateDependencyDepth(currentId, dependencies, allItems);
	if (depth > 5) {
		errors.push("Dependency chain exceeds maximum depth of 5 levels");
	}

	return errors;
}

// Check if adding dependencies would create a cycle
function checkCircularDependency(
	currentId: string,
	dependencies: string[],
	allItems: Array<{ id: string; dependencies?: string[] }>,
): boolean {
	const visited = new Set<string>();
	const recursionStack = new Set<string>();

	// Build dependency map including the current item with its new dependencies
	const depMap = new Map<string, string[]>();
	allItems.forEach((item) => {
		depMap.set(item.id, item.dependencies || []);
	});
	depMap.set(currentId, dependencies);

	function hasCycle(id: string): boolean {
		if (!visited.has(id)) {
			visited.add(id);
			recursionStack.add(id);

			const deps = depMap.get(id) || [];
			for (const depId of deps) {
				if (!visited.has(depId) && hasCycle(depId)) {
					return true;
				} else if (recursionStack.has(depId)) {
					return true;
				}
			}
		}

		recursionStack.delete(id);
		return false;
	}

	return hasCycle(currentId);
}

// Calculate maximum dependency depth
function calculateDependencyDepth(
	currentId: string,
	dependencies: string[],
	allItems: Array<{ id: string; dependencies?: string[] }>,
): number {
	const depMap = new Map<string, string[]>();
	allItems.forEach((item) => {
		depMap.set(item.id, item.dependencies || []);
	});
	depMap.set(currentId, dependencies);

	function getDepth(id: string, visited: Set<string>): number {
		if (visited.has(id)) {
			return 0; // Circular, return 0
		}

		visited.add(id);
		const deps = depMap.get(id) || [];

		if (deps.length === 0) {
			return 0;
		}

		const maxChildDepth = Math.max(
			...deps.map((depId) => getDepth(depId, new Set(visited))),
		);

		return maxChildDepth + 1;
	}

	return getDepth(currentId, new Set());
}
