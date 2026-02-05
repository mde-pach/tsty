"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { StepDetailView } from "@/dashboard/components/step-detail-view";
import { StepNavigator } from "@/dashboard/components/step-navigator";
import { Badge, EmptyState, LoadingState } from "@/dashboard/components/ui";
import { useReports } from "@/dashboard/hooks/use-reports";

export default function RunDetailPage() {
	const router = useRouter();
	const params = useParams();
	const runId = params?.id as string;

	const { reports, loading } = useReports();
	const [activeStepIndex, setActiveStepIndex] = useState(0);

	const report = reports.find((r) => r.id === runId);

	if (loading) {
		return (
			<div className="py-8">
				<LoadingState message="Loading run details..." />
			</div>
		);
	}

	if (!report) {
		return (
			<div className="py-8">
				<EmptyState
					icon={
						<svg
							className="w-8 h-8 text-gray-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
							/>
						</svg>
					}
					title="Run not found"
					description="The test run you're looking for doesn't exist"
					action={{
						label: "Back to Runs",
						onClick: () => router.push("/runs"),
					}}
				/>
			</div>
		);
	}

	const activeStep = report.report.steps[activeStepIndex];
	const isPassed = report.report.failed === 0;

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

	// Get screenshot path for current step
	const getScreenshotPath = (stepIndex: number) => {
		const step = report.report.steps[stepIndex];
		if (!step.screenshots || step.screenshots.length === 0) return undefined;

		// Use the screenshot path from the report - it's already in the correct format
		// (e.g., "run-flowId-timestamp/1-step-name.png")
		const filename = step.screenshots[0];
		return `/api/screenshots?filename=${encodeURIComponent(filename)}`;
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-6 py-4">
				{/* Breadcrumb */}
				<div className="flex items-center gap-2 text-sm mb-3">
					<button
						onClick={() => router.push("/runs")}
						className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
					>
						Runs
					</button>
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
							d="M9 5l7 7-7 7"
						/>
					</svg>
					<span className="text-gray-900 dark:text-white font-medium">
						{report.flowName}
					</span>
				</div>

				{/* Run Info */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
					<div>
						<h1 className="text-h2 text-gray-900 dark:text-white mb-2">
							{report.flowName} Run
						</h1>
						<div className="flex flex-wrap items-center gap-3 text-sm">
							<Badge variant={isPassed ? "success" : "error"}>
								{isPassed ? "Passed" : "Failed"} {report.report.passed}/
								{report.report.totalSteps}
							</Badge>
							<span className="text-gray-600 dark:text-gray-400">•</span>
							<span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
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
								{formatDuration(report.report.duration)}
							</span>
							<span className="text-gray-600 dark:text-gray-400">•</span>
							<span className="text-gray-600 dark:text-gray-400">
								{report.report.device}
							</span>
							<span className="text-gray-600 dark:text-gray-400">•</span>
							<span className="text-gray-600 dark:text-gray-400">
								{new Date(report.createdAt).toLocaleString()}
							</span>
						</div>
					</div>

					{/* Actions */}
					<div className="flex items-center gap-2">
						<button
							onClick={() => router.push(`/flows/${encodeURIComponent(report.flowId)}`)}
							className="px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
						>
							View Flow
						</button>
					</div>
				</div>
			</div>

			{/* Mobile Step Navigator */}
			<div className="lg:hidden">
				<select
					value={activeStepIndex}
					onChange={(e) => setActiveStepIndex(Number(e.target.value))}
					className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
				>
					{report.report.steps.map((step, index) => (
						<option key={index} value={index}>
							{index + 1}. {step.name} {step.passed ? "✓" : "✗"}
						</option>
					))}
				</select>
			</div>

			{/* Two-Panel Layout */}
			<div className="grid lg:grid-cols-[320px_1fr] gap-6">
				{/* Left Sidebar - Step Navigator */}
				<div className="hidden lg:block">
					<StepNavigator
						steps={report.report.steps}
						activeStepIndex={activeStepIndex}
						onStepClick={setActiveStepIndex}
					/>
				</div>

				{/* Right Panel - Step Detail */}
				<div>
					<StepDetailView
						step={activeStep}
						stepNumber={activeStepIndex + 1}
						totalSteps={report.report.steps.length}
						onPrevious={() =>
							setActiveStepIndex(Math.max(0, activeStepIndex - 1))
						}
						onNext={() =>
							setActiveStepIndex(
								Math.min(report.report.steps.length - 1, activeStepIndex + 1),
							)
						}
						screenshotPath={getScreenshotPath(activeStepIndex)}
					/>
				</div>
			</div>
		</div>
	);
}
