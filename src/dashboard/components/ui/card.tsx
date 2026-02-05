import type { ReactNode, DragEvent } from "react";

interface CardProps {
	children: ReactNode;
	className?: string;
	onClick?: () => void;
	hover?: boolean;
	padding?: "none" | "sm" | "md" | "lg";
	draggable?: boolean;
	onDragStart?: (e: DragEvent<HTMLDivElement>) => void;
	onDragEnd?: (e: DragEvent<HTMLDivElement>) => void;
	onDragOver?: (e: DragEvent<HTMLDivElement>) => void;
	onDrop?: (e: DragEvent<HTMLDivElement>) => void;
}

const paddingStyles = {
	none: "p-0",
	sm: "p-4",
	md: "p-5",  // 20px - updated from p-6 for new spacing scale
	lg: "p-8",
};

export function Card({
	children,
	className = "",
	onClick,
	hover = false,
	padding = "md",
	draggable,
	onDragStart,
	onDragEnd,
	onDragOver,
	onDrop,
}: CardProps) {
	const isClickable = !!onClick;

	return (
		<div
			onClick={onClick}
			draggable={draggable}
			onDragStart={onDragStart}
			onDragEnd={onDragEnd}
			onDragOver={onDragOver}
			onDrop={onDrop}
			className={`
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        rounded-lg
        ${paddingStyles[padding]}
        ${hover ? "hover:shadow-lg transition-shadow duration-200" : ""}
        ${isClickable ? "cursor-pointer" : ""}
        ${className}
      `
				.trim()
				.replace(/\s+/g, " ")}
		>
			{children}
		</div>
	);
}

interface MetricCardProps {
	label: string;
	value: string | number;
	trend?: { value: number; positive?: boolean };
	variant?: "default" | "primary" | "success" | "warning" | "error";
	className?: string;
}

const variantStyles = {
	default:
		"from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-gray-200 dark:border-gray-600",
	primary:
		"from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-800",
	success:
		"from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 border-success-200 dark:border-success-800",
	warning:
		"from-warning-50 to-warning-100 dark:from-warning-900/20 dark:to-warning-800/20 border-warning-200 dark:border-warning-800",
	error:
		"from-error-50 to-error-100 dark:from-error-900/20 dark:to-error-800/20 border-error-200 dark:border-error-800",
};

const textVariantStyles = {
	default: "text-gray-900 dark:text-gray-100",
	primary: "text-primary-900 dark:text-primary-100",
	success: "text-success-900 dark:text-success-100",
	warning: "text-warning-900 dark:text-warning-100",
	error: "text-error-900 dark:text-error-100",
};

export function MetricCard({
	label,
	value,
	trend,
	variant = "default",
	className = "",
}: MetricCardProps) {
	return (
		<div
			className={`
        bg-gradient-to-br ${variantStyles[variant]}
        border
        rounded-lg
        p-6
        ${className}
      `
				.trim()
				.replace(/\s+/g, " ")}
		>
			<div className={`text-3xl font-bold ${textVariantStyles[variant]} mb-1`}>
				{value}
			</div>
			<div className="flex items-center gap-2">
				<div
					className={`text-sm ${variant === "default" ? "text-gray-600 dark:text-gray-400" : `${textVariantStyles[variant]} opacity-80`}`}
				>
					{label}
				</div>
				{trend && (
					<div
						className={`text-xs font-medium ${trend.positive ? "text-success-600 dark:text-success-400" : "text-error-600 dark:text-error-400"}`}
					>
						{trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}%
					</div>
				)}
			</div>
		</div>
	);
}
