"use client";

import { useEffect, useState } from "react";

export default function TestSSE() {
	const [events, setEvents] = useState<string[]>([]);
	const [status, setStatus] = useState("Not connected");

	useEffect(() => {
		const es = new EventSource(
			"/api/run/stream?flowId=ui-audit/execution-modal-test&device=desktop",
		);

		es.onopen = () => {
			setStatus("Connected!");
			setEvents((prev) => [...prev, "✅ Connection opened"]);
		};

		es.onmessage = (event) => {
			const data = JSON.parse(event.data);
			setEvents((prev) => [
				...prev,
				`📨 ${data.type}: ${JSON.stringify(data.data).substring(0, 100)}`,
			]);
		};

		es.onerror = (error) => {
			setStatus("Error!");
			setEvents((prev) => [...prev, `❌ Error: ${error}`]);
			es.close();
		};

		return () => es.close();
	}, []);

	return (
		<div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-3xl font-bold mb-4">SSE Test Page</h1>
				<div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-4">
					<h2 className="text-xl font-semibold mb-2">Status: {status}</h2>
				</div>
				<div className="bg-white dark:bg-gray-800 rounded-lg p-6">
					<h2 className="text-xl font-semibold mb-4">Events:</h2>
					<div className="space-y-2 font-mono text-sm">
						{events.map((event, i) => (
							<div key={i} className="p-2 bg-gray-100 dark:bg-gray-700 rounded">
								{event}
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
