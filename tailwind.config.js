/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: "class",
	content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./src/**/*.{js,ts,jsx,tsx,mdx}"],
	theme: {
		extend: {
			colors: {
				// CSS Variable-based colors (for compatibility)
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",

				// New Design System Colors
				primary: {
					DEFAULT: "#2563EB", // Primary Blue
					50: "#EFF6FF",
					100: "#DBEAFE",
					200: "#BFDBFE",
					300: "#93C5FD",
					400: "#60A5FA",
					500: "#3B82F6",
					600: "#2563EB",
					700: "#1D4ED8",
					800: "#1E40AF",
					900: "#1E3A8A",
					foreground: "hsl(var(--primary-foreground))",
				},
				success: {
					DEFAULT: "#10B981", // Success Green
					50: "#ECFDF5",
					100: "#D1FAE5",
					200: "#A7F3D0",
					300: "#6EE7B7",
					400: "#34D399",
					500: "#10B981",
					600: "#059669",
					700: "#047857",
					800: "#065F46",
					900: "#064E3B",
				},
				warning: {
					DEFAULT: "#F59E0B", // Warning Amber
					50: "#FFFBEB",
					100: "#FEF3C7",
					200: "#FDE68A",
					300: "#FCD34D",
					400: "#FBBF24",
					500: "#F59E0B",
					600: "#D97706",
					700: "#B45309",
					800: "#92400E",
					900: "#78350F",
				},
				error: {
					DEFAULT: "#EF4444", // Error Red
					50: "#FEF2F2",
					100: "#FEE2E2",
					200: "#FECACA",
					300: "#FCA5A5",
					400: "#F87171",
					500: "#EF4444",
					600: "#DC2626",
					700: "#B91C1C",
					800: "#991B1B",
					900: "#7F1D1D",
				},
				info: {
					DEFAULT: "#8B5CF6", // Info Purple
					50: "#FAF5FF",
					100: "#F3E8FF",
					200: "#E9D5FF",
					300: "#D8B4FE",
					400: "#C084FC",
					500: "#A855F7",
					600: "#9333EA",
					700: "#7E22CE",
					800: "#6B21A8",
					900: "#581C87",
				},

				// Legacy compatibility
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
			},
			borderRadius: {
				lg: "12px",
				md: "8px",
				sm: "4px",
				xl: "16px",
			},
			spacing: {
				18: "4.5rem",
				88: "22rem",
				100: "25rem",
				112: "28rem",
				128: "32rem",
			},
			fontSize: {
				display: ["2rem", { lineHeight: "2.5rem", fontWeight: "700" }],
				h1: ["1.5rem", { lineHeight: "2rem", fontWeight: "600" }],
				h2: ["1.25rem", { lineHeight: "1.75rem", fontWeight: "600" }],
				h3: ["1.125rem", { lineHeight: "1.75rem", fontWeight: "600" }],
			},
			fontFamily: {
				sans: [
					"Inter",
					"-apple-system",
					"BlinkMacSystemFont",
					"Segoe UI",
					"sans-serif",
				],
			},
			boxShadow: {
				"level-1": "0 1px 3px rgba(0, 0, 0, 0.1)",
				"level-2": "0 4px 6px rgba(0, 0, 0, 0.1)",
				"level-3": "0 10px 15px rgba(0, 0, 0, 0.1)",
				"level-4": "0 20px 25px rgba(0, 0, 0, 0.15)",
			},
		},
	},
	plugins: [],
};
