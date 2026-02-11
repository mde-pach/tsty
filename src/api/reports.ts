import { type NextRequest, NextResponse } from "next/server";
import { FileManager } from "../lib/file-manager";

const fileManager = new FileManager();

/**
 * GET /api/tsty/reports?flowId=<flowId>
 * List all reports (optionally filtered by flow)
 */
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const flowId = searchParams.get("flowId");

		if (flowId) {
			const reports = fileManager.getFlowReports(flowId);
			return NextResponse.json({ success: true, data: reports });
		}

		const reports = await fileManager.listReports();
		return NextResponse.json({ success: true, data: reports });
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: String(error) },
			{ status: 500 },
		);
	}
}

/**
 * POST /api/tsty/reports?action=clear&flowId=<flowId>
 * Clear old reports for a flow, keeping only the most recent
 */
export async function POST(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const action = searchParams.get("action");
		const flowId = searchParams.get("flowId");

		if (action === "clear") {
			if (!flowId) {
				return NextResponse.json(
					{ success: false, error: "Missing flowId parameter" },
					{ status: 400 },
				);
			}

			const result = await fileManager.clearOldReports(flowId);
			return NextResponse.json({
				success: true,
				data: result,
				message: `Cleared ${result.deleted} old report${result.deleted === 1 ? "" : "s"}`,
			});
		}

		return NextResponse.json(
			{ success: false, error: "Invalid action" },
			{ status: 400 },
		);
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: String(error) },
			{ status: 500 },
		);
	}
}

/**
 * DELETE /api/tsty/reports?id=<reportId>
 * Delete a report
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

		await fileManager.deleteReport(id);
		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: String(error) },
			{ status: 500 },
		);
	}
}
