"use client";

import { useEffect, useState } from "react";
import type { ApiResponse, Tag, TagUsage } from "../../lib/types";

export function useTags() {
	const [tags, setTags] = useState<Tag[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchTags = async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/tsty/tags");
			const data: ApiResponse<Tag[]> = await response.json();

			if (data.success && data.data) {
				setTags(data.data);
				setError(null);
			} else {
				setError(data.error || "Failed to fetch tags");
			}
		} catch (err) {
			setError(String(err));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchTags();
	}, []);

	const createTag = async (
		tag: Omit<Tag, "id" | "createdAt" | "updatedAt">,
	) => {
		try {
			const response = await fetch("/api/tsty/tags", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(tag),
			});

			const data: ApiResponse<Tag> = await response.json();

			if (data.success && data.data) {
				await fetchTags();
				return data.data;
			} else {
				throw new Error(data.error || "Failed to create tag");
			}
		} catch (err) {
			setError(String(err));
			throw err;
		}
	};

	const updateTag = async (id: string, updates: Partial<Tag>) => {
		try {
			const response = await fetch("/api/tsty/tags", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id, ...updates }),
			});

			const data: ApiResponse<Tag> = await response.json();

			if (data.success && data.data) {
				await fetchTags();
				return data.data;
			} else {
				throw new Error(data.error || "Failed to update tag");
			}
		} catch (err) {
			setError(String(err));
			throw err;
		}
	};

	const deleteTag = async (id: string) => {
		try {
			const response = await fetch(`/api/tsty/tags?id=${id}`, {
				method: "DELETE",
			});

			const data: ApiResponse<void> = await response.json();

			if (data.success) {
				await fetchTags();
			} else {
				throw new Error(data.error || "Failed to delete tag");
			}
		} catch (err) {
			setError(String(err));
			throw err;
		}
	};

	const getTagUsage = async (id: string): Promise<TagUsage> => {
		try {
			const response = await fetch(
				`/api/tsty/tags?id=${id}&action=usage`,
			);
			const data: ApiResponse<TagUsage> = await response.json();

			if (data.success && data.data) {
				return data.data;
			} else {
				throw new Error(data.error || "Failed to fetch tag usage");
			}
		} catch (err) {
			setError(String(err));
			throw err;
		}
	};

	return {
		tags,
		loading,
		error,
		createTag,
		updateTag,
		deleteTag,
		getTagUsage,
		refresh: fetchTags,
	};
}
