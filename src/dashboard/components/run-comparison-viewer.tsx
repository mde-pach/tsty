"use client";

import { useState, useEffect } from "react";
import { ScreenshotComparison } from "./screenshot-comparison";
import { Badge, Card, LoadingState } from "./ui";
import type { TestReport } from "@/lib/types";

interface RunComparisonViewerProps {
  referenceRun: {
    id: string;
    report: TestReport;
  };
  currentRun: {
    id: string;
    report: TestReport;
  };
  flowName: string;
}

/**
 * Full run comparison viewer with metadata and screenshot navigation
 */
export function RunComparisonViewer({
  referenceRun,
  currentRun,
  flowName,
}: RunComparisonViewerProps) {
  const [selectedStep, setSelectedStep] = useState(0);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && selectedStep > 0) {
        setSelectedStep(selectedStep - 1);
      } else if (
        e.key === "ArrowRight" &&
        selectedStep < referenceRun.report.steps.length - 1
      ) {
        setSelectedStep(selectedStep + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedStep, referenceRun.report.steps.length]);

  const totalSteps = Math.min(
    referenceRun.report.steps.length,
    currentRun.report.steps.length
  );

  const refStep = referenceRun.report.steps[selectedStep];
  const curStep = currentRun.report.steps[selectedStep];

  if (!refStep || !curStep) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p>No screenshots available for this step</p>
      </div>
    );
  }

  const refScreenshot = refStep.screenshots[0];
  const curScreenshot = curStep.screenshots[0];

  const formatDuration = (ms?: number) => {
    if (!ms) return "—";
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const refPassed = referenceRun.report.failed === 0;
  const curPassed = currentRun.report.failed === 0;
  const statusChanged = refPassed !== curPassed;

  return (
    <div className="space-y-6">
      {/* Overview Comparison */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Reference Run */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Reference Run
            </h3>
            <Badge variant={refPassed ? "success" : "error"}>
              {refPassed ? "Passed" : "Failed"}
            </Badge>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Flow</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {flowName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Date</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {new Date(referenceRun.report.timestamp).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Duration</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatDuration(referenceRun.report.duration)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Steps</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {referenceRun.report.passed}/{referenceRun.report.totalSteps}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Device</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {referenceRun.report.device}
              </span>
            </div>
          </div>
        </Card>

        {/* Current Run */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Current Run
            </h3>
            <Badge variant={curPassed ? "success" : "error"}>
              {curPassed ? "Passed" : "Failed"}
            </Badge>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Flow</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {flowName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Date</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {new Date(currentRun.report.timestamp).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Duration</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatDuration(currentRun.report.duration)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Steps</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {currentRun.report.passed}/{currentRun.report.totalSteps}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Device</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {currentRun.report.device}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Status Change Alert */}
      {statusChanged && (
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-3">
            <svg
              className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                Status Changed
              </p>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Test went from {refPassed ? "Passed" : "Failed"} to{" "}
                {curPassed ? "Passed" : "Failed"}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Step Selector */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Select Step to Compare
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {referenceRun.report.steps.map((step, index) => {
            const isSelected = index === selectedStep;
            const refStepPassed = step.passed;
            const curStepPassed = currentRun.report.steps[index]?.passed;
            const stepStatusChanged = refStepPassed !== curStepPassed;

            return (
              <button
                key={index}
                onClick={() => setSelectedStep(index)}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${
                    isSelected
                      ? "bg-blue-600 text-white"
                      : stepStatusChanged
                        ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/50"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }
                `}
              >
                Step {index + 1}
                {stepStatusChanged && !isSelected && (
                  <span className="ml-1">⚠️</span>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Screenshot Comparison */}
      <Card>
        {refScreenshot && curScreenshot ? (
          <ScreenshotComparison
            referenceScreenshot={refScreenshot}
            currentScreenshot={curScreenshot}
            stepName={refStep.name}
            stepIndex={selectedStep}
            totalSteps={totalSteps}
            onPrevious={selectedStep > 0 ? () => setSelectedStep(selectedStep - 1) : undefined}
            onNext={
              selectedStep < totalSteps - 1
                ? () => setSelectedStep(selectedStep + 1)
                : undefined
            }
          />
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
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
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-lg font-medium mb-2">No Screenshots Available</p>
            <p className="text-sm">
              Screenshots were not captured for this step in one or both runs
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
