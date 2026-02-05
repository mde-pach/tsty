#!/bin/bash
# Install or update Claude Code skill from this repository

set -e

SKILL_NAME="tsty-skill"
SKILL_DIR="$HOME/.claude/skills/$SKILL_NAME"
REPO_SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/skill"

echo "📦 Installing Tsty skill for Claude Code..."
echo ""

# Check if skill directory exists in repo
if [ ! -d "$REPO_SKILL_DIR" ]; then
  echo "❌ Error: Skill directory not found at $REPO_SKILL_DIR"
  exit 1
fi

# Create Claude skills directory if it doesn't exist
mkdir -p "$HOME/.claude/skills"

# Remove old skill if it exists
if [ -d "$SKILL_DIR" ]; then
  echo "🔄 Updating existing skill..."
  rm -rf "$SKILL_DIR"
else
  echo "✨ Installing new skill..."
fi

# Copy skill files
cp -r "$REPO_SKILL_DIR" "$SKILL_DIR"

echo ""
echo "✅ Skill installed successfully!"
echo "📍 Location: $SKILL_DIR"
echo ""
echo "🔄 Restart Claude Code to load the updated skill"
echo ""
echo "Usage in Claude Code:"
echo "  - 'Test the login page with tsty'"
echo "  - 'Create a visual test for the dashboard'"
echo "  - 'Run user flow tests'"
