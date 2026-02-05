# Tsty Skill Design Philosophy & Extension Guidelines

## Purpose of This Document

This document defines the **design principles and architectural guidelines** for the Tsty skill. Use this when:
- Extending the skill with new features
- Updating existing documentation
- Refactoring or reorganizing content
- Making decisions about what belongs in the skill
- Maintaining the skill's effectiveness over time

**This is NOT about implementation details** - it's about the skill's shape, philosophy, and design approach.

---

## 🎯 Core Design Principles

### 1. Autonomous Iteration First

**Principle:** The skill's PRIMARY purpose is autonomous, iterative E2E testing.

**What this means:**
- The skill should ALWAYS emphasize the run → analyze → fix → re-run loop
- Instructions should guide toward autonomous fixing, not just reporting
- Users should be encouraged to iterate until tests pass (exit code 0)
- The skill should make it easy to fix and verify without human intervention

**When extending:**
- ✅ Add features that support autonomous iteration
- ✅ Add analysis tools that help identify fixable issues
- ✅ Add examples showing how to fix common problems
- ❌ Don't add features that require manual intervention mid-test
- ❌ Don't break the autonomous loop with unnecessary confirmations

**Example:**
```
❌ Bad: "Should I fix this issue?" (breaks autonomous flow)
✅ Good: "Fixing issue automatically, re-running in 3s..." (maintains flow)
```

### 2. Discovery-First Testing

**Principle:** Always screenshot first, never guess selectors.

**What this means:**
- E2E testing should start with discovery (navigate + screenshot)
- Selectors should be based on actual DOM inspection
- Tests should be built incrementally, one action at a time
- Fail-fast mode is preferred to stop at root cause

**When extending:**
- ✅ Emphasize screenshot-based discovery in examples
- ✅ Show incremental test building patterns
- ✅ Guide users to validate each action before composing flows
- ❌ Don't encourage assumption-based selector guessing
- ❌ Don't show examples that skip discovery phase

**Example:**
```
❌ Bad: Create 10-step flow, guess all selectors, run and debug
✅ Good: Navigate + screenshot → inspect DOM → create 1 action → test → repeat
```

### 3. CLI-First for Autonomous Work

**Principle:** CLI workflow is the primary mode for autonomous testing.

**What this means:**
- CLI commands should be emphasized over dashboard UI
- Dashboard is positioned as optional (good for manual editing)
- Workflows should be optimized for scriptability
- Documentation should show CLI examples first

**When extending:**
- ✅ New features should have CLI equivalents
- ✅ Show CLI usage before dashboard usage
- ✅ Optimize for headless, automated workflows
- ❌ Don't make features dashboard-only
- ❌ Don't hide CLI functionality behind UI

**Example:**
```
❌ Bad: "Open dashboard to create flow" (requires UI)
✅ Good: "Create flow JSON in .tsty/flows/ or use dashboard" (CLI first)
```

### 4. Progressive Disclosure

**Principle:** SKILL.md should be lean (<500 lines), with details in references.

**What this means:**
- Core workflow stays in SKILL.md
- Detailed schemas, examples, and edge cases go to references/
- Users should find essential info quickly without context overload
- References are loaded only when needed

**When extending:**
- ✅ Add summaries to SKILL.md (2-5 lines)
- ✅ Create detailed reference files for deep dives
- ✅ Link clearly between SKILL.md and references
- ❌ Don't bloat SKILL.md with exhaustive details
- ❌ Don't create references without linking from SKILL.md

**Example:**
```
❌ Bad: Add 100-line Faker API reference to SKILL.md
✅ Good: Add 3-line summary + "See references/VARIABLES.md" link
```

### 5. Testing ANY Web Application

**Principle:** The skill tests any web app, not just the framework itself.

**What this means:**
- Tsty is a general-purpose E2E testing framework
- It can test React, Vue, Angular, vanilla JS, or any web tech
- It can even test itself (meta-testing for framework development)
- Documentation should avoid coupling to specific tech stacks

**When extending:**
- ✅ Use generic examples (localhost:3000, example.com)
- ✅ Show framework-agnostic patterns
- ✅ Note that it works with "any tech stack"
- ❌ Don't assume React, Next.js, or specific frameworks
- ❌ Don't couple examples to framework-specific patterns

**Example:**
```
❌ Bad: "Test your Next.js components" (too specific)
✅ Good: "Test any web application (React, Vue, Angular, etc.)"
```

---

## 🏗️ Architectural Guidelines

### File Organization

**SKILL.md Structure (target: <500 lines):**
```
1. Core Principle (autonomous iteration)
2. E2E Discovery-First Approach
3. Prerequisites (init first!)
4. Quick Start Guide
5. CLI Commands (quick reference)
6. Core Workflow (4 phases)
7. Workflow Approaches (CLI vs Dashboard vs Hybrid)
8. Flow & Action Basics (summaries only)
9. Troubleshooting
10. Reference Documentation (navigation hub)
11. When to Use This Skill
```

