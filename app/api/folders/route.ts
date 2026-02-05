import { NextRequest, NextResponse } from "next/server";
import {
	createFolder,
	renameFolder,
	deleteFolder,
	moveItem,
	moveFolder,
} from "@/api/folders";
import { FileManager } from "@/lib/file-manager";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { action, type, parentPath, name, oldPath, newName, folderPath, itemId, targetFolder, sourceFolderPath } =
			body;

		if (!type || (type !== "flows" && type !== "actions")) {
			return NextResponse.json(
				{ success: false, error: "Invalid type" },
				{ status: 400 },
			);
		}

		switch (action) {
			case "create":
				if (!name) {
					return NextResponse.json(
						{ success: false, error: "Name is required" },
						{ status: 400 },
					);
				}
				const createResult = await createFolder(type, parentPath || null, name);
				return NextResponse.json(createResult);

			case "rename":
				if (!oldPath || !newName) {
					return NextResponse.json(
						{ success: false, error: "oldPath and newName are required" },
						{ status: 400 },
					);
				}
				const renameResult = await renameFolder(type, oldPath, newName);
				return NextResponse.json(renameResult);

			case "delete":
				if (!folderPath) {
					return NextResponse.json(
						{ success: false, error: "folderPath is required" },
						{ status: 400 },
					);
				}
				const deleteResult = await deleteFolder(type, folderPath);
				return NextResponse.json(deleteResult);

			case "move":
				if (!itemId) {
					return NextResponse.json(
						{ success: false, error: "itemId is required" },
						{ status: 400 },
					);
				}
				const moveResult = await moveItem(type, itemId, targetFolder || null);
				return NextResponse.json(moveResult);

			case "moveFolder":
				if (!sourceFolderPath) {
					return NextResponse.json(
						{ success: false, error: "sourceFolderPath is required" },
						{ status: 400 },
					);
				}
				const moveFolderResult = await moveFolder(type, sourceFolderPath, targetFolder || null);
				return NextResponse.json(moveFolderResult);

			default:
				return NextResponse.json(
					{ success: false, error: "Invalid action" },
					{ status: 400 },
				);
		}
	} catch (error) {
		console.error("Error in folders API:", error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const action = searchParams.get("action");

		if (action === "list") {
			const fileManager = new FileManager();
			const folders = await fileManager.listFolders();
			return NextResponse.json({ success: true, data: folders });
		}

		return NextResponse.json(
			{ success: false, error: "Invalid action" },
			{ status: 400 },
		);
	} catch (error) {
		console.error("Error in folders API:", error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
