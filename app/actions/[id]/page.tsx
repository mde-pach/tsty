"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge, Button, Card, LoadingState } from "@/dashboard/components/ui";
import type { ActionFile, FlowFile } from "@/lib/types";

interface ActionDetailPageProps {
	params: Promise<{ id: string }>;
}

export default function ActionDetailPage({ params }: ActionDetailPageProps) {
	const router = useRouter();
	const [action, setAction] = useState<ActionFile | null>(null);
	const [loading, setLoading] = useState(true);
	const [actionId, setActionId] = useState<string>("");
	const [usedInFlows, setUsedInFlows] = useState<FlowFile[]>([]);

	useEffect(() => {
		params.then((p) => {
			// Decode URL-encoded ID: "e2e%2Faction-name" -> "e2e/action-name"
			const id = decodeURIComponent(p.id);
			setActionId(id);
		});
	}, [params]);

	useEffect(() => {
		if (!actionId) return;

		const fetchAction = async () => {
			try {
				const response = await fetch(`/api/actions/${encodeURIComponent(actionId)}`);
				const data = await response.json();

				if (data.success) {
					setAction(data.data);

					// Fetch flows using this action
					const flowsResponse = await fetch("/api/flows");
					const flowsData = await flowsResponse.json();
					if (flowsData.success) {
						const flows = flowsData.data.filter((flow: FlowFile) =>
							flow.flow.steps.some((step) =>
								step.actions?.includes(actionId),
							),
						);
						setUsedInFlows(flows);
					}
				}
			} catch (error) {
				console.error("Failed to fetch action:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchAction();
	}, [actionId]);

	if (loading) {
		return (
			<div className="py-8">
				<LoadingState message="Loading action..." />
			</div>
		);
	}

	if (!action) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-600 dark:text-gray-400">Action not found</p>
				<Button onClick={() => router.push("/actions")} className="mt-4">
					Back to Actions
				</Button>
			</div>
		);
	}

	const typeIcons = {
		auth: "🔐",
		modal: "🔲",
		form: "📝",
		navigation: "🧭",
		interaction: "👆",
		data: "📊",
	};

	return (
		<div className="space-y-6">
			{/* Breadcrumb */}
			<nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
				<button
					onClick={() => router.push("/actions")}
					className="hover:text-primary-600 dark:hover:text-primary-400"
				>
					Actions
				</button>
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
						d="M9 5l7 7-7 7"
					/>
				</svg>
				<span className="text-gray-900 dark:text-white">{action.name}</span>
			</nav>

			{/* Header */}
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<div className="flex items-center gap-3 mb-2">
						<span className="text-4xl">
							{typeIcons[action.definition.type]}
						</span>
						<div>
							<h1 className="text-display text-gray-900 dark:text-white">
								{action.name}
							</h1>
							<p className="text-gray-600 dark:text-gray-400 mt-1">
								{action.definition.description || "No description"}
							</p>
						</div>
					</div>

					{/* Tags */}
					{action.definition.tags && action.definition.tags.length > 0 && (
						<div className="flex flex-wrap gap-2 mt-3">
							{action.definition.tags.map((tag) => (
								<Badge key={tag} variant="neutral" size="sm">
									#{tag}
								</Badge>
							))}
						</div>
					)}
				</div>

				<div className="flex items-center gap-2">
					<Button
						variant="secondary"
						onClick={() => router.push(`/actions/${encodeURIComponent(action.id)}/edit`)}
						className="flex items-center gap-2"
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
								d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
							/>
						</svg>
						Edit
					</Button>
				</div>
			</div>

			{/* Metadata Cards */}
			<div className="grid gap-4 sm:grid-cols-3">
				<Card>
					<div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
						Type
					</div>
					<div className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
						{action.definition.type}
					</div>
				</Card>

				<Card>
					<div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
						Actions
					</div>
					<div className="text-2xl font-bold text-gray-900 dark:text-white">
						{action.definition.primitives.length}
					</div>
				</Card>

				<Card>
					<div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
						Category
					</div>
					<div className="text-2xl font-bold text-gray-900 dark:text-white">
						{action.definition.category || "—"}
					</div>
				</Card>
			</div>

			{/* Action Sequence */}
			<Card>
				<h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
					Action Sequence
				</h2>
				<div className="space-y-3">
					{action.definition.primitives.map((act, index) => (
						<div
							key={index}
							className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
						>
							<div className="flex-shrink-0 w-6 h-6 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center text-sm font-medium">
								{index + 1}
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2 mb-1">
									<span className="font-medium text-gray-900 dark:text-white capitalize">
										{act.type}
									</span>
									{act.type === "click" && (
										<Badge variant="info" size="sm">
											Click
										</Badge>
									)}
									{act.type === "fill" && (
										<Badge variant="info" size="sm">
											Fill
										</Badge>
									)}
									{(act.type === "waitForLoadState" || act.type === "waitForTimeout" || act.type === "waitForSelector" || act.type === "waitForFunction" || act.type === "waitForURL" || act.type === "waitForEvent") && (
										<Badge variant="warning" size="sm">
											Wait
										</Badge>
									)}
									{act.type === "goto" && (
										<Badge variant="success" size="sm">
											Go To
										</Badge>
									)}
									{act.type === "type" && (
										<Badge variant="info" size="sm">
											Type
										</Badge>
									)}
									{act.type === "selectOption" && (
										<Badge variant="info" size="sm">
											Select
										</Badge>
									)}
									{(act.type === "check" || act.type === "uncheck") && (
										<Badge variant="info" size="sm">
											Check
										</Badge>
									)}
									{act.type === "hover" && (
										<Badge variant="info" size="sm">
											Hover
										</Badge>
									)}
									{act.type === "press" && (
										<Badge variant="info" size="sm">
											Press
										</Badge>
									)}
									{act.type === "screenshot" && (
										<Badge variant="warning" size="sm">
											Screenshot
										</Badge>
									)}
								</div>
								<div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
									{"selector" in act && act.selector && (
										<div className="font-mono text-xs">
											{String(act.selector)}
										</div>
									)}
									{"value" in act && act.value && (
										<div>
											Value:{" "}
											<span className="font-mono">{String(act.value)}</span>
										</div>
									)}
									{"url" in act && act.url && (
										<div>
											URL: <span className="font-mono">{String(act.url)}</span>
										</div>
									)}
									{"text" in act && act.text && (
										<div>
											Text:{" "}
											<span className="font-mono">{String(act.text)}</span>
										</div>
									)}
									{"key" in act && act.key && (
										<div>
											Key: <span className="font-mono">{String(act.key)}</span>
										</div>
									)}
									{"name" in act && (
										typeof act.name === 'string' && act.name ? (
											<div>
												Name:{" "}
												<span className="font-mono">{act.name}</span>
											</div>
										) : null
									)}
									{"condition" in act && (
										act.condition ? (
											<div>Condition: {String(act.condition)}</div>
										) : null
									)}
									{"duration" in act && act.duration ? (
										<div>Duration: {String(act.duration)}ms</div>
									) : null}
								</div>
							</div>
						</div>
					))}
				</div>
			</Card>

			{/* Used In Flows - Cross-Linking */}
			{usedInFlows.length > 0 && (
				<Card>
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-h2 text-gray-900 dark:text-white">
							Used in {usedInFlows.length}{" "}
							{usedInFlows.length === 1 ? "Flow" : "Flows"}
						</h2>
						<Badge variant="info" size="md">
							{usedInFlows.length}
						</Badge>
					</div>
					<div className="space-y-2">
						{usedInFlows.map((flow) => (
							<button
								key={flow.id}
								onClick={() => router.push(`/flows/${encodeURIComponent(flow.id)}`)}
								className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
							>
								<div className="flex items-center gap-3 flex-1 min-w-0">
									<svg
										className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0"
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
									<div className="flex-1 min-w-0">
										<div className="font-medium text-gray-900 dark:text-white truncate">
											{flow.name}
										</div>
										{flow.flow.description && (
											<div className="text-sm text-gray-600 dark:text-gray-400 truncate">
												{flow.flow.description}
											</div>
										)}
									</div>
								</div>
								<svg
									className="w-5 h-5 text-gray-400 flex-shrink-0"
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
							</button>
						))}
					</div>
				</Card>
			)}

			{/* Dependencies */}
			{action.definition.dependencies &&
				action.definition.dependencies.length > 0 && (
					<Card>
						<h2 className="text-h2 text-gray-900 dark:text-white mb-4">
							Dependencies
						</h2>
						<div className="space-y-2">
							{action.definition.dependencies.map((depId) => (
								<div
									key={depId}
									className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded"
								>
									<svg
										className="w-4 h-4 text-gray-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
										/>
									</svg>
									<span className="text-sm text-gray-900 dark:text-white">
										{depId}
									</span>
								</div>
							))}
						</div>
					</Card>
				)}

			{/* Metadata */}
			<Card>
				<h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
					Metadata
				</h2>
				<div className="grid gap-3 sm:grid-cols-2">
					<div>
						<div className="text-sm text-gray-600 dark:text-gray-400">
							Created
						</div>
						<div className="text-gray-900 dark:text-white">
							{new Date(action.createdAt).toLocaleString()}
						</div>
					</div>
					<div>
						<div className="text-sm text-gray-600 dark:text-gray-400">
							Last Updated
						</div>
						<div className="text-gray-900 dark:text-white">
							{new Date(action.updatedAt).toLocaleString()}
						</div>
					</div>
					<div>
						<div className="text-sm text-gray-600 dark:text-gray-400">ID</div>
						<div className="text-gray-900 dark:text-white font-mono text-sm">
							{action.id}
						</div>
					</div>
					<div>
						<div className="text-sm text-gray-600 dark:text-gray-400">
							File Path
						</div>
						<div className="text-gray-900 dark:text-white font-mono text-sm truncate">
							{action.path}
						</div>
					</div>
				</div>
			</Card>
		</div>
	);
}
