import { type NextRequest, NextResponse } from "next/server";
import { DependencyValidator } from "../lib/dependency-validator";
import { FileManager } from "../lib/file-manager";

const validator = new DependencyValidator();
const fileManager = new FileManager();

/**
 * POST /api/qa-testing/validate/dependencies
 * Validate dependencies for a flow or action
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { type, id, dependencies } = body as {
			type: "flow" | "action";
			id: string;
			dependencies: string[];
		};

		if (!type || !id || !dependencies) {
			return NextResponse.json(
				{ success: false, error: "Missing type, id, or dependencies" },
				{ status: 400 },
			);
		}

		if (type !== "flow" && type !== "action") {
			return NextResponse.json(
				{ success: false, error: 'Type must be "flow" or "action"' },
				{ status: 400 },
			);
		}

		// Build map of all items with their dependencies
		const allItems = new Map<string, string[]>();

		if (type === "flow") {
			const flows = await fileManager.listFlows();
			flows.forEach((f) => {
				if (f.id !== id) {
					allItems.set(f.id, f.flow.dependencies || []);
				}
			});
		} else {
			const actions = await fileManager.listActions();
			actions.forEach((a) => {
				if (a.id !== id) {
					allItems.set(a.id, a.definition.dependencies || []);
				}
			});
		}

		// Validate
		const validation = validator.validate(id, dependencies, allItems, type);

		return NextResponse.json({ success: true, data: validation });
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: String(error) },
			{ status: 500 },
		);
	}
}

/**
 * GET /api/qa-testing/dependencies/graph?type=<flow|action>
 * Get full dependency graph
 */
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const type = searchParams.get("type") as "flow" | "action";

		if (!type || (type !== "flow" && type !== "action")) {
			return NextResponse.json(
				{
					success: false,
					error:
						'Invalid or missing type parameter (must be "flow" or "action")',
				},
				{ status: 400 },
			);
		}

		// Build graph
		let items: Array<{ id: string; dependencies: string[] }>;

		if (type === "flow") {
			const flows = await fileManager.listFlows();
			items = flows.map((f) => ({
				id: f.id,
				dependencies: f.flow.dependencies || [],
			}));
		} else {
			const actions = await fileManager.listActions();
			items = actions.map((a) => ({
				id: a.id,
				dependencies: a.definition.dependencies || [],
			}));
		}

		const graph = validator.buildGraph(items);

		// Add names to nodes
		if (type === "flow") {
			const flows = await fileManager.listFlows();
			graph.forEach((node) => {
				const flow = flows.find((f) => f.id === node.id);
				if (flow) {
					node.name = flow.flow.name;
					node.type = "flow";
				}
			});
		} else {
			const actions = await fileManager.listActions();
			graph.forEach((node) => {
				const action = actions.find((a) => a.id === node.id);
				if (action) {
					node.name = action.name;
					node.type = "action";
				}
			});
		}

		// Try to get execution order
		let executionOrder: string[] | null = null;
		try {
			executionOrder = validator.getExecutionOrder(graph);
		} catch (error) {
			// Circular dependencies exist, executionOrder will be null
		}

		return NextResponse.json({
			success: true,
			data: {
				graph,
				executionOrder,
				hasCircularDependencies: executionOrder === null,
			},
		});
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: String(error) },
			{ status: 500 },
		);
	}
}
