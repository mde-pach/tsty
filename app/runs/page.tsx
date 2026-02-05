"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
	Badge,
	Card,
	EmptyState,
	Input,
	LoadingState,
	Select,
} from "@/dashboard/components/ui";
import { useReports } from "@/dashboard/hooks/use-reports";
import { RunComparison } from "@/dashboard/components/run-comparison";

type StatusFilter = "all" | "passed" | "failed";
type DateFilter = "7days" | "30days" | "90days" | "all";

export default function RunsPage() {
	const router = useRouter();
	const { reports, loading } = useReports();

	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
	const [dateFilter, setDateFilter] = useState<DateFilter>("30days");
	const [flowFilter, setFlowFilter] = useState<string>("all");
	const [deviceFilter, setDeviceFilter] = useState<string>("all");
	const [comparisonMode, setComparisonMode] = useState(false);
	const [selectedRunIds, setSelectedRunIds] = useState<Set<string>>(new Set());
	const [showComparison, setShowComparison] = useState(false);

	// Get unique flow names and devices for filters
	const uniqueFlows = useMemo(() => {
		const flows = new Set(reports.map((r) => r.flowName));
		return Array.from(flows).sort();
	}, [reports]);

	const uniqueDevices = useMemo(() => {
		const devices = new Set(reports.map((r) => r.report.device));
		return Array.from(devices).sort();
	}, [reports]);

	// Filter and sort reports
	const filteredReports = useMemo(() => {
		let result = [...reports];

		// Search filter
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			result = result.filter((report) =>
				report.flowName.toLowerCase().includes(query),
			);
		}

		// Status filter
		if (statusFilter !== "all") {
			result = result.filter((report) => {
				const passed = report.report.failed === 0;
				return statusFilter === "passed" ? passed : !passed;
			});
		}

		// Date filter
		if (dateFilter !== "all") {
			const now = new Date();
			const daysMap = { "7days": 7, "30days": 30, "90days": 90 };
			const days = daysMap[dateFilter];
			const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

			result = result.filter((report) => new Date(report.createdAt) >= cutoff);
		}

		// Flow name filter
		if (flowFilter !== "all") {
			result = result.filter((report) => report.flowName === flowFilter);
		}

		// Device filter
		if (deviceFilter !== "all") {
			result = result.filter((report) => report.report.device === deviceFilter);
		}

		return result;
	}, [reports, searchQuery, statusFilter, dateFilter, flowFilter, deviceFilter]);

	// Group by date
	const groupedReports = useMemo(() => {
		const groups: Record<string, typeof reports> = {};

		filteredReports.forEach((report) => {
			const date = new Date(report.createdAt);
			const today = new Date();
			const yesterday = new Date(today);
			yesterday.setDate(yesterday.getDate() - 1);

			let label: string;
			if (date.toDateString() === today.toDateString()) {
				label = "Today";
			} else if (date.toDateString() === yesterday.toDateString()) {
				label = "Yesterday";
			} else {
				label = date.toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
				});
			}

			if (!groups[label]) {
				groups[label] = [];
			}
			groups[label].push(report);
		});

		return groups;
	}, [filteredReports]);

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

	const getRelativeTime = (date: string) => {
		const now = new Date();
		const past = new Date(date);
		const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

		if (diffInSeconds < 60) return "just now";
		if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
		if (diffInSeconds < 86400)
			return `${Math.floor(diffInSeconds / 3600)}h ago`;

		return past.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
	};

	const handleExportJSON = () => {
		const dataStr = JSON.stringify(filteredReports, null, 2);
		const dataBlob = new Blob([dataStr], { type: "application/json" });
		const url = URL.createObjectURL(dataBlob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `test-runs-${new Date().toISOString().split("T")[0]}.json`;
		link.click();
		URL.revokeObjectURL(url);
	};

	const handleExportCSV = () => {
		const headers = ["Flow Name", "Status", "Device", "Date", "Duration", "Passed", "Failed", "Total Steps"];
		const rows = filteredReports.map((report) => [
			report.flowName,
			report.report.failed === 0 ? "Passed" : "Failed",
			report.report.device,
			new Date(report.createdAt).toLocaleString(),
			formatDuration(report.report.duration),
			report.report.passed.toString(),
			report.report.failed.toString(),
			report.report.totalSteps.toString(),
		]);

		const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
		const dataBlob = new Blob([csv], { type: "text/csv" });
		const url = URL.createObjectURL(dataBlob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `test-runs-${new Date().toISOString().split("T")[0]}.csv`;
		link.click();
		URL.revokeObjectURL(url);
	};

	const handleToggleSelection = (runId: string, flowName: string) => {
		const newSelection = new Set(selectedRunIds);

		if (newSelection.has(runId)) {
			newSelection.delete(runId);
		} else {
			// Check if we already have a selection from a different flow
			if (newSelection.size > 0) {
				const firstSelectedId = Array.from(newSelection)[0];
				const firstSelectedReport = reports.find((r) => r.id === firstSelectedId);

				if (firstSelectedReport && firstSelectedReport.flowName !== flowName) {
					// Can't compare runs from different flows
					alert(`Can only compare runs from the same flow.\nCurrently selected: ${firstSelectedReport.flowName}\nTried to select: ${flowName}`);
					return;
				}
			}

			if (newSelection.size >= 2) {
				// Only allow 2 selections for comparison
				const [firstId] = Array.from(newSelection);
				newSelection.delete(firstId);
			}
			newSelection.add(runId);
		}
		setSelectedRunIds(newSelection);
	};

	const handleCompare = () => {
		if (selectedRunIds.size === 2) {
			setShowComparison(true);
		}
	};

	const selectedRuns = useMemo(() => {
		const ids = Array.from(selectedRunIds);
		return [
			reports.find((r) => r.id === ids[0]),
			reports.find((r) => r.id === ids[1]),
		].filter(Boolean);
	}, [selectedRunIds, reports]);

	if (loading) {
		return (
			<div className="py-8">
				<LoadingState message="Loading test runs..." />
			</div>
		);
	}

	const passedCount = reports.filter((r) => r.report.failed === 0).length;
	const failedCount = reports.length - passedCount;

	return (
		<div className="flex flex-col h-full -m-6">
			{/* Fixed Header */}
			<div className="flex-shrink-0 bg-gray-50 dark:bg-gray-900 px-6 pt-6 pb-4 space-y-4">
				{/* Page Header */}
				<div className="flex items-start justify-between gap-4">
					<div>
						<h1 className="text-display text-gray-900 dark:text-white mb-2">
							Test Runs
						</h1>
						<p className="text-gray-600 dark:text-gray-400">
							Browse and analyze test execution history
						</p>
					</div>

					{/* Actions */}
					<div className="flex items-center gap-2">
						{/* Comparison Mode Toggle */}
						<button
							onClick={() => {
								setComparisonMode(!comparisonMode);
								setSelectedRunIds(new Set());
							}}
							className={`px-3 py-2 text-sm rounded-lg transition-colors ${
								comparisonMode
									? "bg-primary-600 text-white"
									: "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
							}`}
						>
							<div className="flex items-center gap-2">
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
								</svg>
								Compare
							</div>
						</button>

						{/* Export Dropdown */}
						<div className="relative group">
							<button className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
								<div className="flex items-center gap-2">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
									</svg>
									Export
								</div>
							</button>

							{/* Dropdown Menu */}
							<div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
								<button
									onClick={handleExportJSON}
									className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
								>
									Export as JSON
								</button>
								<button
									onClick={handleExportCSV}
									className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
								>
									Export as CSV
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* Stats */}
				<div className="grid gap-4 sm:grid-cols-3">
				<Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-gray-200 dark:border-gray-600">
					<div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
						{reports.length}
					</div>
					<div className="text-sm text-gray-600 dark:text-gray-400">
						Total Runs
					</div>
				</Card>

				<Card className="bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 border-success-200 dark:border-success-800">
					<div className="text-3xl font-bold text-success-900 dark:text-success-100 mb-1">
						{passedCount}
					</div>
					<div className="text-sm text-success-700 dark:text-success-300">
						Passed
					</div>
				</Card>

				<Card className="bg-gradient-to-br from-error-50 to-error-100 dark:from-error-900/20 dark:to-error-800/20 border-error-200 dark:border-error-800">
					<div className="text-3xl font-bold text-error-900 dark:text-error-100 mb-1">
						{failedCount}
					</div>
					<div className="text-sm text-error-700 dark:text-error-300">
						Failed
					</div>
				</Card>
			</div>

				{/* Filters */}
				<div className="flex flex-col gap-3">
					<div className="flex flex-col sm:flex-row gap-3">
						<div className="flex-1">
							<Input
								type="search"
								value={searchQuery}
								onChange={setSearchQuery}
								placeholder="Search by flow name..."
								icon={
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
											d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
										/>
									</svg>
								}
							/>
						</div>

						<Select
							value={statusFilter}
							onChange={(value) => setStatusFilter(value as StatusFilter)}
							options={[
								{ value: "all", label: "All Status" },
								{ value: "passed", label: "Passed" },
								{ value: "failed", label: "Failed" },
							]}
							className="w-40"
						/>

						<Select
							value={dateFilter}
							onChange={(value) => setDateFilter(value as DateFilter)}
							options={[
								{ value: "7days", label: "Last 7 days" },
								{ value: "30days", label: "Last 30 days" },
								{ value: "90days", label: "Last 90 days" },
								{ value: "all", label: "All time" },
							]}
							className="w-40"
						/>
					</div>

					{/* Additional Filters Row */}
					<div className="flex flex-col sm:flex-row gap-3">
						<Select
							value={flowFilter}
							onChange={(value) => setFlowFilter(value)}
							options={[
								{ value: "all", label: "All Flows" },
								...uniqueFlows.map((flow) => ({ value: flow, label: flow })),
							]}
							className="flex-1 sm:w-auto"
						/>

						<Select
							value={deviceFilter}
							onChange={(value) => setDeviceFilter(value)}
							options={[
								{ value: "all", label: "All Devices" },
								...uniqueDevices.map((device) => ({ value: device, label: device })),
							]}
							className="flex-1 sm:w-auto"
						/>

						{/* Clear filters button */}
						{(searchQuery || statusFilter !== "all" || dateFilter !== "30days" || flowFilter !== "all" || deviceFilter !== "all") && (
							<button
								onClick={() => {
									setSearchQuery("");
									setStatusFilter("all");
									setDateFilter("30days");
									setFlowFilter("all");
									setDeviceFilter("all");
								}}
								className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors whitespace-nowrap"
							>
								Clear filters
							</button>
						)}
					</div>
				</div>

				{/* Comparison Banner */}
				{comparisonMode && (
					<div className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
						<div className="flex items-center gap-2">
							<svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<span className="text-sm font-medium text-primary-900 dark:text-primary-100">
								{selectedRunIds.size === 0 && "Select 2 runs to compare"}
								{selectedRunIds.size === 1 && "Select 1 more run to compare"}
								{selectedRunIds.size === 2 && "2 runs selected"}
							</span>
						</div>
						<div className="flex items-center gap-2">
							{selectedRunIds.size === 2 && (
								<button
									onClick={handleCompare}
									className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
								>
									Compare Runs
								</button>
							)}
							<button
								onClick={() => {
									setComparisonMode(false);
									setSelectedRunIds(new Set());
								}}
								className="px-3 py-1.5 text-sm text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/40 rounded-lg transition-colors"
							>
								Cancel
							</button>
						</div>
					</div>
				)}
			</div>

			{/* Scrollable Content */}
			<div className="flex-1 overflow-y-auto px-6 pb-6">{/* Timeline */}
			{filteredReports.length === 0 ? (
				reports.length === 0 ? (
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
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
						}
						title="No runs found"
						description="Try adjusting your filters"
						action={{
							label: "Clear Filters",
							onClick: () => {
								setSearchQuery("");
								setStatusFilter("all");
								setDateFilter("30days");
							},
						}}
					/>
				)
			) : (
				<div className="space-y-6">
					{Object.entries(groupedReports).map(([dateLabel, dateReports], groupIndex) => (
						<div key={dateLabel} className="relative">
							<h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 pl-8">
								{dateLabel}
							</h2>
							<div className="relative">
								{/* Timeline vertical line */}
								<div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

								<Card padding="none">
									<div className="divide-y divide-gray-200 dark:divide-gray-700">
										{dateReports.map((report, index) => {
											const passed = report.report.failed === 0;
											const isSelected = selectedRunIds.has(report.id);
											const nextReport = dateReports[index + 1];
											const timeDiff = nextReport
												? new Date(report.createdAt).getTime() -
												  new Date(nextReport.createdAt).getTime()
												: 0;
											const showTimeGap = timeDiff > 3600000; // > 1 hour

											return (
												<div key={report.id}>
													<div
														onClick={(e) => {
															if (comparisonMode) {
																e.preventDefault();
																handleToggleSelection(report.id, report.flowName);
															} else {
																router.push(`/runs/${report.id}`);
															}
														}}
														className={`relative flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${
															isSelected ? "bg-primary-50 dark:bg-primary-900/20" : ""
														}`}
													>
														{/* Timeline dot */}
														<div className="absolute left-0 -ml-1">
															<div
																className={`w-3 h-3 rounded-full border-2 ${
																	passed
																		? "bg-success-500 border-success-500"
																		: "bg-error-500 border-error-500"
																}`}
															/>
														</div>

														{/* Selection Checkbox (Comparison Mode) */}
														{comparisonMode && (
															<div className="flex-shrink-0 ml-6">
																<div
																	className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
																		isSelected
																			? "bg-primary-600 border-primary-600"
																			: "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
																	}`}
																>
																	{isSelected && (
																		<svg
																			className="w-3 h-3 text-white"
																			fill="none"
																			stroke="currentColor"
																			viewBox="0 0 24 24"
																		>
																			<path
																				strokeLinecap="round"
																				strokeLinejoin="round"
																				strokeWidth={3}
																				d="M5 13l4 4L19 7"
																			/>
																		</svg>
																	)}
																</div>
															</div>
														)}

														{/* Status Icon */}
														<div className={`flex-shrink-0 ${comparisonMode ? "" : "ml-6"}`}>
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
																<Badge
																	variant={passed ? "success" : "error"}
																	size="sm"
																>
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
																	{getRelativeTime(report.createdAt)}
																</span>
																<span>•</span>
																<span>{report.report.device}</span>
																{report.report.duration && (
																	<>
																		<span>•</span>
																		<span>
																			{formatDuration(report.report.duration)}
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

														{/* Arrow */}
														{!comparisonMode && (
															<svg
																className="w-5 h-5 text-gray-400 flex-shrink-0"
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
														)}
													</div>

													{/* Time Gap Indicator */}
													{showTimeGap && (
														<div className="relative py-2">
															<div className="absolute left-5 top-0 bottom-0 w-0.5 bg-dashed bg-gray-300 dark:bg-gray-600" />
															<div className="ml-8 pl-6">
																<div className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
																	<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
																	</svg>
																	{Math.floor(timeDiff / 3600000)}h gap
																</div>
															</div>
														</div>
													)}
												</div>
											);
										})}
									</div>
								</Card>
							</div>
						</div>
					))}
				</div>
			)}
			</div>

			{/* Comparison Modal */}
			{showComparison && selectedRuns.length === 2 && (
				<RunComparison
					run1={selectedRuns[0]!}
					run2={selectedRuns[1]!}
					onClose={() => {
						setShowComparison(false);
						setComparisonMode(false);
						setSelectedRunIds(new Set());
					}}
				/>
			)}
		</div>
	);
}
