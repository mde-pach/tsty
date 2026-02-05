"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "./ui/command";

interface CommandPaletteProps {
	flows?: Array<{ id: string; name: string }>;
	actions?: Array<{ id: string; name: string }>;
	reports?: Array<{ id: string; flowId: string; timestamp: string }>;
	onRunAll?: () => void;
}

export function CommandPalette({
	flows = [],
	actions = [],
	reports = [],
	onRunAll,
}: CommandPaletteProps) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");

	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((open) => !open);
			}
		};

		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, []);

	const runCommand = (command: () => void) => {
		setOpen(false);
		setSearch("");
		command();
	};

	// Filter items based on search
	const filteredFlows = flows.filter((flow) =>
		flow.name.toLowerCase().includes(search.toLowerCase()),
	);
	const filteredActions = actions.filter((action) =>
		action.name.toLowerCase().includes(search.toLowerCase()),
	);
	const filteredReports = reports.filter((report) =>
		report.flowId.toLowerCase().includes(search.toLowerCase()),
	);

	return (
		<CommandDialog open={open} onOpenChange={setOpen}>
			<CommandInput
				placeholder="Type a command or search..."
				value={search}
				onValueChange={setSearch}
			/>
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>

				{/* Quick Actions */}
				<CommandGroup heading="Quick Actions">
					<CommandItem
						onSelect={() => runCommand(() => router.push("/flows/new"))}
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
								d="M12 4v16m8-8H4"
							/>
						</svg>
						<span>New Flow</span>
						<span className="ml-auto text-xs text-gray-400">Cmd+N</span>
					</CommandItem>
					<CommandItem
						onSelect={() => runCommand(() => router.push("/actions/new"))}
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
								d="M13 10V3L4 14h7v7l9-11h-7z"
							/>
						</svg>
						<span>New Action</span>
						<span className="ml-auto text-xs text-gray-400">Cmd+Shift+N</span>
					</CommandItem>
					{onRunAll && (
						<CommandItem onSelect={() => runCommand(onRunAll)}>
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
									d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<span>Run All Tests</span>
							<span className="ml-auto text-xs text-gray-400">Cmd+R</span>
						</CommandItem>
					)}
				</CommandGroup>

				<CommandSeparator />

				{/* Navigation - Updated for UX Revamp */}
				<CommandGroup heading="Navigation">
					<CommandItem onSelect={() => runCommand(() => router.push("/"))}>
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
								d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
							/>
						</svg>
						<span>Tests</span>
						<span className="ml-auto text-xs text-gray-400">Cmd+1</span>
					</CommandItem>
					<CommandItem onSelect={() => runCommand(() => router.push("/runs"))}>
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
								d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
							/>
						</svg>
						<span>Results</span>
						<span className="ml-auto text-xs text-gray-400">Cmd+2</span>
					</CommandItem>
					<CommandItem
						onSelect={() => runCommand(() => router.push("/actions"))}
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
								d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
							/>
						</svg>
						<span>Library</span>
						<span className="ml-auto text-xs text-gray-400">Cmd+3</span>
					</CommandItem>
				</CommandGroup>

				{/* Search Flows */}
				{search && filteredFlows.length > 0 && (
					<>
						<CommandSeparator />
						<CommandGroup heading={`Flows (${filteredFlows.length})`}>
							{filteredFlows.slice(0, 5).map((flow) => (
								<CommandItem
									key={flow.id}
									onSelect={() =>
										runCommand(() => router.push(`/flows/${encodeURIComponent(flow.id)}`))
									}
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
											d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
										/>
									</svg>
									<span>{flow.name}</span>
								</CommandItem>
							))}
							{filteredFlows.length > 5 && (
								<CommandItem disabled>
									<span className="text-xs text-gray-400">
										+{filteredFlows.length - 5} more...
									</span>
								</CommandItem>
							)}
						</CommandGroup>
					</>
				)}

				{/* Search Actions */}
				{search && filteredActions.length > 0 && (
					<>
						<CommandSeparator />
						<CommandGroup heading={`Actions (${filteredActions.length})`}>
							{filteredActions.slice(0, 5).map((action) => (
								<CommandItem
									key={action.id}
									onSelect={() =>
										runCommand(() => router.push(`/actions/${encodeURIComponent(action.id)}`))
									}
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
											d="M13 10V3L4 14h7v7l9-11h-7z"
										/>
									</svg>
									<span>{action.name}</span>
								</CommandItem>
							))}
							{filteredActions.length > 5 && (
								<CommandItem disabled>
									<span className="text-xs text-gray-400">
										+{filteredActions.length - 5} more...
									</span>
								</CommandItem>
							)}
						</CommandGroup>
					</>
				)}

				{/* Search Results */}
				{search && filteredReports.length > 0 && (
					<>
						<CommandSeparator />
						<CommandGroup heading={`Results (${filteredReports.length})`}>
							{filteredReports.slice(0, 5).map((report) => (
								<CommandItem
									key={report.id}
									onSelect={() =>
										runCommand(() => router.push(`/runs/${report.id}`))
									}
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
											d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
										/>
									</svg>
									<span>
										{report.flowId} - {new Date(report.timestamp).toLocaleString()}
									</span>
								</CommandItem>
							))}
							{filteredReports.length > 5 && (
								<CommandItem disabled>
									<span className="text-xs text-gray-400">
										+{filteredReports.length - 5} more...
									</span>
								</CommandItem>
							)}
						</CommandGroup>
					</>
				)}
			</CommandList>
		</CommandDialog>
	);
}
