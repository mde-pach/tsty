"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "./button";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;
	footer?: ReactNode;
	size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({
	isOpen,
	onClose,
	title,
	children,
	footer,
	size = "md",
}: ModalProps) {
	// ESC key listener
	useEffect(() => {
		if (!isOpen) return;

		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			}
		};
		window.addEventListener("keydown", handleEsc);
		return () => window.removeEventListener("keydown", handleEsc);
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	const sizeClasses = {
		sm: "max-w-sm",
		md: "max-w-md",
		lg: "max-w-lg",
		xl: "max-w-xl",
	};

	const modalContent = (
		<>
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
				onClick={onClose}
			/>

			{/* Modal */}
			<div
				className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full ${sizeClasses[size]} mx-4`}
			>
				<div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
					{/* Header */}
					<div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
							{title}
						</h2>
						<button
							onClick={onClose}
							className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
							title="Close (ESC)"
						>
							<svg
								className="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>

					{/* Content */}
					<div className="px-6 py-4">{children}</div>

					{/* Footer */}
					{footer && (
						<div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
							{footer}
						</div>
					)}
				</div>
			</div>
		</>
	);

	// Render modal at document root using portal
	return typeof document !== "undefined"
		? createPortal(modalContent, document.body)
		: null;
}

interface ConfirmModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	variant?: "danger" | "warning" | "info";
}

export function ConfirmModal({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	confirmLabel = "Confirm",
	cancelLabel = "Cancel",
	variant = "info",
}: ConfirmModalProps) {
	const handleConfirm = () => {
		onConfirm();
		onClose();
	};

	const variantStyles = {
		danger: "bg-error-600 hover:bg-error-700 text-white",
		warning: "bg-warning-600 hover:bg-warning-700 text-white",
		info: "bg-primary-600 hover:bg-primary-700 text-white",
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
			<p className="text-gray-700 dark:text-gray-300">{message}</p>
			<div className="flex gap-3 mt-6 justify-end">
				<Button onClick={onClose} variant="secondary">
					{cancelLabel}
				</Button>
				<button
					onClick={handleConfirm}
					className={`px-4 py-2 rounded-lg font-medium transition-colors ${variantStyles[variant]}`}
				>
					{confirmLabel}
				</button>
			</div>
		</Modal>
	);
}

interface PromptModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (value: string) => void;
	title: string;
	message?: string;
	placeholder?: string;
	defaultValue?: string;
	confirmLabel?: string;
	cancelLabel?: string;
}

export function PromptModal({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	placeholder = "",
	defaultValue = "",
	confirmLabel = "Confirm",
	cancelLabel = "Cancel",
}: PromptModalProps) {
	const [value, setValue] = React.useState(defaultValue);

	useEffect(() => {
		if (isOpen) {
			setValue(defaultValue);
		}
	}, [isOpen, defaultValue]);

	const handleConfirm = () => {
		if (value.trim()) {
			onConfirm(value.trim());
			onClose();
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleConfirm();
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
			{message && (
				<p className="text-gray-700 dark:text-gray-300 mb-4">{message}</p>
			)}
			<input
				type="text"
				value={value}
				onChange={(e) => setValue(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder={placeholder}
				className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
				autoFocus
			/>
			<div className="flex gap-3 mt-6 justify-end">
				<Button onClick={onClose} variant="secondary">
					{cancelLabel}
				</Button>
				<Button
					onClick={handleConfirm}
					disabled={!value.trim()}
				>
					{confirmLabel}
				</Button>
			</div>
		</Modal>
	);
}

// Export React for useState
import React from "react";
