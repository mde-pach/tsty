"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Badge, LoadingState, EmptyState } from "@/dashboard/components/ui";
import type { GitHubIssue, FlowFile } from "@/lib/types";

export default function IssuesPage() {
  const router = useRouter();
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [flows, setFlows] = useState<FlowFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFetchModal, setShowFetchModal] = useState(false);
  const [fetchNumber, setFetchNumber] = useState("");
  const [fetchRepo, setFetchRepo] = useState("");
  const [fetchingIssue, setFetchingIssue] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [issuesRes, flowsRes] = await Promise.all([
        fetch("/api/issues"),
        fetch("/api/flows"),
      ]);

      const issuesData = await issuesRes.json();
      const flowsData = await flowsRes.json();

      if (issuesData.success) {
        setIssues(issuesData.data);
      }

      if (flowsData.success) {
        setFlows(flowsData.data);
      }

      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setLoading(false);
    }
  };

  const handleFetchIssue = async () => {
    if (!fetchNumber) return;

    setFetchingIssue(true);
    try {
      const response = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issueNumber: parseInt(fetchNumber),
          repo: fetchRepo || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowFetchModal(false);
        setFetchNumber("");
        setFetchRepo("");
        fetchData(); // Refresh list
      } else {
        alert(`Failed to fetch issue: ${data.error}`);
      }
    } catch (error) {
      alert("Failed to fetch issue");
    } finally {
      setFetchingIssue(false);
    }
  };

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

  const getStateColor = (state: string) => {
    return state === "open" ? "success" : "neutral";
  };

  if (loading) {
    return <LoadingState message="Loading issues..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            GitHub Issues
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage and track issues linked to test flows
          </p>
        </div>
        <Button onClick={() => setShowFetchModal(true)}>
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Fetch Issue
        </Button>
      </div>

      {/* Fetch Issue Modal */}
      {showFetchModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Fetch GitHub Issue
              </h2>
              <button
                onClick={() => setShowFetchModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Issue Number *
                </label>
                <input
                  type="number"
                  value={fetchNumber}
                  onChange={(e) => setFetchNumber(e.target.value)}
                  placeholder="123"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Repository (optional)
                </label>
                <input
                  type="text"
                  value={fetchRepo}
                  onChange={(e) => setFetchRepo(e.target.value)}
                  placeholder="owner/repo (auto-detected if empty)"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleFetchIssue}
                  disabled={!fetchNumber || fetchingIssue}
                  className="flex-1"
                >
                  {fetchingIssue ? "Fetching..." : "Fetch Issue"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowFetchModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Requires <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">gh</code> CLI authenticated
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Issues List */}
      {issues.length === 0 ? (
        <EmptyState
          title="No Issues Yet"
          description="Fetch a GitHub issue to get started"
          action={{
            label: "Fetch Issue",
            onClick: () => setShowFetchModal(true),
          }}
        />
      ) : (
        <div className="grid gap-4">
          {issues.map((issue) => {
            const linkedFlow = flows.find((f) => f.id === issue.linkedFlowId);

            return (
              <Card
                key={issue.number}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/issues/${issue.number}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        #{issue.number} {issue.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant={getStateColor(issue.state)}>
                          {issue.state}
                        </Badge>
                        <Badge variant={getStatusColor(issue.status)}>
                          {issue.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span>{issue.repository}</span>
                      </div>

                      {issue.labels && issue.labels.length > 0 && (
                        <div className="flex items-center gap-1">
                          {issue.labels.slice(0, 3).map((label, index) => {
                            const labelText = typeof label === 'string' ? label : label.name;
                            return (
                              <span
                                key={`${labelText}-${index}`}
                                className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                              >
                                {labelText}
                              </span>
                            );
                          })}
                          {issue.labels.length > 3 && (
                            <span className="text-xs">+{issue.labels.length - 3} more</span>
                          )}
                        </div>
                      )}

                      {linkedFlow && (
                        <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          <span>Linked to {linkedFlow.flow.name}</span>
                        </div>
                      )}
                    </div>

                    {issue.body && (
                      <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {issue.body}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(issue.url, "_blank");
                    }}
                    className="ml-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Fetched {new Date(issue.fetchedAt).toLocaleString()}</span>
                  {issue.referenceRunId && (
                    <span className="text-blue-600 dark:text-blue-400">
                      Reference run captured
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
