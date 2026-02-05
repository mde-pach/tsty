"use client";

import { useDroppable } from "@dnd-kit/core";
import {
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Action } from "../../../lib/types";
import { useActionEditor } from "../../contexts/action-editor-context";

// Icon mapping for action types (shared with primitive palette)
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
	scroll: "📜",
};

interface SortableActionProps {
	action: Action;
	index: number;
	isSelected: boolean;
	onSelect: () => void;
	onRemove: () => void;
}

function SortableAction({
	action,
	index,
	isSelected,
	onSelect,
	onRemove,
}: SortableActionProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: `action-${index}`,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	// Get action details
	const getActionDisplay = () => {
		const icon = ACTION_ICONS[action.type] || "⚡";
		const label = action.type
			.replace(/([A-Z])/g, " $1")
			.replace(/^./, (str) => str.toUpperCase());

		// Build details string based on action properties
		let details = "";

		if ("selector" in action && action.selector) {
			details = action.selector;
			if ("value" in action && action.value) {
				details += ` = "${action.value}"`;
			}
			if ("text" in action && action.text) {
				details += `: "${action.text}"`;
			}
		} else if ("url" in action && action.url) {
			details = action.url;
		} else if ("key" in action && action.key) {
			details = action.key;
		} else if ("path" in action && action.path) {
			details = action.path;
		} else if ("timeout" in action && action.timeout) {
			details = `${action.timeout}ms`;
		} else if ("state" in action && action.state) {
			details = action.state;
		} else if ("source" in action && action.source) {
			details = `${action.source} → ${"target" in action ? action.target : ""}`;
		}

		return { icon, label, details };
	};

	const display = getActionDisplay();

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`group relative bg-white dark:bg-gray-800 border-2 rounded-lg transition-all ${
				isDragging
					? "opacity-50 border-blue-300 dark:border-blue-600 shadow-lg"
					: isSelected
						? "border-blue-500 dark:border-blue-400 shadow-md"
						: "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
			}`}
			onClick={onSelect}
		>
			{/* Drag Handle */}
			<div
				{...attributes}
				{...listeners}
				className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
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

			<div className="p-3 ml-4 flex items-start justify-between gap-3">
				<div className="flex items-start gap-3 flex-1 min-w-0">
					<div className="text-2xl flex-shrink-0">{display.icon}</div>
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2">
							<span className="text-xs font-medium text-gray-500 dark:text-gray-400">
								#{index + 1}
							</span>
							<h4 className="font-medium text-gray-900 dark:text-white text-sm">
								{display.label}
							</h4>
						</div>
						{display.details && (
							<p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate font-mono">
								{display.details}
							</p>
						)}
						{action.description && (
							<p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
								{action.description}
							</p>
						)}
					</div>
				</div>

				{/* Remove Button */}
				<button
					onClick={(e) => {
						e.stopPropagation();
						onRemove();
					}}
					className="flex-shrink-0 p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded opacity-0 group-hover:opacity-100 transition-opacity"
					title="Remove action"
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
					>
						<path d="M3 6h18" />
						<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
						<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
					</svg>
				</button>
			</div>
		</div>
	);
}

export function ActionSequenceEditor() {
	const { definition, selectedActionIndex, selectAction, removeAction } =
		useActionEditor();

	const { setNodeRef } = useDroppable({
		id: "action-sequence",
	});

	const actionIds = (definition.primitives || []).map((_, index) => `action-${index}`);

	return (
		<div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
			{/* Header */}
			<div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
				<h3 className="text-sm font-semibold text-gray-900 dark:text-white">
					Action Sequence
				</h3>
				<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
					{(definition.primitives || []).length} action
					{(definition.primitives || []).length !== 1 ? "s" : ""}
				</p>
			</div>

			{/* Sequence Canvas */}
			<div ref={setNodeRef} className="flex-1 overflow-y-auto p-4">
				{(definition.primitives || []).length === 0 ? (
					<div className="h-full flex items-center justify-center">
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
									<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
									<polyline points="17 8 12 3 7 8" />
									<line x1="12" x2="12" y1="3" y2="15" />
								</svg>
							</div>
							<h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
								No actions yet
							</h4>
							<p className="text-xs text-gray-500 dark:text-gray-400">
								Drag primitive actions from the left to build your sequence
							</p>
						</div>
					</div>
				) : (
					<SortableContext
						items={actionIds}
						strategy={verticalListSortingStrategy}
					>
						<div className="space-y-2">
							{(definition.primitives || []).map((action, index) => (
								<SortableAction
									key={`action-${index}`}
									action={action}
									index={index}
									isSelected={selectedActionIndex === index}
									onSelect={() => selectAction(index)}
									onRemove={() => removeAction(index)}
								/>
							))}
						</div>
					</SortableContext>
				)}
			</div>
		</div>
	);
}
