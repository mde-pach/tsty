"use client";

import { useRouter } from "next/navigation";
import { FlowBuilder } from "../../../src/dashboard/components/flow-editor/flow-builder";
import { FlowEditorProvider } from "../../../src/dashboard/contexts/flow-editor-context";
import type { Flow } from "../../../src/lib/types";

const initialFlow: Flow = {
	name: "New Flow",
	description: "",
	baseUrl: "",
	steps: [],
};

export default function NewFlowPage() {
	const router = useRouter();

	const handleSave = async (flow: Flow) => {
		try {
			// Generate ID from name
			const id = flow.name
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/^-|-$/g, "");

			const response = await fetch("/api/flows", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id, flow }),
			});

			const data = await response.json();

			if (data.success) {
				// Navigate to edit page
				router.push(`/flows/${encodeURIComponent(id)}/edit`);
			} else {
				throw new Error(data.error || "Failed to save flow");
			}
		} catch (error) {
			console.error("Error saving flow:", error);
			alert("Failed to save flow: " + error);
		}
	};

	return (
		<FlowEditorProvider initialFlow={initialFlow} onSave={handleSave}>
			<FlowBuilder />
		</FlowEditorProvider>
	);
}
