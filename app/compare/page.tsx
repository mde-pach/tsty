"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { RunComparisonViewer } from "@/dashboard/components/run-comparison-viewer";
import { LoadingState, Button, Card } from "@/dashboard/components/ui";
import type { ReportFile, FlowFile } from "@/lib/types";

export default function ComparePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flows, setFlows] = useState<FlowFile[]>([]);
  const [reports, setReports] = useState<ReportFile[]>([]);

  const [selectedFlow, setSelectedFlow] = useState<string>("");
  const [referenceRunId, setReferenceRunId] = useState<string>("");
  const [currentRunId, setCurrentRunId] = useState<string>("");

  const [referenceRun, setReferenceRun] = useState<ReportFile | null>(null);
  const [currentRun, setCurrentRun] = useState<ReportFile | null>(null);

  // Load flows and reports
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [flowsRes, reportsRes] = await Promise.all([
          fetch("/api/flows"),
          fetch("/api/reports"),
        ]);

        const flowsData = await flowsRes.json();
        const reportsData = await reportsRes.json();

        if (flowsData.success) {
          setFlows(flowsData.data);
        }

        if (reportsData.success) {
          setReports(reportsData.data);
        }

        // Check URL params
        const flowParam = searchParams.get("flow");
        const referenceParam = searchParams.get("reference");
        const currentParam = searchParams.get("current");

        if (flowParam) {
          setSelectedFlow(flowParam);

          // Auto-load reference from flow if available
          const flow = flowsData.data?.find((f: FlowFile) => f.id === flowParam);
          if (flow?.flow.referenceRunId) {
            setReferenceRunId(flow.flow.referenceRunId);
          }
        }

        if (referenceParam) {
          setReferenceRunId(referenceParam);
        }

        if (currentParam) {
          setCurrentRunId(currentParam);
        }

        setLoading(false);
      } catch (err) {
        setError("Failed to load comparison data");
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  // Load runs when IDs change
  useEffect(() => {
    if (referenceRunId && currentRunId) {
      const refRun = reports.find((r) =>
        r.id.includes(referenceRunId) || r.report.runId === referenceRunId
      );
      const curRun = reports.find((r) =>
        r.id.includes(currentRunId) || r.report.runId === currentRunId
      );

      setReferenceRun(refRun || null);
      setCurrentRun(curRun || null);
    }
  }, [referenceRunId, currentRunId, reports]);

  if (loading) {
    return <LoadingState message="Loading comparison data..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  // Filter reports by selected flow
  const flowReports = selectedFlow
    ? reports.filter((r) => r.flowId === selectedFlow)
    : reports;

  const selectedFlowData = flows.find((f) => f.id === selectedFlow);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Compare Runs
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Compare screenshots and results between two test runs
        </p>
      </div>

      {/* Selection UI */}
      {(!referenceRun || !currentRun) && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Select Runs to Compare
          </h2>

          <div className="space-y-4">
            {/* Flow selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Flow
              </label>
              <select
                value={selectedFlow}
                onChange={(e) => {
                  setSelectedFlow(e.target.value);
                  const flow = flows.find((f) => f.id === e.target.value);
                  if (flow?.flow.referenceRunId) {
                    setReferenceRunId(flow.flow.referenceRunId);
                  }
                  setCurrentRunId("");
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Select a flow...</option>
                {flows.map((flow) => (
                  <option key={flow.id} value={flow.id}>
                    {flow.flow.name}
                    {flow.flow.referenceRunId && " (has reference)"}
                  </option>
                ))}
              </select>
            </div>

            {selectedFlow && (
              <>
                {/* Reference run selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reference Run (Before)
                    {selectedFlowData?.flow.referenceRunId && (
                      <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                        (Auto-selected from flow)
                      </span>
                    )}
                  </label>
                  <select
                    value={referenceRunId}
                    onChange={(e) => setReferenceRunId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">Select reference run...</option>
                    {flowReports.map((report) => (
                      <option
                        key={report.id}
                        value={report.report.runId || report.id}
                      >
                        {new Date(report.createdAt).toLocaleString()} -{" "}
                        {report.report.failed === 0 ? "Passed" : "Failed"}
                        {report.report.isReference && " (Reference)"}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Current run selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Run (After)
                  </label>
                  <select
                    value={currentRunId}
                    onChange={(e) => setCurrentRunId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">Select current run...</option>
                    {flowReports
                      .filter((r) => (r.report.runId || r.id) !== referenceRunId)
                      .map((report) => (
                        <option
                          key={report.id}
                          value={report.report.runId || report.id}
                        >
                          {new Date(report.createdAt).toLocaleString()} -{" "}
                          {report.report.failed === 0 ? "Passed" : "Failed"}
                        </option>
                      ))}
                  </select>
                </div>
              </>
            )}

            {referenceRunId && currentRunId && (
              <Button
                onClick={() => {
                  // Trigger load by clearing and resetting
                  const refRun = reports.find((r) =>
                    r.id.includes(referenceRunId) || r.report.runId === referenceRunId
                  );
                  const curRun = reports.find((r) =>
                    r.id.includes(currentRunId) || r.report.runId === currentRunId
                  );

                  setReferenceRun(refRun || null);
                  setCurrentRun(curRun || null);
                }}
                className="w-full"
              >
                Compare Runs
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Comparison View */}
      {referenceRun && currentRun && (
        <>
          <div className="flex justify-between items-center">
            <Button
              variant="secondary"
              onClick={() => {
                setReferenceRun(null);
                setCurrentRun(null);
              }}
            >
              ← Select Different Runs
            </Button>
          </div>

          <RunComparisonViewer
            referenceRun={{
              id: referenceRun.id,
              report: referenceRun.report,
            }}
            currentRun={{
              id: currentRun.id,
              report: currentRun.report,
            }}
            flowName={selectedFlowData?.flow.name || "Unknown Flow"}
          />
        </>
      )}

      {/* Empty state */}
      {!referenceRun && !currentRun && !selectedFlow && (
        <Card className="text-center py-12">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Comparison Selected
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Select a flow and two runs to compare their screenshots
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Tip: Mark a run as reference first using{" "}
            <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
              tsty mark-reference
            </code>
          </p>
        </Card>
      )}
    </div>
  );
}
