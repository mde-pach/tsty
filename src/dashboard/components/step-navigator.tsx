"use client";

import type { StepResult } from "@/lib/types";
import { Badge } from "./ui";

interface StepNavigatorProps {
	steps: StepResult[];
	activeStepIndex: number;
	onStepClick: (index: number) => void;
}

export function StepNavigator({
	steps,
	activeStepIndex,
	onStepClick,
}: StepNavigatorProps) {
	const formatDuration = (duration?: number) => {
		if (!duration) return "—";
		const seconds = Math.floor(duration / 1000);
		return `${seconds}s`;
	};

	return (
		<div className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full overflow-y-auto custom-scrollbar">
			<div className="p-4 border-b border-gray-200 dark:border-gray-700">
				<h3 className="font-semibold text-gray-900 dark:text-white">
					Steps ({steps.length})
				</h3>
			</div>

			<div className="divide-y divide-gray-200 dark:divide-gray-700">
				{steps.map((step, index) => {
					const isActive = index === activeStepIndex;
					const hasFailed = !step.passed;

					return (
						<button
							key={index}
							onClick={() => onStepClick(index)}
							className={`w-full p-4 text-left transition-colors ${
								isActive
									? "bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-600"
									: hasFailed
										? "hover:bg-error-50 dark:hover:bg-error-900/10"
										: "hover:bg-gray-50 dark:hover:bg-gray-700/50"
							} ${isActive ? "pl-3" : "pl-4"}`}
						>
							{/* Step Header */}
							<div className="flex items-start gap-3 mb-2">
								{/* Status Icon */}
								<div className="flex-shrink-0 mt-0.5">
									{step.passed ? (
										<div className="w-6 h-6 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center">
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
													d="M5 13l4 4L19 7"
												/>
											</svg>
										</div>
									) : (
										<div className="w-6 h-6 bg-error-100 dark:bg-error-900/30 rounded-full flex items-center justify-center">
											<svg
												className="w-4 h-4 text-error-600 dark:text-error-400"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M6 18L18 6M6 6l12 12"
												/>
											</svg>
										</div>
									)}
								</div>

								{/* Step Info */}
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 mb-1">
										<span
											className={`text-sm font-medium ${
												isActive
													? "text-primary-900 dark:text-primary-100"
													: hasFailed
														? "text-error-900 dark:text-error-100"
														: "text-gray-900 dark:text-white"
											}`}
										>
											{index + 1}. {step.name}
										</span>
									</div>

									{/* Duration */}
									<div
										className={`text-xs ${
											isActive
												? "text-primary-700 dark:text-primary-300"
												: "text-gray-500 dark:text-gray-400"
										}`}
									>
										{formatDuration(step.duration)}
									</div>
								</div>
							</div>

							{/* Progress Bar */}
							{step.assertions && step.assertions.length > 0 && (
								<div className="mt-2">
									<div className="flex items-center gap-2 text-xs">
										<div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
											<div
												className={`h-full ${
													step.passed ? "bg-success-500" : "bg-error-500"
												}`}
												style={{
													width: `${(step.assertions.filter((a) => a.passed).length / step.assertions.length) * 100}%`,
												}}
											/>
										</div>
										<span
											className={`flex-shrink-0 ${
												isActive
													? "text-primary-700 dark:text-primary-300"
													: "text-gray-500 dark:text-gray-400"
											}`}
										>
											{step.assertions.filter((a) => a.passed).length}/
											{step.assertions.length}
										</span>
									</div>
								</div>
							)}
						</button>
					);
				})}
			</div>
		</div>
	);
}
