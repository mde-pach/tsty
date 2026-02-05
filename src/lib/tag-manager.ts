import * as fs from "fs";
import * as path from "path";
import { getAbsolutePath } from "./config";
import type { ActionFile, FlowFile, Tag, TagUsage } from "./types";

/**
 * Tag manager for organizing flows and actions
 * Stores tags in .tsty/tags.json
 */
export class TagManager {
	private tagsFile: string;

	constructor(projectRoot?: string) {
		const testDir = projectRoot
			? path.join(projectRoot, ".tsty")
			: getAbsolutePath(".tsty");
		this.tagsFile = path.join(testDir, "tags.json");

		// Ensure .tsty directory exists
		if (!fs.existsSync(testDir)) {
			fs.mkdirSync(testDir, { recursive: true });
		}
	}

	/**
	 * Read tags from file
	 */
	private async readTags(): Promise<Tag[]> {
		if (!fs.existsSync(this.tagsFile)) {
			return [];
		}

		try {
			const content = fs.readFileSync(this.tagsFile, "utf-8");
			return JSON.parse(content) as Tag[];
		} catch (error) {
			console.error("Error reading tags file:", error);
			return [];
		}
	}

	/**
	 * Write tags to file
	 */
	private async writeTags(tags: Tag[]): Promise<void> {
		try {
			fs.writeFileSync(this.tagsFile, JSON.stringify(tags, null, 2));
		} catch (error) {
			throw new Error(`Failed to write tags: ${error}`);
		}
	}

	/**
	 * List all tags
	 */
	async listTags(): Promise<Tag[]> {
		return this.readTags();
	}

	/**
	 * Get a specific tag by ID
	 */
	async getTag(id: string): Promise<Tag | null> {
		const tags = await this.readTags();
		return tags.find((t) => t.id === id) || null;
	}

	/**
	 * Create a new tag
	 */
	async createTag(
		tag: Omit<Tag, "id" | "createdAt" | "updatedAt">,
	): Promise<Tag> {
		const tags = await this.readTags();

		// Check for duplicate names
		if (tags.some((t) => t.name.toLowerCase() === tag.name.toLowerCase())) {
			throw new Error(`Tag with name "${tag.name}" already exists`);
		}

		const newTag: Tag = {
			id: this.generateId(tag.name),
			...tag,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		tags.push(newTag);
		await this.writeTags(tags);

		return newTag;
	}

	/**
	 * Update an existing tag
	 */
	async updateTag(
		id: string,
		updates: Partial<Omit<Tag, "id" | "createdAt">>,
	): Promise<Tag> {
		const tags = await this.readTags();
		const index = tags.findIndex((t) => t.id === id);

		if (index === -1) {
			throw new Error(`Tag ${id} not found`);
		}

		// Check for duplicate names (excluding current tag)
		if (updates.name) {
			const duplicate = tags.find(
				(t) =>
					t.id !== id && t.name.toLowerCase() === updates.name!.toLowerCase(),
			);
			if (duplicate) {
				throw new Error(`Tag with name "${updates.name}" already exists`);
			}
		}

		const updatedTag: Tag = {
			...tags[index],
			...updates,
			updatedAt: new Date().toISOString(),
		};

		tags[index] = updatedTag;
		await this.writeTags(tags);

		return updatedTag;
	}

	/**
	 * Delete a tag
	 */
	async deleteTag(id: string): Promise<void> {
		const tags = await this.readTags();
		const filtered = tags.filter((t) => t.id !== id);

		if (filtered.length === tags.length) {
			throw new Error(`Tag ${id} not found`);
		}

		await this.writeTags(filtered);
	}

	/**
	 * Get tag usage across flows and actions
	 */
	async getTagUsage(
		id: string,
		flows: FlowFile[],
		actions: ActionFile[],
	): Promise<TagUsage> {
		const tag = await this.getTag(id);
		if (!tag) {
			throw new Error(`Tag ${id} not found`);
		}

		const flowsWithTag = flows.filter((f) => f.flow.tags?.includes(tag.name));
		const actionsWithTag = actions.filter((a) =>
			a.definition.tags?.includes(tag.name),
		);

		return {
			tagId: id,
			flowCount: flowsWithTag.length,
			actionCount: actionsWithTag.length,
			flows: flowsWithTag.map((f) => f.id),
			actions: actionsWithTag.map((a) => a.id),
		};
	}

	/**
	 * Generate a URL-safe ID from a name
	 */
	private generateId(name: string): string {
		const base = name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-|-$/g, "");

		// Add timestamp to ensure uniqueness
		const timestamp = Date.now().toString(36);
		return `${base}-${timestamp}`;
	}

	/**
	 * Get all tags by category
	 */
	async getTagsByCategory(): Promise<Record<string, Tag[]>> {
		const tags = await this.readTags();
		const byCategory: Record<string, Tag[]> = {};

		for (const tag of tags) {
			const category = tag.category || "uncategorized";
			if (!byCategory[category]) {
				byCategory[category] = [];
			}
			byCategory[category].push(tag);
		}

		return byCategory;
	}

	/**
	 * Search tags by name
	 */
	async searchTags(query: string): Promise<Tag[]> {
		const tags = await this.readTags();
		const lowerQuery = query.toLowerCase();

		return tags.filter(
			(t) =>
				t.name.toLowerCase().includes(lowerQuery) ||
				t.category?.toLowerCase().includes(lowerQuery),
		);
	}
}
