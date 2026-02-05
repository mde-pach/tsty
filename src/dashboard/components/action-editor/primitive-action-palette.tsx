"use client";

import { useDraggable } from "@dnd-kit/core";
import { useState } from "react";
import type { ActionType, Action } from "../../../lib/types";
import { ACTION_CATEGORIES } from "../../../lib/generated-actions";
import { useActionEditor } from "../../contexts/action-editor-context";

interface PrimitiveActionTemplate {
	type: ActionType;
	label: string;
	description: string;
	icon: string;
	color: string;
	category: string;
}

// Icon mapping for action types
const ACTION_ICONS: Record<string, string> = {
	// Navigation
	goto: "🔗",
	goBack: "◀️",
	goForward: "▶️",
	reload: "🔄",

	// Mouse
	click: "👆",
	dblclick: "👆👆",
	hover: "🖱️",
	dragAndDrop: "🔀",
	tap: "👉",

	// Keyboard
	type: "⌨️",
	fill: "✏️",
	press: "🔑",

	// Form
	check: "☑️",
	uncheck: "◻️",
	selectOption: "📋",
	setInputFiles: "📎",

	// Element
	focus: "🎯",
	blur: "👁️",
	dispatchEvent: "⚡",

	// Waiting
	waitForLoadState: "⏳",
	waitForTimeout: "⏱️",
	waitForSelector: "🔍",
	waitForFunction: "🔧",
	waitForURL: "🔗",
	waitForEvent: "📡",

	// Screenshot
	screenshot: "📸",

	// Content
	content: "📄",
	title: "📋",
	url: "🔗",

	// Evaluation
	evaluate: "💻",
	evaluateHandle: "🔧",

	// Locators
	locator: "🎯",
	getByRole: "🎭",
	getByText: "📝",
	getByLabel: "🏷️",
	getByPlaceholder: "💬",
	getByAltText: "🖼️",
	getByTitle: "📌",
	getByTestId: "🔬",

	// Viewport
	setViewportSize: "📱",
	viewportSize: "📐",

	// Misc
	bringToFront: "⬆️",
	close: "❌",
	pdf: "📄",
	pause: "⏸️",
	setExtraHTTPHeaders: "🔐",
	setContent: "📝",
	mouse: "🖱️",
};

// Color mapping for categories
const CATEGORY_COLORS: Record<string, string> = {
	navigation: "blue",
	mouse: "purple",
	keyboard: "green",
	form: "indigo",
	element: "cyan",
	waiting: "amber",
	screenshot: "pink",
	content: "slate",
	evaluation: "red",
	locator: "teal",
	viewport: "orange",
	misc: "gray",
	scroll: "emerald",
};

// Generate action descriptions
const ACTION_DESCRIPTIONS: Record<string, string> = {
	goto: "Navigate to a URL",
	goBack: "Go back in browser history",
	goForward: "Go forward in browser history",
	reload: "Reload current page",
	click: "Click an element",
	dblclick: "Double-click an element",
	hover: "Hover over an element",
	dragAndDrop: "Drag and drop elements",
	tap: "Tap an element (mobile)",
	type: "Type text character by character",
	fill: "Fill an input field instantly",
	press: "Press a keyboard key",
	check: "Check a checkbox/radio",
	uncheck: "Uncheck a checkbox",
	selectOption: "Select dropdown option",
	setInputFiles: "Upload files",
	focus: "Focus an element",
	blur: "Remove focus from element",
	dispatchEvent: "Dispatch DOM event",
	waitForLoadState: "Wait for page load state",
	waitForTimeout: "Wait for milliseconds",
	waitForSelector: "Wait for element to appear",
	waitForFunction: "Wait for condition",
	waitForURL: "Wait for URL pattern",
	waitForEvent: "Wait for page event",
	screenshot: "Take a screenshot",
	content: "Get page HTML",
	title: "Get page title",
	url: "Get current URL",
	evaluate: "Execute JavaScript",
	evaluateHandle: "Execute JS and return handle",
	locator: "Create element locator",
	getByRole: "Get element by ARIA role",
	getByText: "Get element by text",
	getByLabel: "Get element by label",
	getByPlaceholder: "Get element by placeholder",
	getByAltText: "Get element by alt text",
	getByTitle: "Get element by title",
	getByTestId: "Get element by test ID",
	setViewportSize: "Set viewport dimensions",
	viewportSize: "Get viewport size",
	bringToFront: "Bring page to front",
	close: "Close the page",
	pdf: "Generate PDF",
	pause: "Pause execution (debug)",
	setExtraHTTPHeaders: "Set HTTP headers",
	setContent: "Set page HTML content",
	mouse: "Access mouse API",
	scroll: "Scroll page or element",
};

