"use client";

import { useEffect, useState } from "react";
import type { ActionFile } from "../../lib/types";

export function useActions() {
	const [actions, setActions] = useState<ActionFile[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchActions = async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/actions");
			const data = await response.json();

			if (data.success) {
				setActions(data.data);
			} else {
				setError(data.error);
			}
		} catch (err) {
			setError(String(err));
		} finally {
			setLoading(false);
		}
	};

	const deleteAction = async (actionId: string) => {
		try {
			const response = await fetch(`/api/actions/${encodeURIComponent(actionId)}`, {
				method: "DELETE",
			});
			const data = await response.json();

			if (data.success) {
				await fetchActions(); // Refresh the list
			} else {
				setError(data.error);
			}
		} catch (err) {
			setError(String(err));
		}
	};

	useEffect(() => {
		fetchActions();
	}, []);

	return { actions, loading, error, refetch: fetchActions, deleteAction };
}
