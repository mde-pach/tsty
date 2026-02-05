"use client";

import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	DragOverlay,
	type DragStartEvent,
} from "@dnd-kit/core";
import { useEffect, useState } from "react";
import type { Action, ActionFile, ActionType } from "../../../lib/types";
import { useActionEditor } from "../../contexts/action-editor-context";
import { DependencySelector } from "../dependency-selector";
import { ActionSequenceEditor } from "./action-sequence-editor";
import { ActionPropertyEditor } from "./action-property-editor";
import { PrimitiveActionPalette } from "./primitive-action-palette";

interface ActionComposerProps {
	onSave?: () => void;
}

export function ActionComposer({ onSave }: ActionComposerProps) {
	const {
		name,
		definition,
		updateName,
		updateDefinition,
		addAction,
		selectedActionIndex,
		isDirty,
		canUndo,
		canRedo,
		lastSaved,
		undo,
		redo,
		save,
	} = useActionEditor();

	const [activeId, setActiveId] = useState<string | null>(null);
	const [showJsonView, setShowJsonView] = useState(false);
	const [availableActions, setAvailableActions] = useState<ActionFile[]>([]);

	// Fetch available actions for dependency selection
	useEffect(() => {
		const fetchActions = async () => {
			try {
				const response = await fetch("/api/actions");
				const data = await response.json();
				if (data.success) {
					setAvailableActions(data.data);
				}
			} catch (error) {
				console.error("Failed to fetch actions:", error);
			}
		};

		fetchActions();
	}, []);

	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id as string);
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (!over) {
			setActiveId(null);
			return;
		}

		// Dragging from primitive palette to sequence
		if (active.id.toString().startsWith("primitive-")) {
			const actionType = active.id
				.toString()
				.replace("primitive-", "") as ActionType;

			// Create new action with default properties
			const newAction = createDefaultAction(actionType);
			addAction(newAction);
		}

		setActiveId(null);
	};

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

		// Actions that need key (+ optional selector)
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

	const handleSave = async () => {
		await save();
		if (onSave) {
			onSave();
		}
	};

	const getSaveStatusText = () => {
		if (!isDirty && lastSaved) {
			return "Saved";
		}
		if (isDirty) {
			return "Unsaved changes";
		}
		return "No changes";
	};

	return (
		<DndContext
			id="action-composer-dnd"
			collisionDetection={closestCenter}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			<div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
				{/* Header */}
				<div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
					{/* Top Bar */}
					<div className="px-6 py-4">
						<div className="flex items-start justify-between gap-4">
							<div className="flex-1 min-w-0">
								{/* Action Name */}
								<input
									type="text"
									value={name}
									onChange={(e) => updateName(e.target.value)}
									placeholder="Action name (e.g., Login, Search, Add to cart)"
									className="w-full px-3 py-2 text-xl font-semibold bg-transparent border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none transition-colors"
								/>

								{/* Description */}
								<input
									type="text"
									value={definition.description || ""}
									onChange={(e) =>
										updateDefinition({ description: e.target.value })
									}
									placeholder="Brief description of what this action does"
									className="w-full px-3 py-1.5 mt-1 text-sm bg-transparent border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded text-gray-600 dark:text-gray-400 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none transition-colors"
								/>
							</div>

							{/* Actions */}
							<div className="flex items-center gap-2">
								{/* Save Status */}
								<div className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-900">
									<div
										className={`w-2 h-2 rounded-full ${
											isDirty
												? "bg-amber-500"
												: lastSaved
													? "bg-green-500"
													: "bg-gray-400"
										}`}
									/>
									<span className="text-xs text-gray-600 dark:text-gray-400">
										{getSaveStatusText()}
									</span>
								</div>

								{/* Undo/Redo */}
								<div className="flex items-center gap-1">
									<button
										onClick={undo}
										disabled={!canUndo}
										title="Undo (Cmd+Z)"
										className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
											<path d="M3 7v6h6" />
											<path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />
										</svg>
									</button>
									<button
										onClick={redo}
										disabled={!canRedo}
										title="Redo (Cmd+Shift+Z)"
										className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
											<path d="M21 7v6h-6" />
											<path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7" />
										</svg>
									</button>
								</div>

								{/* View Toggle */}
								<button
									onClick={() => setShowJsonView(!showJsonView)}
									className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${
										showJsonView
											? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
											: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
									}`}
									title="Toggle JSON view"
								>
									{showJsonView ? "Visual" : "JSON"}
								</button>

								{/* Save Button */}
								<button
									onClick={handleSave}
									disabled={!isDirty}
									className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-md text-sm font-medium transition-colors disabled:cursor-not-allowed"
								>
									Save
								</button>
							</div>
						</div>
					</div>

					{/* Action Type and Settings */}
					<div className="px-6 pb-4">
						<div className="flex items-start gap-4">
							{/* Action Type Badge */}
							<div className="flex items-center gap-2">
								<span className="px-2 py-1 text-xs font-medium rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
									Reusable Action
								</span>
								<span className="text-xs text-gray-500 dark:text-gray-400">
									{(definition.primitives || []).length} primitive
									{(definition.primitives || []).length !== 1 ? "s" : ""}
								</span>
							</div>

							{/* Dependencies */}
							<div className="flex-1 max-w-md">
								<label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
									Dependencies
								</label>
								<DependencySelector
									type="action"
									currentId={undefined}
									selectedDependencies={definition.dependencies || []}
									availableItems={availableActions.map((a) => ({
										id: a.id,
										name: a.name,
										dependencies: a.definition.dependencies,
									}))}
									onChange={(dependencies) =>
										updateDefinition({ dependencies })
									}
									maxDependencies={10}
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Main Content */}
				{showJsonView ? (
					// JSON View
					<div className="flex-1 overflow-hidden p-6">
						<div className="h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
							<div className="h-full overflow-auto p-4">
								<pre className="text-xs font-mono text-gray-900 dark:text-white">
									{JSON.stringify(definition, null, 2)}
								</pre>
							</div>
						</div>
					</div>
				) : (
					// Visual Editor
					<div className="flex-1 flex overflow-hidden">
						{/* Left Panel - Primitive Palette */}
						<div className="w-80 border-r border-gray-200 dark:border-gray-700">
							<PrimitiveActionPalette />
						</div>

						{/* Middle Panel - Action Sequence */}
						<div className="flex-1 border-r border-gray-200 dark:border-gray-700">
							<ActionSequenceEditor />
						</div>

						{/* Right Panel - Property Editor */}
						<div className="w-80">
							<ActionPropertyEditor />
						</div>
					</div>
				)}

				{/* Drag Overlay */}
				<DragOverlay>
					{activeId ? (
						<div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-600 rounded-lg p-3 shadow-lg">
							<div className="text-sm font-medium text-blue-700 dark:text-blue-300">
								{activeId.replace("primitive-", "")}
							</div>
						</div>
					) : null}
				</DragOverlay>
			</div>
		</DndContext>
	);
}
