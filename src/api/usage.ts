import type { ActionFile, FlowFile } from "../lib/types";
import { FileManager } from "../lib/file-manager";

const fileManager = new FileManager();

/**
 * Get all flows that use a specific action
 */
export async function getFlowsUsingAction(
	actionId: string,
): Promise<FlowFile[]> {
	const flows = await fileManager.listFlows();

	return flows.filter((flow) => {
		// Check if any step uses this action
		return flow.flow.steps.some((step) => step.actions?.includes(actionId));
	});
}

/**
 * Get usage statistics for an action
 */
export async function getActionUsageStats(actionId: string): Promise<{
	usedInFlowCount: number;
	flows: Array<{ id: string; name: string }>;
}> {
	const flows = await getFlowsUsingAction(actionId);

	return {
		usedInFlowCount: flows.length,
		flows: flows.map((f) => ({ id: f.id, name: f.name })),
	};
}

/**
 * Get all actions used in a flow
 */
export async function getActionsUsedInFlow(
	flowId: string,
): Promise<ActionFile[]> {
	const flows = await fileManager.listFlows();
	const actions = await fileManager.listActions();

	const flow = flows.find((f) => f.id === flowId);
	if (!flow) return [];

	// Collect all action IDs used in the flow
	const actionIds = new Set<string>();
	for (const step of flow.flow.steps) {
		if (step.actions) {
			step.actions.forEach((id) => actionIds.add(id));
		}
	}

	// Return the actual action objects
	return actions.filter((action) => actionIds.has(action.id));
}

/**
 * Get usage statistics for all actions
 */
export async function getAllActionUsageStats(): Promise<
	Record<string, number>
> {
	const flows = await fileManager.listFlows();
	const usageCount: Record<string, number> = {};

	for (const flow of flows) {
		for (const step of flow.flow.steps) {
			if (step.actions) {
				for (const actionId of step.actions) {
					usageCount[actionId] = (usageCount[actionId] || 0) + 1;
				}
			}
		}
	}

	return usageCount;
}

/**
 * Get dependency chain for a flow (all flows it depends on)
 */
export async function getFlowDependencyChain(
	flowId: string,
	maxDepth = 5,
): Promise<FlowFile[]> {
	const flows = await fileManager.listFlows();
	const flow = flows.find((f) => f.id === flowId);

	if (!flow || !flow.flow.dependencies) return [];

	const visited = new Set<string>();
	const result: FlowFile[] = [];

	const traverse = (id: string, depth: number) => {
		if (depth > maxDepth || visited.has(id)) return;
		visited.add(id);

		const depFlow = flows.find((f) => f.id === id);
		if (!depFlow) return;

		result.push(depFlow);

		if (depFlow.flow.dependencies) {
			for (const depId of depFlow.flow.dependencies) {
				traverse(depId, depth + 1);
			}
		}
	};

	for (const depId of flow.flow.dependencies) {
		traverse(depId, 1);
	}

	return result;
}

/**
 * Get all flows that depend on a specific flow
 */
export async function getFlowsDependingOn(flowId: string): Promise<FlowFile[]> {
	const flows = await fileManager.listFlows();

	return flows.filter(
		(flow) =>
			flow.flow.dependencies && flow.flow.dependencies.includes(flowId),
	);
}
