"use client";

import type { ActionFile } from "../../lib/types";

interface ActionLibraryProps {
	actions: ActionFile[];
	onSelectAction: (action: ActionFile) => void;
}

export function ActionLibrary({ actions, onSelectAction }: ActionLibraryProps) {
	const actionsByType = actions.reduce(
		(acc, action) => {
			const type = action.definition.type;
			if (!acc[type]) {
				acc[type] = [];
			}
			acc[type].push(action);
			return acc;
		},
		{} as Record<string, ActionFile[]>,
	);

	if (actions.length === 0) {
		return (
			<div className="text-center py-12 text-gray-500">
				<p className="text-lg">No actions found</p>
				<p className="text-sm mt-2">Create an action to get started</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{Object.entries(actionsByType).map(([type, typeActions]) => (
				<div key={type}>
					<h3 className="text-lg font-semibold mb-3 capitalize">
						{type} Actions
					</h3>
					<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
						{typeActions.map((action) => (
							<div
								key={action.id}
								className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
								onClick={() => onSelectAction(action)}
							>
								<h4 className="font-medium mb-1">{action.name}</h4>
								<p className="text-sm text-gray-600 mb-2 line-clamp-2">
									{action.definition.description}
								</p>
								<div className="flex items-center justify-between text-xs text-gray-500">
									<span>{action.definition.primitives.length} steps</span>
									<span className="px-2 py-0.5 bg-gray-100 rounded">
										{action.definition.type}
									</span>
								</div>
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	);
}
