"use client";

interface ShortcutsHelpProps {
	isOpen: boolean;
	onClose: () => void;
}

interface ShortcutGroup {
	title: string;
	shortcuts: Array<{
		keys: string[];
		description: string;
	}>;
}

const shortcutGroups: ShortcutGroup[] = [
	{
		title: "Global",
		shortcuts: [
			{ keys: ["⌘", "K"], description: "Open command palette" },
			{ keys: ["⌘", "/"], description: "Show keyboard shortcuts" },
			{ keys: ["⌘", "O"], description: "Open organize modal" },
			{ keys: ["⌘", "1"], description: "Navigate to Tests" },
			{ keys: ["⌘", "2"], description: "Navigate to Results" },
			{ keys: ["⌘", "3"], description: "Navigate to Library" },
			{ keys: ["⌘", "F"], description: "Focus search" },
			{ keys: ["ESC"], description: "Close modals" },
		],
	},
	{
		title: "Quick Actions",
		shortcuts: [
			{ keys: ["⌘", "N"], description: "Create new flow" },
			{ keys: ["⌘", "⇧", "N"], description: "Create new action" },
			{ keys: ["⌘", "R"], description: "Run all tests" },
		],
	},
	{
		title: "Editor",
		shortcuts: [
			{ keys: ["⌘", "S"], description: "Save (manual)" },
			{ keys: ["⌘", "Z"], description: "Undo" },
			{ keys: ["⌘", "⇧", "Z"], description: "Redo" },
			{ keys: ["⌘", "↵"], description: "Run test / Preview action" },
		],
	},
	{
		title: "Navigation",
		shortcuts: [
			{ keys: ["⌘", "Click"], description: "Quick view modal" },
			{ keys: ["⇧", "Click"], description: "Select range" },
		],
	},
];

export function ShortcutsHelp({ isOpen, onClose }: ShortcutsHelpProps) {
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
						className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Header */}
						<div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
									<svg
										className="w-6 h-6 text-primary-600 dark:text-primary-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
										/>
									</svg>
								</div>
								<div>
									<h2 className="text-h1 text-gray-900 dark:text-white">
										Keyboard Shortcuts
									</h2>
									<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
										Speed up your workflow with these shortcuts
									</p>
								</div>
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

						{/* Content */}
						<div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
							{shortcutGroups.map((group) => (
								<div key={group.title}>
									<h3 className="text-h3 text-gray-900 dark:text-white mb-3">
										{group.title}
									</h3>
									<div className="space-y-2">
										{group.shortcuts.map((shortcut, index) => (
											<div
												key={index}
												className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
											>
												<span className="text-sm text-gray-700 dark:text-gray-300">
													{shortcut.description}
												</span>
												<div className="flex items-center gap-1">
													{shortcut.keys.map((key, keyIndex) => (
														<span key={keyIndex} className="flex items-center">
															<kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm font-mono text-gray-900 dark:text-gray-100 shadow-sm">
																{key}
															</kbd>
															{keyIndex < shortcut.keys.length - 1 && (
																<span className="mx-1 text-gray-400 text-xs">
																	+
																</span>
															)}
														</span>
													))}
												</div>
											</div>
										))}
									</div>
								</div>
							))}
						</div>

						{/* Footer */}
						<div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
							<div className="text-sm text-gray-600 dark:text-gray-400">
								<span className="inline-flex items-center gap-1">
									<kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">
										⌘
									</kbd>
									<span className="mx-1">=</span>
									<kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">
										Cmd
									</kbd>
									<span className="ml-3 mr-1">or</span>
									<kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">
										Ctrl
									</kbd>
									<span className="ml-1">on Windows/Linux</span>
								</span>
							</div>
							<button
								onClick={onClose}
								className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
							>
								Got it
							</button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
