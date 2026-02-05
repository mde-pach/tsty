import { type NextRequest, NextResponse } from "next/server";
import { FileManager } from "@/lib/file-manager";
import type { ActionDefinition } from "@/lib/types";

const fileManager = new FileManager();

/**
 * GET /api/actions/[id]
 * Get a single action by ID (supports nested paths via URL encoding: "e2e%2Faction-name")
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id: encodedId } = await params;
		// Decode URL-encoded slashes: "e2e%2Faction-name" -> "e2e/action-name"
		const id = decodeURIComponent(encodedId);
		const action = await fileManager.getAction(id);

		if (!action) {
			return NextResponse.json(
				{ success: false, error: "Action not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json({ success: true, data: action });
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: String(error) },
			{ status: 500 },
		);
	}
}

/**
 * PUT /api/actions/[id]
 * Update an existing action (supports nested paths via URL encoding)
 */
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id: encodedId } = await params;
		const id = decodeURIComponent(encodedId);
		const body = await request.json();
		const { definition } = body as { definition: ActionDefinition };

		if (!definition) {
			return NextResponse.json(
				{ success: false, error: "Missing definition" },
				{ status: 400 },
			);
		}

		const action = await fileManager.updateAction(id, definition);
		return NextResponse.json({ success: true, data: action });
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: String(error) },
			{ status: 500 },
		);
	}
}

/**
 * DELETE /api/actions/[id]
 * Delete an action (supports nested paths via URL encoding)
 */
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id: encodedId } = await params;
		const id = decodeURIComponent(encodedId);
		await fileManager.deleteAction(id);
		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: String(error) },
			{ status: 500 },
		);
	}
}
