import { type NextRequest, NextResponse } from "next/server";
import { FileManager } from "../lib/file-manager";
import type { ActionDefinition } from "../lib/types";

const fileManager = new FileManager();

/**
 * GET /api/qa-testing/actions
 * List all actions
 */
export async function GET(request: NextRequest) {
	try {
		const actions = await fileManager.listActions();
		return NextResponse.json({ success: true, data: actions });
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: String(error) },
			{ status: 500 },
		);
	}
}

/**
 * POST /api/qa-testing/actions
 * Create a new action
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { id, definition } = body as {
			id: string;
			definition: ActionDefinition;
		};

		if (!id || !definition) {
			return NextResponse.json(
				{ success: false, error: "Missing id or definition" },
				{ status: 400 },
			);
		}

		const action = await fileManager.createAction(id, definition);
		return NextResponse.json({ success: true, data: action });
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: String(error) },
			{ status: 500 },
		);
	}
}

/**
 * PUT /api/qa-testing/actions
 * Update an existing action
 */
export async function PUT(request: NextRequest) {
	try {
		const body = await request.json();
		const { id, definition } = body as {
			id: string;
			definition: ActionDefinition;
		};

		if (!id || !definition) {
			return NextResponse.json(
				{ success: false, error: "Missing id or definition" },
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
 * DELETE /api/qa-testing/actions?id=<actionId>
 * Delete an action
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

		await fileManager.deleteAction(id);
		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: String(error) },
			{ status: 500 },
		);
	}
}
