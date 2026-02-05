import { type NextRequest, NextResponse } from "next/server";
import { FileManager } from "../lib/file-manager";
import { PageExtractor } from "../lib/page-extractor";

const pageExtractor = new PageExtractor();
const fileManager = new FileManager();

/**
 * GET /api/qa-testing/pages/tree
 * Build page tree from all flows
 */
export async function GET(request: NextRequest) {
	try {
		const flows = await fileManager.listFlows();
		const tree = pageExtractor.buildPageTree(flows);

		return NextResponse.json({ success: true, data: tree });
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: String(error) },
			{ status: 500 },
		);
	}
}
