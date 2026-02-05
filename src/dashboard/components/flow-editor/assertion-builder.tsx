"use client";

import type { FlowAssertion } from "../../../lib/types";

interface AssertionBuilderProps {
	assertions: FlowAssertion[];
	onChange: (assertions: FlowAssertion[]) => void;
}

const ASSERTION_TYPES = [
	{ value: "visible", label: "Element is visible" },
	{ value: "hidden", label: "Element is hidden" },
	{ value: "text", label: "Text content matches" },
	{ value: "count", label: "Element count matches" },
	{ value: "value", label: "Input value matches" },
	{ value: "attribute", label: "Attribute matches" },
	{ value: "url", label: "URL matches" },
];

export function AssertionBuilder({
	assertions,
	onChange,
}: AssertionBuilderProps) {
	const addAssertion = () => {
		onChange([
			...assertions,
			{
				type: "visible",
				selector: "",
			},
		]);
	};

	const updateAssertion = (index: number, updates: Partial<FlowAssertion>) => {
		const newAssertions = [...assertions];
		newAssertions[index] = { ...newAssertions[index], ...updates };
		onChange(newAssertions);
	};

	const removeAssertion = (index: number) => {
		onChange(assertions.filter((_, i) => i !== index));
	};

	const needsSelector = (type: FlowAssertion["type"]) => {
		return type !== "url";
	};

	const needsExpected = (type: FlowAssertion["type"]) => {
		return ["text", "count", "value", "attribute", "url"].includes(type);
	};

	const needsAttribute = (type: FlowAssertion["type"]) => {
		return type === "attribute";
	};

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
					Assertions
				</label>
				<button
					type="button"
					onClick={addAssertion}
					className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded font-medium transition-colors"
				>
					Add Assertion
				</button>
			</div>

			{assertions.length === 0 ? (
				<div className="text-center py-6 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
					<p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
						No assertions yet
					</p>
					<button
						type="button"
						onClick={addAssertion}
						className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
					>
						Add your first assertion
					</button>
				</div>
			) : (
				<div className="space-y-3">
					{assertions.map((assertion, index) => (
						<div
							key={index}
							className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3"
						>
							<div className="flex items-start justify-between mb-3">
								<span className="text-xs font-medium text-gray-500 dark:text-gray-400">
									Assertion #{index + 1}
								</span>
								<button
									type="button"
									onClick={() => removeAssertion(index)}
									className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
									title="Remove assertion"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<line x1="18" y1="6" x2="6" y2="18" />
										<line x1="6" y1="6" x2="18" y2="18" />
									</svg>
								</button>
							</div>

							<div className="space-y-2">
								{/* Type */}
								<div>
									<label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
										Type
									</label>
									<select
										value={assertion.type}
										onChange={(e) =>
											updateAssertion(index, {
												type: e.target.value as FlowAssertion["type"],
											})
										}
										className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
									>
										{ASSERTION_TYPES.map((type) => (
											<option key={type.value} value={type.value}>
												{type.label}
											</option>
										))}
									</select>
								</div>

								{/* Selector */}
								{needsSelector(assertion.type) && (
									<div>
										<label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
											Selector
										</label>
										<input
											type="text"
											value={assertion.selector || ""}
											onChange={(e) =>
												updateAssertion(index, { selector: e.target.value })
											}
											placeholder="CSS selector (e.g., .button, #submit)"
											className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
										/>
									</div>
								)}

								{/* Attribute Name */}
								{needsAttribute(assertion.type) && (
									<div>
										<label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
											Attribute Name
										</label>
										<input
											type="text"
											value={assertion.attribute || ""}
											onChange={(e) =>
												updateAssertion(index, { attribute: e.target.value })
											}
											placeholder="e.g., href, data-value"
											className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
										/>
									</div>
								)}

								{/* Expected Value */}
								{needsExpected(assertion.type) && (
									<div>
										<label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
											Expected {assertion.type === "count" ? "Count" : "Value"}
										</label>
										<input
											type={assertion.type === "count" ? "number" : "text"}
											value={assertion.expected?.toString() || ""}
											onChange={(e) => {
												const value =
													assertion.type === "count"
														? parseInt(e.target.value)
														: e.target.value;
												updateAssertion(index, { expected: value });
											}}
											placeholder={
												assertion.type === "count"
													? "Number of elements"
													: assertion.type === "url"
														? "Expected URL or pattern"
														: "Expected value"
											}
											className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
										/>
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
