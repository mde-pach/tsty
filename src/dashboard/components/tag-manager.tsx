"use client";

import { useState } from "react";
import type { Tag } from "../../lib/types";
import { useTags } from "../hooks/use-tags";

export function TagManager() {
	const { tags, loading, error, createTag, updateTag, deleteTag, getTagUsage } =
		useTags();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingTag, setEditingTag] = useState<Tag | null>(null);
	const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
	const [formData, setFormData] = useState({
		name: "",
		category: "",
		color: "#3B82F6",
	});
	const [tagUsage, setTagUsage] = useState<
		Record<string, { flowCount: number; actionCount: number }>
	>({});

	const loadTagUsage = async (tagId: string) => {
		try {
			const usage = await getTagUsage(tagId);
			setTagUsage((prev) => ({
				...prev,
				[tagId]: { flowCount: usage.flowCount, actionCount: usage.actionCount },
			}));
		} catch (err) {
			console.error("Failed to load tag usage:", err);
		}
	};

	const handleOpenModal = (tag?: Tag) => {
		if (tag) {
			setEditingTag(tag);
			setFormData({
				name: tag.name,
				category: tag.category || "",
				color: tag.color || "#3B82F6",
			});
		} else {
			setEditingTag(null);
			setFormData({ name: "", category: "", color: "#3B82F6" });
		}
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setEditingTag(null);
		setFormData({ name: "", category: "", color: "#3B82F6" });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			if (editingTag) {
				await updateTag(editingTag.id, formData);
			} else {
				await createTag(formData);
			}
			handleCloseModal();
		} catch (err) {
			console.error("Failed to save tag:", err);
		}
	};

	const handleDelete = async (tagId: string) => {
		try {
			await deleteTag(tagId);
			setDeleteConfirm(null);
		} catch (err) {
			console.error("Failed to delete tag:", err);
		}
	};

	const groupedTags = tags.reduce(
		(acc, tag) => {
			const category = tag.category || "Uncategorized";
			if (!acc[category]) {
				acc[category] = [];
			}
			acc[category].push(tag);
			return acc;
		},
		{} as Record<string, Tag[]>,
	);

	if (loading) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="text-gray-600 dark:text-gray-400">Loading tags...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-md">
				Error: {error}
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
						Tags
					</h2>
					<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
						Organize your flows and actions with tags
					</p>
				</div>
				<button
					onClick={() => handleOpenModal()}
					className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-md font-medium transition-colors"
				>
					Create Tag
				</button>
			</div>

			{/* Tags by Category */}
			{Object.keys(groupedTags).length === 0 ? (
				<div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
					<p className="text-gray-600 dark:text-gray-400 mb-4">No tags yet</p>
					<button
						onClick={() => handleOpenModal()}
						className="text-blue-600 dark:text-blue-400 hover:underline"
					>
						Create your first tag
					</button>
				</div>
			) : (
				<div className="space-y-6">
					{Object.entries(groupedTags).map(([category, categoryTags]) => (
						<div
							key={category}
							className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
						>
							<div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
								<h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase">
									{category}
								</h3>
							</div>
							<div className="divide-y divide-gray-200 dark:divide-gray-700">
								{categoryTags.map((tag) => (
									<div
										key={tag.id}
										className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
										onMouseEnter={() =>
											!tagUsage[tag.id] && loadTagUsage(tag.id)
										}
									>
										<div className="flex items-center gap-3">
											<div
												className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600"
												style={{ backgroundColor: tag.color || "#3B82F6" }}
											/>
											<span className="font-medium text-gray-900 dark:text-white">
												{tag.name}
											</span>
											{tagUsage[tag.id] && (
												<span className="text-xs text-gray-500 dark:text-gray-400">
													{tagUsage[tag.id].flowCount} flows,{" "}
													{tagUsage[tag.id].actionCount} actions
												</span>
											)}
										</div>
										<div className="flex items-center gap-2">
											<button
												onClick={() => handleOpenModal(tag)}
												className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
												title="Edit tag"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="16"
													height="16"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2"
													strokeLinecap="round"
													strokeLinejoin="round"
												>
													<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
													<path d="m15 5 4 4" />
												</svg>
											</button>
											{deleteConfirm === tag.id ? (
												<div className="flex items-center gap-1">
													<button
														onClick={() => handleDelete(tag.id)}
														className="px-2 py-1 text-xs text-white bg-red-600 hover:bg-red-700 rounded"
													>
														Confirm
													</button>
													<button
														onClick={() => setDeleteConfirm(null)}
														className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
													>
														Cancel
													</button>
												</div>
											) : (
												<button
													onClick={() => setDeleteConfirm(tag.id)}
													className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
													title="Delete tag"
												>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="16"
														height="16"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														strokeWidth="2"
														strokeLinecap="round"
														strokeLinejoin="round"
													>
														<path d="M3 6h18" />
														<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
														<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
													</svg>
												</button>
											)}
										</div>
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			)}

			{/* Modal */}
			{isModalOpen && (
				<>
					<div
						className="fixed inset-0 bg-black/50 z-40"
						onClick={handleCloseModal}
					/>
					<div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 border border-gray-200 dark:border-gray-700">
						<form onSubmit={handleSubmit}>
							<div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
									{editingTag ? "Edit Tag" : "Create Tag"}
								</h3>
							</div>
							<div className="px-6 py-4 space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
										Name *
									</label>
									<input
										type="text"
										value={formData.name}
										onChange={(e) =>
											setFormData({ ...formData, name: e.target.value })
										}
										className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
										required
										autoFocus
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
										Category
									</label>
									<input
										type="text"
										value={formData.category}
										onChange={(e) =>
											setFormData({ ...formData, category: e.target.value })
										}
										className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
										placeholder="e.g., priority, feature, environment"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
										Color
									</label>
									<div className="flex items-center gap-3">
										<input
											type="color"
											value={formData.color}
											onChange={(e) =>
												setFormData({ ...formData, color: e.target.value })
											}
											className="w-16 h-10 rounded cursor-pointer"
										/>
										<input
											type="text"
											value={formData.color}
											onChange={(e) =>
												setFormData({ ...formData, color: e.target.value })
											}
											className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
											pattern="^#[0-9A-Fa-f]{6}$"
										/>
									</div>
								</div>
							</div>
							<div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
								<button
									type="button"
									onClick={handleCloseModal}
									className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md font-medium transition-colors"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-md font-medium transition-colors"
								>
									{editingTag ? "Save Changes" : "Create Tag"}
								</button>
							</div>
						</form>
					</div>
				</>
			)}
		</div>
	);
}
