"use client";

import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useState, useEffect } from "react";
import { ThemeToggle } from "./theme-toggle";
import { OrganizeModal } from "./organize-modal";
import { ShortcutsHelp } from "./shortcuts-help";
import { useKeyboardShortcuts } from "../hooks/use-keyboard-shortcuts";

interface DashboardLayoutProps {
	children: ReactNode;
	showSidebar?: boolean;
}

export type Tab =
	| "overview"
	| "flows"
	| "actions"
	| "reports"
	| "tags"
	| "collections";

interface NavItem {
	id: string;
	label: string;
	href: string;
	icon: ReactNode;
}

export function DashboardLayout({
	children,
	showSidebar = true,
}: DashboardLayoutProps) {
	const router = useRouter();
	const pathname = usePathname();
	const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
	const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] =
		useState(true); // Default to collapsed for more space
	const [isOrganizeModalOpen, setIsOrganizeModalOpen] = useState(false);
	const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState(false);

	// Global keyboard shortcuts
	useKeyboardShortcuts({
		onOrganize: undefined, // Removed - inline editing instead
		onShowShortcuts: () => setIsShortcutsHelpOpen(true),
		onRunAll: () => {
			// TODO: Implement run all tests
			console.log("Run all tests functionality coming soon!");
		},
		onFocusSearch: () => {
			// Focus the first search input on the page
			const searchInput = document.querySelector<HTMLInputElement>(
				'input[type="search"], input[placeholder*="search" i]',
			);
			searchInput?.focus();
		},
	});

	// UX Revamp: Simplified 3-item navigation
	const navItems: NavItem[] = [
		{
			id: "tests",
			label: "Tests",
			href: "/",
			icon: (
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
						d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
					/>
				</svg>
			),
		},
		{
			id: "results",
			label: "Results",
			href: "/runs",
			icon: (
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
						d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
					/>
				</svg>
			),
		},
		{
			id: "library",
			label: "Library",
			href: "/actions",
			icon: (
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
						d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
					/>
				</svg>
			),
		},
	];

	const isActiveRoute = (href: string) => {
		if (href === "/") return pathname === "/";
		return pathname?.startsWith(href);
	};

	// Check if current page needs full-screen layout (editors)
	const isFullScreenPage = pathname?.match(
		/^\/(actions|flows)\/(new|[^/]+\/edit)$/
	);

	return (
		<div className="min-h-screen h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden">
			{/* Mobile Sidebar Overlay */}
			{showSidebar && isMobileSidebarOpen && (
				<div
					className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
					onClick={() => setIsMobileSidebarOpen(false)}
				/>
			)}

			{/* Sidebar */}
			{showSidebar && (
				<aside
					className={`${
						isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
					} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 ${
						isDesktopSidebarCollapsed ? "lg:w-16" : "lg:w-64"
					} w-64 transition-all duration-300 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen`}
				>
					{/* Sidebar Header */}
					<div
						className={`p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 ${isDesktopSidebarCollapsed ? "lg:px-2" : ""}`}
					>
						<div className="flex items-center gap-3">
							<div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
								<span className="text-white font-bold text-sm">QA</span>
							</div>
							{!isDesktopSidebarCollapsed && (
								<div className="min-w-0 flex-1">
									<h2 className="font-semibold text-gray-900 dark:text-white truncate">
										QA Framework
									</h2>
									<p className="text-xs text-gray-500 dark:text-gray-400 truncate">
										Testing Dashboard
									</p>
								</div>
							)}
						</div>
					</div>

					{/* Navigation */}
					<nav className="flex-1 overflow-y-auto custom-scrollbar p-3">
						<div className="space-y-1">
							{navItems.map((item) => {
								const isActive = isActiveRoute(item.href);
								return (
									<button
										key={item.id}
										onClick={() => {
											router.push(item.href);
											setIsMobileSidebarOpen(false);
										}}
										className={`
                      w-full flex items-center gap-3
                      ${isDesktopSidebarCollapsed ? "lg:justify-center lg:px-3" : "px-3"}
                      py-2.5
                      rounded-lg
                      font-medium text-sm
                      transition-colors
                      ${
												isActive
													? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
													: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
											}
                    `}
										title={isDesktopSidebarCollapsed ? item.label : undefined}
									>
										<span className="flex-shrink-0">{item.icon}</span>
										{!isDesktopSidebarCollapsed && <span>{item.label}</span>}
									</button>
								);
							})}
						</div>
					</nav>

					{/* Sidebar Footer */}
					<div
						className={`p-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 ${isDesktopSidebarCollapsed ? "lg:px-2" : ""} space-y-2`}
					>
						{/* Theme Toggle - Desktop */}
						<div className="hidden lg:flex items-center justify-center">
							<ThemeToggle />
						</div>

						<button
							onClick={() =>
								setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed)
							}
							className={`
                hidden lg:flex items-center gap-3
                w-full
                ${isDesktopSidebarCollapsed ? "justify-center px-3" : "px-3"}
                py-2
                text-gray-600 dark:text-gray-400
                hover:bg-gray-100 dark:hover:bg-gray-700
                rounded-lg
                transition-colors
              `}
							title={
								isDesktopSidebarCollapsed
									? "Expand sidebar"
									: "Collapse sidebar"
							}
						>
							<svg
								className={`w-5 h-5 transition-transform ${isDesktopSidebarCollapsed ? "rotate-180" : ""}`}
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
								/>
							</svg>
							{!isDesktopSidebarCollapsed && (
								<span className="text-sm font-medium">Collapse</span>
							)}
						</button>
					</div>
				</aside>
			)}

			{/* Main Content */}
			<div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
				{/* Mobile Header - Only show menu button on mobile */}
				{showSidebar && (
					<div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between flex-shrink-0">
						<button
							onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
							className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
							title="Toggle menu"
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
									d="M4 6h16M4 12h16M4 18h16"
								/>
							</svg>
						</button>
						<ThemeToggle />
					</div>
				)}

				{/* Content Area */}
				{isFullScreenPage ? (
					// Full-screen layout for editors (no padding, no max-width)
					<main className="flex-1 overflow-hidden">{children}</main>
				) : (
					// Standard layout with padding and max-width
					<main className="flex-1 overflow-y-auto custom-scrollbar">
						<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
							{children}
						</div>
					</main>
				)}
			</div>

			{/* Organize Modal */}
			<OrganizeModal
				isOpen={isOrganizeModalOpen}
				onClose={() => setIsOrganizeModalOpen(false)}
			/>

			{/* Shortcuts Help Modal */}
			<ShortcutsHelp
				isOpen={isShortcutsHelpOpen}
				onClose={() => setIsShortcutsHelpOpen(false)}
			/>
		</div>
	);
}
