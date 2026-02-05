"use client";

import { useDraggable } from "@dnd-kit/core";
import { useState } from "react";
import type { ActionFile } from "../../../lib/types";
import { useActions } from "../../hooks/use-actions";

interface DraggableActionProps {
	action: ActionFile;
}

function DraggableAction({ action }: DraggableActionProps) {
	const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
		id: `action-${action.id}`,
		data: { action },
	});

	return (
		<div
			ref={setNodeRef}
			{...listeners}
			{...attributes}
			className={`group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 cursor-grab active:cursor-grabbing transition-all ${
				isDragging
					? "opacity-50 scale-95"
					: "hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600"
			}`}
		>
			{/* Drag Handle */}
			<div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
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

			<div className="ml-6">
				<h4 className="font-medium text-gray-900 dark:text-white text-sm">
					{action.name}
				</h4>
				<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
					{action.definition.description}
				</p>
				<div className="flex items-center gap-2 mt-2">
					<span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
						{action.definition.type}
					</span>
					<span className="text-xs text-gray-400 dark:text-gray-500">
						{action.definition.primitives.length} action
						{action.definition.primitives.length !== 1 ? "s" : ""}
					</span>
				</div>
			</div>
		</div>
	);
}

export function ActionPalette() {
	const { actions, loading, error } = useActions();
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedType, setSelectedType] = useState<string>("all");

	const filteredActions = actions.filter((action) => {
		const matchesSearch =
			searchQuery === "" ||
			action.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			action.definition.description
				.toLowerCase()
				.includes(searchQuery.toLowerCase());

		const matchesType =
			selectedType === "all" || action.definition.type === selectedType;

		return matchesSearch && matchesType;
	});

	const actionTypes = ["all", "modal", "form", "navigation", "interaction"];

	if (error) {
		return (
			<div className="h-full flex items-center justify-center p-4">
				<div className="text-center">
					<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
			{/* Header */}
			<div className="p-4 border-b border-gray-200 dark:border-gray-700">
				<h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
					Action Library
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

				{/* Type Filter */}
				<div className="flex gap-1 overflow-x-auto">
					{actionTypes.map((type) => (
						<button
							key={type}
							onClick={() => setSelectedType(type)}
							className={`px-2 py-1 text-xs rounded font-medium whitespace-nowrap transition-colors ${
								selectedType === type
									? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
									: "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
							}`}
						>
							{type}
						</button>
					))}
				</div>
			</div>

			{/* Actions List */}
			<div className="flex-1 overflow-y-auto p-4 space-y-2">
				{loading ? (
					<div className="text-center py-8">
						<div className="text-sm text-gray-500 dark:text-gray-400">
							Loading actions...
						</div>
					</div>
				) : filteredActions.length === 0 ? (
					<div className="text-center py-8">
						<p className="text-sm text-gray-500 dark:text-gray-400">
							{searchQuery ? "No actions found" : "No actions yet"}
						</p>
						{!searchQuery && (
							<button className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2">
								Create your first action
							</button>
						)}
					</div>
				) : (
					<>
						{filteredActions.map((action) => (
							<DraggableAction key={action.id} action={action} />
						))}
					</>
				)}
			</div>

			{/* Footer */}
			<div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
				<p className="text-xs text-gray-500 dark:text-gray-400 text-center">
					Drag actions to add them to your flow
				</p>
			</div>
		</div>
	);
}
