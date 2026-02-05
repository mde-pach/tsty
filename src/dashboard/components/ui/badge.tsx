import type { ReactNode } from "react";

export type BadgeVariant =
	| "success"
	| "error"
	| "warning"
	| "info"
	| "neutral"
	| "default";

interface BadgeProps {
	children: ReactNode;
	variant: BadgeVariant;
	size?: "sm" | "md";
	className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
	success: `
    bg-success-100 dark:bg-success-900/30
    text-success-800 dark:text-success-300
  `,
	error: `
    bg-error-100 dark:bg-error-900/30
    text-error-800 dark:text-error-300
  `,
	warning: `
    bg-warning-100 dark:bg-warning-900/30
    text-warning-800 dark:text-warning-300
  `,
	info: `
    bg-info-100 dark:bg-info-900/30
    text-info-800 dark:text-info-300
  `,
	neutral: `
    bg-gray-100 dark:bg-gray-700
    text-gray-800 dark:text-gray-200
  `,
	default: `
    bg-gray-100 dark:bg-gray-700
    text-gray-800 dark:text-gray-200
  `,
};

export function Badge({
	children,
	variant,
	size = "md",
	className = "",
}: BadgeProps) {
	// Updated spacing: increased py from 0.5 to 1 for better touch targets
	const sizeClass = size === "sm" ? "px-2 py-1 text-xs" : "px-2.5 py-1 text-sm";

	return (
		<span
			className={`
        inline-flex items-center gap-1
        ${sizeClass}
        ${variantStyles[variant]}
        font-semibold
        rounded-md
        ${className}
      `
				.trim()
				.replace(/\s+/g, " ")}
		>
			{children}
		</span>
	);
}
