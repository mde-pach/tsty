"use client";

import { DashboardLayout } from "./components/dashboard-layout";
import { OverviewPage } from "./pages/overview-page";

/**
 * Main QA Dashboard Component
 * This is the primary entry point for standalone usage
 * For Next.js integration, use the app router pages directly
 */
export function QADashboard() {
	return (
		<DashboardLayout>
			<OverviewPage />
		</DashboardLayout>
	);
}

export { ActionLibrary } from "./components/action-library";
export { CommandPalette } from "./components/command-palette";
export { DashboardLayout } from "./components/dashboard-layout";
export { FlowCard } from "./components/flow-card";
// Export individual components for custom integrations
export { FlowList } from "./components/flow-list";
export { FlowMetrics } from "./components/flow-metrics";
export { FlowStepCard } from "./components/flow-step-card";
export { PageTreeView } from "./components/page-tree-view";
export { ReportViewer } from "./components/report-viewer";
export { ReportsList } from "./components/reports-list";
export { ScreenshotGallery } from "./components/screenshot-gallery";
export { SmartCollectionBuilder } from "./components/smart-collection-builder";
export { StepDetailView } from "./components/step-detail-view";
export { StepNavigator } from "./components/step-navigator";
export { TagManager } from "./components/tag-manager";
export { TagPicker } from "./components/tag-picker";
export { ThemeToggle } from "./components/theme-toggle";
// Export UI components
export * from "./components/ui";
export { useActions } from "./hooks/use-actions";
export { useCollections } from "./hooks/use-collections";
// Export hooks for custom integrations
export { useFlows, useRunFlow } from "./hooks/use-flows";
export { useReports } from "./hooks/use-reports";
export { useTags } from "./hooks/use-tags";
export { OverviewPage } from "./pages/overview-page";
