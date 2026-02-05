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
import type { Action, ActionDefinition } from "../../lib/types";

interface ActionEditorState {
	id: string;
	name: string;
	definition: ActionDefinition;
	selectedActionIndex: number | null;
	isDirty: boolean;
	isSaving: boolean;
	canUndo: boolean;
	canRedo: boolean;
	lastSaved: string | null;
}

interface ActionEditorContextValue extends ActionEditorState {
	updateName: (name: string) => void;
	updateDefinition: (updates: Partial<ActionDefinition>) => void;
	addAction: (action: Action) => void;
	updateAction: (index: number, updates: Partial<Action>) => void;
	removeAction: (index: number) => void;
	reorderActions: (fromIndex: number, toIndex: number) => void;
	selectAction: (index: number | null) => void;
	undo: () => void;
	redo: () => void;
	save: () => Promise<void>;
	reset: (id: string, name: string, definition: ActionDefinition) => void;
}

const ActionEditorContext = createContext<ActionEditorContextValue | undefined>(
	undefined,
);

const MAX_HISTORY = 50;
const AUTO_SAVE_DELAY = 2000; // 2 seconds

interface ActionEditorProviderProps {
	children: React.ReactNode;
	initialId: string;
	initialName: string;
	initialDefinition: ActionDefinition;
	onSave?: (
		id: string,
		name: string,
		definition: ActionDefinition,
	) => Promise<void>;
}

