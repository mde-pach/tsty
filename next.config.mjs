import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const srcDir = path.resolve(__dirname, "src");

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	distDir: ".next",
	// Prevent Next.js from inferring wrong workspace root when installed as a package
	outputFileTracingRoot: __dirname,
	// Ensure TypeScript files in this package are transpiled when installed in node_modules
	transpilePackages: ["tsty"],
	webpack: (config) => {
		// Ensure @/ always resolves to this package's src/ directory,
		// even when installed inside another project's node_modules
		config.resolve.alias["@"] = srcDir;
		return config;
	},
};

export default nextConfig;
