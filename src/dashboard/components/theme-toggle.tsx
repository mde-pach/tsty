"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	// Avoid hydration mismatch
	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<button
				className="px-3 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-700"
				disabled
			>
				...
			</button>
		);
	}

	return (
		<div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-md">
			<button
				onClick={() => setTheme("light")}
				className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
					theme === "light"
						? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
						: "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
				}`}
				title="Light mode"
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
					<circle cx="12" cy="12" r="4" />
					<path d="M12 2v2" />
					<path d="M12 20v2" />
					<path d="m4.93 4.93 1.41 1.41" />
					<path d="m17.66 17.66 1.41 1.41" />
					<path d="M2 12h2" />
					<path d="M20 12h2" />
					<path d="m6.34 17.66-1.41 1.41" />
					<path d="m19.07 4.93-1.41 1.41" />
				</svg>
			</button>

			<button
				onClick={() => setTheme("system")}
				className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
					theme === "system"
						? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
						: "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
				}`}
				title="System preference"
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
					<rect width="20" height="14" x="2" y="3" rx="2" />
					<line x1="8" x2="16" y1="21" y2="21" />
					<line x1="12" x2="12" y1="17" y2="21" />
				</svg>
			</button>

			<button
				onClick={() => setTheme("dark")}
				className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
					theme === "dark"
						? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
						: "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
				}`}
				title="Dark mode"
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
					<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
				</svg>
			</button>
		</div>
	);
}
