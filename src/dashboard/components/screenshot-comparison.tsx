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

  const [imageDimensions, setImageDimensions] = useState<{
    reference: { width: number; height: number } | null;
    current: { width: number; height: number } | null;
  }>({ reference: null, current: null });

  const handleImageLoad = (type: 'reference' | 'current', event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    setImageDimensions(prev => ({
      ...prev,
      [type]: { width: img.naturalWidth, height: img.naturalHeight }
    }));
  };

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

      {/* Labels - More Prominent */}
      <div className="grid grid-cols-2 gap-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-blue-500 dark:bg-blue-600 text-white rounded-lg text-lg font-bold shadow-md">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>BEFORE</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Reference Screenshot</p>
        </div>
        <div className="text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-500 dark:bg-green-600 text-white rounded-lg text-lg font-bold shadow-md">
            <span>AFTER</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Current Screenshot</p>
        </div>
      </div>

      {/* Size Comparison Display */}
      {(imageDimensions.reference || imageDimensions.current) && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-6 text-center">
            <div>
              {imageDimensions.reference && (
                <>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {imageDimensions.reference.width} × {imageDimensions.reference.height}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {(imageDimensions.reference.width * imageDimensions.reference.height / 1000000).toFixed(2)}MP
                  </div>
                </>
              )}
            </div>
            <div>
              {imageDimensions.current && (
                <>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {imageDimensions.current.width} × {imageDimensions.current.height}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {(imageDimensions.current.width * imageDimensions.current.height / 1000000).toFixed(2)}MP
                  </div>
                  {imageDimensions.reference && (
                    <div className="mt-2 text-xs">
                      {imageDimensions.current.width === imageDimensions.reference.width &&
                       imageDimensions.current.height === imageDimensions.reference.height ? (
                        <span className="text-green-600 dark:text-green-400">✓ Same size</span>
                      ) : (
                        <span className="text-yellow-600 dark:text-yellow-400">
                          Δ {Math.abs(imageDimensions.current.width - imageDimensions.reference.width)}×
                          {Math.abs(imageDimensions.current.height - imageDimensions.reference.height)}px
                        </span>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reference screenshot */}
        <div className="border-4 border-blue-500 dark:border-blue-600 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900 shadow-lg">
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
              onLoad={(e) => handleImageLoad('reference', e)}
            />
          )}
        </div>

        {/* Current screenshot */}
        <div className="border-4 border-green-500 dark:border-green-600 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900 shadow-lg">
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
              onLoad={(e) => handleImageLoad('current', e)}
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
