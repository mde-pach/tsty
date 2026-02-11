/**
 * Example Tsty Configuration
 *
 * Copy this file to your project root as qa.config.js
 * and customize for your application
 */

module.exports = {
	// Directory where test files are stored
	testDir: "./.tsty",

	// Base URL of your application
	baseUrl: "http://localhost:3000",

	// Authentication configuration (optional)
	auth: {
		loginUrl: "/auth/login",
		credentials: {
			email: "admin@example.com",
			password: "password123",
		},
	},

	// Viewport configurations for different devices
	viewports: {
		desktop: {
			width: 1920,
			height: 1080,
		},
		mobile: {
			width: 375,
			height: 667,
		},
		tablet: {
			width: 768,
			height: 1024,
		},
	},

	// Playwright-specific configuration
	playwright: {
		// Run in headless mode (no visible browser)
		headless: true,

		// Slow down operations by N milliseconds (useful for debugging)
		slowMo: 0,

		// Default timeout for all operations (in milliseconds)
		timeout: 30000,
	},
};