// Auto-generate primitive actions from ACTION_CATEGORIES
const PRIMITIVE_ACTIONS: PrimitiveActionTemplate[] = Object.entries(ACTION_CATEGORIES).flatMap(
	([category, methods]) =>
		(methods as string[]).map((method) => ({
			type: method as ActionType,
			label: method.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
			description: ACTION_DESCRIPTIONS[method] || `Execute ${method}`,
			icon: ACTION_ICONS[method] || "⚡",
			color: CATEGORY_COLORS[category] || "gray",
			category,
		}))
);

interface DraggablePrimitiveActionProps {
	template: PrimitiveActionTemplate;
}

function DraggablePrimitiveAction({ template }: DraggablePrimitiveActionProps) {
	const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
		id: `primitive-${template.type}`,
		data: { template },
	});

	// Import context to add action on click
	const { addAction } = useActionEditor();

	// Create default action with proper properties based on type
	const createDefaultAction = (type: ActionType): Action => {
		const baseAction = { type } as Action;

		// Actions that need selector
		if (["click", "dblclick", "hover", "check", "uncheck", "focus", "blur", "tap"].includes(type)) {
			return { ...baseAction, selector: "" } as Action;
		}

		// Actions that need selector + value
		if (["fill", "selectOption"].includes(type)) {
			return { ...baseAction, selector: "", value: "" } as Action;
		}

		// Actions that need selector + text
		if (["type"].includes(type)) {
			return { ...baseAction, selector: "", text: "" } as Action;
		}

		// Actions that need key
		if (["press"].includes(type)) {
			return { ...baseAction, key: "" } as Action;
		}

		// Actions that need URL
		if (["goto", "waitForURL"].includes(type)) {
			return { ...baseAction, url: "" } as Action;
		}

		// Wait actions
		if (["waitForTimeout"].includes(type)) {
			return { ...baseAction, timeout: 1000 } as Action;
		}

		if (["waitForSelector"].includes(type)) {
			return { ...baseAction, selector: "" } as Action;
		}

		if (["waitForLoadState"].includes(type)) {
			return { ...baseAction, state: "load" } as Action;
		}

		if (["waitForFunction"].includes(type)) {
			return { ...baseAction, fn: "" } as Action;
		}

		// Screenshot
		if (["screenshot"].includes(type)) {
			return { ...baseAction, path: "" } as Action;
		}

		// Drag and drop
		if (["dragAndDrop"].includes(type)) {
			return { ...baseAction, source: "", target: "" } as Action;
		}

		// Set input files
		if (["setInputFiles"].includes(type)) {
			return { ...baseAction, selector: "", files: [] } as Action;
		}

		// Viewport
		if (["setViewportSize"].includes(type)) {
			return { ...baseAction, width: 1920, height: 1080 } as Action;
		}

		// Evaluate
		if (["evaluate", "evaluateHandle"].includes(type)) {
			return { ...baseAction, fn: "" } as Action;
		}

		// Locators
		if (["getByRole", "getByText", "getByLabel", "getByPlaceholder", "getByAltText", "getByTitle", "getByTestId"].includes(type)) {
			return { ...baseAction, text: "" } as Action;
		}

		// Scroll
		if (["scroll"].includes(type)) {
			return { ...baseAction, x: 0, y: 0 } as Action;
		}

		// Default: return base action
		return baseAction;
	};

	// Handle click to add primitive to sequence
	const handleClick = (e: React.MouseEvent) => {
		// Prevent drag from interfering with click
		e.stopPropagation();
		const newAction = createDefaultAction(template.type);
		addAction(newAction);
	};

	const colorClasses = {
		blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-600",
		green:
			"bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-600",
		purple:
			"bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-600",
		indigo:
			"bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 hover:border-indigo-300 dark:hover:border-indigo-600",
		teal: "bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800 hover:border-teal-300 dark:hover:border-teal-600",
		gray: "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
		cyan: "bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800 hover:border-cyan-300 dark:hover:border-cyan-600",
		orange:
			"bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-600",
		amber:
			"bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 hover:border-amber-300 dark:hover:border-amber-600",
		pink: "bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 hover:border-pink-300 dark:hover:border-pink-600",
		violet:
			"bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800 hover:border-violet-300 dark:hover:border-violet-600",
		emerald:
			"bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-600",
	};

	return (
		<div
			ref={setNodeRef}
			{...attributes}
			onClick={handleClick}
			className={`group relative border rounded-lg p-3 cursor-pointer transition-all ${
				colorClasses[template.color as keyof typeof colorClasses]
			} ${isDragging ? "opacity-50 scale-95" : "hover:shadow-md"}`}
		>
			<div className="flex items-center gap-3">
				<div className="text-2xl flex-shrink-0">{template.icon}</div>
				<div className="flex-1 min-w-0">
					<h4 className="font-medium text-gray-900 dark:text-white text-sm">
						{template.label}
					</h4>
					<p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
						{template.description}
					</p>
				</div>
				<div
					{...listeners}
					className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
					onClick={(e) => e.stopPropagation()}
				>
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
						className="text-gray-400 dark:text-gray-500"
					>
						<circle cx="9" cy="12" r="1" />
						<circle cx="9" cy="5" r="1" />
						<circle cx="9" cy="19" r="1" />
						<circle cx="15" cy="12" r="1" />
						<circle cx="15" cy="5" r="1" />
						<circle cx="15" cy="19" r="1" />
					</svg>
				</div>
			</div>
		</div>
	);
}

