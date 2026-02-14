"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Badge, LoadingState } from "@/dashboard/components/ui";
import { RunComparisonViewer } from "@/dashboard/components/run-comparison-viewer";
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push("/issues")}
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Issues
        </button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                #{issue.number} {issue.title}
              </h1>
              <Badge variant={issue.state === "OPEN" || issue.state === "open" ? "success" : "neutral"}>
                {issue.state}
              </Badge>
              {issue.status && (
                <Badge variant={getStatusColor(issue.status)}>
                  {issue.status}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              {issue.repository && <span>{issue.repository}</span>}
              {issue.labels && issue.labels.length > 0 && (
                <div className="flex items-center gap-2">
                  {issue.labels.map((label, index) => {
                    const labelText = typeof label === 'string' ? label : label.name;
                    return (
                      <span
                        key={`${labelText}-${index}`}
                        className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      >
                        {labelText}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {issue.url && (
            <Button
              onClick={() => window.open(issue.url, "_blank")}
              variant="secondary"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View on GitHub
            </Button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Before/After Comparison - Shown First for Quick Access */}
          {referenceRun && latestRun && latestRun.id !== referenceRun.id && (
            <Card>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Before/After Comparison
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Visual comparison to verify if the issue is fixed
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    router.push(
                      `/compare?flow=${issue.linkedFlowId}&reference=${issue.referenceRunId}&current=${latestRun.report.runId}`
                    )
                  }
                >
                  Full Screen
                </Button>
              </div>

              <RunComparisonViewer
                referenceRun={referenceRun}
                currentRun={latestRun}
                flowName={linkedFlow?.flow.name || "Test Flow"}
              />
            </Card>
          )}

          {/* Description */}
          {issue.body && (
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Description
              </h2>
              <div className="prose dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-sans">
                  {issue.body}
                </pre>
              </div>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Testing Timeline
            </h2>

            <div className="space-y-4">
              {/* Fetched */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-2 bg-gray-300 dark:bg-gray-700 rounded-full" />
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      Issue Fetched
                    </span>
                    {issue.fetchedAt && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(issue.fetchedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Issue imported from GitHub
                  </p>
                </div>
              </div>

              {/* Linked to Flow */}
              {linkedFlow && (
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-2 bg-blue-500 rounded-full" />
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">
                        Linked to Flow
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {linkedFlow.flow.name}
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => router.push(`/flows/${issue.linkedFlowId}`)}
                    >
                      View Flow
                    </Button>
                  </div>
                </div>
              )}

              {/* Reference Run */}
              {referenceRun && (
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-2 bg-yellow-500 rounded-full" />
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">
                        Reference Captured (Before)
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(referenceRun.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Baseline screenshots captured showing the issue
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => router.push(`/runs?report=${referenceRun.id}`)}
                      >
                        View Reference Run
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Latest Run */}
              {latestRun && latestRun.id !== referenceRun?.id && (
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-2 bg-green-500 rounded-full" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">
                        Latest Run (After)
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(latestRun.createdAt).toLocaleString()}
                      </span>
                      <Badge variant={latestRun.report.failed === 0 ? "success" : "error"}>
                        {latestRun.report.failed === 0 ? "Passed" : "Failed"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Most recent test run
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => router.push(`/runs?report=${latestRun.id}`)}
                      >
                        View Latest Run
                      </Button>
                      {referenceRun && (
                        <Button
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/compare?flow=${issue.linkedFlowId}&reference=${issue.referenceRunId}&current=${latestRun.report.runId}`
                            )
                          }
                        >
                          Compare Before/After
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Metadata */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Metadata
            </h3>
            <div className="space-y-3 text-sm">
              {issue.author && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Author</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {issue.author.login}
                  </p>
                </div>
              )}
              <div>
                <span className="text-gray-600 dark:text-gray-400">Created</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(issue.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Updated</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(issue.updatedAt).toLocaleString()}
                </p>
              </div>
              {issue.closedAt && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Closed</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(issue.closedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Actions */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Actions
            </h3>
            <div className="space-y-2">
              {!linkedFlow && (
                <Button variant="secondary" className="w-full">
                  Link to Flow
                </Button>
              )}
              {linkedFlow && !referenceRun && (
                <Button className="w-full">
                  Capture Reference Run
                </Button>
              )}
              {referenceRun && latestRun && (
                <Button
                  className="w-full"
                  onClick={() =>
                    router.push(
                      `/compare?flow=${issue.linkedFlowId}&reference=${issue.referenceRunId}&current=${latestRun.report.runId}`
                    )
                  }
                >
                  View Comparison
                </Button>
              )}
            </div>
          </Card>

          {/* Test Runs */}
          {flowReports.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Test Runs ({flowReports.length})
              </h3>
              <div className="space-y-2">
                {flowReports.slice(0, 5).map((report) => (
                  <button
                    key={report.id}
                    onClick={() => router.push(`/runs?report=${report.id}`)}
                    className="w-full text-left p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(report.createdAt).toLocaleString()}
                      </span>
                      <Badge
                        variant={report.report.failed === 0 ? "success" : "error"}
                        size="sm"
                      >
                        {report.report.failed === 0 ? "✓" : "✗"}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {report.report.passed}/{report.report.totalSteps} steps
                      {report.report.runId === issue.referenceRunId && (
                        <span className="ml-2 text-blue-600 dark:text-blue-400">
                          (Reference)
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
