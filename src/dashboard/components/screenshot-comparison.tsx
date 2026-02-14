"use client";

import { useState } from "react";
import { Button } from "./ui";

interface ScreenshotComparisonProps {
  referenceScreenshot: string;
  currentScreenshot: string;
  stepName: string;
  stepIndex: number;
  totalSteps: number;
  onPrevious?: () => void;
  onNext?: () => void;
}

/**
 * Side-by-side screenshot comparison component
 * Shows reference (before) and current (after) screenshots
 */
export function ScreenshotComparison({
  referenceScreenshot,
  currentScreenshot,
  stepName,
  stepIndex,
  totalSteps,
  onPrevious,
  onNext,
}: ScreenshotComparisonProps) {
  const [imageError, setImageError] = useState<{
    reference: boolean;
    current: boolean;
  }>({ reference: false, current: false });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Step {stepIndex + 1}: {stepName}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Comparing screenshots side-by-side
          </p>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {stepIndex + 1} of {totalSteps}
        </div>
      </div>

      {/* Labels */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium">
            <span>📸</span>
            <span>Reference (Before)</span>
          </div>
        </div>
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium">
            <span>📸</span>
            <span>Current (After)</span>
          </div>
        </div>
      </div>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Reference screenshot */}
        <div className="border-2 border-blue-200 dark:border-blue-800 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900">
          {imageError.reference ? (
            <div className="aspect-video flex items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <svg
                  className="w-12 h-12 mx-auto mb-2 text-gray-400"
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
                <p className="text-sm">Reference screenshot not found</p>
              </div>
            </div>
          ) : (
            <img
              src={`/api/screenshots?filename=${referenceScreenshot}`}
              alt={`Reference: ${stepName}`}
              className="w-full h-auto"
              onError={() => setImageError((prev) => ({ ...prev, reference: true }))}
            />
          )}
        </div>

        {/* Current screenshot */}
        <div className="border-2 border-green-200 dark:border-green-800 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900">
          {imageError.current ? (
            <div className="aspect-video flex items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <svg
                  className="w-12 h-12 mx-auto mb-2 text-gray-400"
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
                <p className="text-sm">Current screenshot not found</p>
              </div>
            </div>
          ) : (
            <img
              src={`/api/screenshots?filename=${currentScreenshot}`}
              alt={`Current: ${stepName}`}
              className="w-full h-auto"
              onError={() => setImageError((prev) => ({ ...prev, current: true }))}
            />
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          onClick={onPrevious}
          disabled={!onPrevious || stepIndex === 0}
          variant="secondary"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Previous Step
        </Button>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          Use keyboard: ← → to navigate
        </div>

        <Button
          onClick={onNext}
          disabled={!onNext || stepIndex === totalSteps - 1}
          variant="secondary"
        >
          Next Step
          <svg
            className="w-4 h-4 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Button>
      </div>
    </div>
  );
}
