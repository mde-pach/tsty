"use client";

import { useState } from "react";
import { CategoryManager } from "./category-manager";
import { TagManager } from "./tag-manager";

interface OrganizeModalProps {
	isOpen: boolean;
	onClose: () => void;
}

type OrganizeTab = "categories" | "tags";

export function OrganizeModal({ isOpen, onClose }: OrganizeModalProps) {
	const [activeTab, setActiveTab] = useState<OrganizeTab>("categories");

	if (!isOpen) return null;

	return (
		<>
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="fixed inset-0 z-50 overflow-y-auto">
				<div className="flex min-h-full items-center justify-center p-4">
					<div
						className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Header */}
						<div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
							<div>
								<h2 className="text-h1 text-gray-900 dark:text-white">
									Organize
								</h2>
								<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
									Manage your flows and actions organization
								</p>
							</div>
							<button
								onClick={onClose}
								className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
							>
								<svg
									className="w-5 h-5"
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

						{/* Info Banner */}
						<div className="px-6 py-3 bg-primary-50 dark:bg-primary-900/20 border-b border-primary-200 dark:border-primary-800">
							<div className="flex items-start gap-3">
								<svg
									className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
										clipRule="evenodd"
									/>
								</svg>
								<div className="flex-1">
									<p className="text-sm text-primary-900 dark:text-primary-100 font-medium">
										Simplified Organization
									</p>
									<p className="text-sm text-primary-700 dark:text-primary-300 mt-1">
										Use <strong>Categories</strong> for folder-based organization
										and <strong>Tags</strong> for flexible labeling. Pages are
										auto-generated from URLs.
									</p>
								</div>
							</div>
						</div>

						{/* Tabs */}
						<div className="border-b border-gray-200 dark:border-gray-700 px-6">
							<nav className="flex gap-6">
								<button
									onClick={() => setActiveTab("categories")}
									className={`
										flex items-center gap-2 px-1 py-3 border-b-2 font-medium text-sm transition-colors
										${
											activeTab === "categories"
												? "border-primary-600 text-primary-600 dark:text-primary-400"
												: "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600"
										}
									`}
								>
									<span>📁</span>
									Categories
								</button>
								<button
									onClick={() => setActiveTab("tags")}
									className={`
										flex items-center gap-2 px-1 py-3 border-b-2 font-medium text-sm transition-colors
										${
											activeTab === "tags"
												? "border-primary-600 text-primary-600 dark:text-primary-400"
												: "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600"
										}
									`}
								>
									<span>🏷️</span>
									Tags
								</button>
							</nav>
						</div>

						{/* Content */}
						<div className="px-6 py-4 overflow-y-auto max-h-[calc(85vh-240px)]">
							{activeTab === "categories" && (
								<div>
									<CategoryManager />
								</div>
							)}
							{activeTab === "tags" && (
								<div>
									<TagManager />
								</div>
							)}
						</div>

						{/* Footer */}
						<div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
							<div className="flex items-center justify-between">
								<div className="text-sm text-gray-600 dark:text-gray-400">
									<kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">
										Cmd
									</kbd>
									+
									<kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">
										O
									</kbd>
									<span className="ml-2">to open this dialog</span>
								</div>
								<button
									onClick={onClose}
									className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
								>
									Done
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
