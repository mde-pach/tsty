import type { ReactNode } from "react";
import { Button } from "./button";

interface EmptyStateProps {
	icon?: ReactNode;
	title: string;
	description: string;
	action?: {
		label: string;
		onClick: () => void;
	};
}

export function EmptyState({
	icon,
	title,
	description,
	action,
}: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center justify-center py-12 px-4 text-center">
			{icon && (
				<div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
					{icon}
				</div>
			)}
			<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
				{title}
			</h3>
			<p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
				{description}
			</p>
			{action && <Button onClick={action.onClick}>{action.label}</Button>}
		</div>
	);
}
