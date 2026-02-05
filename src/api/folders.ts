import { FileManager } from "../lib/file-manager";
import * as fs from "fs";
import * as path from "path";
import { getAbsolutePath } from "../lib/config";

export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: string;
}

/**
 * Create a new folder
 */
export async function createFolder(
	type: "flows" | "actions",
	parentPath: string | null,
	name: string,
): Promise<ApiResponse> {
	try {
		const fileManager = new FileManager();
		const config = (fileManager as any).config;
		const baseDir =
			type === "flows"
				? getAbsolutePath(config.flowsDir)
				: getAbsolutePath(config.actionsDir);

		// Build folder path
		const folderPath = parentPath
			? path.join(baseDir, parentPath, name)
			: path.join(baseDir, name);

		// Validate name
		if (!/^[a-z0-9-]+$/i.test(name)) {
			return {
				success: false,
				error:
					"Folder name can only contain letters, numbers, and hyphens",
			};
		}

		// Check if folder already exists
		if (fs.existsSync(folderPath)) {
			return { success: false, error: "Folder already exists" };
		}

		// Create folder
		fs.mkdirSync(folderPath, { recursive: true });

		// For flows, also persist empty folder in metadata
		if (type === "flows") {
			const folderMetadataPath = parentPath ? `${parentPath}/${name}` : name;
			await fileManager.createFolder(folderMetadataPath);
		}

		return {
			success: true,
			data: { path: parentPath ? `${parentPath}/${name}` : name },
		};
	} catch (error) {
		console.error("Error creating folder:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Rename a folder
 */
export async function renameFolder(
	type: "flows" | "actions",
	oldPath: string,
	newName: string,
): Promise<ApiResponse> {
	try {
		const fileManager = new FileManager();
		const config = (fileManager as any).config;
		const baseDir =
			type === "flows"
				? getAbsolutePath(config.flowsDir)
				: getAbsolutePath(config.actionsDir);

		// Validate name
		if (!/^[a-z0-9-]+$/i.test(newName)) {
			return {
				success: false,
				error:
					"Folder name can only contain letters, numbers, and hyphens",
			};
		}

		// Build paths
		const parts = oldPath.split("/");
		const oldName = parts[parts.length - 1];
		const parentPath = parts.slice(0, -1).join("/");

		const oldFolderPath = path.join(baseDir, oldPath);
		const newFolderPath = path.join(
			baseDir,
			parentPath ? `${parentPath}/${newName}` : newName,
		);

		// Check if old folder exists
		if (!fs.existsSync(oldFolderPath)) {
			return { success: false, error: "Folder not found" };
		}

		// Check if new folder name conflicts
		if (fs.existsSync(newFolderPath)) {
			return { success: false, error: "Folder with that name already exists" };
		}

		// Rename folder
		fs.renameSync(oldFolderPath, newFolderPath);

		// For flows, also update folder metadata
		if (type === "flows") {
			const newPath = parentPath ? `${parentPath}/${newName}` : newName;
			await fileManager.renameFolder(oldPath, newPath);
		}

		// Update all item IDs within the folder
		const items =
			type === "flows"
				? await fileManager.listFlows()
				: await fileManager.listActions();

		const itemsToUpdate = items.filter((item) =>
			item.id.startsWith(`${oldPath}/`),
		);

		for (const item of itemsToUpdate) {
			const oldId = item.id;
			const newId = oldId.replace(
				`${oldPath}/`,
				`${parentPath ? `${parentPath}/${newName}` : newName}/`,
			);

			if (type === "flows") {
				const flow = await fileManager.getFlow(oldId);
				if (flow) {
					await fileManager.deleteFlow(oldId);
					await fileManager.createFlow(newId, flow.flow);
				}
			} else {
				const action = await fileManager.getAction(oldId);
				if (action) {
					await fileManager.deleteAction(oldId);
					await fileManager.createAction(newId, action.definition);
				}
			}
		}

		return {
			success: true,
			data: {
				newPath: parentPath ? `${parentPath}/${newName}` : newName,
			},
		};
	} catch (error) {
		console.error("Error renaming folder:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Delete a folder and all its contents
 */
export async function deleteFolder(
	type: "flows" | "actions",
	folderPath: string,
): Promise<ApiResponse> {
	try {
		const fileManager = new FileManager();
		const config = (fileManager as any).config;
		const baseDir =
			type === "flows"
				? getAbsolutePath(config.flowsDir)
				: getAbsolutePath(config.actionsDir);

		const fullPath = path.join(baseDir, folderPath);

		// Check if folder exists
		if (!fs.existsSync(fullPath)) {
			return { success: false, error: "Folder not found" };
		}

		// Delete folder recursively
		fs.rmSync(fullPath, { recursive: true, force: true });

		// For flows, also remove from folder metadata
		if (type === "flows") {
			await fileManager.deleteFolder(folderPath);
		}

		return { success: true };
	} catch (error) {
		console.error("Error deleting folder:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Move a folder to a different location
 */
export async function moveFolder(
	type: "flows" | "actions",
	folderPath: string,
	targetFolder: string | null,
): Promise<ApiResponse> {
	try {
		const fileManager = new FileManager();
		const config = (fileManager as any).config;
		const baseDir =
			type === "flows"
				? getAbsolutePath(config.flowsDir)
				: getAbsolutePath(config.actionsDir);

		// Extract folder name from path
		const folderName = folderPath.split("/").pop();
		if (!folderName) {
			return { success: false, error: "Invalid folder path" };
		}

		// Build new folder path
		const newFolderPath = targetFolder
			? `${targetFolder}/${folderName}`
			: folderName;

		// Don't move if already in target location
		if (newFolderPath === folderPath) {
			return { success: true, data: { newPath: newFolderPath } };
		}

		// Prevent moving a folder into itself or its children
		if (targetFolder && targetFolder.startsWith(folderPath + "/")) {
			return {
				success: false,
				error: "Cannot move a folder into itself or its children",
			};
		}

		// Build full paths
		const oldFullPath = path.join(baseDir, folderPath);
		const newFullPath = path.join(baseDir, newFolderPath);

		// Check if folder exists (either physically or in metadata)
		const physicalExists = fs.existsSync(oldFullPath);
		let metadataExists = false;

		if (type === "flows") {
			const allFolders = await fileManager.listFolders();
			metadataExists = allFolders.includes(folderPath);
		}

		// If folder doesn't exist at all, return error
		if (!physicalExists && !metadataExists) {
			return { success: false, error: "Folder not found" };
		}

		// Check if target location already has a folder with same name
		if (fs.existsSync(newFullPath)) {
			return {
				success: false,
				error: "A folder with that name already exists in the target location",
			};
		}

		// For flows, get child folders BEFORE moving (important!)
		let childFolders: string[] = [];
		if (type === "flows") {
			const allFolders = await fileManager.listFolders();
			childFolders = allFolders.filter((folder) =>
				folder.startsWith(folderPath + "/")
			);
		}

		// Move physical folder if it exists
		if (physicalExists) {
			// Create target parent directory if needed
			const targetParentDir = path.dirname(newFullPath);
			if (!fs.existsSync(targetParentDir)) {
				fs.mkdirSync(targetParentDir, { recursive: true });
			}

			// Move the folder (this moves all files inside automatically)
			fs.renameSync(oldFullPath, newFullPath);

			// Verify the move succeeded
			if (!fs.existsSync(newFullPath)) {
				throw new Error("Physical move failed - new path does not exist");
			}
			if (fs.existsSync(oldFullPath)) {
				throw new Error("Physical move failed - old path still exists");
			}
		}

		// For flows, update folder metadata in folders.json
		if (type === "flows") {
			// Remove old path and add new path
			await fileManager.deleteFolder(folderPath);
			await fileManager.createFolder(newFolderPath);

			// Update child folder paths using the list we got BEFORE the move
			for (const folder of childFolders) {
				const newChildPath = folder.replace(folderPath, newFolderPath);
				await fileManager.renameFolder(folder, newChildPath);
			}
		}

		return { success: true, data: { newPath: newFolderPath } };
	} catch (error) {
		console.error("Error moving folder:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Move an item to a different folder
 */
export async function moveItem(
	type: "flows" | "actions",
	itemId: string,
	targetFolder: string | null,
): Promise<ApiResponse> {
	try {
		const fileManager = new FileManager();

		// Get the item
		const item =
			type === "flows"
				? await fileManager.getFlow(itemId)
				: await fileManager.getAction(itemId);

		if (!item) {
			return { success: false, error: "Item not found" };
		}

		// Extract item name (last part of ID)
		const itemName = itemId.split("/").pop();
		if (!itemName) {
			return { success: false, error: "Invalid item ID" };
		}

		// Build new ID
		const newId = targetFolder ? `${targetFolder}/${itemName}` : itemName;

		// Don't move if already in target folder
		if (newId === itemId) {
			return { success: true, data: { newId } };
		}

		// Check if target already exists
		const existingItem =
			type === "flows"
				? await fileManager.getFlow(newId)
				: await fileManager.getAction(newId);

		if (existingItem) {
			return {
				success: false,
				error: "Item with that name already exists in target folder",
			};
		}

		// Move item (delete old, create new)
		if (type === "flows" && "flow" in item) {
			await fileManager.deleteFlow(itemId);
			await fileManager.createFlow(newId, item.flow);
		} else if (type === "actions" && "definition" in item) {
			await fileManager.deleteAction(itemId);
			await fileManager.createAction(newId, item.definition);
		}

		return { success: true, data: { newId } };
	} catch (error) {
		console.error("Error moving item:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}
