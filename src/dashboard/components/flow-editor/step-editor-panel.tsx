"use client";

import { useFlowEditor } from "../../contexts/flow-editor-context";
import { TagPicker } from "../tag-picker";
import { AssertionBuilder } from "./assertion-builder";

export function StepEditorPanel() {
	const { flow, selectedStepIndex, updateStep, selectStep } = useFlowEditor();

	if (selectedStepIndex === null) {
		return (
			<div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
				<div className="h-full flex items-center justify-center p-6">
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
								<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
								<polyline points="14 2 14 8 20 8" />
								<line x1="16" y1="13" x2="8" y2="13" />
								<line x1="16" y1="17" x2="8" y2="17" />
								<polyline points="10 9 9 9 8 9" />
							</svg>
						</div>
						<h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
							No step selected
						</h4>
						<p className="text-xs text-gray-500 dark:text-gray-400">
							Select a step from the canvas to edit its properties
						</p>
					</div>
				</div>
			</div>
		);
	}

	const step = flow.steps[selectedStepIndex];

	return (
		<div className="h-full flex flex-col bg-white dark:bg-gray-800">
			{/* Header */}
			<div className="p-4 border-b border-gray-200 dark:border-gray-700">
				<div className="flex items-center justify-between mb-2">
					<h3 className="text-sm font-semibold text-gray-900 dark:text-white">
						Edit Step {selectedStepIndex + 1}
					</h3>
					<button
						onClick={() => selectStep(null)}
						className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
						title="Close"
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
							<line x1="18" y1="6" x2="6" y2="18" />
							<line x1="6" y1="6" x2="18" y2="18" />
						</svg>
					</button>
				</div>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-y-auto p-4 space-y-4">
				{/* Name */}
				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						Step Name *
					</label>
					<input
						type="text"
						value={step.name || ""}
						onChange={(e) =>
							updateStep(selectedStepIndex, { name: e.target.value })
						}
						className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="e.g., Login to dashboard"
					/>
				</div>

				{/* URL */}
				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						URL *
					</label>
					<input
						type="text"
						value={step.url || ""}
						onChange={(e) =>
							updateStep(selectedStepIndex, { url: e.target.value })
						}
						className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="/dashboard"
					/>
					<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
						Relative to base URL or full URL
					</p>
				</div>

				{/* Timeout */}
				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						Timeout (ms)
					</label>
					<input
						type="number"
						value={step.timeout || ""}
						onChange={(e) =>
							updateStep(selectedStepIndex, {
								timeout: e.target.value ? parseInt(e.target.value) : undefined,
							})
						}
						className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="30000"
					/>
					<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
						Leave empty to use default (30000ms)
					</p>
				</div>

				{/* Capture Options */}
				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Capture Options
					</label>
					<div className="space-y-2">
						<label className="flex items-center">
							<input
								type="checkbox"
								checked={step.capture?.screenshot || false}
								onChange={(e) =>
									updateStep(selectedStepIndex, {
										capture: {
											...step.capture,
											screenshot: e.target.checked,
										},
									})
								}
								className="w-4 h-4 text-blue-600 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
							/>
							<span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
								Take screenshot
							</span>
						</label>
						<label className="flex items-center">
							<input
								type="checkbox"
								checked={step.capture?.html || false}
								onChange={(e) =>
									updateStep(selectedStepIndex, {
										capture: {
											...step.capture,
											html: e.target.checked,
										},
									})
								}
								className="w-4 h-4 text-blue-600 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
							/>
							<span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
								Capture HTML
							</span>
						</label>
						<label className="flex items-center">
							<input
								type="checkbox"
								checked={step.capture?.console || false}
								onChange={(e) =>
									updateStep(selectedStepIndex, {
										capture: {
											...step.capture,
											console: e.target.checked,
										},
									})
								}
								className="w-4 h-4 text-blue-600 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
							/>
							<span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
								Capture console logs
							</span>
						</label>
					</div>
				</div>

				{/* Actions */}
				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Actions
					</label>
					<div className="space-y-2">
						{step.actions && step.actions.length > 0 ? (
							<>
								{step.actions.map((actionId, index) => (
									<div
										key={index}
										className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700"
									>
										<span className="text-sm text-gray-900 dark:text-white">
											{actionId}
										</span>
										<button
											type="button"
											onClick={() => {
												const newActions = step.actions?.filter(
													(_, i) => i !== index,
												);
												updateStep(selectedStepIndex, { actions: newActions });
											}}
											className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400"
											title="Remove action"
										>
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
												<line x1="18" y1="6" x2="6" y2="18" />
												<line x1="6" y1="6" x2="18" y2="18" />
											</svg>
										</button>
									</div>
								))}
							</>
						) : (
							<p className="text-sm text-gray-500 dark:text-gray-400 italic">
								No actions yet. Actions will be added when you drag them to this
								step.
							</p>
						)}
					</div>
				</div>

				{/* Assertions */}
				<AssertionBuilder
					assertions={step.assertions || []}
					onChange={(assertions) =>
						updateStep(selectedStepIndex, { assertions })
					}
				/>
			</div>
		</div>
	);
}
