import type { ReactNode } from "react";

interface PageLayoutProps {
	title: string;
	description?: string;
	action?: ReactNode;
	filters?: ReactNode;
	children: ReactNode;
}

/**
 * Reusable page layout with fixed header and scrollable content
 * Ensures consistent behavior across all pages
 */
export function PageLayout({
	title,
	description,
	action,
	filters,
	children,
}: PageLayoutProps) {
	return (
		<div className="flex flex-col -m-6 h-[calc(100vh)]">
			{/* Fixed Header */}
			<div className="flex-shrink-0 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
				<div className="flex items-center justify-between gap-4">
					<div className="min-w-0">
						<h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
							{title}
						</h1>
						{description && (
							<p className="text-sm text-gray-600 dark:text-gray-400">
								{description}
							</p>
						)}
					</div>
					{action && <div className="flex-shrink-0">{action}</div>}
				</div>
			</div>

			{/* Fixed Filters (optional) */}
			{filters && (
				<div className="flex-shrink-0 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3">
					{filters}
				</div>
			)}

			{/* Scrollable Content */}
			<div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4 min-h-0">
				{children}
			</div>
		</div>
	);
}
