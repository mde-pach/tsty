import { useEffect } from "react";
import { useRouter } from "next/navigation";

export interface KeyboardShortcutsConfig {
	/** Open organize modal */
	onOrganize?: () => void;
	/** Run all tests */
	onRunAll?: () => void;
	/** Show shortcuts help */
	onShowShortcuts?: () => void;
	/** Focus search input */
	onFocusSearch?: () => void;
}

/**
 * Global keyboard shortcuts hook
 *
 * Handles all global shortcuts like Cmd+1/2/3 for navigation,
 * Cmd+N for new flow, Cmd+Shift+N for new action, etc.
 *
 * Note: Editor-specific shortcuts (Cmd+Z, Cmd+S) are handled in their respective contexts.
 */
export function useKeyboardShortcuts(config: KeyboardShortcutsConfig = {}) {
	const router = useRouter();

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const isMod = e.metaKey || e.ctrlKey;
			const isShift = e.shiftKey;

			// Ignore if user is typing in an input/textarea
			const target = e.target as HTMLElement;
			if (
				target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA" ||
				target.isContentEditable
			) {
				// Allow some shortcuts even in inputs
				if (!isMod) return;

				// Only allow Cmd+K and Cmd+/ in inputs
				if (e.key !== "k" && e.key !== "/") return;
			}

			// Cmd+K - Command Palette (handled by CommandPalette component)
			// Cmd+O - Organize Modal
			if (isMod && !isShift && e.key === "o") {
				e.preventDefault();
				config.onOrganize?.();
				return;
			}

			// Cmd+/ - Show Shortcuts Help
			if (isMod && !isShift && e.key === "/") {
				e.preventDefault();
				config.onShowShortcuts?.();
				return;
			}

			// Cmd+1 - Navigate to Tests
			if (isMod && !isShift && e.key === "1") {
				e.preventDefault();
				router.push("/");
				return;
			}

			// Cmd+2 - Navigate to Results
			if (isMod && !isShift && e.key === "2") {
				e.preventDefault();
				router.push("/runs");
				return;
			}

			// Cmd+3 - Navigate to Library
			if (isMod && !isShift && e.key === "3") {
				e.preventDefault();
				router.push("/actions");
				return;
			}

			// Cmd+N - New Flow
			if (isMod && !isShift && e.key === "n") {
				e.preventDefault();
				router.push("/flows/new");
				return;
			}

			// Cmd+Shift+N - New Action
			if (isMod && isShift && e.key.toLowerCase() === "n") {
				e.preventDefault();
				router.push("/actions/new");
				return;
			}

			// Cmd+R - Run All Tests
			if (isMod && !isShift && e.key === "r") {
				e.preventDefault();
				config.onRunAll?.();
				return;
			}

			// Cmd+F - Focus Search
			if (isMod && !isShift && e.key === "f") {
				e.preventDefault();
				config.onFocusSearch?.();
				return;
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [router, config]);
}
