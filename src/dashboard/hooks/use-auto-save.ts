import { useEffect, useRef, useState, useCallback } from "react";

export interface UseAutoSaveOptions<T> {
	/** The data to save */
	data: T;
	/** Function to save data (returns true on success) */
	onSave: (data: T) => Promise<boolean>;
	/** Debounce delay in milliseconds (default: 2000) */
	delay?: number;
	/** Whether auto-save is enabled (default: true) */
	enabled?: boolean;
	/** Callback when save starts */
	onSaveStart?: () => void;
	/** Callback when save completes */
	onSaveComplete?: (success: boolean) => void;
}

export interface UseAutoSaveReturn {
	/** Current save status */
	status: "idle" | "saving" | "saved" | "error";
	/** Timestamp of last successful save */
	lastSaved: Date | null;
	/** Error message if save failed */
	error: string | null;
	/** Manually trigger save */
	save: () => Promise<void>;
	/** Reset save status */
	reset: () => void;
}

/**
 * Hook for debounced auto-saving with localStorage backup
 *
 * @example
 * ```tsx
 * const { status, lastSaved, save } = useAutoSave({
 *   data: flowData,
 *   onSave: async (data) => {
 *     const response = await fetch('/api/flows', {
 *       method: 'PUT',
 *       body: JSON.stringify(data),
 *     });
 *     return response.ok;
 *   },
 *   delay: 2000,
 * });
 * ```
 */
export function useAutoSave<T>({
	data,
	onSave,
	delay = 2000,
	enabled = true,
	onSaveStart,
	onSaveComplete,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
	const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
		"idle",
	);
	const [lastSaved, setLastSaved] = useState<Date | null>(null);
	const [error, setError] = useState<string | null>(null);

	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const dataRef = useRef<T>(data);
	const isMountedRef = useRef(true);

	// Update data reference
	useEffect(() => {
		dataRef.current = data;
	}, [data]);

	// Track mounted state
	useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
		};
	}, []);

	// Manual save function
	const save = useCallback(async () => {
		if (!enabled) return;

		try {
			setStatus("saving");
			setError(null);
			onSaveStart?.();

			// Backup to localStorage before API call
			const backupKey = `autosave-backup-${Date.now()}`;
			try {
				localStorage.setItem(backupKey, JSON.stringify(dataRef.current));
			} catch (e) {
				console.warn("Failed to backup to localStorage:", e);
			}

			const success = await onSave(dataRef.current);

			if (!isMountedRef.current) return;

			if (success) {
				setStatus("saved");
				setLastSaved(new Date());
				setError(null);

				// Clear backup on success
				try {
					localStorage.removeItem(backupKey);
				} catch (e) {
					// Ignore
				}

				// Reset to idle after 3 seconds
				setTimeout(() => {
					if (isMountedRef.current) {
						setStatus("idle");
					}
				}, 3000);
			} else {
				setStatus("error");
				setError("Save failed");
			}

			onSaveComplete?.(success);
		} catch (err) {
			if (!isMountedRef.current) return;

			setStatus("error");
			setError(err instanceof Error ? err.message : "Unknown error");
			onSaveComplete?.(false);
		}
	}, [enabled, onSave, onSaveStart, onSaveComplete]);

	// Auto-save with debounce
	useEffect(() => {
		if (!enabled) return;

		// Clear existing timeout
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		// Skip if no changes (first render or data unchanged)
		if (status === "idle" && lastSaved === null) {
			return;
		}

		// Set new timeout
		timeoutRef.current = setTimeout(() => {
			save();
		}, delay);

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [data, delay, enabled, save]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	const reset = useCallback(() => {
		setStatus("idle");
		setError(null);
	}, []);

	return {
		status,
		lastSaved,
		error,
		save,
		reset,
	};
}

/**
 * Get formatted status message for display
 */
export function getAutoSaveStatusMessage(
	status: UseAutoSaveReturn["status"],
	lastSaved: Date | null,
): string {
	switch (status) {
		case "saving":
			return "Saving...";
		case "saved":
			return lastSaved
				? `Saved at ${lastSaved.toLocaleTimeString()}`
				: "Saved";
		case "error":
			return "Save failed";
		case "idle":
		default:
			return lastSaved
				? `Last saved at ${lastSaved.toLocaleTimeString()}`
				: "";
	}
}