export function PrimitiveActionPalette() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string>("all");

	// Get unique categories from generated actions
	const uniqueCategories = ["all", ...new Set(PRIMITIVE_ACTIONS.map((a) => a.category))];

	const filteredActions = PRIMITIVE_ACTIONS.filter((action) => {
		const matchesSearch =
			searchQuery === "" ||
			action.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
			action.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
			action.type.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesCategory =
			selectedCategory === "all" || action.category === selectedCategory;

		return matchesSearch && matchesCategory;
	});

	// Group actions by category for better organization
	const groupedActions = filteredActions.reduce((acc, action) => {
		if (!acc[action.category]) {
			acc[action.category] = [];
		}
		acc[action.category].push(action);
		return acc;
	}, {} as Record<string, PrimitiveActionTemplate[]>);

	return (
		<div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
			{/* Header */}
			<div className="p-4 border-b border-gray-200 dark:border-gray-700">
				<h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
					Primitive Actions
				</h3>

				{/* Search */}
				<div className="relative mb-3">
					<div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
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
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search actions..."
						className="w-full pl-10 pr-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				{/* Category Filter */}
				<div className="flex gap-1 overflow-x-auto pb-1">
					{uniqueCategories.map((category) => {
						const count = category === "all"
							? PRIMITIVE_ACTIONS.length
							: PRIMITIVE_ACTIONS.filter(a => a.category === category).length;
						return (
							<button
								key={category}
								onClick={() => setSelectedCategory(category)}
								className={`px-2 py-1 text-xs rounded font-medium whitespace-nowrap transition-colors ${
									selectedCategory === category
										? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
										: "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
								}`}
							>
								{category} ({count})
							</button>
						);
					})}
				</div>
			</div>

			{/* Actions List */}
			<div className="flex-1 overflow-y-auto p-4 space-y-4">
				{filteredActions.length === 0 ? (
					<div className="text-center py-8">
						<p className="text-sm text-gray-500 dark:text-gray-400">
							No actions found
						</p>
					</div>
				) : selectedCategory === "all" ? (
					<>
						{/* Group by category when showing all */}
						{Object.entries(groupedActions).sort(([a], [b]) => a.localeCompare(b)).map(([category, actions]) => (
							<div key={category}>
								<h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
									{category} ({actions.length})
								</h4>
								<div className="space-y-2">
									{actions.map((template) => (
										<DraggablePrimitiveAction
											key={template.type}
											template={template}
										/>
									))}
								</div>
							</div>
						))}
					</>
				) : (
					<>
						{/* Flat list when filtering by category */}
						{filteredActions.map((template) => (
							<DraggablePrimitiveAction
								key={template.type}
								template={template}
							/>
						))}
					</>
				)}
			</div>

			{/* Footer */}
			<div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
				<p className="text-xs text-gray-500 dark:text-gray-400 text-center">
					{filteredActions.length} of {PRIMITIVE_ACTIONS.length} actions • Drag to add
				</p>
			</div>
		</div>
	);
}
