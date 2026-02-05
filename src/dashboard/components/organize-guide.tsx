export function OrganizeGuide() {
	const features = [
		{
			icon: "📁",
			title: "Categories",
			description:
				"Group flows and actions into logical categories like 'Authentication', 'Checkout', or 'Dashboard'. Use the category field when creating or editing items.",
		},
		{
			icon: "🗂️",
			title: "Page Hierarchy",
			description:
				"Automatically organizes flows by the pages they test. Click any page to filter flows that visit it. Great for finding all tests related to a specific page.",
		},
		{
			icon: "🏷️",
			title: "Tags",
			description:
				"Add multiple tags to flows and actions for flexible organization. Use tags like 'critical', 'smoke-test', 'regression', or feature names.",
		},
		{
			icon: "📚",
			title: "Smart Collections",
			description:
				"Create dynamic collections that automatically include flows matching specific criteria. Collections update automatically as you add or modify flows.",
		},
	];

	const tips = [
		{
			title: "Use categories for broad organization",
			description:
				"Create 5-10 main categories that represent major features or sections of your app.",
		},
		{
			title: "Tags for cross-cutting concerns",
			description:
				"Use tags for things that span multiple categories: priority levels, test types, or release versions.",
		},
		{
			title: "Collections for test suites",
			description:
				"Build collections for common test runs: 'Smoke Tests', 'Pre-Deploy', 'Regression Suite'.",
		},
		{
			title: "Page hierarchy for navigation",
			description:
				"Use the page tree to quickly find all tests for a specific page or section of your app.",
		},
	];

	return (
		<div className="bg-gradient-to-br from-primary-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 rounded-lg border border-primary-200 dark:border-gray-700 p-6 mb-6">
			<div className="flex items-start gap-4">
				<div className="flex-shrink-0 w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
					<svg
						className="w-6 h-6 text-white"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
				<div className="flex-1">
					<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
						Organization Features
					</h3>
					<p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
						Use these tools to keep your test suite organized and easy to
						navigate as it grows.
					</p>

					{/* Features Grid */}
					<div className="grid sm:grid-cols-2 gap-4 mb-6">
						{features.map((feature) => (
							<div
								key={feature.title}
								className="bg-white dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
							>
								<div className="flex items-start gap-2">
									<span className="text-2xl">{feature.icon}</span>
									<div>
										<h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
											{feature.title}
										</h4>
										<p className="text-xs text-gray-600 dark:text-gray-400">
											{feature.description}
										</p>
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Best Practices */}
					<details className="group">
						<summary className="cursor-pointer text-sm font-medium text-primary-700 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 flex items-center gap-2">
							<svg
								className="w-4 h-4 group-open:rotate-90 transition-transform"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 5l7 7-7 7"
								/>
							</svg>
							Best Practices
						</summary>
						<div className="mt-3 pl-6 space-y-2">
							{tips.map((tip) => (
								<div key={tip.title} className="text-sm">
									<span className="font-medium text-gray-900 dark:text-white">
										{tip.title}:
									</span>{" "}
									<span className="text-gray-600 dark:text-gray-400">
										{tip.description}
									</span>
								</div>
							))}
						</div>
					</details>
				</div>
			</div>
		</div>
	);
}
