"use client";

import type { FlowFile } from "../../lib/types";

interface FlowListProps {
	flows: FlowFile[];
	onSelectFlow: (flow: FlowFile) => void;
	onRunFlow: (flowId: string) => void;
	runningFlowId?: string | null;
}

export function FlowList({
	flows,
	onSelectFlow,
	onRunFlow,
	runningFlowId,
}: FlowListProps) {
	if (flows.length === 0) {
		return (
			<div className="text-center py-12 text-gray-500">
				<p className="text-lg">No flows found</p>
				<p className="text-sm mt-2">Create a flow to get started</p>
			</div>
		);
	}

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{flows.map((flow) => (
				<div
					key={flow.id}
					className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
					onClick={() => onSelectFlow(flow)}
				>
					<div className="flex items-start justify-between mb-3">
						<h3 className="font-semibold text-lg">{flow.flow.name}</h3>
						{flow.lastRunStatus && (
							<span
								className={`px-2 py-1 rounded text-xs font-medium ${
									flow.lastRunStatus === "passed"
										? "bg-green-100 text-green-800"
										: "bg-red-100 text-red-800"
								}`}
							>
								{flow.lastRunStatus}
							</span>
						)}
					</div>

					<p className="text-sm text-gray-600 mb-4 line-clamp-2">
						{flow.flow.description}
					</p>

					<div className="flex items-center justify-between text-xs text-gray-500 mb-4">
						<span>{flow.flow.steps.length} steps</span>
						{flow.lastRun && (
							<span>
								Last run: {new Date(flow.lastRun).toLocaleDateString()}
							</span>
						)}
					</div>

					<button
						onClick={(e) => {
							e.stopPropagation();
							onRunFlow(flow.id);
						}}
						disabled={runningFlowId === flow.id}
						className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						{runningFlowId === flow.id ? "Running..." : "Run Test"}
					</button>
				</div>
			))}
		</div>
	);
}
