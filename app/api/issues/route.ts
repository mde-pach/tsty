import { type NextRequest, NextResponse } from "next/server";
import { GitHubIssueManager } from "@/lib/github-issue-manager";
import path from "path";

const projectRoot = process.env.QA_PROJECT_ROOT || process.cwd();
const issueManager = new GitHubIssueManager(path.join(projectRoot, ".tsty/issues"));

/**
 * GET /api/issues - List all issues or get specific issue
 */
export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const number = searchParams.get("number");

	try {
		if (number) {
			// Get specific issue
			const issue = await issueManager.getIssue(parseInt(number));
			return NextResponse.json({ success: true, data: issue });
		}

		// List all issues
		const issues = await issueManager.listIssues();
		return NextResponse.json({ success: true, data: issues });
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				error: (error as Error).message,
			},
			{ status: 500 }
		);
	}
}

/**
 * POST /api/issues - Fetch issue from GitHub
 */
export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { issueNumber, repo } = body;

		if (!issueNumber) {
			return NextResponse.json(
				{ success: false, error: "Issue number required" },
				{ status: 400 }
			);
		}

		// Check gh CLI
		const hasGh = await issueManager.checkGhCLI();
		if (!hasGh) {
			return NextResponse.json(
				{
					success: false,
					error: "GitHub CLI (gh) not found or not authenticated",
				},
				{ status: 400 }
			);
		}

		// Fetch issue
		const issue = await issueManager.fetchIssue(issueNumber, repo);

		return NextResponse.json({ success: true, data: issue });
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				error: (error as Error).message,
			},
			{ status: 500 }
		);
	}
}

/**
 * PUT /api/issues - Update issue metadata
 */
export async function PUT(req: NextRequest) {
	try {
		const body = await req.json();
		const { issueNumber, updates } = body;

		if (!issueNumber) {
			return NextResponse.json(
				{ success: false, error: "Issue number required" },
				{ status: 400 }
			);
		}

		await issueManager.updateIssue(issueNumber, updates);

		const updated = await issueManager.getIssue(issueNumber);
		return NextResponse.json({ success: true, data: updated });
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				error: (error as Error).message,
			},
			{ status: 500 }
		);
	}
}

/**
 * DELETE /api/issues - Delete issue
 */
export async function DELETE(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const number = searchParams.get("number");

	if (!number) {
		return NextResponse.json(
			{ success: false, error: "Issue number required" },
			{ status: 400 }
		);
	}

	try {
		await issueManager.deleteIssue(parseInt(number));
		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				error: (error as Error).message,
			},
			{ status: 500 }
		);
	}
}
