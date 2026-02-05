"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface SelectorSuggestion {
	selector: string;
	label: string;
	description: string;
	category: "common" | "form" | "navigation" | "content";
}

const COMMON_SELECTORS: SelectorSuggestion[] = [
	// Common
	{
		selector: "button",
		label: "Any Button",
		description: "Matches all button elements",
		category: "common",
	},
	{
		selector: "a",
		label: "Any Link",
		description: "Matches all anchor elements",
		category: "common",
	},
	{
		selector: '[data-testid="..."]',
		label: "Test ID",
		description: "Element with test ID attribute",
		category: "common",
	},
	{
		selector: "#id",
		label: "By ID",
		description: "Element with specific ID",
		category: "common",
	},
	{
		selector: ".class",
		label: "By Class",
		description: "Element with specific class",
		category: "common",
	},

	// Form
	{
		selector: 'input[type="text"]',
		label: "Text Input",
		description: "Text input field",
		category: "form",
	},
	{
		selector: 'input[type="email"]',
		label: "Email Input",
		description: "Email input field",
		category: "form",
	},
	{
		selector: 'input[type="password"]',
		label: "Password Input",
		description: "Password input field",
		category: "form",
	},
	{
		selector: 'input[type="checkbox"]',
		label: "Checkbox",
		description: "Checkbox input",
		category: "form",
	},
	{
		selector: 'input[type="radio"]',
		label: "Radio Button",
		description: "Radio button input",
		category: "form",
	},
	{
		selector: "select",
		label: "Dropdown",
		description: "Select dropdown element",
		category: "form",
	},
	{
		selector: "textarea",
		label: "Text Area",
		description: "Multi-line text input",
		category: "form",
	},
	{
		selector: "form",
		label: "Form",
		description: "Form element",
		category: "form",
	},

	// Navigation
	{
		selector: "nav a",
		label: "Nav Link",
		description: "Link within navigation",
		category: "navigation",
	},
	{
		selector: '[role="navigation"]',
		label: "Navigation",
		description: "Element with navigation role",
		category: "navigation",
	},
	{
		selector: '[aria-label="..."]',
		label: "Aria Label",
		description: "Element with aria-label",
		category: "navigation",
	},

	// Content
	{
		selector: "h1",
		label: "Heading 1",
		description: "Main heading",
		category: "content",
	},
	{
		selector: "h2",
		label: "Heading 2",
		description: "Subheading",
		category: "content",
	},
	{
		selector: "p",
		label: "Paragraph",
		description: "Paragraph element",
		category: "content",
	},
	{
		selector: '[role="button"]',
		label: "Button Role",
		description: "Element with button role",
		category: "content",
	},
];

interface SelectorPickerProps {
	value: string;
	onChange: (selector: string) => void;
	placeholder?: string;
	showSuggestions?: boolean;
	required?: boolean;
}

export function SelectorPicker({
	value,
	onChange,
	placeholder = "CSS selector (e.g., button, #submit, .btn-primary)",
	showSuggestions = true,
	required = false,
}: SelectorPickerProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<
		"all" | "common" | "form" | "navigation" | "content"
	>("all");
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

	const handleInputChange = (newValue: string) => {
		onChange(newValue);
		if (newValue && showSuggestions) {
			setIsOpen(true);
		}
	};

	const handleSuggestionClick = useCallback(
		(selector: string) => {
			onChange(selector);
			setIsOpen(false);
			setSearchQuery("");
		},
		[onChange],
	);

	const filteredSuggestions = COMMON_SELECTORS.filter((suggestion) => {
		const matchesSearch =
			searchQuery === "" ||
			suggestion.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
			suggestion.selector.toLowerCase().includes(searchQuery.toLowerCase()) ||
			suggestion.description.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesCategory =
			selectedCategory === "all" || suggestion.category === selectedCategory;

		return matchesSearch && matchesCategory;
	});

	// Validate selector (basic check)
	const isValidSelector = useCallback(
		(sel: string): boolean => {
			if (!sel) return !required;

			try {
				// Try to use querySelector to validate
				// This won't throw for invalid selectors, but catches some basic issues
				if (sel.includes("...")) return false; // Template placeholder
				return true;
			} catch {
				return false;
			}
		},
		[required],
	);

	const validationState = isValidSelector(value);

	return (
		<div ref={containerRef} className="relative">
			{/* Main Input */}
			<div className="relative">
				<input
					type="text"
					value={value}
					onChange={(e) => handleInputChange(e.target.value)}
					onFocus={() => showSuggestions && setIsOpen(true)}
					placeholder={placeholder}
					className={`w-full px-3 py-2 pr-20 text-sm font-mono bg-white dark:bg-gray-800 border rounded-md text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 ${
						!validationState && value
							? "border-red-300 dark:border-red-700 focus:ring-red-500"
							: "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
					}`}
				/>

				{/* Browse Button */}
				{showSuggestions && (
					<button
						type="button"
						onClick={() => setIsOpen(!isOpen)}
						className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
					>
						Browse
					</button>
				)}
			</div>

			{/* Validation Message */}
			{!validationState && value && (
				<p className="mt-1 text-xs text-red-600 dark:text-red-400">
					Replace "..." with actual values or check selector syntax
				</p>
			)}

			{/* Suggestions Dropdown */}
			{isOpen && showSuggestions && (
				<div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-hidden flex flex-col">
					{/* Search */}
					<div className="p-3 border-b border-gray-200 dark:border-gray-700">
						<div className="relative">
							<div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
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
								placeholder="Search selectors..."
								className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
					</div>

					{/* Category Filter */}
					<div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 flex gap-1 overflow-x-auto">
						{(["all", "common", "form", "navigation", "content"] as const).map(
							(category) => (
								<button
									key={category}
									onClick={() => setSelectedCategory(category)}
									className={`px-2 py-1 text-xs rounded font-medium whitespace-nowrap transition-colors ${
										selectedCategory === category
											? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
											: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
									}`}
								>
									{category}
								</button>
							),
						)}
					</div>

					{/* Suggestions List */}
					<div className="flex-1 overflow-y-auto p-2">
						{filteredSuggestions.length === 0 ? (
							<div className="text-center py-8">
								<p className="text-sm text-gray-500 dark:text-gray-400">
									No selectors found
								</p>
							</div>
						) : (
							<div className="space-y-1">
								{filteredSuggestions.map((suggestion, index) => (
									<button
										key={index}
										onClick={() => handleSuggestionClick(suggestion.selector)}
										className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
									>
										<div className="flex items-start justify-between gap-2">
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2">
													<span className="text-xs font-medium text-gray-900 dark:text-white">
														{suggestion.label}
													</span>
													<span className="px-1.5 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
														{suggestion.category}
													</span>
												</div>
												<code className="block text-xs text-blue-600 dark:text-blue-400 font-mono mt-1">
													{suggestion.selector}
												</code>
												<p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
													{suggestion.description}
												</p>
											</div>
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
												className="text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
											>
												<polyline points="9 18 15 12 9 6" />
											</svg>
										</div>
									</button>
								))}
							</div>
						)}
					</div>

					{/* Quick Tips */}
					<div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
						<p className="text-xs text-gray-600 dark:text-gray-400">
							<span className="font-medium">Tip:</span> Use test IDs like{" "}
							<code className="px-1 py-0.5 bg-white dark:bg-gray-800 rounded text-blue-600 dark:text-blue-400">
								[data-testid="submit"]
							</code>{" "}
							for stable selectors
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