**References Structure:**
- **Workflows:** E2E-TESTING-GUIDE.md, ITERATIVE-WORKFLOW.md, ANALYSIS-METHODS.md
- **Technical:** FLOW-STRUCTURE.md, ACTIONS.md, VARIABLES.md, CONFIG.md, CLI-REFERENCE.md
- **Features:** DASHBOARD.md, FAIL-FAST-GUIDE.md, EXAMPLES.md
- **Standards:** VISUAL-ANALYSIS-GUIDE.md, accessibility-standards.md

**When to create a new reference file:**
- Content is >50 lines and detailed/technical
- Content is loaded conditionally (not always needed)
- Content is a reference (schema, API, examples)
- Content is variant-specific (dashboard vs CLI)

**When to keep in SKILL.md:**
- Essential workflow steps
- Decision points (which mode to use)
- Prerequisites and setup
- Navigation/pointers to references
- Troubleshooting common issues

### Progressive Loading Pattern

**Tier 1: Always loaded (SKILL.md ~450 lines)**
- Core principles and workflow
- Prerequisites and quick start
- Essential decision points

**Tier 2: Loaded on first use (references)**
- E2E-TESTING-GUIDE.md - When creating first test
- ANALYSIS-METHODS.md - After first run
- ITERATIVE-WORKFLOW.md - When iteration needed

**Tier 3: Loaded as needed (references)**
- FLOW-STRUCTURE.md - When need JSON schema
- VARIABLES.md - When using dynamic data
- EXAMPLES.md - When looking for patterns
- DASHBOARD.md - When using UI

### Information Hierarchy

**1. Principles (Why)**
- Why autonomous iteration matters
- Why discovery-first works
- Why CLI is preferred for automation

**2. Workflow (How)**
- How to initialize
- How to create flows
- How to run and analyze
- How to iterate

**3. Reference (What)**
- What fields exist in Flow schema
- What 48 Playwright actions are available
- What variables can be used
- What config options exist

**4. Examples (Show)**
- Show common patterns
- Show best practices
- Show error resolution

---

## 🔧 Extension Guidelines

### Adding New Features

