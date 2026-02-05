"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ActionComposer } from "../../../../src/dashboard/components/action-editor/action-composer";
import { ActionEditorProvider } from "../../../../src/dashboard/contexts/action-editor-context";
import type { ActionDefinition, ActionFile } from "../../../../src/lib/types";

export default function EditActionPage() {
	const params = useParams();
	// Decode URL-encoded ID: "e2e%2Faction-name" -> "e2e/action-name"
	const actionId = params?.id ? decodeURIComponent(params.id as string) : "";

	const [actionFile, setActionFile] = useState<ActionFile | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const loadAction = async () => {
			try {
				// Get the specific action by ID
				const response = await fetch(`/api/actions/${encodeURIComponent(actionId)}`);

				if (!response.ok) {
					throw new Error("Failed to load action");
				}

				const result = await response.json();

				if (!result.success) {
					throw new Error(result.error || "Action not found");
				}

				setActionFile(result.data);
			} catch (err) {
				console.error("Error loading action:", err);
				setError(err instanceof Error ? err.message : "Failed to load action");
			} finally {
				setLoading(false);
			}
		};

		loadAction();
	}, [actionId]);

	const handleSave = async (
		id: string,
		name: string,
		definition: ActionDefinition,
	) => {
		try {
			const response = await fetch(`/api/actions/${encodeURIComponent(id)}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ definition }),
			});

			const data = await response.json();

			if (!data.success) {
				throw new Error(data.error || "Failed to save action");
			}

			// Update local state with saved action file
			setActionFile(data.data);
		} catch (error) {
			console.error("Error saving action:", error);
			alert("Failed to save action: " + error);
		}
	};

	if (loading) {
		return (
			<div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
				<div className="text-center">
					<div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto mb-4" />
					<p className="text-sm text-gray-600 dark:text-gray-400">
						Loading action...
					</p>
				</div>
			</div>
		);
	}

	if (error || !actionFile) {
		return (
			<div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
				<div className="text-center max-w-md">
					<div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="32"
							height="32"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="text-red-600 dark:text-red-400"
						>
							<circle cx="12" cy="12" r="10" />
							<line x1="12" x2="12" y1="8" y2="12" />
							<line x1="12" x2="12.01" y1="16" y2="16" />
						</svg>
					</div>
					<h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
						Failed to load action
					</h2>
					<p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
						{error || "Action not found"}
					</p>
					<a
						href="/dashboard"
						className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
					>
						Back to Dashboard
					</a>
				</div>
			</div>
		);
	}

	return (
		<ActionEditorProvider
			initialId={actionFile.id}
			initialName={actionFile.name}
			initialDefinition={actionFile.definition}
			onSave={handleSave}
		>
			<ActionComposer />
		</ActionEditorProvider>
	);
}
