import { type NextRequest, NextResponse } from "next/server";
import { FileManager } from "@/lib/file-manager";

const fileManager = new FileManager();

/**
 * GET /api/reports/[id]
 * Get a single report by ID
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const report = await fileManager.getReport(id);

		if (!report) {
			return NextResponse.json(
				{ success: false, error: "Report not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json({ success: true, data: report });
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: String(error) },
			{ status: 500 },
		);
	}
}
