"use client";

import { useEffect, useState } from "react";
import type { FlowProgressEvent, StepResult } from "@/lib/types";

interface ExecutionProgressProps {
	flowId: string;
	device?: "desktop" | "mobile";
	onComplete?: (reportId: string) => void;
	onError?: (error: string) => void;
}

interface StepProgress {
	number: number;
	name: string;
	url: string;
	status: "pending" | "running" | "passed" | "failed";
	result?: StepResult;
	error?: string;
}

export function ExecutionProgress({
	flowId,
	device = "desktop",
	onComplete,
	onError,
}: ExecutionProgressProps) {
	const [flowName, setFlowName] = useState<string>("");
	const [totalSteps, setTotalSteps] = useState<number>(0);
	const [steps, setSteps] = useState<StepProgress[]>([]);
	const [currentStep, setCurrentStep] = useState<number>(0);
	const [status, setStatus] = useState<
		"connecting" | "running" | "complete" | "error"
	>("connecting");
	const [runId, setRunId] = useState<string>("");
	const [startTime] = useState<number>(Date.now());
	const [elapsedTime, setElapsedTime] = useState<number>(0);

	useEffect(() => {
		// Timer for elapsed time
		const timer = setInterval(() => {
			if (status === "running") {
				setElapsedTime(Date.now() - startTime);
			}
		}, 100);

		return () => clearInterval(timer);
	}, [status, startTime]);

	useEffect(() => {
		// Connect to SSE endpoint
		const url = `/api/run/stream?flowId=${encodeURIComponent(flowId)}&device=${device}`;

		const eventSource = new EventSource(url);

		eventSource.onmessage = (event) => {
			const progressEvent: FlowProgressEvent = JSON.parse(event.data);

			switch (progressEvent.type) {
				case "start": {
					const data = progressEvent.data as any;
					setFlowName(data.flowName);
					setTotalSteps(data.totalSteps);
					setRunId(data.runId);
					setStatus("running");

					// Initialize steps array
					const initialSteps: StepProgress[] = [];
					for (let i = 0; i < data.totalSteps; i++) {
						initialSteps.push({
							number: i + 1,
							name: "",
							url: "",
							status: "pending",
						});
					}
					setSteps(initialSteps);
					break;
				}

				case "step_start": {
					const data = progressEvent.data as any;
					setCurrentStep(data.stepNumber);
					setSteps((prev) =>
						prev.map((step, idx) =>
							idx === data.stepNumber - 1
								? {
										...step,
										name: data.stepName,
										url: data.url,
										status: "running" as const,
									}
								: step,
						),
					);
					break;
				}

				case "step_complete": {
					const data = progressEvent.data as any;
					setSteps((prev) =>
						prev.map((step, idx) =>
							idx === data.stepNumber - 1
								? {
										...step,
										status: data.result.passed ? "passed" : "failed",
										result: data.result,
									}
								: step,
						),
					);
					break;
				}

				case "step_error": {
					const data = progressEvent.data as any;
					setSteps((prev) =>
						prev.map((step, idx) =>
							idx === data.stepNumber - 1
								? {
										...step,
										status: "failed" as const,
										error: data.error,
									}
								: step,
						),
					);
					break;
				}

				case "complete": {
					const data = progressEvent.data as any;
					setStatus("complete");
					setElapsedTime(data.report.duration || Date.now() - startTime);
					if (onComplete) {
						onComplete(data.report.runId || runId);
					}
					eventSource.close();
					break;
				}

				case "error": {
					const data = progressEvent.data as any;
					setStatus("error");
					if (onError) {
						onError(data.error);
					}
					eventSource.close();
					break;
				}
			}
		};

		eventSource.onerror = () => {
			setStatus("error");
			if (onError) {
				onError("Connection lost");
			}
			eventSource.close();
		};

		return () => {
			eventSource.close();
		};
	}, [flowId, device]); // Only re-connect if flowId or device changes

	const formatTime = (ms: number): string => {
		const seconds = Math.floor(ms / 1000);
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;

		if (minutes > 0) {
			return `${minutes}m ${remainingSeconds}s`;
		}
		return `${seconds}s`;
	};

	const getStatusIcon = (status: StepProgress["status"]) => {
		switch (status) {
			case "pending":
				return (
					<div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600" />
				);
			case "running":
				return (
					<div className="w-6 h-6 rounded-full border-2 border-primary-600 dark:border-primary-400 border-t-transparent animate-spin" />
				);
			case "passed":
				return (
					<svg
						className="w-6 h-6 text-success-600 dark:text-success-400"
						fill="currentColor"
						viewBox="0 0 20 20"
					>
						<path
							fillRule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
							clipRule="evenodd"
						/>
					</svg>
				);
			case "failed":
				return (
					<svg
						className="w-6 h-6 text-error-600 dark:text-error-400"
						fill="currentColor"
						viewBox="0 0 20 20"
					>
						<path
							fillRule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
							clipRule="evenodd"
						/>
					</svg>
				);
		}
	};

	if (status === "connecting") {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="text-center">
					<div className="w-12 h-12 rounded-full border-4 border-primary-600 border-t-transparent animate-spin mx-auto mb-4" />
					<p className="text-gray-600 dark:text-gray-400">
						Connecting to test runner...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-h3 text-gray-900 dark:text-white">
						{flowName}
					</h3>
					<p className="text-sm text-gray-600 dark:text-gray-400">
						{device === "mobile" ? "📱 Mobile" : "🖥️ Desktop"} • Step{" "}
						{currentStep} of {totalSteps}
					</p>
				</div>
				<div className="text-right">
					<div className="text-2xl font-semibold text-gray-900 dark:text-white">
						{formatTime(elapsedTime)}
					</div>
					<div className="text-sm text-gray-600 dark:text-gray-400">
						{status === "running" && "In progress..."}
						{status === "complete" && "✓ Complete"}
						{status === "error" && "✗ Failed"}
					</div>
				</div>
			</div>

			{/* Progress Bar */}
			<div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
				<div
					className="absolute top-0 left-0 h-full bg-primary-600 dark:bg-primary-400 transition-all duration-300"
					style={{
						width: `${(currentStep / totalSteps) * 100}%`,
					}}
				/>
			</div>

			{/* Steps List */}
			<div className="space-y-2 max-h-96 overflow-y-auto">
				{steps.map((step) => (
					<div
						key={step.number}
						className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
							step.status === "running"
								? "bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800"
								: step.status === "passed"
									? "bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800"
									: step.status === "failed"
										? "bg-error-50 dark:bg-error-900/20 border-error-200 dark:border-error-800"
										: "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
						}`}
					>
						<div className="flex-shrink-0 mt-0.5">
							{getStatusIcon(step.status)}
						</div>

						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2">
								<span className="text-sm font-semibold text-gray-900 dark:text-white">
									Step {step.number}
								</span>
								{step.name && (
									<span className="text-sm text-gray-700 dark:text-gray-300">
										{step.name}
									</span>
								)}
							</div>

							{step.url && (
								<p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-1">
									{step.url}
								</p>
							)}

							{step.error && (
								<p className="text-xs text-error-600 dark:text-error-400 mt-1">
									{step.error}
								</p>
							)}

							{step.result && (
								<div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
									{step.result.assertions.length > 0 && (
										<span>
											{step.result.assertions.filter((a) => a.passed).length}/
											{step.result.assertions.length} assertions passed
										</span>
									)}
									{step.result.screenshots.length > 0 && (
										<span className="ml-2">
											📸 {step.result.screenshots.length} screenshot(s)
										</span>
									)}
								</div>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
