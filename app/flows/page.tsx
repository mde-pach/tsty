import { redirect } from "next/navigation";

// UX Revamp: Flows page is now integrated into the main Tests view (/)
// This redirect maintains backward compatibility for bookmarks/links
export default function FlowsPage() {
	redirect("/");
}
