"use client";

import { ExecutionProgress } from "@/dashboard/components/execution-progress";

export default function TestExecutionPage() {
	return (
		<div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
					Test Execution Progress
				</h1>

				<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
					<ExecutionProgress
						flowId="ui-audit/execution-modal-test"
						device="desktop"
						onComplete={(reportId) => {
							console.log("Test complete:", reportId);
							alert(`Test complete! Report ID: ${reportId}`);
						}}
						onError={(error) => {
							console.error("Test error:", error);
							alert(`Test error: ${error}`);
						}}
					/>
				</div>
			</div>
		</div>
	);
}
