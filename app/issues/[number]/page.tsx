"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Badge, LoadingState } from "@/dashboard/components/ui";
import { ScreenshotComparison } from "@/dashboard/components/screenshot-comparison";
import type { GitHubIssue, FlowFile, ReportFile } from "@/lib/types";

interface IssueDetailPageProps {
  params: Promise<{ number: string }>;
}

export default function IssueDetailPage({ params }: IssueDetailPageProps) {
  const router = useRouter();
  const [issue, setIssue] = useState<GitHubIssue | null>(null);
  const [flows, setFlows] = useState<FlowFile[]>([]);
  const [reports, setReports] = useState<ReportFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [issueNumber, setIssueNumber] = useState<number>(0);
  const [selectedStep, setSelectedStep] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    params.then((p) => {
      setIssueNumber(parseInt(p.number));
    });
  }, [params]);

  useEffect(() => {
    if (!issueNumber) return;

    const fetchData = async () => {
      try {
        const [issueRes, flowsRes, reportsRes] = await Promise.all([
          fetch(`/api/issues?number=${issueNumber}`),
          fetch("/api/flows"),
          fetch("/api/reports"),
        ]);

        const issueData = await issueRes.json();
        const flowsData = await flowsRes.json();
        const reportsData = await reportsRes.json();

        if (issueData.success) {
          setIssue(issueData.data);
        }

        if (flowsData.success) {
          setFlows(flowsData.data);
        }

        if (reportsData.success) {
          setReports(reportsData.data);
        }

        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [issueNumber]);

  // Keyboard navigation for steps
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!referenceRun || !latestRun) return;

      if (e.key === "ArrowLeft" && selectedStep > 0) {
        setSelectedStep(selectedStep - 1);
      } else if (
        e.key === "ArrowRight" &&
        selectedStep < referenceRun.report.steps.length - 1
      ) {
        setSelectedStep(selectedStep + 1);
      } else if (e.key === "i") {
        setShowDetails(!showDetails);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedStep, showDetails]);

  if (loading) {
    return <LoadingState message="Loading issue..." />;
  }

  if (!issue) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">Issue not found</p>
        <Button onClick={() => router.push("/issues")} className="mt-4">
          Back to Issues
        </Button>
      </div>
    );
  }

  const linkedFlow = flows.find((f) => f.id === issue.linkedFlowId);
  const referenceRun = issue.referenceRunId
    ? reports.find((r) => r.report.runId === issue.referenceRunId)
    : null;

  const flowReports = issue.linkedFlowId
    ? reports.filter((r) => r.flowId === issue.linkedFlowId)
    : [];

  const latestRun = flowReports.length > 0 ? flowReports[0] : null;

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "warning",
      linked: "info",
      testing: "info",
      fixed: "success",
      failed: "error",
    } as const;
    return colors[status as keyof typeof colors] || "neutral";
  };

  if (!referenceRun || !latestRun || latestRun.id === referenceRun.id) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md">
          <svg className="w-20 h-20 mx-auto mb-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            No Comparison Available
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {!referenceRun ? "No reference run captured yet." : "Only one test run available. Run tests again to see before/after comparison."}
          </p>
          <Button onClick={() => router.push("/issues")}>
            Back to Issues
          </Button>
        </div>
      </div>
    );
  }

  const refStep = referenceRun.report.steps[selectedStep];
  const curStep = latestRun.report.steps[selectedStep];
  const totalSteps = Math.min(
    referenceRun.report.steps.length,
    latestRun.report.steps.length
  );

  const refScreenshot = refStep?.screenshots[0];
  const curScreenshot = curStep?.screenshots[0];

  const refPassed = referenceRun.report.failed === 0;
  const curPassed = latestRun.report.failed === 0;
  const statusChanged = refPassed !== curPassed;

  return (
    <div className="relative flex flex-col h-screen bg-gray-950 overflow-hidden">
      {/* Minimal Header - Fixed */}
      <div className="flex-shrink-0 border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button
                onClick={() => router.push("/issues")}
                className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                title="Back to Issues"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-lg font-bold text-gray-400 flex-shrink-0">#{issue.number}</span>
                <h1 className="text-lg font-semibold text-white truncate">{issue.title}</h1>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant={issue.state === "open" ? "success" : "neutral"} size="sm">
                  {issue.state}
                </Badge>
                {issue.status && (
                  <Badge variant={getStatusColor(issue.status)} size="sm">
                    {issue.status}
                  </Badge>
                )}
                {statusChanged && (
                  <Badge variant={curPassed ? "success" : "error"} size="sm">
                    {refPassed ? "Passed" : "Failed"} → {curPassed ? "Passed" : "Failed"}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4 flex-shrink-0">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                title="Toggle Details (I)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              {issue.url && (
                <button
                  onClick={() => window.open(issue.url, "_blank")}
                  className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                  title="View on GitHub"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Screenshot Comparison */}
      <div className="flex-1 overflow-auto">
        <div className="h-full flex flex-col">
          {/* Step Navigation Bar */}
          <div className="flex-shrink-0 bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-400">Test Steps</span>
                <span className="text-xs text-gray-500">
                  {selectedStep + 1} / {totalSteps}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setSelectedStep(Math.max(0, selectedStep - 1))}
                  disabled={selectedStep === 0}
                  variant="secondary"
                  size="sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Button>
                <Button
                  onClick={() => setSelectedStep(Math.min(totalSteps - 1, selectedStep + 1))}
                  disabled={selectedStep === totalSteps - 1}
                  variant="secondary"
                  size="sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </div>
            </div>

            {/* Step Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
              {referenceRun.report.steps.map((step, index) => {
                const isSelected = index === selectedStep;
                const refStepPassed = step.passed;
                const curStepPassed = latestRun.report.steps[index]?.passed;
                const stepStatusChanged = refStepPassed !== curStepPassed;

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedStep(index)}
                    className={`
                      px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex-shrink-0
                      ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-lg scale-105"
                          : stepStatusChanged
                            ? "bg-yellow-900/50 text-yellow-300 hover:bg-yellow-900/70 border border-yellow-700"
                            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }
                    `}
                  >
                    {index + 1}. {step.name}
                    {stepStatusChanged && !isSelected && " ⚠️"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Screenshot Comparison - Full Space */}
          <div className="flex-1 p-4 min-h-0">
            {refScreenshot && curScreenshot ? (
              <ScreenshotComparison
                referenceScreenshot={refScreenshot}
                currentScreenshot={curScreenshot}
                stepName={refStep.name}
                stepIndex={selectedStep}
                totalSteps={totalSteps}
                onPrevious={selectedStep > 0 ? () => setSelectedStep(selectedStep - 1) : undefined}
                onNext={selectedStep < totalSteps - 1 ? () => setSelectedStep(selectedStep + 1) : undefined}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-lg font-medium mb-2">No Screenshots Available</p>
                  <p className="text-sm">Screenshots were not captured for this step</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details Drawer - Slides from right */}
      <div
        className={`
          fixed top-0 right-0 h-screen w-96 bg-gray-900 border-l border-gray-800 shadow-2xl
          transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto
          ${showDetails ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Issue Details</h2>
            <button
              onClick={() => setShowDetails(false)}
              className="p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Description */}
          {issue.body && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Description</h3>
              <div className="bg-gray-800 rounded-lg p-3 text-sm text-gray-300 max-h-60 overflow-y-auto">
                <pre className="whitespace-pre-wrap font-sans text-xs">{issue.body}</pre>
              </div>
            </div>
          )}

          {/* Test Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Test Comparison</h3>
            <div className="space-y-3">
              <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-3">
                <div className="text-xs font-bold text-blue-400 mb-1">BEFORE (Reference)</div>
                <div className="text-sm text-white font-medium">{linkedFlow?.flow.name}</div>
                <div className="text-xs text-gray-400 mt-2 space-y-1">
                  <div>{new Date(referenceRun.report.timestamp).toLocaleString()}</div>
                  <div>{referenceRun.report.passed}/{referenceRun.report.totalSteps} steps passed</div>
                </div>
              </div>
              <div className="bg-green-900/20 border border-green-800 rounded-lg p-3">
                <div className="text-xs font-bold text-green-400 mb-1">AFTER (Latest)</div>
                <div className="text-sm text-white font-medium">{linkedFlow?.flow.name}</div>
                <div className="text-xs text-gray-400 mt-2 space-y-1">
                  <div>{new Date(latestRun.report.timestamp).toLocaleString()}</div>
                  <div>{latestRun.report.passed}/{latestRun.report.totalSteps} steps passed</div>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Metadata</h3>
            <div className="space-y-2 text-xs">
              {issue.author && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Author</span>
                  <span className="text-gray-300 font-medium">{issue.author.login}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="text-gray-300 font-medium">{new Date(issue.createdAt).toLocaleDateString()}</span>
              </div>
              {issue.repository && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Repository</span>
                  <span className="text-gray-300 font-medium">{issue.repository}</span>
                </div>
              )}
            </div>
          </div>

          {/* Labels */}
          {issue.labels && issue.labels.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Labels</h3>
              <div className="flex flex-wrap gap-2">
                {issue.labels.map((label, index) => {
                  const labelText = typeof label === 'string' ? label : label.name;
                  return (
                    <span
                      key={`${labelText}-${index}`}
                      className="px-2 py-1 text-xs rounded-full bg-gray-800 text-gray-300"
                    >
                      {labelText}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-400 z-40">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-300">←</kbd>
            <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-300">→</kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-300">I</kbd>
            Details
          </span>
        </div>
      </div>
    </div>
  );
}
