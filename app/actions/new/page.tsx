"use client";

import { useRouter } from "next/navigation";
import { ActionComposer } from "../../../src/dashboard/components/action-editor/action-composer";
import { ActionEditorProvider } from "../../../src/dashboard/contexts/action-editor-context";
import type { ActionDefinition } from "../../../src/lib/types";

const initialDefinition: ActionDefinition = {
	type: "interaction",
	description: "",
	primitives: [],
	tags: [],
	dependencies: [],
};

export default function NewActionPage() {
	const router = useRouter();

	const handleSave = async (
		id: string,
		name: string,
		definition: ActionDefinition,
	) => {
		try {
			// Generate ID from name if empty
			const actionId =
				id ||
				name
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, "-")
					.replace(/^-|-$/g, "");

			const response = await fetch("/api/actions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id: actionId, definition }),
			});

			const data = await response.json();

			if (data.success) {
				// Navigate to edit page
				router.push(`/actions/${encodeURIComponent(actionId)}/edit`);
			} else {
				throw new Error(data.error || "Failed to save action");
			}
		} catch (error) {
			console.error("Error saving action:", error);
			alert("Failed to save action: " + error);
		}
	};

	return (
		<ActionEditorProvider
			initialId=""
			initialName="New Action"
			initialDefinition={initialDefinition}
			onSave={handleSave}
		>
			<ActionComposer />
		</ActionEditorProvider>
	);
}