**Before adding a feature, ask:**
1. Does it support autonomous iteration? (Core Principle #1)
2. Does it have a CLI interface? (Core Principle #3)
3. Where does it belong? (SKILL.md summary or references detail)
4. Does it work with any tech stack? (Core Principle #5)

**Feature addition checklist:**
- [ ] Supports autonomous workflows
- [ ] Has CLI equivalent (not dashboard-only)
- [ ] Summary in SKILL.md (<5 lines)
- [ ] Details in appropriate reference file
- [ ] Examples show discovery-first approach
- [ ] Works with any web framework
- [ ] Maintains fail-fast compatibility
- [ ] Includes troubleshooting guidance

**Example: Adding screenshot comparison feature**
```
✅ Good approach:
1. Add CLI command: tsty compare run-1 run-2
2. Add 3-line summary to SKILL.md
3. Create references/VISUAL-REGRESSION.md with details
4. Show how it fits in iteration loop
5. Keep it framework-agnostic

❌ Bad approach:
1. Dashboard-only feature
2. Add 50 lines to SKILL.md
3. Requires React-specific setup
4. Breaks autonomous loop with manual approval
```

### Updating Existing Content

**When updating, maintain:**
1. **Autonomous-first tone** - Guide to fix, not just report
2. **CLI-first examples** - Show terminal commands before UI
3. **Discovery-first flow** - Navigate + screenshot before building
4. **Progressive disclosure** - Summary in main, details in references
5. **Framework-agnostic** - Generic examples, not tech-specific

**Update checklist:**
- [ ] Preserves autonomous iteration emphasis
- [ ] Maintains CLI-first approach
- [ ] Keeps SKILL.md under 500 lines
- [ ] Updates both summary and reference if needed
- [ ] Maintains cross-references between files
- [ ] Uses framework-agnostic language

### Removing Deprecated Content

**When removing features:**
1. Check for references in SKILL.md and all reference files
2. Update navigation in "Reference Documentation" section
3. Add migration note in troubleshooting if breaking change
4. Update examples that used the deprecated feature
5. Verify SKILL.md still makes sense without it

---

## ✅ Quality Checklist

### SKILL.md Quality
- [ ] Under 500 lines
- [ ] Clear section hierarchy (##, ###)
- [ ] Each detailed section has "→ See references/X.md" pointer
- [ ] Prerequisites section is prominent
- [ ] Core workflow is complete and clear
- [ ] Troubleshooting covers common issues
- [ ] Reference Documentation section is navigation hub

### Reference File Quality
- [ ] >100 lines has table of contents at top
- [ ] Clear title and purpose statement
- [ ] Examples are runnable/testable
- [ ] Cross-references to related files
- [ ] Framework-agnostic examples
- [ ] Supports autonomous workflows

### Overall Skill Quality
- [ ] Emphasizes autonomous iteration throughout
- [ ] CLI-first approach maintained
- [ ] Discovery-first testing emphasized
- [ ] Works with any web tech stack
- [ ] Progressive disclosure maintained
- [ ] Total context load is reasonable (<100K tokens for full skill)

---

## 🚫 Anti-Patterns to Avoid

### Documentation Anti-Patterns

❌ **Bloating SKILL.md**
- Adding exhaustive API references to main file
- Including all edge cases in main workflow
- Duplicating content from references

✅ **Solution:** Keep summaries, link to references

---

❌ **Breaking Autonomous Flow**
- Adding manual confirmation prompts mid-test
- Requiring dashboard for core workflows
- Making CLI secondary to UI

✅ **Solution:** CLI-first, autonomous-first, dashboard optional

---

❌ **Framework Coupling**
- Examples assume React/Next.js
- Selectors tied to specific component libraries
- Setup requires specific tech stack

✅ **Solution:** Generic examples, any tech stack, localhost:3000

---

❌ **Assumption-Based Testing**
- Encouraging users to guess selectors
- Skipping discovery phase
- Building full flows before testing actions

✅ **Solution:** Discovery-first, incremental building, screenshot validation

---

❌ **Hidden References**
- Creating reference files without linking from SKILL.md
- Deep nesting (references calling references)
- Unclear when to load which file

✅ **Solution:** Clear navigation hub, one-level deep, "when to read" guidance

---

### Workflow Anti-Patterns

❌ **Report-Only Analysis**
- Listing issues without fixing
- Waiting for user approval to fix
- Stopping after first run

✅ **Solution:** Analyze → Fix → Re-run autonomously

---

❌ **Selector Guessing**
- Creating flows without screenshots
- Assuming DOM structure
- Building all steps before testing

✅ **Solution:** Screenshot → Inspect → Create → Test → Build

---

❌ **Dashboard Dependency**
- Making features UI-only
- Hiding CLI commands
- Requiring visual editor for basic tasks

✅ **Solution:** CLI equivalents, terminal-first, dashboard as enhancement

---

## 📊 Metrics for Success

### User Experience Metrics
- Time to first successful test run (<5 min for simple flow)
- Number of iterations needed (discovery-first should reduce to 1-2)
- Error resolution time (autonomous fixing should be <2 min/error)

### Documentation Metrics
- SKILL.md size (<500 lines maintained)
- Context load per trigger (<25K tokens)
- Reference files loaded per session (avg 2-3, not all)

### Skill Effectiveness Metrics
- Users initialize before creating flows (100%)
- Users follow discovery-first approach (>80%)
- Users iterate autonomously (>70%)
- Users prefer CLI for iteration (>60%)

---

## 🔄 Versioning Philosophy

### When to create new reference files:
- New major feature (dashboard, fail-fast, etc.)
- New domain (visual regression, API testing, etc.)
- Content >50 lines that's conditionally useful

### When to update existing files:
- Bug fixes or clarifications
- Small feature additions
- Better examples
- Updated troubleshooting

### When to refactor:
- SKILL.md exceeds 500 lines
- Reference file exceeds 300 lines (consider splitting)
- User feedback indicates confusion
- New design patterns emerge

---

## 💡 Design Philosophy Summary

**The Tsty skill is designed to be:**

1. **Autonomous** - Iterates until tests pass without waiting for users
2. **Discovery-driven** - Screenshots first, assumptions never
3. **CLI-native** - Terminal workflows, dashboard optional
4. **Lean** - Progressive disclosure, load only what's needed
5. **Universal** - Works with any web tech stack
6. **Fail-fast** - Stop at root cause, fix efficiently
7. **Iterative** - Run → Analyze → Fix → Re-run is the core loop

**When in doubt:**
- Choose autonomous over manual
- Choose CLI over dashboard
- Choose discovery over assumption
- Choose summary over exhaustive detail
- Choose framework-agnostic over specific

---

## 📚 Further Reading

When updating this skill, consult:
- **skill-creator/references/workflows.md** - Sequential workflow patterns
- **skill-creator/references/output-patterns.md** - Template and example patterns
- **This file** - Design philosophy and extension guidelines

---

**Last Updated:** 2026-02-06
**Maintainers:** Follow these principles to preserve the skill's effectiveness
**Contributors:** Read this before proposing changes
