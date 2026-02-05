import { type NextRequest, NextResponse } from "next/server";
import { runFlow } from "../cli/commands";

/**
 * POST /api/qa-testing/run
 * Execute a test flow
 * Body: { flowId: string, device?: 'desktop' | 'mobile' }
 *
 * Uses shared CLI logic for consistency between API and CLI
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { flowId, device = "desktop" } = body as {
			flowId: string;
			device?: "desktop" | "mobile";
		};

		if (!flowId) {
			return NextResponse.json(
				{ success: false, error: "Missing flowId" },
				{ status: 400 },
			);
		}

		// Use shared command logic
		const report = await runFlow(flowId, device);

		return NextResponse.json({ success: true, data: report });
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: String(error) },
			{ status: 500 },
		);
	}
}
