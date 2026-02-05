"use client";

import type { ReportFile } from "../../lib/types";

interface ReportsListProps {
	reports: ReportFile[];
	onSelectReport: (report: ReportFile) => void;
}

export function ReportsList({ reports, onSelectReport }: ReportsListProps) {
	if (reports.length === 0) {
		return (
			<div className="text-center py-12 text-gray-500">
				<p className="text-lg">No reports found</p>
				<p className="text-sm mt-2">Run a flow to generate reports</p>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			{reports.map((report) => {
				const passed = report.report.failed === 0;
				const passRate =
					report.report.totalSteps > 0
						? Math.round(
								(report.report.passed / report.report.totalSteps) * 100,
							)
						: 0;

				return (
					<div
						key={report.id}
						className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
						onClick={() => onSelectReport(report)}
					>
						<div className="flex items-start justify-between mb-2">
							<div className="flex-1">
								<h3 className="font-semibold">{report.flowName}</h3>
								<p className="text-sm text-gray-500">
									{new Date(report.createdAt).toLocaleString()}
									{" • "}
									{report.report.device}
								</p>
							</div>
							<span
								className={`px-3 py-1 rounded text-sm font-medium ${
									passed
										? "bg-green-100 text-green-800"
										: "bg-red-100 text-red-800"
								}`}
							>
								{passRate}%
							</span>
						</div>

						<div className="flex items-center gap-4 text-sm">
							<span className="text-green-600">
								✓ {report.report.passed} passed
							</span>
							{report.report.failed > 0 && (
								<span className="text-red-600">
									✗ {report.report.failed} failed
								</span>
							)}
							<span className="text-gray-500">
								{report.report.totalSteps} total
							</span>
							{report.report.duration && (
								<span className="text-gray-500">
									{(report.report.duration / 1000).toFixed(1)}s
								</span>
							)}
						</div>
					</div>
				);
			})}
		</div>
	);
}
