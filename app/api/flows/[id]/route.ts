import { type NextRequest, NextResponse } from "next/server";
import { FileManager } from "@/lib/file-manager";
import type { Flow } from "@/lib/types";

const fileManager = new FileManager();

/**
 * GET /api/flows/[id]
 * Get a single flow by ID (supports nested paths via URL encoding: "e2e%2Fflow-name")
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id: encodedId } = await params;
		// Decode URL-encoded slashes: "e2e%2Fflow-name" -> "e2e/flow-name"
		const id = decodeURIComponent(encodedId);
		const flow = await fileManager.getFlow(id);

		if (!flow) {
			return NextResponse.json(
				{ success: false, error: "Flow not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json({ success: true, data: flow });
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: String(error) },
			{ status: 500 },
		);
	}
}

/**
 * PUT /api/flows/[id]
 * Update an existing flow (supports nested paths via URL encoding)
 */
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id: encodedId } = await params;
		const id = decodeURIComponent(encodedId);
		const body = await request.json();
		const { flow } = body as { flow: Flow };

		if (!flow) {
			return NextResponse.json(
				{ success: false, error: "Missing flow" },
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
 * DELETE /api/flows/[id]
 * Delete a flow (supports nested paths via URL encoding)
 */
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id: encodedId } = await params;
		const id = decodeURIComponent(encodedId);
		await fileManager.deleteFlow(id);
		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: String(error) },
			{ status: 500 },
		);
	}
}
