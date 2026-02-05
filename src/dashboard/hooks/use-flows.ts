"use client";

import { useEffect, useState } from "react";
import type { FlowFile } from "../../lib/types";

export function useFlows() {
	const [flows, setFlows] = useState<FlowFile[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchFlows = async (silent = false) => {
		try {
			// Only show loading state on initial load, not on refetch
			if (!silent) {
				setLoading(true);
			}
			const response = await fetch("/api/flows");
			const data = await response.json();

			if (data.success) {
				setFlows(data.data);
			} else {
				setError(data.error);
			}
		} catch (err) {
			setError(String(err));
		} finally {
			if (!silent) {
				setLoading(false);
			}
		}
	};

	const deleteFlow = async (flowId: string) => {
		try {
			const response = await fetch(`/api/flows/${encodeURIComponent(flowId)}`, {
				method: "DELETE",
			});
			const data = await response.json();

			if (data.success) {
				await fetchFlows(); // Refresh the list
			} else {
				setError(data.error);
			}
		} catch (err) {
			setError(String(err));
		}
	};

	useEffect(() => {
		fetchFlows();
	}, []);

	return {
		flows,
		loading,
		error,
		refetch: () => fetchFlows(true), // Silent refetch to prevent flash
		deleteFlow
	};
}

export function useRunFlow() {
	const [running, setRunning] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const runFlow = async (
		flowId: string,
		device: "desktop" | "mobile" = "desktop",
	) => {
		try {
			setRunning(true);
			setError(null);

			const response = await fetch("/api/run", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ flowId, device }),
			});

			const data = await response.json();

			if (!data.success) {
				setError(data.error);
				return null;
			}

			return data.data;
		} catch (err) {
			setError(String(err));
			return null;
		} finally {
			setRunning(false);
		}
	};

	return { runFlow, running, error };
}
