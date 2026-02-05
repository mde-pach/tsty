"use client";

import { useDroppable } from "@dnd-kit/core";
import {
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { FlowStep } from "../../../lib/types";
import { useFlowEditor } from "../../contexts/flow-editor-context";

interface SortableStepProps {
	step: FlowStep;
	index: number;
	isSelected: boolean;
	onSelect: () => void;
	onRemove: () => void;
}

function SortableStep({
	step,
	index,
	isSelected,
	onSelect,
	onRemove,
}: SortableStepProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: `step-${index}`,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

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

			<div className="p-4 ml-4">
				{/* Step Number */}
				<div className="flex items-start justify-between gap-4">
					<div className="flex items-start gap-3 flex-1 min-w-0">
						<div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold flex items-center justify-center">
							{index + 1}
						</div>
						<div className="flex-1 min-w-0">
							<h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
								{step.name}
							</h4>
							<p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
								{step.url}
							</p>
							<div className="flex items-center gap-3 mt-2">
								{step.actions && step.actions.length > 0 && (
									<span className="text-xs text-gray-600 dark:text-gray-400">
										{step.actions.length} action
										{step.actions.length !== 1 ? "s" : ""}
									</span>
								)}
								{step.assertions && step.assertions.length > 0 && (
									<span className="text-xs text-gray-600 dark:text-gray-400">
										{step.assertions.length} assertion
										{step.assertions.length !== 1 ? "s" : ""}
									</span>
								)}
								{step.capture?.screenshot && (
									<span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
										📷 Screenshot
									</span>
								)}
							</div>
						</div>
					</div>

					{/* Remove Button */}
					<button
						onClick={(e) => {
							e.stopPropagation();
							onRemove();
						}}
						className="flex-shrink-0 p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded opacity-0 group-hover:opacity-100 transition-opacity"
						title="Remove step"
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
		</div>
	);
}

export function FlowCanvas() {
	const { flow, selectedStepIndex, selectStep, removeStep, reorderSteps } =
		useFlowEditor();

	const { setNodeRef } = useDroppable({
		id: "flow-canvas",
	});

	const stepIds = flow.steps.map((_, index) => `step-${index}`);

	return (
		<div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
			{/* Header */}
			<div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
				<div className="flex items-center justify-between">
					<div>
						<h3 className="text-sm font-semibold text-gray-900 dark:text-white">
							Flow Steps
						</h3>
						<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
							{flow.steps.length} step{flow.steps.length !== 1 ? "s" : ""}
						</p>
					</div>
				</div>
			</div>

			{/* Canvas */}
			<div ref={setNodeRef} className="flex-1 overflow-y-auto p-4">
				{flow.steps.length === 0 ? (
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
								No steps yet
							</h4>
							<p className="text-xs text-gray-500 dark:text-gray-400">
								Drag actions from the left panel to add steps to your flow
							</p>
						</div>
					</div>
				) : (
					<SortableContext
						items={stepIds}
						strategy={verticalListSortingStrategy}
					>
						<div className="space-y-3">
							{flow.steps.map((step, index) => (
								<SortableStep
									key={`step-${index}`}
									step={step}
									index={index}
									isSelected={selectedStepIndex === index}
									onSelect={() => selectStep(index)}
									onRemove={() => removeStep(index)}
								/>
							))}
						</div>
					</SortableContext>
				)}
			</div>
		</div>
	);
}
