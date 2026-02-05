import { type NextRequest, NextResponse } from "next/server";
import { FileManager } from "../lib/file-manager";
import type { Flow } from "../lib/types";

const fileManager = new FileManager();

/**
 * GET /api/flows
 * List all flows
 */
export async function GET(request: NextRequest) {
	try {
		const flows = await fileManager.listFlows();
		return NextResponse.json({ success: true, data: flows });
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: String(error) },
			{ status: 500 },
		);
	}
}

/**
 * POST /api/flows
 * Create a new flow
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { id, flow } = body as { id: string; flow: Flow };

		if (!id || !flow) {
			return NextResponse.json(
				{ success: false, error: "Missing id or flow" },
				{ status: 400 },
			);
		}

		const flowFile = await fileManager.createFlow(id, flow);
		return NextResponse.json({ success: true, data: flowFile });
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: String(error) },
			{ status: 500 },
		);
	}
}

/**
 * PUT /api/flows
 * Update an existing flow
 */
export async function PUT(request: NextRequest) {
	try {
		const body = await request.json();
		const { id, flow } = body as { id: string; flow: Flow };

		if (!id || !flow) {
			return NextResponse.json(
				{ success: false, error: "Missing id or flow" },
				{ status: 400 },
			);
		}

		const flowFile = await fileManager.updateFlow(id, flow);
		return NextResponse.json({ success: true, data: flowFile });
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: String(error) },
			{ status: 500 },
		);
	}
}

/**
 * DELETE /api/flows?id=<flowId>
 * Delete a flow
 */
export async function DELETE(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		if (!id) {
			return NextResponse.json(
				{ success: false, error: "Missing id parameter" },
				{ status: 400 },
			);
		}

		await fileManager.deleteFlow(id);
		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: String(error) },
			{ status: 500 },
		);
	}
}
