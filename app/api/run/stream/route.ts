import { type NextRequest } from "next/server";
import { PlaywrightRunner } from "@/runner/playwright-runner";
import type { FlowProgressEvent } from "@/lib/types";

/**
 * GET /api/run/stream?flowId=...&device=...
 * Stream test execution progress using Server-Sent Events (SSE)
 */
export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const flowId = searchParams.get("flowId");
	const device = (searchParams.get("device") || "desktop") as
		| "desktop"
		| "mobile";

	if (!flowId) {
		return new Response("Missing flowId parameter", { status: 400 });
	}

	// Create a TransformStream for SSE
	const { readable, writable } = new TransformStream();
	const writer = writable.getWriter();
	const encoder = new TextEncoder();

	// Helper to send SSE message
	const send = async (event: FlowProgressEvent) => {
		try {
			const message = `data: ${JSON.stringify(event)}\n\n`;
			await writer.write(encoder.encode(message));
		} catch (error) {
			console.error("[SSE] Error writing to stream:", error);
		}
	};

	// Send initial connection message immediately to keep connection alive
	(async () => {
		try {
			// Send a comment to establish the connection
			await writer.write(encoder.encode(": connected\n\n"));

			console.log(`[SSE] Starting flow: ${flowId} on ${device}`);

			// Create runner with progress callback
			const runner = new PlaywrightRunner(undefined, send);

			// Run flow and stream progress
			await runner.runFlow(flowId, device);

			console.log(`[SSE] Flow completed: ${flowId}`);
		} catch (error) {
			console.error(`[SSE] Flow error: ${flowId}`, error);

			// Send error event
			await send({
				type: "error",
				timestamp: new Date().toISOString(),
				data: {
					error: String(error),
				},
			});
		} finally {
			// Close the stream
			try {
				await writer.close();
			} catch (error) {
				console.error("[SSE] Error closing writer:", error);
			}
		}
	})();

	// Return SSE response immediately
	return new Response(readable, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache, no-transform",
			Connection: "keep-alive",
			"X-Accel-Buffering": "no", // Disable nginx buffering
		},
	});
}
