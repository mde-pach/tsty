"use client";

import { useRouter } from "next/navigation";
import type { ActionDefinition } from "@/lib/types";

interface ActionTemplatesProps {
	isOpen: boolean;
	onClose: () => void;
}

const templates: Array<{
	id: string;
	name: string;
	description: string;
	category: string;
	icon: string;
	definition: Omit<ActionDefinition, "primitives"> & { primitives: any[] };
}> = [
	{
		id: "login-form",
		name: "Login Form",
		description: "Standard email/password login flow with validation",
		category: "auth",
		icon: "🔐",
		definition: {
			type: "form",
			description: "Login with email and password",
			category: "auth",
			primitives: [
				{ type: "navigate", url: "${baseUrl}/login" },
				{
					type: "fill",
					selector: "input[name='email'], input[type='email']",
					value: "${credentials.email}",
				},
				{
					type: "fill",
					selector: "input[name='password'], input[type='password']",
					value: "${credentials.password}",
				},
				{
					type: "click",
					selector: "button[type='submit'], button:has-text('Login'), button:has-text('Sign in')",
				},
				{ type: "wait", condition: "networkidle" },
			],
		},
	},
	{
		id: "modal-interaction",
		name: "Modal Interaction",
		description: "Open a modal, interact with it, and close",
		category: "interaction",
		icon: "🔲",
		definition: {
			type: "modal",
			description: "Interact with a modal dialog",
			category: "common",
			primitives: [
				{
					type: "click",
					selector: "button[data-modal-trigger], button:has-text('Open')",
				},
				{ type: "wait", selector: "[role='dialog'], .modal" },
				{
					type: "fill",
					selector: ".modal input, [role='dialog'] input",
					value: "Test input",
				},
				{
					type: "click",
					selector: ".modal button[type='submit'], [role='dialog'] button:has-text('Save')",
				},
				{ type: "wait", condition: "networkidle" },
			],
		},
	},
	{
		id: "navigation-menu",
		name: "Navigation Menu",
		description: "Navigate through a multi-level menu structure",
		category: "navigation",
		icon: "🧭",
		definition: {
			type: "navigation",
			description: "Navigate through menu items",
			category: "navigation",
			primitives: [
				{ type: "click", selector: "nav button, .menu-toggle" },
				{ type: "wait", selector: "nav ul, .menu-items" },
				{
					type: "click",
					selector: "nav a[href*='settings'], .menu-item:has-text('Settings')",
				},
				{ type: "wait", condition: "networkidle" },
			],
		},
	},
	{
		id: "form-validation",
		name: "Form with Validation",
		description: "Submit a form and check for validation errors",
		category: "forms",
		icon: "📝",
		definition: {
			type: "form",
			description: "Fill form with validation checks",
			category: "forms",
			primitives: [
				{
					type: "fill",
					selector: "input[name='username']",
					value: "testuser",
				},
				{
					type: "fill",
					selector: "input[name='email']",
					value: "test@example.com",
				},
				{ type: "click", selector: "button[type='submit']" },
				{ type: "wait", condition: "networkidle" },
			],
		},
	},
	{
		id: "search-and-select",
		name: "Search and Select",
		description: "Search for an item and select it from results",
		category: "interaction",
		icon: "🔍",
		definition: {
			type: "interaction",
			description: "Search and select from results",
			category: "data",
			primitives: [
				{
					type: "fill",
					selector: "input[type='search'], input[placeholder*='Search']",
					value: "test query",
				},
				{ type: "press", key: "Enter" },
				{ type: "wait", selector: ".search-results, [role='listbox']" },
				{
					type: "click",
					selector: ".search-result:first-child, [role='option']:first-child",
				},
				{ type: "wait", condition: "networkidle" },
			],
		},
	},
	{
		id: "file-upload",
		name: "File Upload",
		description: "Upload a file through an input element",
		category: "forms",
		icon: "📤",
		definition: {
			type: "form",
			description: "Upload a file",
			category: "forms",
			primitives: [
				{
					type: "click",
					selector: "input[type='file'], button:has-text('Upload')",
				},
				{ type: "wait", condition: "networkidle" },
			],
		},
	},
];

export function ActionTemplates({ isOpen, onClose }: ActionTemplatesProps) {
	const router = useRouter();

	if (!isOpen) return null;

	const handleUseTemplate = async (template: typeof templates[0]) => {
		try {
			// Create action from template
			const timestamp = Date.now();
			const actionId = `${template.id}-${timestamp}`;

			const response = await fetch("/api/actions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					id: actionId,
					definition: template.definition,
				}),
			});

			if (response.ok) {
				// Navigate to edit page for customization
				router.push(`/actions/${encodeURIComponent(actionId)}/edit`);
				onClose();
			} else {
				alert("Failed to create action from template");
			}
		} catch (error) {
			console.error("Template creation error:", error);
			alert("Failed to create action from template");
		}
	};

	return (
		<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
			<div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
					<div>
						<h2 className="text-h2 text-gray-900 dark:text-white">
							Action Templates
						</h2>
						<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
							Start with a pre-built action pattern and customize it
						</p>
					</div>
					<button
						onClick={onClose}
						className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
				<div className="flex-1 overflow-y-auto p-6">
					<div className="grid gap-4 sm:grid-cols-2">
						{templates.map((template) => (
							<button
								key={template.id}
								onClick={() => handleUseTemplate(template)}
								className="text-left p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors group"
							>
								<div className="flex items-start gap-3 mb-3">
									<span className="text-3xl">{template.icon}</span>
									<div className="flex-1">
										<h3 className="text-h3 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-1">
											{template.name}
										</h3>
										<p className="text-sm text-gray-600 dark:text-gray-400">
											{template.description}
										</p>
									</div>
								</div>

								{/* Actions Preview */}
								<div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
									<span className="px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
										{template.definition.primitives.length} steps
									</span>
									<span className="px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
										{template.category}
									</span>
								</div>
							</button>
						))}
					</div>
				</div>

				{/* Footer */}
				<div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
					<p className="text-sm text-gray-600 dark:text-gray-400">
						💡 Tip: After selecting a template, you can customize selectors and
						values to match your application
					</p>
				</div>
			</div>
		</div>
	);
}
