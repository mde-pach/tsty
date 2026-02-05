"use client";

import { MetricCard } from "./ui";

interface FlowMetricsProps {
	passRate: number | null;
	avgDuration: number | null; // in milliseconds
	lastRun: {
		time: string;
		status: "passed" | "failed";
	} | null;
}

export function FlowMetrics({
	passRate,
	avgDuration,
	lastRun,
}: FlowMetricsProps) {
	const passRateVariant =
		passRate !== null && passRate >= 80
			? "success"
			: passRate !== null && passRate >= 60
				? "warning"
				: passRate !== null
					? "error"
					: "default";

	const formatDuration = (ms: number) => {
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
		if (diffInSeconds < 604800)
			return `${Math.floor(diffInSeconds / 86400)}d ago`;

		return past.toLocaleDateString();
	};

	return (
		<div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
			<MetricCard
				label="Pass Rate"
				value={passRate !== null ? `${passRate}%` : "N/A"}
				variant={passRateVariant}
				trend={
					passRate !== null && passRate >= 80
						? { value: 5, positive: true }
						: undefined
				}
			/>

			<MetricCard
				label="Avg Duration"
				value={avgDuration !== null ? formatDuration(avgDuration) : "N/A"}
				variant="default"
			/>

			<MetricCard
				label="Last Run"
				value={lastRun ? getRelativeTime(lastRun.time) : "Never"}
				variant={
					lastRun
						? lastRun.status === "passed"
							? "success"
							: "error"
						: "default"
				}
			/>
		</div>
	);
}
