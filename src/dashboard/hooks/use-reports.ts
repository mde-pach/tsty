"use client";

import { useEffect, useState } from "react";
import type { ReportFile } from "../../lib/types";

export function useReports(flowId?: string) {
	const [reports, setReports] = useState<ReportFile[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchReports = async () => {
		try {
			setLoading(true);
			const url = flowId ? `/api/reports?flowId=${flowId}` : "/api/reports";

			const response = await fetch(url);
			const data = await response.json();

			if (data.success) {
				setReports(data.data);
			} else {
				setError(data.error);
			}
		} catch (err) {
			setError(String(err));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchReports();
	}, [flowId]);

	return { reports, loading, error, refetch: fetchReports };
}
