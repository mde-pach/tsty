"use client";

import { useMemo } from "react";
import type { TestReport } from "@/lib/types";
import { Badge, Card } from "./ui";

interface RunComparisonProps {
	run1: { id: string; flowName: string; createdAt: string; report: TestReport };
	run2: { id: string; flowName: string; createdAt: string; report: TestReport };
	onClose: () => void;
}

export function RunComparison({ run1, run2, onClose }: RunComparisonProps) {
	const comparison = useMemo(() => {
		const changes = {
			statusChanged: (run1.report.failed === 0) !== (run2.report.failed === 0),
			durationDiff: run2.report.duration
				? run2.report.duration - (run1.report.duration || 0)
				: null,
			stepDifferences: [] as Array<{
				name: string;
				run1Status: boolean;
				run2Status: boolean;
				changed: boolean;
			}>,
		};

		// Compare steps (match by name)
		run1.report.steps.forEach((step1) => {
			const step2 = run2.report.steps.find((s) => s.name === step1.name);
			if (step2) {
				changes.stepDifferences.push({
					name: step1.name,
					run1Status: step1.passed,
					run2Status: step2.passed,
					changed: step1.passed !== step2.passed,
				});
			}
		});

		return changes;
	}, [run1, run2]);

	const formatDuration = (ms?: number) => {
		if (!ms) return "—";
		const seconds = Math.floor(ms / 1000);
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;

		if (minutes > 0) {
			return `${minutes}m ${remainingSeconds}s`;
		}
		return `${seconds}s`;
	};

	const formatDurationDiff = (ms: number) => {
		const abs = Math.abs(ms);
		const sign = ms > 0 ? "+" : "";
		const seconds = Math.floor(abs / 1000);

		if (seconds === 0) return "Same duration";
		return `${sign}${seconds}s ${ms > 0 ? "slower" : "faster"}`;
	};

	const run1Passed = run1.report.failed === 0;
	const run2Passed = run2.report.failed === 0;

	return (
		<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
			<div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
					<h2 className="text-h2 text-gray-900 dark:text-white">
						Run Comparison
					</h2>
					<button
						onClick={onClose}
						className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-6 space-y-6">
					{/* Overview Comparison */}
					<div className="grid md:grid-cols-2 gap-4">
						{/* Run 1 */}
						<Card>
							<div className="flex items-center justify-between mb-3">
								<h3 className="text-h3 text-gray-900 dark:text-white">Run 1</h3>
								<Badge variant={run1Passed ? "success" : "error"}>
									{run1Passed ? "Passed" : "Failed"}
								</Badge>
							</div>
							<div className="space-y-2 text-sm">
								<div className="flex justify-between">
									<span className="text-gray-600 dark:text-gray-400">Flow</span>
									<span className="font-medium text-gray-900 dark:text-white">
										{run1.flowName}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600 dark:text-gray-400">Date</span>
									<span className="font-medium text-gray-900 dark:text-white">
										{new Date(run1.createdAt).toLocaleString()}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600 dark:text-gray-400">Duration</span>
									<span className="font-medium text-gray-900 dark:text-white">
										{formatDuration(run1.report.duration)}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600 dark:text-gray-400">Steps</span>
									<span className="font-medium text-gray-900 dark:text-white">
										{run1.report.passed}/{run1.report.totalSteps}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600 dark:text-gray-400">Device</span>
									<span className="font-medium text-gray-900 dark:text-white">
										{run1.report.device}
									</span>
								</div>
							</div>
						</Card>

						{/* Run 2 */}
						<Card>
							<div className="flex items-center justify-between mb-3">
								<h3 className="text-h3 text-gray-900 dark:text-white">Run 2</h3>
								<Badge variant={run2Passed ? "success" : "error"}>
									{run2Passed ? "Passed" : "Failed"}
								</Badge>
							</div>
							<div className="space-y-2 text-sm">
								<div className="flex justify-between">
									<span className="text-gray-600 dark:text-gray-400">Flow</span>
									<span className="font-medium text-gray-900 dark:text-white">
										{run2.flowName}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600 dark:text-gray-400">Date</span>
									<span className="font-medium text-gray-900 dark:text-white">
										{new Date(run2.createdAt).toLocaleString()}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600 dark:text-gray-400">Duration</span>
									<span className="font-medium text-gray-900 dark:text-white">
										{formatDuration(run2.report.duration)}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600 dark:text-gray-400">Steps</span>
									<span className="font-medium text-gray-900 dark:text-white">
										{run2.report.passed}/{run2.report.totalSteps}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600 dark:text-gray-400">Device</span>
									<span className="font-medium text-gray-900 dark:text-white">
										{run2.report.device}
									</span>
								</div>
							</div>
						</Card>
					</div>

					{/* Key Changes */}
					{(comparison.statusChanged || comparison.durationDiff !== null) && (
						<Card>
							<h3 className="text-h3 text-gray-900 dark:text-white mb-3">
								Key Changes
							</h3>
							<div className="space-y-2">
								{comparison.statusChanged && (
									<div className="flex items-center gap-2 text-sm">
										<svg
											className="w-5 h-5 text-warning-600 dark:text-warning-400"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
											/>
										</svg>
										<span className="text-gray-900 dark:text-white font-medium">
											Status changed from{" "}
											{run1Passed ? "Passed" : "Failed"} to{" "}
											{run2Passed ? "Passed" : "Failed"}
										</span>
									</div>
								)}
								{comparison.durationDiff !== null && comparison.durationDiff !== 0 && (
									<div className="flex items-center gap-2 text-sm">
										<svg
											className={`w-5 h-5 ${
												comparison.durationDiff > 0
													? "text-error-600 dark:text-error-400"
													: "text-success-600 dark:text-success-400"
											}`}
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
										<span className="text-gray-900 dark:text-white">
											{formatDurationDiff(comparison.durationDiff)}
										</span>
									</div>
								)}
							</div>
						</Card>
					)}

					{/* Step-by-Step Comparison */}
					<Card>
						<h3 className="text-h3 text-gray-900 dark:text-white mb-3">
							Step-by-Step Comparison
						</h3>
						<div className="space-y-1">
							{comparison.stepDifferences.map((diff, index) => (
								<div
									key={index}
									className={`flex items-center justify-between p-3 rounded-lg ${
										diff.changed
											? "bg-warning-50 dark:bg-warning-900/10"
											: "bg-gray-50 dark:bg-gray-700/50"
									}`}
								>
									<div className="flex items-center gap-3 flex-1 min-w-0">
										<span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-8">
											{index + 1}
										</span>
										<span className="text-sm text-gray-900 dark:text-white truncate">
											{diff.name}
										</span>
									</div>
									<div className="flex items-center gap-4 flex-shrink-0">
										{/* Run 1 Status */}
										<div className="flex items-center gap-1.5">
											{diff.run1Status ? (
												<svg
													className="w-4 h-4 text-success-600 dark:text-success-400"
													fill="currentColor"
													viewBox="0 0 20 20"
												>
													<path
														fillRule="evenodd"
														d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
													/>
												</svg>
											) : (
												<svg
													className="w-4 h-4 text-error-600 dark:text-error-400"
													fill="currentColor"
													viewBox="0 0 20 20"
												>
													<path
														fillRule="evenodd"
														d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
													/>
												</svg>
											)}
										</div>

										{/* Arrow */}
										{diff.changed && (
											<svg
												className="w-4 h-4 text-gray-400"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M13 7l5 5m0 0l-5 5m5-5H6"
												/>
											</svg>
										)}

										{/* Run 2 Status */}
										<div className="flex items-center gap-1.5">
											{diff.run2Status ? (
												<svg
													className="w-4 h-4 text-success-600 dark:text-success-400"
													fill="currentColor"
													viewBox="0 0 20 20"
												>
													<path
														fillRule="evenodd"
														d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
													/>
												</svg>
											) : (
												<svg
													className="w-4 h-4 text-error-600 dark:text-error-400"
													fill="currentColor"
													viewBox="0 0 20 20"
												>
													<path
														fillRule="evenodd"
														d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
													/>
												</svg>
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
}
