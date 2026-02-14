import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	distDir: ".next",
	// Prevent Next.js from inferring wrong workspace root when installed as a package
	outputFileTracingRoot: __dirname,
	webpack: (config) => {
		// Ensure @/ always resolves to this package's src/ directory,
		// even when installed inside another project's node_modules
		config.resolve.alias["@"] = path.resolve(__dirname, "src");
		return config;
	},
};

export default nextConfig;
