"use client";

import { useState, useRef } from "react";
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
 * Shows reference (before) and current (after) screenshots with synchronized zoom
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

  const [zoomPosition, setZoomPosition] = useState<{ x: number; y: number } | null>(null);
  const [isZooming, setIsZooming] = useState(false);

  const refImageRef = useRef<HTMLDivElement>(null);
  const curImageRef = useRef<HTMLDivElement>(null);

  const handleImageLoad = (type: 'reference' | 'current', event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    setImageDimensions(prev => ({
      ...prev,
      [type]: { width: img.naturalWidth, height: img.naturalHeight }
    }));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsZooming(true);
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
    setZoomPosition(null);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Minimal Header with Labels */}
      <div className="flex-shrink-0 grid grid-cols-2 gap-2 mb-2">
        <div className="flex items-center justify-between bg-blue-900/30 border border-blue-700 rounded-lg px-4 py-2">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-bold text-sm text-blue-300">BEFORE</span>
          </div>
          {imageDimensions.reference && (
            <span className="text-xs font-mono text-blue-400">
              {imageDimensions.reference.width}×{imageDimensions.reference.height}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between bg-green-900/30 border border-green-700 rounded-lg px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-green-300">AFTER</span>
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          {imageDimensions.current && (
            <span className="text-xs font-mono text-green-400">
              {imageDimensions.current.width}×{imageDimensions.current.height}
            </span>
          )}
        </div>
      </div>

      {/* Size Delta Indicator */}
      {imageDimensions.reference && imageDimensions.current && (
        <div className="flex-shrink-0 text-center py-1 mb-2">
          {imageDimensions.current.width === imageDimensions.reference.width &&
           imageDimensions.current.height === imageDimensions.reference.height ? (
            <span className="text-xs text-green-400 font-medium">✓ Same dimensions</span>
          ) : (
            <span className="text-xs text-yellow-400 font-medium">
              ⚠️ Size difference: {Math.abs(imageDimensions.current.width - imageDimensions.reference.width)}×
              {Math.abs(imageDimensions.current.height - imageDimensions.reference.height)}px
            </span>
          )}
        </div>
      )}

      {/* Full-Height Side-by-side comparison with zoom */}
      <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">
        {/* Reference screenshot with zoom */}
        <div
          ref={refImageRef}
          className="relative border-2 border-blue-600 rounded-lg overflow-hidden bg-black cursor-crosshair group h-full"
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {imageError.reference ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-600"
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
                <p className="text-sm">Reference not found</p>
              </div>
            </div>
          ) : (
            <img
              src={`/api/screenshots?filename=${referenceScreenshot}`}
              alt={`Reference: ${stepName}`}
              className="w-full h-full object-contain transition-transform duration-150"
              style={
                isZooming && zoomPosition
                  ? {
                      transform: 'scale(2)',
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    }
                  : undefined
              }
              onError={() => setImageError((prev) => ({ ...prev, reference: true }))}
              onLoad={(e) => handleImageLoad('reference', e)}
            />
          )}
          {isZooming && (
            <div className="absolute top-3 left-3 bg-blue-600/90 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg shadow-xl font-medium">
              🔍 2x Zoom
            </div>
          )}
          {!isZooming && (
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
              Hover to zoom
            </div>
          )}
        </div>

        {/* Current screenshot with synchronized zoom */}
        <div
          ref={curImageRef}
          className="relative border-2 border-green-600 rounded-lg overflow-hidden bg-black cursor-crosshair group h-full"
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {imageError.current ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-600"
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
                <p className="text-sm">Current not found</p>
              </div>
            </div>
          ) : (
            <img
              src={`/api/screenshots?filename=${currentScreenshot}`}
              alt={`Current: ${stepName}`}
              className="w-full h-full object-contain transition-transform duration-150"
              style={
                isZooming && zoomPosition
                  ? {
                      transform: 'scale(2)',
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    }
                  : undefined
              }
              onError={() => setImageError((prev) => ({ ...prev, current: true }))}
              onLoad={(e) => handleImageLoad('current', e)}
            />
          )}
          {isZooming && (
            <div className="absolute top-3 left-3 bg-green-600/90 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg shadow-xl font-medium">
              🔍 2x Zoom
            </div>
          )}
          {!isZooming && (
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
              Hover to zoom
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
