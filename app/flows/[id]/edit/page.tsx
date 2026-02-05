"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FlowBuilder } from "../../../../src/dashboard/components/flow-editor/flow-builder";
import { FlowEditorProvider } from "../../../../src/dashboard/contexts/flow-editor-context";
import type { Flow } from "../../../../src/lib/types";

export default function EditFlowPage() {
	const params = useParams();
	const router = useRouter();
	// Decode URL-encoded ID: "e2e%2Fe2e-action-creation" -> "e2e/e2e-action-creation"
	const flowId = params?.id ? decodeURIComponent(params.id as string) : "";

	const [flow, setFlow] = useState<Flow | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		loadFlow();
	}, [flowId]);

	const loadFlow = async () => {
		try {
			const response = await fetch("/api/flows");
			const data = await response.json();

			if (data.success && data.data) {
				const flowFile = data.data.find((f: any) => f.id === flowId);
				if (flowFile) {
					setFlow(flowFile.flow);
				} else {
					setError("Flow not found");
				}
			} else {
				setError(data.error || "Failed to load flow");
			}
		} catch (err) {
			setError(String(err));
		} finally {
			setLoading(false);
		}
	};

	const handleSave = async (updatedFlow: Flow) => {
		try {
			const response = await fetch("/api/flows", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id: flowId, flow: updatedFlow }),
			});

			const data = await response.json();

			if (!data.success) {
				throw new Error(data.error || "Failed to save flow");
			}
		} catch (error) {
			console.error("Error saving flow:", error);
			alert("Failed to save flow: " + error);
			throw error;
		}
	};

	if (loading) {
		return (
			<div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
				<div className="text-center">
					<div className="text-lg text-gray-600 dark:text-gray-400 mb-2">
						Loading flow...
					</div>
				</div>
			</div>
		);
	}

	if (error || !flow) {
		return (
			<div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
				<div className="text-center max-w-md">
					<div className="text-lg text-red-600 dark:text-red-400 mb-4">
						{error || "Flow not found"}
					</div>
					<button
						onClick={() => router.push("/")}
						className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
					>
						Back to Dashboard
					</button>
				</div>
			</div>
		);
	}

	return (
		<FlowEditorProvider initialFlow={flow} flowId={flowId} onSave={handleSave}>
			<FlowBuilder />
		</FlowEditorProvider>
	);
}
