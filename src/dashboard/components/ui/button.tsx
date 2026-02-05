import type { ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
	children: ReactNode;
	variant?: ButtonVariant;
	size?: ButtonSize;
	onClick?: () => void;
	disabled?: boolean;
	type?: "button" | "submit" | "reset";
	className?: string;
	fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
	primary: `
    bg-primary-600 hover:bg-primary-700
    text-white
    shadow-sm hover:shadow-md
  `,
	secondary: `
    bg-white dark:bg-gray-800
    border border-gray-300 dark:border-gray-600
    text-gray-700 dark:text-gray-200
    hover:bg-gray-50 dark:hover:bg-gray-700
  `,
	danger: `
    bg-error-600 hover:bg-error-700
    text-white
    shadow-sm
  `,
	ghost: `
    bg-transparent
    text-gray-700 dark:text-gray-200
    hover:bg-gray-100 dark:hover:bg-gray-800
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
	sm: "px-3 py-1.5 text-sm",
	md: "px-4 py-2 text-base",
	lg: "px-6 py-3 text-base font-medium",
};

export function Button({
	children,
	variant = "primary",
	size = "md",
	onClick,
	disabled = false,
	type = "button",
	className = "",
	fullWidth = false,
}: ButtonProps) {
	return (
		<button
			type={type}
			onClick={onClick}
			disabled={disabled}
			className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? "w-full" : ""}
        rounded-lg
        font-medium
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        dark:focus:ring-offset-gray-900
        ${className}
      `
				.trim()
				.replace(/\s+/g, " ")}
		>
			{children}
		</button>
	);
}
