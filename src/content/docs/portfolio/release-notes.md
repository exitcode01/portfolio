---
title: Release Notes
description: Two sanitized release-notes samples — a UI component library and an AI coding assistant.
prev: false
next: false
sidebar:
  order: 16
head:
  - tag: meta
    attrs:
      name: robots
      content: "noindex, nofollow"
---

:::note[Sanitized writing sample]
Two release-notes samples from different product types, showing the same core skill — organizing a release into scannable categories — applied to very different audiences. Product names have been genericized; internal download links, registry URLs, and internal tool names have been removed.
:::

## Sample 1 — UI component library ("Vista UI 1.1.0")

## 🚀 New Feature

### Bulk data editing & deleting

You now have bulk data editing and deleting support. Select a set of rows and perform the operation — for editing, a customizable modal UI is displayed to input values.

### Sort multiple columns with ease

Click **Ctrl/Cmd** along with a column header to sort by multiple columns. Sort order is displayed next to each sorted column's label.

### Dedicated header column for row grouping

A dedicated header column now differentiates grouped-row information.

### Visualize parent-child records with subgrid

With Subgrid, you can now visualize parent-child records hierarchically within the table.

### Table refresh option

Fetch fresh data and re-render the table UI with the new Table Refresh button.

### On-demand display of total count information

Display `total-count` information on demand — inline as a label, or in a popover triggered by a dedicated button.

### Pagination layout customization

Rearrange the page elements within the pagination UI.

### Editable page numbers

Input page numbers directly using an editable textbox, instead of choosing from a predefined list.

## 🪄 Enhancements

- Action buttons now offer clearer visual cues: an outline on hover, a color fill when activated.
- Setting width as 100% now evenly distributes width across all columns.
- Row-grouping and reordering features are automatically enabled in server-driven scenarios unless explicitly disabled.
- Events dispatched from master-detail view interactions now include expanded/collapsed row information.
- Row-height calculations for pinnable columns have been removed in favor of an ellipsis when content exceeds the defined width or height.

## 🛠️ Bug Fix

- Fixed data duplication that occurred when row selection was enabled alongside row grouping.
- Fixed row misalignment while scrolling through the table.
- Fixed doubled serial numbers when navigating to the last page, caused by incorrect start/end index calculation.
- Fixed inconsistent serial-number behavior when the row-virtualization plugin was disabled.
- Fixed hidden columns reappearing after a refresh even when persisted state was enabled.
- Fixed incorrect pagination "from"/"to" indices during sort/filter operations in server-driven scenarios.
- Fixed page buttons not responding to the Enter key.

---

## Sample 2 — AI coding assistant ("Nova 2.1.0 Beta")

This release brings a security-review agent, a deep-research tool, folder search in the CLI, mid-conversation context compaction, and a range of UI improvements and fixes across the IDE and CLI.

## New Features

### Pause & resume mid-conversation
*Available in: IDE*

The send button now adapts to the current state of the conversation — a **pause** icon while processing, a **resume** icon when paused, and the original **send** icon when composing. You can pause a long-running response at any point and pick it back up later.

### Folder search
*Available in: CLI*

Search by folder name directly in the CLI using `@`.

### `/compact` command & automatic context compaction
*Available in: IDE integrations*

Sessions can now manage context size explicitly. Use `/compact` to compress conversation history on demand, or let the assistant trigger compaction automatically as context approaches its limit.

### Switch models without leaving the conversation
*Available in: IDE*

Switch the active model directly from the conversation view — previously this required navigating to Settings, interrupting the current task.

### Deep research integration
*Available in: IDE + CLI*

Multi-step web research orchestration is now supported directly inside the assistant, backed by an internal web-search/fetch service.

> **Note:** Deep research requires access to the internal network the research service runs on.

## New Agents

### Security review command
*Available in: IDE + CLI*

Runs an AI-powered security review against your codebase, with four scopes: entire source, remote repository changes, local uncommitted changes, and APIs. Works with any project type, is customizable, and functions reliably on open-source models.

### False-positive classification command
*Available in: IDE + CLI*

Classifies false positives in static-analysis security reports using AI, so findings can be triaged toward real vulnerabilities.

## UI/UX
*Available in: IDE*

- The chat footer layout has been reorganized, grouping the chat input and toolbar actions more consistently; the auto-approve option moved into the footer toolbar.
- The dedicated footer button for `@` has been removed to reduce toolbar clutter.
- A circular progress bar now shows approximate context-window usage during a conversation.
- Conversation titles can now be renamed directly from the UI.

## Bug Fixes

- Fixed an auth-token error in the CLI caused by tokens not refreshing correctly mid-session.
- Fixed an array index out-of-range error that caused an unexpected crash; the affected code path is now bounds-checked.
- Fixed a tool-ID collision bug where a single ID was assigned to multiple tool entries, causing conflicts when resolving which tool to call.
- Fixed a Linux startup error in the terminal UI's render library that prevented the CLI from launching at all.
- Fixed copy-paste not working in the input field while the assistant was asking a follow-up question mid-task.

## Refactoring & Improvements
*Available in: IDE + CLI*

- CLI shell-executor output is now truncated to 20,000 characters for very large outputs, preventing oversized payloads from consuming context.
- File writes are now skipped entirely when content is unchanged, avoiding unnecessary writes during iterative edits.
- Tool output size limits are now enforced consistently across both the system prompt and individual tool definitions.
- The token-usage tab now has a refresh button that reads the current value directly from disk instead of a stale cached count.
- Auto-compaction threshold handling now covers more edge cases, reducing unexpected compaction triggers in long-running sessions.

## Known Issues

- With auto-approve disabled, switching models mid-conversation can get the CLI stuck on "Applying model..." indefinitely, because the pending approval prompt isn't dismissed when the switch is triggered.
- An intermittent UI overlap issue occurs in the CLI interface; the trigger is still being investigated.
- Files are occasionally created or modified even in chat mode, where no file changes should occur.
- Responses from certain legacy models may not render correctly in the CLI; switching to a newer model is the current workaround.
- Third-party VS Code theme plugins may cause contrast/display issues.
