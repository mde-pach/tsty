import { type NextRequest, NextResponse } from "next/server";
import { FileManager } from "../lib/file-manager";
import { TagManager } from "../lib/tag-manager";
import type { Tag } from "../lib/types";

const tagManager = new TagManager();
const fileManager = new FileManager();

/**
 * GET /api/tsty/tags
 * List all tags or get tag usage
 */
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");
		const action = searchParams.get("action");

		// Get tag usage
		if (id && action === "usage") {
			const flows = await fileManager.listFlows();
			const actions = await fileManager.listActions();
			const usage = await tagManager.getTagUsage(id, flows, actions);
			return NextResponse.json({ success: true, data: usage });
		}

		// Get single tag
		if (id) {
			const tag = await tagManager.getTag(id);
			if (!tag) {
				return NextResponse.json(
					{ success: false, error: "Tag not found" },
					{ status: 404 },
				);
			}
			return NextResponse.json({ success: true, data: tag });
		}

		// List all tags
		const tags = await tagManager.listTags();
		return NextResponse.json({ success: true, data: tags });
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: String(error) },
			{ status: 500 },
		);
	}
}

/**
 * POST /api/tsty/tags
 * Create a new tag
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { name, category, color } = body as Omit<
			Tag,
			"id" | "createdAt" | "updatedAt"
		>;

		if (!name) {
			return NextResponse.json(
				{ success: false, error: "Missing name" },
				{ status: 400 },
			);
		}

		const tag = await tagManager.createTag({ name, category, color });
		return NextResponse.json({ success: true, data: tag });
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: String(error) },
			{ status: 500 },
		);
	}
}

/**
 * PUT /api/tsty/tags
 * Update an existing tag
 */
export async function PUT(request: NextRequest) {
	try {
		const body = await request.json();
		const { id, ...updates } = body as Tag;

		if (!id) {
			return NextResponse.json(
				{ success: false, error: "Missing id" },
				{ status: 400 },
			);
		}

		const tag = await tagManager.updateTag(id, updates);
		return NextResponse.json({ success: true, data: tag });
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: String(error) },
			{ status: 500 },
		);
	}
}

/**
 * DELETE /api/tsty/tags?id=<tagId>
 * Delete a tag
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

		await tagManager.deleteTag(id);
		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: String(error) },
			{ status: 500 },
		);
	}
}
