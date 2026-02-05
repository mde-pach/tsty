"use client";

import type { TestReport } from "../../lib/types";
import { ScreenshotGallery } from "./screenshot-gallery";

interface ReportViewerProps {
	report: TestReport;
	onClose: () => void;
}

export function ReportViewer({ report, onClose }: ReportViewerProps) {
	const passRate =
		report.totalSteps > 0
			? Math.round((report.passed / report.totalSteps) * 100)
			: 0;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
			<div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
					<div>
						<h2 className="text-2xl font-bold">{report.flow}</h2>
						<p className="text-sm text-gray-500">
							{new Date(report.timestamp).toLocaleString()}
							{" • "}
							{report.device}
							{report.duration && ` • ${(report.duration / 1000).toFixed(1)}s`}
						</p>
					</div>
					<button
						onClick={onClose}
						className="px-4 py-2 text-gray-600 hover:text-gray-900"
					>
						✕
					</button>
				</div>

				{/* Summary */}
				<div className="px-6 py-4 border-b bg-gray-50">
					<div className="grid grid-cols-4 gap-4">
						<div>
							<p className="text-sm text-gray-600">Total Steps</p>
							<p className="text-2xl font-bold">{report.totalSteps}</p>
						</div>
						<div>
							<p className="text-sm text-gray-600">Passed</p>
							<p className="text-2xl font-bold text-green-600">
								{report.passed}
							</p>
						</div>
						<div>
							<p className="text-sm text-gray-600">Failed</p>
							<p className="text-2xl font-bold text-red-600">{report.failed}</p>
						</div>
						<div>
							<p className="text-sm text-gray-600">Pass Rate</p>
							<p className="text-2xl font-bold">{passRate}%</p>
						</div>
					</div>
				</div>

				{/* Steps */}
				<div className="px-6 py-4 space-y-6">
					{report.steps.map((step, index) => (
						<div key={index} className="border rounded-lg overflow-hidden">
							{/* Step Header */}
							<div
								className={`px-4 py-3 font-medium flex items-center justify-between ${
									step.passed
										? "bg-green-50 text-green-900"
										: "bg-red-50 text-red-900"
								}`}
							>
								<span>
									{step.passed ? "✓" : "✗"} {step.name}
								</span>
								<span className="text-sm font-normal opacity-75">
									{step.url}
								</span>
							</div>

							{/* Step Content */}
							<div className="p-4 space-y-4">
								{/* Assertions */}
								{step.assertions.length > 0 && (
									<div>
										<h4 className="font-semibold mb-2">Assertions</h4>
										<div className="space-y-2">
											{step.assertions.map((assertion, i) => (
												<div
													key={i}
													className={`flex items-start gap-2 text-sm p-2 rounded ${
														assertion.passed
															? "bg-green-50 text-green-900"
															: "bg-red-50 text-red-900"
													}`}
												>
													<span>{assertion.passed ? "✓" : "✗"}</span>
													<div className="flex-1">
														<p>
															{assertion.type}: {assertion.selector}
														</p>
														{assertion.error && (
															<p className="text-xs mt-1 opacity-75">
																{assertion.error}
															</p>
														)}
													</div>
												</div>
											))}
										</div>
									</div>
								)}

								{/* Screenshots */}
								{step.screenshots.length > 0 && (
									<div>
										<h4 className="font-semibold mb-2">Screenshots</h4>
										<ScreenshotGallery screenshots={step.screenshots} />
									</div>
								)}

								{/* Errors */}
								{step.errors.length > 0 && (
									<div>
										<h4 className="font-semibold mb-2 text-red-600">Errors</h4>
										<div className="space-y-2">
											{step.errors.map((error, i) => (
												<pre
													key={i}
													className="text-xs bg-red-50 text-red-900 p-3 rounded overflow-x-auto"
												>
													{error}
												</pre>
											))}
										</div>
									</div>
								)}

								{/* Console Logs */}
								{step.console && step.console.length > 0 && (
									<div>
										<h4 className="font-semibold mb-2">Console Logs</h4>
										<div className="bg-gray-900 text-gray-100 p-3 rounded text-xs space-y-1 max-h-40 overflow-y-auto">
											{step.console.map((log, i) => (
												<div key={i}>{log}</div>
											))}
										</div>
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
