"use client";

import type React from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import type { Flow, FlowStep } from "../../lib/types";

interface FlowEditorState {
	flow: Flow;
	selectedStepIndex: number | null;
	isDirty: boolean;
	canUndo: boolean;
	canRedo: boolean;
	lastSaved: string | null;
	isSaving: boolean;
}

interface FlowEditorContextValue extends FlowEditorState {
	updateFlow: (updates: Partial<Flow>) => void;
	addStep: (step: FlowStep) => void;
	updateStep: (index: number, updates: Partial<FlowStep>) => void;
	removeStep: (index: number) => void;
	reorderSteps: (fromIndex: number, toIndex: number) => void;
	selectStep: (index: number | null) => void;
	undo: () => void;
	redo: () => void;
	save: () => Promise<void>;
	reset: (flow: Flow) => void;
}

const FlowEditorContext = createContext<FlowEditorContextValue | undefined>(
	undefined,
);

const MAX_HISTORY = 50;
const AUTO_SAVE_DELAY = 2000; // 2 seconds

interface FlowEditorProviderProps {
	children: React.ReactNode;
	initialFlow: Flow;
	flowId?: string;
	onSave?: (flow: Flow) => Promise<void>;
}

export function FlowEditorProvider({
	children,
	initialFlow,
	flowId,
	onSave,
}: FlowEditorProviderProps) {
	const [flow, setFlow] = useState<Flow>(initialFlow);
	const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(
		null,
	);
	const [history, setHistory] = useState<Flow[]>([initialFlow]);
	const [historyIndex, setHistoryIndex] = useState(0);
	const [isDirty, setIsDirty] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [lastSaved, setLastSaved] = useState<string | null>(null);
	const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

	// Auto-save
	useEffect(() => {
		if (isDirty && onSave) {
			if (autoSaveTimerRef.current) {
				clearTimeout(autoSaveTimerRef.current);
			}

			autoSaveTimerRef.current = setTimeout(() => {
				handleSave();
			}, AUTO_SAVE_DELAY);
		}

		return () => {
			if (autoSaveTimerRef.current) {
				clearTimeout(autoSaveTimerRef.current);
			}
		};
	}, [isDirty, flow]);

	const addToHistory = useCallback(
		(newFlow: Flow) => {
			setHistory((prev) => {
				// Remove any history after current index
				const newHistory = prev.slice(0, historyIndex + 1);

				// Add new state
				newHistory.push(newFlow);

				// Limit history size
				if (newHistory.length > MAX_HISTORY) {
					newHistory.shift();
					setHistoryIndex((prev) => prev - 1);
				}

				return newHistory;
			});
			setHistoryIndex((prev) => Math.min(prev + 1, MAX_HISTORY - 1));
			setIsDirty(true);
		},
		[historyIndex],
	);

	const updateFlow = useCallback(
		(updates: Partial<Flow>) => {
			const newFlow = { ...flow, ...updates };
			setFlow(newFlow);
			addToHistory(newFlow);
		},
		[flow, addToHistory],
	);

	const addStep = useCallback(
		(step: FlowStep) => {
			const newFlow = {
				...flow,
				steps: [...flow.steps, step],
			};
			setFlow(newFlow);
			addToHistory(newFlow);
			setSelectedStepIndex(newFlow.steps.length - 1);
		},
		[flow, addToHistory],
	);

	const updateStep = useCallback(
		(index: number, updates: Partial<FlowStep>) => {
			const newSteps = [...flow.steps];
			newSteps[index] = { ...newSteps[index], ...updates };
			const newFlow = { ...flow, steps: newSteps };
			setFlow(newFlow);
			addToHistory(newFlow);
		},
		[flow, addToHistory],
	);

	const removeStep = useCallback(
		(index: number) => {
			const newSteps = flow.steps.filter((_, i) => i !== index);
			const newFlow = { ...flow, steps: newSteps };
			setFlow(newFlow);
			addToHistory(newFlow);

			// Adjust selected step index
			if (selectedStepIndex === index) {
				setSelectedStepIndex(null);
			} else if (selectedStepIndex !== null && selectedStepIndex > index) {
				setSelectedStepIndex(selectedStepIndex - 1);
			}
		},
		[flow, selectedStepIndex, addToHistory],
	);

	const reorderSteps = useCallback(
		(fromIndex: number, toIndex: number) => {
			const newSteps = [...flow.steps];
			const [movedStep] = newSteps.splice(fromIndex, 1);
			newSteps.splice(toIndex, 0, movedStep);
			const newFlow = { ...flow, steps: newSteps };
			setFlow(newFlow);
			addToHistory(newFlow);

			// Adjust selected step index
			if (selectedStepIndex === fromIndex) {
				setSelectedStepIndex(toIndex);
			} else if (selectedStepIndex !== null) {
				if (fromIndex < selectedStepIndex && toIndex >= selectedStepIndex) {
					setSelectedStepIndex(selectedStepIndex - 1);
				} else if (
					fromIndex > selectedStepIndex &&
					toIndex <= selectedStepIndex
				) {
					setSelectedStepIndex(selectedStepIndex + 1);
				}
			}
		},
		[flow, selectedStepIndex, addToHistory],
	);

	const selectStep = useCallback((index: number | null) => {
		setSelectedStepIndex(index);
	}, []);

	const undo = useCallback(() => {
		if (historyIndex > 0) {
			const newIndex = historyIndex - 1;
			setHistoryIndex(newIndex);
			setFlow(history[newIndex]);
			setIsDirty(true);
		}
	}, [history, historyIndex]);

	const redo = useCallback(() => {
		if (historyIndex < history.length - 1) {
			const newIndex = historyIndex + 1;
			setHistoryIndex(newIndex);
			setFlow(history[newIndex]);
			setIsDirty(true);
		}
	}, [history, historyIndex]);

	const handleSave = async () => {
		if (onSave) {
			try {
				setIsSaving(true);

				// Backup to localStorage before saving
				try {
					const backupKey = `flow-backup-${flowId || "new"}`;
					localStorage.setItem(backupKey, JSON.stringify(flow));
				} catch (e) {
					console.warn("Failed to backup to localStorage:", e);
				}

				await onSave(flow);
				setIsDirty(false);
				setLastSaved(new Date().toISOString());

				// Clear backup on success
				try {
					const backupKey = `flow-backup-${flowId || "new"}`;
					localStorage.removeItem(backupKey);
				} catch (e) {
					// Ignore
				}
			} catch (error) {
				console.error("Failed to save flow:", error);
			} finally {
				setIsSaving(false);
			}
		}
	};

	const save = useCallback(async () => {
		await handleSave();
	}, [flow, onSave]);

	const reset = useCallback((newFlow: Flow) => {
		setFlow(newFlow);
		setHistory([newFlow]);
		setHistoryIndex(0);
		setIsDirty(false);
		setSelectedStepIndex(null);
		setLastSaved(null);
	}, []);

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Cmd+Z / Ctrl+Z - Undo
			if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
				e.preventDefault();
				undo();
			}

			// Cmd+Shift+Z / Ctrl+Shift+Z - Redo
			if ((e.metaKey || e.ctrlKey) && e.key === "z" && e.shiftKey) {
				e.preventDefault();
				redo();
			}

			// Cmd+S / Ctrl+S - Save
			if ((e.metaKey || e.ctrlKey) && e.key === "s") {
				e.preventDefault();
				save();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [undo, redo, save]);

	const value: FlowEditorContextValue = {
		flow,
		selectedStepIndex,
		isDirty,
		isSaving,
		canUndo: historyIndex > 0,
		canRedo: historyIndex < history.length - 1,
		lastSaved,
		updateFlow,
		addStep,
		updateStep,
		removeStep,
		reorderSteps,
		selectStep,
		undo,
		redo,
		save,
		reset,
	};

	return (
		<FlowEditorContext.Provider value={value}>
			{children}
		</FlowEditorContext.Provider>
	);
}

export function useFlowEditor() {
	const context = useContext(FlowEditorContext);
	if (!context) {
		throw new Error("useFlowEditor must be used within FlowEditorProvider");
	}
	return context;
}
