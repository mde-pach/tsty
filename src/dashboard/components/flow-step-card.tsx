"use client";

import { useState } from "react";
import type { FlowStep } from "@/lib/types";
import { Badge, Card } from "./ui";

interface FlowStepCardProps {
	step: FlowStep;
	stepNumber: number;
	isExpanded?: boolean;
}

export function FlowStepCard({
	step,
	stepNumber,
	isExpanded: defaultExpanded = false,
}: FlowStepCardProps) {
	const [isExpanded, setIsExpanded] = useState(defaultExpanded);

	const actionCount = step.actions?.length || 0;
	const assertionCount = step.assertions?.length || 0;
	const hasCapture =
		step.capture?.screenshot || step.capture?.html || step.capture?.console;

	return (
		<Card padding="none" className="overflow-hidden">
			{/* Step Header - Always Visible */}
			<button
				onClick={() => setIsExpanded(!isExpanded)}
				className="w-full p-4 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
			>
				{/* Step Number */}
				<div className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full flex items-center justify-center font-semibold text-sm">
					{stepNumber}
				</div>

				{/* Step Info */}
				<div className="flex-1 min-w-0">
					<div className="flex items-start justify-between gap-3 mb-2">
						<h3 className="font-semibold text-gray-900 dark:text-white">
							{step.name}
						</h3>
						<svg
							className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
								isExpanded ? "rotate-180" : ""
							}`}
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</div>

					{/* URL */}
					<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
						<svg
							className="w-4 h-4 flex-shrink-0"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
							/>
						</svg>
						<span className="truncate">{step.url}</span>
					</div>

					{/* Metadata Badges */}
					<div className="flex flex-wrap items-center gap-2">
						{actionCount > 0 && (
							<Badge variant="info" size="sm">
								<svg
									className="w-3 h-3"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M13 10V3L4 14h7v7l9-11h-7z"
									/>
								</svg>
								{actionCount} {actionCount === 1 ? "action" : "actions"}
							</Badge>
						)}

						{assertionCount > 0 && (
							<Badge variant="success" size="sm">
								<svg
									className="w-3 h-3"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								{assertionCount}{" "}
								{assertionCount === 1 ? "assertion" : "assertions"}
							</Badge>
						)}

						{hasCapture && (
							<Badge variant="neutral" size="sm">
								<svg
									className="w-3 h-3"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
									/>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
									/>
								</svg>
								Capture
							</Badge>
						)}

						{step.timeout && (
							<Badge variant="warning" size="sm">
								<svg
									className="w-3 h-3"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								{step.timeout}ms
							</Badge>
						)}
					</div>
				</div>
			</button>

			{/* Expanded Content */}
			{isExpanded && (
				<div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
					{/* Actions */}
					{step.actions && step.actions.length > 0 && (
						<div className="mb-4">
							<h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
								<svg
									className="w-4 h-4 text-info-600 dark:text-info-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M13 10V3L4 14h7v7l9-11h-7z"
									/>
								</svg>
								Actions ({step.actions.length})
							</h4>
							<div className="space-y-2">
								{step.actions.map((actionId, index) => (
									<div
										key={index}
										className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-3 py-2 rounded border border-gray-200 dark:border-gray-700"
									>
										<svg
											className="w-4 h-4 text-info-500 flex-shrink-0"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 5l7 7-7 7"
											/>
										</svg>
										<span className="font-mono">{actionId}</span>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Assertions */}
					{step.assertions && step.assertions.length > 0 && (
						<div className="mb-4">
							<h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
								<svg
									className="w-4 h-4 text-success-600 dark:text-success-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								Assertions ({step.assertions.length})
							</h4>
							<div className="space-y-2">
								{step.assertions.map((assertion, index) => (
									<div
										key={index}
										className="text-sm bg-white dark:bg-gray-800 px-3 py-2 rounded border border-gray-200 dark:border-gray-700"
									>
										<div className="flex items-start gap-2">
											<svg
												className="w-4 h-4 text-success-500 flex-shrink-0 mt-0.5"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M5 13l4 4L19 7"
												/>
											</svg>
											<div className="flex-1">
												<div className="font-medium text-gray-900 dark:text-white">
													{assertion.type}
													{assertion.selector && (
														<span className="ml-2 font-mono text-xs text-gray-600 dark:text-gray-400">
															{assertion.selector}
														</span>
													)}
												</div>
												{assertion.expected !== undefined && (
													<div className="text-gray-600 dark:text-gray-400 mt-1">
														Expected:{" "}
														<span className="font-mono">
															{String(assertion.expected)}
														</span>
													</div>
												)}
												{assertion.attribute && (
													<div className="text-gray-600 dark:text-gray-400 mt-1">
														Attribute:{" "}
														<span className="font-mono">
															{assertion.attribute}
														</span>
													</div>
												)}
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Capture Settings */}
					{hasCapture && (
						<div>
							<h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
								<svg
									className="w-4 h-4 text-gray-600 dark:text-gray-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
									/>
								</svg>
								Capture Settings
							</h4>
							<div className="flex flex-wrap gap-2">
								{step.capture?.screenshot && (
									<Badge variant="neutral" size="sm">
										Screenshot
									</Badge>
								)}
								{step.capture?.html && (
									<Badge variant="neutral" size="sm">
										HTML
									</Badge>
								)}
								{step.capture?.console && (
									<Badge variant="neutral" size="sm">
										Console Logs
									</Badge>
								)}
							</div>
						</div>
					)}
				</div>
			)}
		</Card>
	);
}
