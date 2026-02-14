"use client";

import Image from "next/image";
import { useState } from "react";
import type { StepResult } from "@/lib/types";
import { Badge, Button, Card } from "./ui";

interface StepDetailViewProps {
	step: StepResult;
	stepNumber: number;
	totalSteps: number;
	onPrevious: () => void;
	onNext: () => void;
	screenshotPath?: string;
}

type DetailTab = "assertions" | "console" | "html";

export function StepDetailView({
	step,
	stepNumber,
	totalSteps,
	onPrevious,
	onNext,
	screenshotPath,
}: StepDetailViewProps) {
	const [activeTab, setActiveTab] = useState<DetailTab>("assertions");
	const [imageError, setImageError] = useState(false);

	const formatDuration = (duration?: number) => {
		if (!duration) return "—";
		const seconds = Math.floor(duration / 1000);
		const ms = duration % 1000;
		return `${seconds}.${ms.toString().padStart(3, "0")}s`;
	};

	const hasConsole = step.console && step.console.length > 0;
	const hasHtml = !!step.html;

	return (
		<div className="flex flex-col h-full bg-white dark:bg-gray-800">
			{/* Header */}
			<div className="border-b border-gray-200 dark:border-gray-700 p-4">
				<div className="flex items-start justify-between gap-4 mb-3">
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2 mb-1">
							<h2 className="text-h3 text-gray-900 dark:text-white truncate">
								Step {stepNumber}: {step.name}
							</h2>
							<Badge variant={step.passed ? "success" : "error"}>
								{step.passed ? "Passed" : "Failed"}
							</Badge>
						</div>
						<div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
							<span className="flex items-center gap-1">
								<svg
									className="w-4 h-4"
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
								{formatDuration(step.duration)}
							</span>
							<span>•</span>
							<span className="truncate">{step.url}</span>
						</div>
					</div>
				</div>

				{/* Navigation */}
				<div className="flex items-center gap-2">
					<Button
						variant="secondary"
						size="sm"
						onClick={onPrevious}
						disabled={stepNumber === 1}
					>
						<svg
							className="w-4 h-4 mr-1"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M15 19l-7-7 7-7"
							/>
						</svg>
						Previous
					</Button>
					<Button
						variant="secondary"
						size="sm"
						onClick={onNext}
						disabled={stepNumber === totalSteps}
					>
						Next
						<svg
							className="w-4 h-4 ml-1"
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
					</Button>
					<span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
						{stepNumber} of {totalSteps}
					</span>
				</div>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
				{/* Screenshot */}
				{screenshotPath && step.screenshots.length > 0 && (
					<Card>
						<h3 className="text-h3 text-gray-900 dark:text-white mb-3 flex items-center gap-2">
							<svg
								className="w-5 h-5 text-gray-600 dark:text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
							Screenshot
						</h3>
						<div className="relative bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
							{!imageError ? (
								<img
									src={screenshotPath}
									alt={`Screenshot for ${step.name}`}
									className="w-full h-auto"
									onError={() => setImageError(true)}
								/>
							) : (
								<div className="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400">
									<div className="text-center">
										<svg
											className="w-12 h-12 mx-auto mb-2 opacity-50"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
											/>
										</svg>
										<p className="text-sm">Screenshot not available</p>
									</div>
								</div>
							)}
						</div>
					</Card>
				)}

				{/* Tabs */}
				<Card padding="none">
					{/* Tab Headers */}
					<div className="border-b border-gray-200 dark:border-gray-700 px-4">
						<nav className="flex -mb-px space-x-6">
							<button
								onClick={() => setActiveTab("assertions")}
								className={`py-3 border-b-2 font-medium text-sm transition-colors ${
									activeTab === "assertions"
										? "border-primary-500 text-primary-600 dark:text-primary-400"
										: "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
								}`}
							>
								Assertions ({step.assertions.length})
							</button>
							{hasConsole && (
								<button
									onClick={() => setActiveTab("console")}
									className={`py-3 border-b-2 font-medium text-sm transition-colors ${
										activeTab === "console"
											? "border-primary-500 text-primary-600 dark:text-primary-400"
											: "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
									}`}
								>
									Console ({step.console?.length || 0})
								</button>
							)}
							{hasHtml && (
								<button
									onClick={() => setActiveTab("html")}
									className={`py-3 border-b-2 font-medium text-sm transition-colors ${
										activeTab === "html"
											? "border-primary-500 text-primary-600 dark:text-primary-400"
											: "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
									}`}
								>
									HTML
								</button>
							)}
						</nav>
					</div>

					{/* Tab Content */}
					<div className="p-4">
						{/* Assertions Tab */}
						{activeTab === "assertions" && (
							<div className="space-y-3">
								{step.assertions.length === 0 ? (
									<p className="text-center text-gray-500 dark:text-gray-400 py-8">
										No assertions for this step
									</p>
								) : (
									step.assertions.map((assertion, index) => (
										<div
											key={index}
											className={`p-3 rounded-lg border ${
												assertion.passed
													? "bg-success-50 dark:bg-success-900/10 border-success-200 dark:border-success-800"
													: "bg-error-50 dark:bg-error-900/10 border-error-200 dark:border-error-800"
											}`}
										>
											<div className="flex items-start gap-3">
												<div className="flex-shrink-0 mt-0.5">
													{assertion.passed ? (
														<svg
															className="w-5 h-5 text-success-600 dark:text-success-400"
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
													) : (
														<svg
															className="w-5 h-5 text-error-600 dark:text-error-400"
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
													)}
												</div>
												<div className="flex-1 min-w-0">
													<div className="font-medium text-gray-900 dark:text-white mb-1">
														{assertion.type}
														{assertion.selector && (
															<span className="ml-2 font-mono text-xs text-gray-600 dark:text-gray-400">
																{assertion.selector}
															</span>
														)}
													</div>
													{assertion.expected !== undefined && (
														<div className="text-sm text-gray-700 dark:text-gray-300">
															Expected:{" "}
															<span className="font-mono">
																{String(assertion.expected)}
															</span>
														</div>
													)}
													{assertion.actual !== undefined &&
														!assertion.passed && (
															<div className="text-sm text-error-700 dark:text-error-300">
																Actual:{" "}
																<span className="font-mono">
																	{String(assertion.actual)}
																</span>
															</div>
														)}
													{assertion.error && (
														<div className="text-sm text-error-700 dark:text-error-300 mt-1">
															{assertion.error}
														</div>
													)}
												</div>
											</div>
										</div>
									))
								)}
							</div>
						)}

						{/* Console Tab */}
						{activeTab === "console" && hasConsole && (
							<div className="space-y-1">
								{step.console?.map((log, index) => (
									<div
										key={index}
										className="px-3 py-2 font-mono text-xs bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded border border-gray-200 dark:border-gray-700"
									>
										{typeof log === 'string' ? log : `[${log.type}] ${log.text}`}
									</div>
								))}
							</div>
						)}

						{/* HTML Tab */}
						{activeTab === "html" && hasHtml && (
							<div className="relative">
								<pre className="p-4 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto text-xs font-mono">
									{step.html}
								</pre>
							</div>
						)}
					</div>
				</Card>

				{/* Errors */}
				{step.errors.length > 0 && (
					<Card className="border-error-200 dark:border-error-800 bg-error-50 dark:bg-error-900/10">
						<h3 className="text-h3 text-error-900 dark:text-error-100 mb-3 flex items-center gap-2">
							<svg
								className="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							Errors ({step.errors.length})
						</h3>
						<div className="space-y-2">
							{step.errors.map((error, index) => (
								<div
									key={index}
									className="p-3 bg-white dark:bg-gray-800 rounded border border-error-200 dark:border-error-800"
								>
									<p className="text-sm text-error-900 dark:text-error-100 font-mono">
										{error}
									</p>
								</div>
							))}
						</div>
					</Card>
				)}
			</div>
		</div>
	);
}
