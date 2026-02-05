import { useState, useCallback } from "react";

interface UseFoldersReturn {
	loading: boolean;
	error: string | null;
	createFolder: (
		type: "flows" | "actions",
		parentPath: string | null,
		name: string,
	) => Promise<boolean>;
	renameFolder: (
		type: "flows" | "actions",
		oldPath: string,
		newName: string,
	) => Promise<boolean>;
	deleteFolder: (
		type: "flows" | "actions",
		folderPath: string,
	) => Promise<boolean>;
	moveItem: (
		type: "flows" | "actions",
		itemId: string,
		targetFolder: string | null,
	) => Promise<boolean>;
	moveFolder: (
		type: "flows" | "actions",
		folderPath: string,
		targetFolder: string | null,
	) => Promise<boolean>;
}

export function useFolders(): UseFoldersReturn {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const createFolder = useCallback(
		async (
			type: "flows" | "actions",
			parentPath: string | null,
			name: string,
		): Promise<boolean> => {
			setLoading(true);
			setError(null);

			try {
				const response = await fetch("/api/folders", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "create",
						type,
						parentPath,
						name,
					}),
				});

				const result = await response.json();

				if (!result.success) {
					setError(result.error || "Failed to create folder");
					return false;
				}

				return true;
			} catch (err) {
				const message =
					err instanceof Error ? err.message : "Unknown error";
				setError(message);
				return false;
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	const renameFolder = useCallback(
		async (
			type: "flows" | "actions",
			oldPath: string,
			newName: string,
		): Promise<boolean> => {
			setLoading(true);
			setError(null);

			try {
				const response = await fetch("/api/folders", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "rename",
						type,
						oldPath,
						newName,
					}),
				});

				const result = await response.json();

				if (!result.success) {
					setError(result.error || "Failed to rename folder");
					return false;
				}

				return true;
			} catch (err) {
				const message =
					err instanceof Error ? err.message : "Unknown error";
				setError(message);
				return false;
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	const deleteFolder = useCallback(
		async (
			type: "flows" | "actions",
			folderPath: string,
		): Promise<boolean> => {
			setLoading(true);
			setError(null);

			try {
				const response = await fetch("/api/folders", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "delete",
						type,
						folderPath,
					}),
				});

				const result = await response.json();

				if (!result.success) {
					setError(result.error || "Failed to delete folder");
					return false;
				}

				return true;
			} catch (err) {
				const message =
					err instanceof Error ? err.message : "Unknown error";
				setError(message);
				return false;
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	const moveItem = useCallback(
		async (
			type: "flows" | "actions",
			itemId: string,
			targetFolder: string | null,
		): Promise<boolean> => {
			setLoading(true);
			setError(null);

			try {
				const response = await fetch("/api/folders", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "move",
						type,
						itemId,
						targetFolder,
					}),
				});

				const result = await response.json();

				if (!result.success) {
					setError(result.error || "Failed to move item");
					return false;
				}

				return true;
			} catch (err) {
				const message =
					err instanceof Error ? err.message : "Unknown error";
				setError(message);
				return false;
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	const moveFolder = useCallback(
		async (
			type: "flows" | "actions",
			folderPath: string,
			targetFolder: string | null,
		): Promise<boolean> => {
			setLoading(true);
			setError(null);

			try {
				const response = await fetch("/api/folders", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "moveFolder",
						type,
						sourceFolderPath: folderPath,
						targetFolder,
					}),
				});

				const result = await response.json();

				if (!result.success) {
					setError(result.error || "Failed to move folder");
					return false;
				}

				return true;
			} catch (err) {
				const message =
					err instanceof Error ? err.message : "Unknown error";
				setError(message);
				return false;
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	return {
		loading,
		error,
		createFolder,
		renameFolder,
		deleteFolder,
		moveItem,
		moveFolder,
	};
}
