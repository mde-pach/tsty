"use client";

import type { Action } from "../../../lib/types";
import { useActionEditor } from "../../contexts/action-editor-context";

export function ActionPropertyEditor() {
	const { definition, selectedActionIndex, updateAction } = useActionEditor();

	if (selectedActionIndex === null) {
		return (
			<div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
				<div className="text-center max-w-sm px-4">
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
							<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
							<circle cx="12" cy="12" r="3" />
						</svg>
					</div>
					<h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
						No action selected
					</h4>
					<p className="text-xs text-gray-500 dark:text-gray-400">
						Select an action from the sequence to edit its properties
					</p>
				</div>
			</div>
		);
	}

	const action = definition.primitives[selectedActionIndex];
	if (!action) return null;

	const handleChange = (updates: Partial<Action>) => {
		updateAction(selectedActionIndex, updates);
	};

	const renderField = (label: string, field: string, type = "text", placeholder = "") => {
		const value = (action as any)[field] as string | number | undefined;
		return (
			<div>
				<label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
					{label}
				</label>
				<input
					type={type}
					value={value || ""}
					onChange={(e) => handleChange({ [field]: type === "number" ? Number(e.target.value) : e.target.value } as Partial<Action>)}
					placeholder={placeholder}
					className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				/>
			</div>
		);
	};

	const renderTextarea = (label: string, field: string, placeholder = "", rows = 3) => {
		const value = (action as any)[field] as string | undefined;
		return (
			<div>
				<label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
					{label}
				</label>
				<textarea
					value={value || ""}
					onChange={(e) => handleChange({ [field]: e.target.value } as Partial<Action>)}
					placeholder={placeholder}
					rows={rows}
					className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono"
				/>
			</div>
		);
	};

	const renderSelect = (label: string, field: string, options: string[]) => {
		const value = (action as any)[field] as string | undefined;
		return (
			<div>
				<label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
					{label}
				</label>
				<select
					value={value || options[0]}
					onChange={(e) => handleChange({ [field]: e.target.value } as Partial<Action>)}
					className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				>
					{options.map((option) => (
						<option key={option} value={option}>
							{option}
						</option>
					))}
				</select>
			</div>
		);
	};

	return (
		<div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
			{/* Header */}
			<div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
				<h3 className="text-sm font-semibold text-gray-900 dark:text-white">
					Properties
				</h3>
				<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
					<span className="font-medium">#{selectedActionIndex + 1}</span> - {action.type}
				</p>
			</div>

			{/* Properties Form */}
			<div className="flex-1 overflow-y-auto p-4 space-y-4">
				{/* Common fields */}
				{"selector" in action && renderField("Selector", "selector", "text", "CSS selector (e.g., button.submit, #username)")}
				{"value" in action && renderField("Value", "value", "text", "Value to input")}
				{"text" in action && renderField("Text", "text", "text", "Text content")}
				{"key" in action && renderField("Key", "key", "text", "Key name (e.g., Enter, Escape)")}
				{"url" in action && renderField("URL", "url", "text", "URL to navigate to")}
				{"path" in action && renderField("Path", "path", "text", "Screenshot file path")}

				{/* Numeric fields */}
				{"timeout" in action && renderField("Timeout (ms)", "timeout", "number", "1000")}
				{"x" in action && renderField("X Position", "x", "number", "0")}
				{"y" in action && renderField("Y Position", "y", "number", "0")}
				{"width" in action && renderField("Width", "width", "number", "1920")}
				{"height" in action && renderField("Height", "height", "number", "1080")}

				{/* Drag and drop */}
				{"source" in action && renderField("Source Selector", "source", "text", "Element to drag")}
				{"target" in action && renderField("Target Selector", "target", "text", "Drop target")}

				{/* Function/code fields */}
				{"fn" in action && renderTextarea("Function", "fn", "JavaScript function code")}

				{/* State selection */}
				{"state" in action && renderSelect("Load State", "state", ["load", "domcontentloaded", "networkidle"])}

				{/* Options object */}
				{"options" in action && renderTextarea("Options (JSON)", "options", '{"timeout": 5000}', 3)}

				{/* Description (common to all) */}
				{renderTextarea("Description (optional)", "description", "Brief note about this action", 2)}

				{/* Action Type Info */}
				<div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
					<div className="flex items-start gap-2">
						<svg
							className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<div className="flex-1">
							<p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">
								{action.type} Action
							</p>
							<p className="text-xs text-blue-700 dark:text-blue-300">
								Edit the properties above to configure this action. Changes are saved automatically.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
