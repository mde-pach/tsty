"use client";

import { useState } from "react";
import { Button, ConfirmModal } from "./ui";

interface Category {
	id: string;
	name: string;
	description?: string;
	color: string;
	flowCount: number;
	actionCount: number;
}

export function CategoryManager() {
	const [categories, setCategories] = useState<Category[]>([
		{
			id: "authentication",
			name: "Authentication",
			description: "Login, logout, and auth-related flows",
			color: "bg-blue-500",
			flowCount: 5,
			actionCount: 8,
		},
		{
			id: "checkout",
			name: "Checkout",
			description: "Shopping cart and payment flows",
			color: "bg-green-500",
			flowCount: 3,
			actionCount: 12,
		},
		{
			id: "dashboard",
			name: "Dashboard",
			description: "Dashboard and admin panel tests",
			color: "bg-purple-500",
			flowCount: 7,
			actionCount: 4,
		},
	]);

	const [showCreateForm, setShowCreateForm] = useState(false);
	const [newCategory, setNewCategory] = useState({
		name: "",
		description: "",
		color: "bg-blue-500",
	});
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

	const colors = [
		{ value: "bg-blue-500", label: "Blue" },
		{ value: "bg-green-500", label: "Green" },
		{ value: "bg-purple-500", label: "Purple" },
		{ value: "bg-orange-500", label: "Orange" },
		{ value: "bg-pink-500", label: "Pink" },
		{ value: "bg-yellow-500", label: "Yellow" },
		{ value: "bg-red-500", label: "Red" },
		{ value: "bg-indigo-500", label: "Indigo" },
	];

	const handleCreate = () => {
		if (!newCategory.name.trim()) return;

		const category: Category = {
			id: newCategory.name.toLowerCase().replace(/\s+/g, "-"),
			name: newCategory.name,
			description: newCategory.description,
			color: newCategory.color,
			flowCount: 0,
			actionCount: 0,
		};

		setCategories([...categories, category]);
		setNewCategory({ name: "", description: "", color: "bg-blue-500" });
		setShowCreateForm(false);
	};

	const handleDelete = (id: string) => {
		const category = categories.find((c) => c.id === id);
		if (!category) return;
		setCategoryToDelete(category);
		setShowDeleteConfirm(true);
	};

	const handleDeleteConfirm = () => {
		if (!categoryToDelete) return;
		setCategories(categories.filter((c) => c.id !== categoryToDelete.id));
		setCategoryToDelete(null);
	};

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-base font-semibold text-gray-900 dark:text-white">
						Categories
					</h3>
					<p className="text-sm text-gray-600 dark:text-gray-400">
						{categories.length} categories
					</p>
				</div>
				<Button
					onClick={() => setShowCreateForm(!showCreateForm)}
					className="text-sm"
				>
					{showCreateForm ? "Cancel" : "+ New Category"}
				</Button>
			</div>

			{/* Create Form */}
			{showCreateForm && (
				<div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
					<h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
						Create Category
					</h4>
					<div className="space-y-3">
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								Name
							</label>
							<input
								type="text"
								value={newCategory.name}
								onChange={(e) =>
									setNewCategory({ ...newCategory, name: e.target.value })
								}
								placeholder="e.g., Authentication"
								className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								Description (optional)
							</label>
							<input
								type="text"
								value={newCategory.description}
								onChange={(e) =>
									setNewCategory({ ...newCategory, description: e.target.value })
								}
								placeholder="Brief description"
								className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Color
							</label>
							<div className="flex flex-wrap gap-2">
								{colors.map((color) => (
									<button
										key={color.value}
										type="button"
										onClick={() =>
											setNewCategory({ ...newCategory, color: color.value })
										}
										className={`
											w-8 h-8 rounded-lg ${color.value}
											${newCategory.color === color.value ? "ring-2 ring-offset-2 ring-gray-900 dark:ring-gray-100" : ""}
											hover:opacity-80 transition-opacity
										`}
										title={color.label}
									/>
								))}
							</div>
						</div>
						<Button onClick={handleCreate} className="w-full">
							Create Category
						</Button>
					</div>
				</div>
			)}

			{/* Categories List */}
			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{categories.map((category) => (
					<div
						key={category.id}
						className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
					>
						<div className="flex items-start justify-between mb-3">
							<div className="flex items-center gap-2">
								<div className={`w-3 h-3 rounded-full ${category.color}`} />
								<h4 className="font-medium text-gray-900 dark:text-white">
									{category.name}
								</h4>
							</div>
							<button
								onClick={() => handleDelete(category.id)}
								className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
							>
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>

						{category.description && (
							<p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
								{category.description}
							</p>
						)}

						<div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
							<div className="flex items-center gap-1">
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
									/>
								</svg>
								<span>{category.flowCount} flows</span>
							</div>
							<div className="flex items-center gap-1">
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M13 10V3L4 14h7v7l9-11h-7z"
									/>
								</svg>
								<span>{category.actionCount} actions</span>
							</div>
						</div>
					</div>
				))}
			</div>

			{categories.length === 0 && (
				<div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
					<svg
						className="w-12 h-12 text-gray-400 mx-auto mb-3"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
						/>
					</svg>
					<p className="text-gray-600 dark:text-gray-400 mb-2">
						No categories yet
					</p>
					<p className="text-sm text-gray-500 dark:text-gray-500">
						Create your first category to organize flows and actions
					</p>
				</div>
			)}

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={showDeleteConfirm}
				onClose={() => {
					setShowDeleteConfirm(false);
					setCategoryToDelete(null);
				}}
				onConfirm={handleDeleteConfirm}
				title="Delete Category"
				message={
					categoryToDelete
						? categoryToDelete.flowCount > 0 || categoryToDelete.actionCount > 0
							? `This category has ${categoryToDelete.flowCount} flows and ${categoryToDelete.actionCount} actions. Items will be moved to "Uncategorized". Continue?`
							: `Are you sure you want to delete the category "${categoryToDelete.name}"?`
						: "Are you sure you want to delete this category?"
				}
				confirmLabel="Delete"
				variant="danger"
			/>
		</div>
	);
}
