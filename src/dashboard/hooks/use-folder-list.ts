import { useState, useEffect, useCallback } from "react";

interface UseFolderListReturn {
	folders: string[];
	loading: boolean;
	error: string | null;
	refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage the list of all folders (including empty ones)
 */
export function useFolderList(): UseFolderListReturn {
	const [folders, setFolders] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchFolders = useCallback(async (silent = false) => {
		if (!silent) {
			setLoading(true);
		}
		setError(null);

		try {
			const response = await fetch("/api/folders?action=list");
			const result = await response.json();

			if (result.success) {
				setFolders(result.data);
			} else {
				setError(result.error || "Failed to fetch folders");
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : "Unknown error";
			setError(message);
		} finally {
			if (!silent) {
				setLoading(false);
			}
		}
	}, []);

	// Fetch on mount
	useEffect(() => {
		fetchFolders();
	}, [fetchFolders]);

	return {
		folders,
		loading,
		error,
		refetch: () => fetchFolders(true), // Silent refetch
	};
}
