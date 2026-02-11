"use client";

import { useEffect, useState } from "react";
import type { ApiResponse, FlowFile, SmartCollection } from "../../lib/types";

interface CollectionWithCount extends SmartCollection {
	flowCount: number;
}

export function useCollections() {
	const [collections, setCollections] = useState<CollectionWithCount[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchCollections = async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/tsty/collections");
			const data: ApiResponse<CollectionWithCount[]> = await response.json();

			if (data.success && data.data) {
				setCollections(data.data);
				setError(null);
			} else {
				setError(data.error || "Failed to fetch collections");
			}
		} catch (err) {
			setError(String(err));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchCollections();
	}, []);

	const createCollection = async (
		collection: Omit<SmartCollection, "id" | "createdAt" | "updatedAt">,
	) => {
		try {
			const response = await fetch("/api/tsty/collections", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(collection),
			});

			const data: ApiResponse<SmartCollection> = await response.json();

			if (data.success && data.data) {
				await fetchCollections();
				return data.data;
			} else {
				throw new Error(data.error || "Failed to create collection");
			}
		} catch (err) {
			setError(String(err));
			throw err;
		}
	};

	const updateCollection = async (
		id: string,
		updates: Partial<SmartCollection>,
	) => {
		try {
			const response = await fetch("/api/tsty/collections", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id, ...updates }),
			});

			const data: ApiResponse<SmartCollection> = await response.json();

			if (data.success && data.data) {
				await fetchCollections();
				return data.data;
			} else {
				throw new Error(data.error || "Failed to update collection");
			}
		} catch (err) {
			setError(String(err));
			throw err;
		}
	};

	const deleteCollection = async (id: string) => {
		try {
			const response = await fetch(`/api/tsty/collections?id=${id}`, {
				method: "DELETE",
			});

			const data: ApiResponse<void> = await response.json();

			if (data.success) {
				await fetchCollections();
			} else {
				throw new Error(data.error || "Failed to delete collection");
			}
		} catch (err) {
			setError(String(err));
			throw err;
		}
	};

	const getCollectionFlows = async (id: string): Promise<FlowFile[]> => {
		try {
			const response = await fetch(
				`/api/tsty/collections?id=${id}&action=flows`,
			);
			const data: ApiResponse<FlowFile[]> = await response.json();

			if (data.success && data.data) {
				return data.data;
			} else {
				throw new Error(data.error || "Failed to fetch collection flows");
			}
		} catch (err) {
			setError(String(err));
			throw err;
		}
	};

	return {
		collections,
		loading,
		error,
		createCollection,
		updateCollection,
		deleteCollection,
		getCollectionFlows,
		refresh: fetchCollections,
	};
}
