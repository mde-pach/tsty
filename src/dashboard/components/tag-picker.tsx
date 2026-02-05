"use client";

import { useEffect, useRef, useState } from "react";
import { useTags } from "../hooks/use-tags";

interface TagPickerProps {
	selectedTags: string[];
	onChange: (tags: string[]) => void;
	placeholder?: string;
	maxTags?: number;
}

export function TagPicker({
	selectedTags,
	onChange,
	placeholder = "Add tags...",
	maxTags,
}: TagPickerProps) {
	const { tags, loading } = useTags();
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const containerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const filteredTags = tags.filter((tag) => {
		const matchesSearch = tag.name
			.toLowerCase()
			.includes(searchQuery.toLowerCase());
		const notSelected = !selectedTags.includes(tag.name);
		return matchesSearch && notSelected;
	});

	const groupedFilteredTags = filteredTags.reduce(
		(acc, tag) => {
			const category = tag.category || "Uncategorized";
			if (!acc[category]) {
				acc[category] = [];
			}
			acc[category].push(tag);
			return acc;
		},
		{} as Record<string, typeof tags>,
	);

	const toggleTag = (tagName: string) => {
		if (selectedTags.includes(tagName)) {
			onChange(selectedTags.filter((t) => t !== tagName));
		} else {
			if (maxTags && selectedTags.length >= maxTags) {
				return;
			}
			onChange([...selectedTags, tagName]);
		}
	};

	const removeTag = (tagName: string) => {
		onChange(selectedTags.filter((t) => t !== tagName));
	};

	const handleInputFocus = () => {
		setIsOpen(true);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value);
		setIsOpen(true);
	};

	const selectedTagObjects = tags.filter((tag) =>
		selectedTags.includes(tag.name),
	);

	return (
		<div ref={containerRef} className="relative">
			{/* Selected Tags */}
			{selectedTags.length > 0 && (
				<div className="flex flex-wrap gap-2 mb-2">
					{selectedTagObjects.map((tag) => (
						<span
							key={tag.id}
							className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium text-white"
							style={{ backgroundColor: tag.color || "#3B82F6" }}
						>
							{tag.name}
							<button
								onClick={() => removeTag(tag.name)}
								className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
								type="button"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="14"
									height="14"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<line x1="18" y1="6" x2="6" y2="18" />
									<line x1="6" y1="6" x2="18" y2="18" />
								</svg>
							</button>
						</span>
					))}
				</div>
			)}

			{/* Input */}
			<div className="relative">
				<div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
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
						<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
						<line x1="7" y1="7" x2="7.01" y2="7" />
					</svg>
				</div>
				<input
					ref={inputRef}
					type="text"
					value={searchQuery}
					onChange={handleInputChange}
					onFocus={handleInputFocus}
					placeholder={placeholder}
					className="w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
					disabled={
						loading || (maxTags !== undefined && selectedTags.length >= maxTags)
					}
				/>
				{maxTags !== undefined && (
					<div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400">
						{selectedTags.length}/{maxTags}
					</div>
				)}
			</div>

			{/* Dropdown */}
			{isOpen && !loading && (
				<div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
					{Object.keys(groupedFilteredTags).length === 0 ? (
						<div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
							{searchQuery ? "No tags found" : "No more tags available"}
						</div>
					) : (
						Object.entries(groupedFilteredTags).map(
							([category, categoryTags]) => (
								<div key={category}>
									<div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-900 sticky top-0">
										{category}
									</div>
									{categoryTags.map((tag) => (
										<button
											key={tag.id}
											type="button"
											onClick={() => {
												toggleTag(tag.name);
												setSearchQuery("");
												inputRef.current?.focus();
											}}
											className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
										>
											<div
												className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600"
												style={{ backgroundColor: tag.color || "#3B82F6" }}
											/>
											<span className="text-sm text-gray-900 dark:text-white">
												{tag.name}
											</span>
										</button>
									))}
								</div>
							),
						)
					)}
				</div>
			)}

			{loading && (
				<div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg px-4 py-3">
					<div className="text-sm text-gray-500 dark:text-gray-400 text-center">
						Loading tags...
					</div>
				</div>
			)}
		</div>
	);
}
