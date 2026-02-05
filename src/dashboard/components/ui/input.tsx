import type { ReactNode } from "react";

interface InputProps {
	type?: "text" | "email" | "password" | "number" | "search";
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
	error?: string;
	label?: string;
	icon?: ReactNode;
	className?: string;
}

export function Input({
	type = "text",
	value,
	onChange,
	placeholder,
	disabled = false,
	error,
	label,
	icon,
	className = "",
}: InputProps) {
	return (
		<div className={`${className}`}>
			{label && (
				<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
					{label}
				</label>
			)}
			<div className="relative">
				{icon && (
					<div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
						{icon}
					</div>
				)}
				<input
					type={type}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder={placeholder}
					disabled={disabled}
					className={`
            w-full
            ${icon ? "pl-10" : "pl-4"}
            pr-4 py-2.5
            bg-white dark:bg-gray-800
            border ${error ? "border-error-500" : "border-gray-300 dark:border-gray-600"}
            rounded-lg
            text-gray-900 dark:text-gray-100
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          `
						.trim()
						.replace(/\s+/g, " ")}
				/>
			</div>
			{error && (
				<p className="mt-1 text-sm text-error-600 dark:text-error-400">
					{error}
				</p>
			)}
		</div>
	);
}

interface SelectProps {
	value: string;
	onChange: (value: string) => void;
	options: { value: string; label: string }[];
	placeholder?: string;
	disabled?: boolean;
	label?: string;
	className?: string;
}

export function Select({
	value,
	onChange,
	options,
	placeholder,
	disabled = false,
	label,
	className = "",
}: SelectProps) {
	return (
		<div className={`${className}`}>
			{label && (
				<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
					{label}
				</label>
			)}
			<select
				value={value}
				onChange={(e) => onChange(e.target.value)}
				disabled={disabled}
				className={`
          w-full
          px-4 py-2.5
          bg-white dark:bg-gray-800
          border border-gray-300 dark:border-gray-600
          rounded-lg
          text-gray-900 dark:text-gray-100
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
        `
					.trim()
					.replace(/\s+/g, " ")}
			>
				{placeholder && <option value="">{placeholder}</option>}
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		</div>
	);
}
