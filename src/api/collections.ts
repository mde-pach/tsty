import { type NextRequest, NextResponse } from "next/server";
import { CollectionMatcher } from "../lib/collection-matcher";
import { FileManager } from "../lib/file-manager";
import type { SmartCollection } from "../lib/types";

const fileManager = new FileManager();
const collectionMatcher = new CollectionMatcher();

/**
 * GET /api/tsty/collections
 * List all collections or get flows for a specific collection
 */
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");
		const action = searchParams.get("action");

		// Get flows matching a collection
		if (id && action === "flows") {
			const collection = await fileManager.getCollection(id);
			if (!collection) {
				return NextResponse.json(
					{ success: false, error: "Collection not found" },
					{ status: 404 },
				);
			}

			const flows = await fileManager.listFlows();
			const matchingFlows = collectionMatcher.getMatchingFlows(
				flows,
				collection,
			);

			return NextResponse.json({ success: true, data: matchingFlows });
		}

		// Get single collection
		if (id) {
			const collection = await fileManager.getCollection(id);
			if (!collection) {
				return NextResponse.json(
					{ success: false, error: "Collection not found" },
					{ status: 404 },
				);
			}
			return NextResponse.json({ success: true, data: collection });
		}

		// List all collections with counts
		const collections = await fileManager.listCollections();
		const flows = await fileManager.listFlows();
		const counts = collectionMatcher.getCollectionCounts(flows, collections);

		const collectionsWithCounts = collections.map((c) => ({
			...c,
			flowCount: counts[c.id] || 0,
		}));

		return NextResponse.json({ success: true, data: collectionsWithCounts });
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: String(error) },
			{ status: 500 },
		);
	}
}

/**
 * POST /api/tsty/collections
 * Create a new collection
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { name, description, filters } = body as Omit<
			SmartCollection,
			"id" | "createdAt" | "updatedAt"
		>;

		if (!name || !filters) {
			return NextResponse.json(
				{ success: false, error: "Missing name or filters" },
				{ status: 400 },
			);
		}

		// Validate filters
		for (const filter of filters) {
			const validation = collectionMatcher.validateFilter(filter);
			if (!validation.valid) {
				return NextResponse.json(
					{ success: false, error: validation.error },
					{ status: 400 },
				);
			}
		}

		const collection = await fileManager.createCollection({
			name,
			description,
			filters,
		});
		return NextResponse.json({ success: true, data: collection });
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: String(error) },
			{ status: 500 },
		);
	}
}

/**
 * PUT /api/tsty/collections
 * Update an existing collection
 */
export async function PUT(request: NextRequest) {
	try {
		const body = await request.json();
		const { id, ...updates } = body as SmartCollection;

		if (!id) {
			return NextResponse.json(
				{ success: false, error: "Missing id" },
				{ status: 400 },
			);
		}

		// Validate filters if provided
		if (updates.filters) {
			for (const filter of updates.filters) {
				const validation = collectionMatcher.validateFilter(filter);
				if (!validation.valid) {
					return NextResponse.json(
						{ success: false, error: validation.error },
						{ status: 400 },
					);
				}
			}
		}

		const collection = await fileManager.updateCollection(id, updates);
		return NextResponse.json({ success: true, data: collection });
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: String(error) },
			{ status: 500 },
		);
	}
}

/**
 * DELETE /api/tsty/collections?id=<collectionId>
 * Delete a collection
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

		await fileManager.deleteCollection(id);
		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: String(error) },
			{ status: 500 },
		);
	}
}
