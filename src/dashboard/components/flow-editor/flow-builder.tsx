"use client";

import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	DragOverlay,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useEffect, useState } from "react";
import type { FlowFile, FlowStep } from "../../../lib/types";
import { useFlowEditor } from "../../contexts/flow-editor-context";
import { DependencySelector } from "../dependency-selector";
import { TagPicker } from "../tag-picker";
import { ActionPalette } from "./action-palette";
import { FlowCanvas } from "./flow-canvas";
import { StepEditorPanel } from "./step-editor-panel";

export function FlowBuilder() {
	const {
		flow,
		isDirty,
		isSaving,
		canUndo,
		canRedo,
		lastSaved,
		updateFlow,
		addStep,
		reorderSteps,
		undo,
		redo,
		save,
	} = useFlowEditor();

	const [activeId, setActiveId] = useState<string | null>(null);
	const [availableFlows, setAvailableFlows] = useState<FlowFile[]>([]);

	// Fetch available flows for dependency selection
	useEffect(() => {
		const fetchFlows = async () => {
			try {
				const response = await fetch("/api/flows");
				const data = await response.json();
				if (data.success) {
					setAvailableFlows(data.data);
				}
			} catch (error) {
				console.error("Failed to fetch flows:", error);
			}
		};

		fetchFlows();
	}, []);

	const handleDragStart = (event: any) => {
		setActiveId(event.active.id);
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		setActiveId(null);

		if (!over) return;

		// Handle dragging action to canvas
		if (active.id.toString().startsWith("action-")) {
			const actionData = active.data.current?.action;
			if (actionData) {
				// Create a new step with this action
				const newStep: FlowStep = {
					name: actionData.name,
					url: flow.baseUrl || "/",
					actions: [actionData.id],
					capture: {
						screenshot: false,
						html: false,
						console: false,
					},
				};
				addStep(newStep);
			}
			return;
		}

		// Handle reordering steps
		if (
			active.id.toString().startsWith("step-") &&
			over.id.toString().startsWith("step-")
		) {
			const activeIndex = parseInt(active.id.toString().replace("step-", ""));
			const overIndex = parseInt(over.id.toString().replace("step-", ""));

			if (activeIndex !== overIndex) {
				reorderSteps(activeIndex, overIndex);
			}
		}
	};

	return (
		<DndContext
			collisionDetection={closestCenter}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			<div className="h-screen flex flex-col">
				{/* Top Bar */}
				<div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
					<div className="flex items-center justify-between">
						{/* Left: Flow Info */}
						<div className="flex items-center gap-4 flex-1 min-w-0">
							<div className="flex-1 min-w-0">
								<input
									type="text"
									value={flow.name}
									onChange={(e) => updateFlow({ name: e.target.value })}
									className="text-xl font-semibold bg-transparent border-none text-gray-900 dark:text-white focus:outline-none focus:ring-0 w-full"
									placeholder="Flow name"
								/>
								<input
									type="text"
									value={flow.description}
									onChange={(e) => updateFlow({ description: e.target.value })}
									className="text-sm bg-transparent border-none text-gray-600 dark:text-gray-400 focus:outline-none focus:ring-0 w-full mt-1"
									placeholder="Add a description..."
								/>
							</div>
						</div>

						{/* Right: Actions */}
						<div className="flex items-center gap-3">
							{/* Status */}
							{isSaving && (
								<span className="text-xs text-primary-600 dark:text-primary-400 flex items-center gap-1.5">
									<svg
										className="w-3 h-3 animate-spin"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
										/>
									</svg>
									Saving...
								</span>
							)}
							{!isSaving && isDirty && (
								<span className="text-xs text-orange-600 dark:text-orange-400">
									Unsaved changes
								</span>
							)}
							{!isSaving && lastSaved && !isDirty && (
								<span className="text-xs text-green-600 dark:text-green-400">
									Saved at {new Date(lastSaved).toLocaleTimeString()}
								</span>
							)}

							{/* Undo/Redo */}
							<div className="flex items-center gap-1 border-l border-gray-200 dark:border-gray-700 pl-3">
								<button
									onClick={undo}
									disabled={!canUndo}
									className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
									title="Undo (Cmd+Z)"
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
										<path d="M3 7v6h6" />
										<path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
									</svg>
								</button>
								<button
									onClick={redo}
									disabled={!canRedo}
									className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
									title="Redo (Cmd+Shift+Z)"
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
										<path d="M21 7v6h-6" />
										<path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
									</svg>
								</button>
							</div>

							{/* Save */}
							<button
								onClick={save}
								disabled={!isDirty}
								className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								title="Save (Cmd+S)"
							>
								Save
							</button>
						</div>
					</div>

					{/* Additional Settings */}
					<div className="mt-4 grid grid-cols-2 gap-4">
						<div>
							<label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
								Base URL
							</label>
							<input
								type="text"
								value={flow.baseUrl}
								onChange={(e) => updateFlow({ baseUrl: e.target.value })}
								className="w-full px-3 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="http://localhost:3000"
							/>
						</div>
						<div>
							<label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
								Devices
							</label>
							<div className="flex gap-2">
								<label className="flex items-center">
									<input
										type="checkbox"
										checked={flow.devices?.includes("desktop") || false}
										onChange={(e) => {
											const devices = flow.devices || [];
											const newDevices = e.target.checked
												? [...devices, "desktop" as const]
												: devices.filter((d) => d !== "desktop");
											updateFlow({
												devices: newDevices.length > 0 ? newDevices : undefined,
											});
										}}
										className="w-4 h-4 text-blue-600 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
									/>
									<span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
										Desktop
									</span>
								</label>
								<label className="flex items-center">
									<input
										type="checkbox"
										checked={flow.devices?.includes("mobile") || false}
										onChange={(e) => {
											const devices = flow.devices || [];
											const newDevices = e.target.checked
												? [...devices, "mobile" as const]
												: devices.filter((d) => d !== "mobile");
											updateFlow({
												devices: newDevices.length > 0 ? newDevices : undefined,
											});
										}}
										className="w-4 h-4 text-blue-600 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
									/>
									<span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
										Mobile
									</span>
								</label>
							</div>
						</div>
						<div>
							<label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
								Tags
							</label>
							<TagPicker
								selectedTags={flow.tags || []}
								onChange={(tags) => updateFlow({ tags })}
								placeholder="Add tags..."
							/>
						</div>
						<div>
							<label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
								Dependencies
							</label>
							<DependencySelector
								type="flow"
								selectedDependencies={flow.dependencies || []}
								availableItems={availableFlows.map((f) => ({
									id: f.id,
									name: f.name,
									dependencies: f.flow.dependencies,
								}))}
								onChange={(dependencies) => updateFlow({ dependencies })}
								maxDependencies={10}
							/>
						</div>
					</div>
				</div>

				{/* Main Editor - 3 Panels */}
				<div className="flex-1 flex overflow-hidden">
					{/* Left: Action Palette */}
					<div className="w-80 border-r border-gray-200 dark:border-gray-700 overflow-hidden">
						<ActionPalette />
					</div>

					{/* Center: Flow Canvas */}
					<div className="flex-1 overflow-hidden">
						<FlowCanvas />
					</div>

					{/* Right: Step Editor */}
					<div className="w-96 border-l border-gray-200 dark:border-gray-700 overflow-hidden">
						<StepEditorPanel />
					</div>
				</div>
			</div>

			{/* Drag Overlay */}
			<DragOverlay>
				{activeId && activeId.startsWith("action-") && (
					<div className="bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-400 rounded-lg p-3 shadow-xl">
						<div className="font-medium text-gray-900 dark:text-white text-sm">
							Dragging action...
						</div>
					</div>
				)}
			</DragOverlay>
		</DndContext>
	);
}
