import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { DashboardLayout } from "@/dashboard/components/dashboard-layout";
import "./globals.css";

export const metadata: Metadata = {
	title: "Tsty",
	description: "Visual QA testing dashboard for web applications",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<DashboardLayout>{children}</DashboardLayout>
				</ThemeProvider>
			</body>
		</html>
	);
}
