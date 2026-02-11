import * as fs from "fs";
import { type NextRequest, NextResponse } from "next/server";
import { FileManager } from "../lib/file-manager";

const fileManager = new FileManager();

/**
 * GET /api/tsty/screenshots?filename=<filename>
 * Serve a screenshot image
 */
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const filename = searchParams.get("filename");

		if (!filename) {
			return NextResponse.json(
				{ success: false, error: "Missing filename parameter" },
				{ status: 400 },
			);
		}

		const screenshotPath = fileManager.getScreenshotPath(filename);

		if (!fs.existsSync(screenshotPath)) {
			return NextResponse.json(
				{ success: false, error: "Screenshot not found" },
				{ status: 404 },
			);
		}

		const imageBuffer = fs.readFileSync(screenshotPath);

		return new NextResponse(imageBuffer, {
			headers: {
				"Content-Type": "image/png",
				"Cache-Control": "public, max-age=31536000",
			},
		});
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: String(error) },
			{ status: 500 },
		);
	}
}