export function ActionEditorProvider({
	children,
	initialId,
	initialName,
	initialDefinition,
	onSave,
}: ActionEditorProviderProps) {
	const [id, setId] = useState<string>(initialId);
	const [name, setName] = useState<string>(initialName);
	const [definition, setDefinition] =
		useState<ActionDefinition>(initialDefinition);
	const [selectedActionIndex, setSelectedActionIndex] = useState<number | null>(
		null,
	);
	const [history, setHistory] = useState<ActionDefinition[]>([
		initialDefinition,
	]);
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
	}, [isDirty, definition]);

	const addToHistory = useCallback(
		(newDefinition: ActionDefinition) => {
			setHistory((prev) => {
				const newHistory = prev.slice(0, historyIndex + 1);
				newHistory.push(newDefinition);

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

	const updateName = useCallback((newName: string) => {
		setName(newName);
		setIsDirty(true);
	}, []);

	const updateDefinition = useCallback(
		(updates: Partial<ActionDefinition>) => {
			const newDefinition = { ...definition, ...updates };
			setDefinition(newDefinition);
			addToHistory(newDefinition);
		},
		[definition, addToHistory],
	);

	const addAction = useCallback(
		(action: Action) => {
			const newDefinition = {
				...definition,
				primitives: [...(definition.primitives || []), action],
			};
			setDefinition(newDefinition);
			addToHistory(newDefinition);
			setSelectedActionIndex(newDefinition.primitives.length - 1);
		},
		[definition, addToHistory],
	);

	const updateAction = useCallback(
		(index: number, updates: Partial<Action>) => {
			const newActions = [...(definition.primitives || [])];
			newActions[index] = { ...newActions[index], ...updates } as Action;
			const newDefinition = { ...definition, primitives: newActions };
			setDefinition(newDefinition);
			addToHistory(newDefinition);
		},
		[definition, addToHistory],
	);

	const removeAction = useCallback(
		(index: number) => {
			const newActions = (definition.primitives || []).filter((_, i) => i !== index);
			const newDefinition = { ...definition, primitives: newActions };
			setDefinition(newDefinition);
			addToHistory(newDefinition);

			if (selectedActionIndex === index) {
				setSelectedActionIndex(null);
			} else if (selectedActionIndex !== null && selectedActionIndex > index) {
				setSelectedActionIndex(selectedActionIndex - 1);
			}
		},
		[definition, selectedActionIndex, addToHistory],
	);

	const reorderActions = useCallback(
		(fromIndex: number, toIndex: number) => {
			const newActions = [...(definition.primitives || [])];
			const [movedAction] = newActions.splice(fromIndex, 1);
			newActions.splice(toIndex, 0, movedAction);
			const newDefinition = { ...definition, primitives: newActions };
			setDefinition(newDefinition);
			addToHistory(newDefinition);

			if (selectedActionIndex === fromIndex) {
				setSelectedActionIndex(toIndex);
			} else if (selectedActionIndex !== null) {
				if (fromIndex < selectedActionIndex && toIndex >= selectedActionIndex) {
					setSelectedActionIndex(selectedActionIndex - 1);
				} else if (
					fromIndex > selectedActionIndex &&
					toIndex <= selectedActionIndex
				) {
					setSelectedActionIndex(selectedActionIndex + 1);
				}
			}
		},
		[definition, selectedActionIndex, addToHistory],
	);

	const selectAction = useCallback((index: number | null) => {
		setSelectedActionIndex(index);
	}, []);

	const undo = useCallback(() => {
		if (historyIndex > 0) {
			const newIndex = historyIndex - 1;
			setHistoryIndex(newIndex);
			setDefinition(history[newIndex]);
			setIsDirty(true);
		}
	}, [history, historyIndex]);

	const redo = useCallback(() => {
		if (historyIndex < history.length - 1) {
			const newIndex = historyIndex + 1;
			setHistoryIndex(newIndex);
			setDefinition(history[newIndex]);
			setIsDirty(true);
		}
	}, [history, historyIndex]);

	const handleSave = async () => {
		if (onSave) {
			try {
				setIsSaving(true);

				// Backup to localStorage before saving
				try {
					const backupKey = `action-backup-${id}`;
					localStorage.setItem(
						backupKey,
						JSON.stringify({ id, name, definition }),
					);
				} catch (e) {
					console.warn("Failed to backup to localStorage:", e);
				}

				await onSave(id, name, definition);
				setIsDirty(false);
				setLastSaved(new Date().toISOString());

				// Clear backup on success
				try {
					const backupKey = `action-backup-${id}`;
					localStorage.removeItem(backupKey);
				} catch (e) {
					// Ignore
				}
			} catch (error) {
				console.error("Failed to save action:", error);
			} finally {
				setIsSaving(false);
			}
		}
	};

	const save = useCallback(async () => {
		await handleSave();
	}, [id, name, definition, onSave]);

	const reset = useCallback(
		(newId: string, newName: string, newDefinition: ActionDefinition) => {
			setId(newId);
			setName(newName);
			setDefinition(newDefinition);
			setHistory([newDefinition]);
			setHistoryIndex(0);
			setIsDirty(false);
			setSelectedActionIndex(null);
			setLastSaved(null);
		},
		[],
	);

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
				e.preventDefault();
				undo();
			}

			if ((e.metaKey || e.ctrlKey) && e.key === "z" && e.shiftKey) {
				e.preventDefault();
				redo();
			}

			if ((e.metaKey || e.ctrlKey) && e.key === "s") {
				e.preventDefault();
				save();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [undo, redo, save]);

	const value: ActionEditorContextValue = {
		id,
		name,
		definition,
		selectedActionIndex,
		isDirty,
		isSaving,
		canUndo: historyIndex > 0,
		canRedo: historyIndex < history.length - 1,
		lastSaved,
		updateName,
		updateDefinition,
		addAction,
		updateAction,
		removeAction,
		reorderActions,
		selectAction,
		undo,
		redo,
		save,
		reset,
	};

	return (
		<ActionEditorContext.Provider value={value}>
			{children}
		</ActionEditorContext.Provider>
	);
}

export function useActionEditor() {
	const context = useContext(ActionEditorContext);
	if (!context) {
		throw new Error("useActionEditor must be used within ActionEditorProvider");
	}
	return context;
}
