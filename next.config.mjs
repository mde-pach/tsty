import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const srcDir = path.resolve(__dirname, "src");
const isInsideNodeModules = __dirname.includes("node_modules");

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	distDir: ".next",
	// Prevent Next.js from inferring wrong workspace root when installed as a package
	outputFileTracingRoot: __dirname,
	webpack: (config) => {
		// Ensure @/ always resolves to this package's src/ directory,
		// even when installed inside another project's node_modules
		config.resolve.alias["@"] = srcDir;

		// When installed as a package, our src/ path contains "node_modules"
		// which causes webpack to skip TypeScript transpilation.
		// Fix: override exclude on TS/JS rules to allow our own source files.
		if (isInsideNodeModules) {
			for (const rule of config.module.rules) {
				if (!rule?.oneOf) continue;
				for (const oneOf of rule.oneOf) {
					if (oneOf.exclude && oneOf.test?.toString?.().match(/tsx|ts|jsx|js/)) {
						const origExclude = oneOf.exclude;
						oneOf.exclude = (filePath) => {
							if (filePath.startsWith(srcDir)) return false;
							if (origExclude instanceof RegExp) return origExclude.test(filePath);
							if (typeof origExclude === "function") return origExclude(filePath);
							return false;
						};
					}
				}
			}
		}

		return config;
	},
};

export default nextConfig;
