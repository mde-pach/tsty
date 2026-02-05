import { NextResponse } from "next/server";
import { getAllActionUsageStats } from "@/api/usage";

export async function GET() {
	try {
		const stats = await getAllActionUsageStats();

		return NextResponse.json({
			success: true,
			data: stats,
		});
	} catch (error) {
		console.error("Failed to get action usage stats:", error);
		return NextResponse.json(
			{
				success: false,
				error:
					error instanceof Error ? error.message : "Failed to get usage stats",
			},
			{ status: 500 },
		);
	}
}
