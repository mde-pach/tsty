"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { FlowMetrics } from "@/dashboard/components/flow-metrics";
import { FlowStepCard } from "@/dashboard/components/flow-step-card";
import {
	Badge,
	Button,
	Card,
	EmptyState,
	LoadingState,
} from "@/dashboard/components/ui";
import { useFlows } from "@/dashboard/hooks/use-flows";
import { useReports } from "@/dashboard/hooks/use-reports";

type Tab = "overview" | "runs" | "settings";

export default function FlowDetailPage() {
	const router = useRouter();
	const params = useParams();
	// Decode URL-encoded ID: "e2e%2Fe2e-action-creation" -> "e2e/e2e-action-creation"
	const flowId = params?.id ? decodeURIComponent(params.id as string) : "";

	const { flows, loading: flowsLoading } = useFlows();
	const { reports, loading: reportsLoading } = useReports();

	const [activeTab, setActiveTab] = useState<Tab>("overview");
	const [showRunMenu, setShowRunMenu] = useState(false);

	const flow = flows.find((f) => f.id === flowId);
	const flowReports = reports.filter((r) => r.flowId === flowId);

	const loading = flowsLoading || reportsLoading;

	if (loading) {
		return (
			<div className="py-8">
				<LoadingState message="Loading flow..." />
			</div>
		);
	}

	if (!flow) {
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
					title="Flow not found"
					description="The flow you're looking for doesn't exist"
					action={{
						label: "Back to Flows",
						onClick: () => router.push("/flows"),
					}}
				/>
			</div>
		);
	}

	// Calculate metrics
	const passedRuns = flowReports.filter((r) => r.report.failed === 0).length;
	const passRate =
		flowReports.length > 0
			? Math.round((passedRuns / flowReports.length) * 100)
			: null;

	const avgDuration =
		flowReports.length > 0
			? Math.round(
					flowReports.reduce((sum, r) => sum + (r.report.duration || 0), 0) /
						flowReports.length,
				)
			: null;

	const lastRun =
		flowReports.length > 0
			? {
					time: flowReports[0].createdAt,
					status:
						flowReports[0].report.failed === 0
							? ("passed" as const)
							: ("failed" as const),
				}
			: null;

	const devices = flow.flow.devices || ["desktop"];
	const tags = flow.flow.tags || [];
	const dependencies = flow.flow.dependencies || [];

	const handleRunFlow = (device?: "desktop" | "mobile") => {
		setShowRunMenu(false);
		alert(`Running flow on ${device || "desktop"}...`);
	};

	return (
		<div className="space-y-6">
			{/* Breadcrumb */}
			<div className="flex items-center gap-2 text-sm">
				<button
					onClick={() => router.push("/flows")}
					className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
				>
					Flows
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
					{flow.name}
				</span>
			</div>

			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
				<div className="flex-1 min-w-0">
					<h1 className="text-display text-gray-900 dark:text-white mb-2 truncate">
						{flow.name}
					</h1>
					{flow.flow.description && (
						<p className="text-gray-600 dark:text-gray-400 mb-3">
							{flow.flow.description}
						</p>
					)}
					{tags.length > 0 && (
						<div className="flex flex-wrap gap-1.5">
							{tags.map((tag) => (
								<Badge key={tag} variant="info" size="sm">
									#{tag}
								</Badge>
							))}
						</div>
					)}
				</div>

				{/* Actions */}
				<div className="flex items-center gap-3 flex-shrink-0">
					<Button
						variant="secondary"
						onClick={() => router.push(`/flows/${encodeURIComponent(flowId)}/edit`)}
					>
						<svg
							className="w-4 h-4 mr-1.5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
							/>
						</svg>
						Edit
					</Button>

					{/* Run Button */}
					<div className="relative">
						<Button
							onClick={() => {
								if (devices.length === 1) {
									handleRunFlow(devices[0] as "desktop" | "mobile");
								} else {
									setShowRunMenu(!showRunMenu);
								}
							}}
						>
							<svg
								className="w-4 h-4 mr-1.5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							Run Flow
							{devices.length > 1 && (
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
										d="M19 9l-7 7-7-7"
									/>
								</svg>
							)}
						</Button>

						{/* Device Dropdown */}
						{showRunMenu && devices.length > 1 && (
							<>
								<div
									className="fixed inset-0 z-10"
									onClick={() => setShowRunMenu(false)}
								/>
								<div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20">
									{devices.map((device) => (
										<button
											key={device}
											onClick={() =>
												handleRunFlow(device as "desktop" | "mobile")
											}
											className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg transition-colors"
										>
											{device.charAt(0).toUpperCase() + device.slice(1)}
										</button>
									))}
								</div>
							</>
						)}
					</div>
				</div>
			</div>

			{/* Tabs */}
			<div className="border-b border-gray-200 dark:border-gray-700">
				<nav className="flex -mb-px space-x-8">
					{[
						{ id: "overview", label: "Overview" },
						{ id: "runs", label: "Runs", count: flowReports.length },
						{ id: "settings", label: "Settings" },
					].map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id as Tab)}
							className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
								activeTab === tab.id
									? "border-primary-500 text-primary-600 dark:text-primary-400"
									: "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
							}`}
						>
							{tab.label}
							{tab.count !== undefined && (
								<span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
									{tab.count}
								</span>
							)}
						</button>
					))}
				</nav>
			</div>

			{/* Tab Content */}
			<div>
				{/* Overview Tab */}
				{activeTab === "overview" && (
					<div className="space-y-6">
						{/* Metrics */}
						<FlowMetrics
							passRate={passRate}
							avgDuration={avgDuration}
							lastRun={lastRun}
						/>

						{/* Flow Steps */}
						<div>
							<h2 className="text-h2 text-gray-900 dark:text-white mb-4">
								Flow Steps ({flow.flow.steps.length})
							</h2>
							<div className="space-y-3">
								{flow.flow.steps.map((step, index) => (
									<FlowStepCard
										key={index}
										step={step}
										stepNumber={index + 1}
									/>
								))}
							</div>
						</div>

						{/* Dependencies */}
						{dependencies.length > 0 && (
							<Card>
								<h3 className="text-h3 text-gray-900 dark:text-white mb-3">
									Dependencies
								</h3>
								<div className="space-y-2">
									<div>
										<p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
											This flow requires:
										</p>
										<div className="flex flex-wrap gap-2">
											{dependencies.map((depId) => (
												<Badge key={depId} variant="info">
													{depId}
												</Badge>
											))}
										</div>
									</div>
								</div>
							</Card>
						)}

						{/* Configuration */}
						<Card>
							<h3 className="text-h3 text-gray-900 dark:text-white mb-4">
								Configuration
							</h3>
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<span className="text-gray-600 dark:text-gray-400">
										Base URL
									</span>
									<span className="font-mono text-sm text-gray-900 dark:text-white">
										{flow.flow.baseUrl}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-gray-600 dark:text-gray-400">
										Devices
									</span>
									<div className="flex gap-2">
										{devices.map((device) => (
											<Badge key={device} variant="neutral" size="sm">
												{device}
											</Badge>
										))}
									</div>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-gray-600 dark:text-gray-400">
										Steps
									</span>
									<span className="font-semibold text-gray-900 dark:text-white">
										{flow.flow.steps.length}
									</span>
								</div>
							</div>
						</Card>
					</div>
				)}

				{/* Runs Tab */}
				{activeTab === "runs" && (
					<div>
						{flowReports.length === 0 ? (
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
								title="No test runs yet"
								description="Run this flow to see test results here"
								action={{
									label: "Run Flow",
									onClick: () =>
										handleRunFlow(devices[0] as "desktop" | "mobile"),
								}}
							/>
						) : (
							<Card padding="none">
								<div className="divide-y divide-gray-200 dark:divide-gray-700">
									{flowReports.map((report) => {
										const passed = report.report.failed === 0;
										return (
											<div
												key={report.id}
												onClick={() => router.push(`/runs/${report.id}`)}
												className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
											>
												<div className="flex-shrink-0">
													{passed ? (
														<div className="w-10 h-10 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center">
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
														</div>
													) : (
														<div className="w-10 h-10 bg-error-100 dark:bg-error-900/30 rounded-full flex items-center justify-center">
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
														</div>
													)}
												</div>

												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2 mb-1">
														<Badge
															variant={passed ? "success" : "error"}
															size="sm"
														>
															{passed ? "Passed" : "Failed"}
														</Badge>
														<span className="text-sm text-gray-600 dark:text-gray-400">
															{new Date(report.createdAt).toLocaleString()}
														</span>
													</div>
													<div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
														<span>{report.report.device}</span>
														{report.report.duration && (
															<>
																<span>•</span>
																<span>
																	{(report.report.duration / 1000).toFixed(1)}s
																</span>
															</>
														)}
													</div>
												</div>

												<div className="flex-shrink-0 text-right">
													<p className="text-sm font-medium text-gray-900 dark:text-white">
														{report.report.passed}/{report.report.totalSteps}
													</p>
													<p className="text-xs text-gray-500 dark:text-gray-400">
														steps passed
													</p>
												</div>
											</div>
										);
									})}
								</div>
							</Card>
						)}
					</div>
				)}

				{/* Settings Tab */}
				{activeTab === "settings" && (
					<Card>
						<h3 className="text-h3 text-gray-900 dark:text-white mb-4">
							Flow Settings
						</h3>
						<p className="text-gray-600 dark:text-gray-400">
							Settings management coming soon. For now, use the Edit button to
							modify flow configuration.
						</p>
					</Card>
				)}
			</div>
		</div>
	);
}
