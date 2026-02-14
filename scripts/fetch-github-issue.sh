#!/bin/bash
# Fetch GitHub issue using gh CLI and save to .tsty/issues/

set -e  # Exit on error

ISSUE_NUMBER=$1
REPO=${2:-$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "")}

if [ -z "$ISSUE_NUMBER" ]; then
  echo "Usage: $0 <issue-number> [repo]"
  exit 1
fi

# Check if gh is authenticated
if ! gh auth status &>/dev/null; then
  echo "❌ Error: GitHub CLI not authenticated"
  echo "Run: gh auth login"
  exit 1
fi

# If no repo provided and couldn't auto-detect, error
if [ -z "$REPO" ]; then
  echo "❌ Error: Could not determine repository"
  echo "Either run from a git repository or specify: $0 $ISSUE_NUMBER owner/repo"
  exit 1
fi

# Fetch issue as JSON
echo "Fetching issue #$ISSUE_NUMBER from $REPO..."

ISSUE_JSON=$(gh issue view "$ISSUE_NUMBER" --repo "$REPO" --json \
  number,title,body,state,labels,url,createdAt,updatedAt,closedAt,author,assignees,milestone 2>/dev/null)

if [ $? -ne 0 ]; then
  echo "❌ Error: Failed to fetch issue #$ISSUE_NUMBER"
  echo "Make sure the issue exists and you have access to $REPO"
  exit 1
fi

# Create .tsty/issues directory if needed
mkdir -p .tsty/issues

# Parse and save issue data
ISSUE_FILE=".tsty/issues/${ISSUE_NUMBER}.json"

# Add tsty-specific metadata
echo "$ISSUE_JSON" | jq '. + {
  fetchedAt: (now | strftime("%Y-%m-%dT%H:%M:%SZ")),
  repository: "'"$REPO"'",
  linkedFlowId: null,
  referenceRunId: null,
  status: "pending"
}' > "$ISSUE_FILE"

echo "✓ Saved issue to $ISSUE_FILE"

# Output summary
echo ""
echo "Issue #$ISSUE_NUMBER: $(echo "$ISSUE_JSON" | jq -r .title)"
echo "State: $(echo "$ISSUE_JSON" | jq -r .state)"
echo "Labels: $(echo "$ISSUE_JSON" | jq -r '.labels[].name' | tr '\n' ', ' | sed 's/,$//')"
echo "URL: $(echo "$ISSUE_JSON" | jq -r .url)"
echo ""

# Return the file path
echo "$ISSUE_FILE"
