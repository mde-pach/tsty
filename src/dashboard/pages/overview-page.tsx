"use client";

import { useRouter } from "next/navigation";
import {
	Badge,
	Button,
	Card,
	EmptyState,
	LoadingState,
	MetricCard,
} from "../components/ui";
import { useActions } from "../hooks/use-actions";
import { useFlows } from "../hooks/use-flows";
import { useReports } from "../hooks/use-reports";

export function OverviewPage() {
	const router = useRouter();
	const { flows, loading: flowsLoading } = useFlows();
	const { actions, loading: actionsLoading } = useActions();
	const { reports, loading: reportsLoading } = useReports();

	const loading = flowsLoading || actionsLoading || reportsLoading;

	if (loading) {
		return <LoadingState message="Loading dashboard..." />;
	}

	const recentReports = reports.slice(0, 5);
	const passedReports = reports.filter((r) => r.report.failed === 0).length;
	const passRate =
		reports.length > 0
			? Math.round((passedReports / reports.length) * 100)
			: null;

	// Calculate pass rate variant and trend
	const passRateVariant =
		passRate !== null && passRate >= 80
			? "success"
			: passRate !== null && passRate >= 60
				? "warning"
				: passRate !== null
					? "error"
					: "default";

	// Get most recent run
	const lastRun = reports.length > 0 ? reports[0] : null;
	const lastRunTime = lastRun
		? new Date(lastRun.createdAt).toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
			})
		: null;

	return (
		<div className="flex flex-col h-full -m-6">
			{/* Fixed Header */}
			<div className="flex-shrink-0 bg-gray-50 dark:bg-gray-900 px-6 pt-6 pb-4">
				{/* Page Header */}
				<div>
					<h1 className="text-display text-gray-900 dark:text-white mb-2">
						Welcome back
					</h1>
					<p className="text-gray-600 dark:text-gray-400">
						Here's an overview of your test suite health and recent activity
					</p>
				</div>
			</div>

			{/* Scrollable Content */}
			<div className="flex-1 overflow-y-auto px-6 pb-6">
			<div className="space-y-8">
			{/* Key Metrics */}
			<div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
				<MetricCard
					label="Pass Rate"
					value={passRate !== null ? `${passRate}%` : "—"}
					variant={passRateVariant}
					trend={
						passRate !== null && passRate >= 80
							? { value: 2, positive: true }
							: undefined
					}
				/>

				<MetricCard
					label="Total Runs"
					value={reports.length}
					variant="default"
				/>

				<MetricCard
					label="Last Run"
					value={lastRunTime || "Never"}
					variant={
						lastRun && lastRun.report.failed === 0
							? "success"
							: lastRun
								? "error"
								: "default"
					}
				/>
			</div>

			{/* Quick Actions */}
			<div>
				<h2 className="text-h2 text-gray-900 dark:text-white mb-4">
					Quick Actions
				</h2>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<Card
						padding="md"
						hover
						onClick={() => router.push("/flows/new")}
						className="border-2 border-dashed cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10"
					>
						<div className="flex items-start gap-3">
							<div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
								<svg
									className="w-5 h-5 text-primary-600 dark:text-primary-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 4v16m8-8H4"
									/>
								</svg>
							</div>
							<div>
								<h3 className="font-semibold text-gray-900 dark:text-white mb-1">
									New Flow
								</h3>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									Create a test flow
								</p>
							</div>
						</div>
					</Card>

					<Card
						padding="md"
						hover
						onClick={() => router.push("/actions/new")}
						className="border-2 border-dashed cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10"
					>
						<div className="flex items-start gap-3">
							<div className="w-10 h-10 bg-info-100 dark:bg-info-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
								<svg
									className="w-5 h-5 text-info-600 dark:text-info-400"
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
							</div>
							<div>
								<h3 className="font-semibold text-gray-900 dark:text-white mb-1">
									New Action
								</h3>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									Build reusable action
								</p>
							</div>
						</div>
					</Card>

					<Card
						padding="md"
						hover
						onClick={() => router.push("/runs")}
						className="border-2 border-dashed cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10"
					>
						<div className="flex items-start gap-3">
							<div className="w-10 h-10 bg-success-100 dark:bg-success-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
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
										d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
									/>
								</svg>
							</div>
							<div>
								<h3 className="font-semibold text-gray-900 dark:text-white mb-1">
									View Reports
								</h3>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									Browse test results
								</p>
							</div>
						</div>
					</Card>
				</div>
			</div>

			{/* Recent Runs */}
			<div>
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-h2 text-gray-900 dark:text-white">Recent Runs</h2>
					{reports.length > 0 && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => router.push("/runs")}
						>
							View all →
						</Button>
					)}
				</div>

				<Card padding="none">
					{recentReports.length === 0 ? (
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
							description="Run a flow to see test results here"
							action={{
								label: "Browse Flows",
								onClick: () => router.push("/flows"),
							}}
						/>
					) : (
						<div className="divide-y divide-gray-200 dark:divide-gray-700">
							{recentReports.map((report) => {
								const passed = report.report.failed === 0;
								const relativeTime = getRelativeTime(
									new Date(report.createdAt),
								);

								return (
									<div
										key={report.id}
										onClick={() => router.push(`/runs/${report.id}`)}
										className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
									>
										{/* Status Icon */}
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

										{/* Run Info */}
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 mb-1">
												<p className="font-medium text-gray-900 dark:text-white truncate">
													{report.flowName}
												</p>
												<Badge variant={passed ? "success" : "error"} size="sm">
													{passed ? "Passed" : "Failed"}
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
													{relativeTime}
												</span>
												<span>•</span>
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

										{/* Stats */}
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
					)}
				</Card>
			</div>

			{/* Summary Stats */}
			<div className="grid gap-6 sm:grid-cols-2">
				<Card>
					<h3 className="text-h3 text-gray-900 dark:text-white mb-4">
						Test Suite
					</h3>
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<span className="text-gray-600 dark:text-gray-400">Flows</span>
							<span className="font-semibold text-gray-900 dark:text-white">
								{flows.length}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-gray-600 dark:text-gray-400">Actions</span>
							<span className="font-semibold text-gray-900 dark:text-white">
								{actions.length}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-gray-600 dark:text-gray-400">
								Total Runs
							</span>
							<span className="font-semibold text-gray-900 dark:text-white">
								{reports.length}
							</span>
						</div>
					</div>
				</Card>

				<Card>
					<h3 className="text-h3 text-gray-900 dark:text-white mb-4">
						Activity
					</h3>
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<span className="text-gray-600 dark:text-gray-400">Passed</span>
							<Badge variant="success">{passedReports}</Badge>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-gray-600 dark:text-gray-400">Failed</span>
							<Badge variant="error">{reports.length - passedReports}</Badge>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-gray-600 dark:text-gray-400">
								Success Rate
							</span>
							<Badge variant={passRateVariant}>
								{passRate !== null ? `${passRate}%` : "N/A"}
							</Badge>
						</div>
					</div>
				</Card>
			</div>
			</div>
			</div>
		</div>
	);
}

function getRelativeTime(date: Date): string {
	const now = new Date();
	const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	if (diffInSeconds < 60) return "just now";
	if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
	if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
	if (diffInSeconds < 604800)
		return `${Math.floor(diffInSeconds / 86400)}d ago`;

	return date.toLocaleDateString();
}
