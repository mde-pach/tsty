"use client";

import { Command as CommandPrimitive } from "cmdk";
import * as React from "react";

const Command = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
	<CommandPrimitive
		ref={ref}
		className={`flex h-full w-full flex-col overflow-hidden rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white ${className || ""}`}
		{...props}
	/>
));
Command.displayName = CommandPrimitive.displayName;

interface CommandDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	children: React.ReactNode;
}

const CommandDialog = ({
	open,
	onOpenChange,
	children,
}: CommandDialogProps) => {
	return (
		<>
			{open && (
				<div
					className="fixed inset-0 z-50 bg-black/50"
					onClick={() => onOpenChange(false)}
				/>
			)}
			<div
				className={`fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] transition-all ${
					open
						? "opacity-100 scale-100"
						: "opacity-0 scale-95 pointer-events-none"
				}`}
			>
				<Command className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 shadow-lg">
					{children}
				</Command>
			</div>
		</>
	);
};

const CommandInput = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.Input>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
	<div className="flex items-center border-b border-gray-200 dark:border-gray-800 px-3">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="mr-2 h-4 w-4 shrink-0 opacity-50"
		>
			<circle cx="11" cy="11" r="8" />
			<path d="m21 21-4.3-4.3" />
		</svg>
		<CommandPrimitive.Input
			ref={ref}
			className={`flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50 ${className || ""}`}
			{...props}
		/>
	</div>
));
CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.List>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
	<CommandPrimitive.List
		ref={ref}
		className={`max-h-[300px] overflow-y-auto overflow-x-hidden ${className || ""}`}
		{...props}
	/>
));
CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.Empty>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
	<CommandPrimitive.Empty
		ref={ref}
		className="py-6 text-center text-sm text-gray-500 dark:text-gray-400"
		{...props}
	/>
));
CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.Group>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
	<CommandPrimitive.Group
		ref={ref}
		className={`overflow-hidden p-1 text-gray-900 dark:text-white [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-gray-500 dark:[&_[cmdk-group-heading]]:text-gray-400 ${className || ""}`}
		{...props}
	/>
));
CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.Separator>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
	<CommandPrimitive.Separator
		ref={ref}
		className={`-mx-1 h-px bg-gray-200 dark:bg-gray-800 ${className || ""}`}
		{...props}
	/>
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
	<CommandPrimitive.Item
		ref={ref}
		className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-gray-100 dark:aria-selected:bg-gray-800 aria-selected:text-gray-900 dark:aria-selected:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className || ""}`}
		{...props}
	/>
));
CommandItem.displayName = CommandPrimitive.Item.displayName;

export {
	Command,
	CommandDialog,
	CommandInput,
	CommandList,
	CommandEmpty,
	CommandGroup,
	CommandItem,
	CommandSeparator,
};
