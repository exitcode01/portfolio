---
title: "How-To: Automate PR Review with the CLI in GitHub Actions"
description: A copy-paste-ready GitHub Actions workflow that runs an AI coding assistant as an autonomous PR reviewer, with a locked-down command allowlist.
prev: false
next: false
sidebar:
  order: 5
head:
  - tag: meta
    attrs:
      name: robots
      content: "noindex, nofollow"
---

:::note[Sanitized writing sample]
The AI coding assistant here is referred to as **Nova**, matching the [CLI reference](/portfolio/cli-reference/) elsewhere in this portfolio. Everything else — the workflow YAML, the security reasoning, and the explanatory prose — is as originally written; this was one of a small set of ready-to-use automation samples I wrote for the CLI docs, alongside similar ones for issue triage and dependency-alert response.
:::

Automate code review for every pull request. Nova runs autonomously in GitHub Actions, analyzes the diff, and posts a detailed review comment with inline suggestions.

## The workflow

When a PR is opened or marked ready for review, this workflow:

1. **Checks out** the code.
2. **Installs** Node.js and the Nova CLI.
3. **Configures** authentication (e.g., Anthropic, OpenAI).
4. **Runs Nova** with a system prompt that analyzes the diff, context, and related issues using the GitHub CLI (`gh`).
5. **Posts** a detailed review comment with inline code suggestions.

## Prerequisites

- A GitHub repository with Actions enabled.
- An AI provider API key (e.g., Anthropic, OpenRouter) added as a repository secret.
- A GitHub token (automatically provided by Actions as `GITHUB_TOKEN`).

## Setup

### 1. Create the workflow file

Create `.github/workflows/nova-pr-review.yml`:

```yaml
name: Nova PR Code Review

on:
  pull_request:
    types: [opened, ready_for_review]
  workflow_dispatch:
    inputs:
      pr_number:
        description: "PR number to review"
        required: true
        type: string

concurrency:
  group: pr-review-${{ github.event.pull_request.number || inputs.pr_number }}
  cancel-in-progress: true

jobs:
  nova-pr-review:
    if: |
      (github.event_name == 'pull_request' && github.event.pull_request.draft == false) ||
      github.event_name == 'workflow_dispatch'
    runs-on: ubuntu-latest
    timeout-minutes: 60

    permissions:
      contents: read
      pull-requests: write
      issues: read

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "npm"

      - name: Install Nova CLI
        run: npm install -g nova

      - name: Configure Nova authentication
        # Replace 'anthropic' with your provider of choice (openai, openrouter, etc.)
        # and ensure the corresponding secret is set in your repo settings.
        run: |
          nova auth --provider anthropic \
            --apikey "${{ secrets.ANTHROPIC_API_KEY }}" \
            --modelid <model-id>

      - name: Get PR number
        id: pr
        run: |
          if [ "${{ github.event_name }}" == "workflow_dispatch" ]; then
            echo "number=${{ inputs.pr_number }}" >> $GITHUB_OUTPUT
          else
            echo "number=${{ github.event.pull_request.number }}" >> $GITHUB_OUTPUT
          fi

      - name: Review PR with Nova
        env:
          PR_NUMBER: ${{ steps.pr.outputs.number }}
          GITHUB_REPO: ${{ github.repository }}
          GH_TOKEN: ${{ github.token }}
          # Restrict Nova to only safe, read-only GitHub CLI commands
          NOVA_COMMAND_PERMISSIONS: |
            {
              "allow": [
                "gh pr diff *",
                "gh pr view *",
                "gh pr checks *",
                "gh pr list *",
                "gh issue list *",
                "gh issue view *",
                "git log *",
                "gh pr comment ${{ steps.pr.outputs.number }} *",
                "gh api repos/${{ github.repository }}/pulls/${{ steps.pr.outputs.number }}/comments *",
                "gh api repos/${{ github.repository }}/pulls/${{ steps.pr.outputs.number }}/reviews *"
              ]
            }
        run: |
          nova --auto-approve true 'You are a GitHub PR reviewer for this repository. Your goal is to give the PR author helpful feedback and give maintainers the context they need to review efficiently.

          PR: #'"${PR_NUMBER}"'

          ## Gather context
          Use `gh` commands to fetch the PR diff, details, and checks.

          ```bash
          # Get full PR details
          gh pr view '"${PR_NUMBER}"' --json number,title,body,author,createdAt,updatedAt,isDraft,labels,commits,files,additions,deletions,changedFiles,baseRefName,headRefName,mergeable,reviewDecision

          # Get the diff
          gh pr diff '"${PR_NUMBER}"'

          # Check CI status
          gh pr checks '"${PR_NUMBER}"'
          ```

          ## Deep code review
          Analyze the code changes. Look for:
          - Logic errors and edge cases
          - Security vulnerabilities
          - Performance issues
          - Adherence to patterns in the codebase

          ## Submit review
          Post a single comprehensive comment summarizing your review.

          If you have specific code suggestions, use the GitHub API to post inline comments:

          ```bash
          gh api repos/'"${GITHUB_REPO}"'/pulls/'"${PR_NUMBER}"'/reviews \
            -X POST \
            -f event="COMMENT" \
            -f body="" \
            -F comments='"'"'[{"path": "src/file.ts", "line": 10, "body": "Suggestion: ..."}]'"'"'

          Start your main comment with "Reviewed by Nova".'
```

### 2. Configure secrets

1. Go to your repository settings → **Secrets and variables** → **Actions**.
2. Add a **New repository secret**.
3. Name: `ANTHROPIC_API_KEY` (or match the key used in your workflow).
4. Value: your actual API key.

## Key components explained

### Permissions

```yaml
permissions:
  contents: read
  pull-requests: write
  issues: read
```

`pull-requests: write` lets Nova post comments and inline reviews. `contents: read` ensures it can analyze the code but **cannot push changes directly** — a deliberate security boundary, not an oversight.

### Authentication

```bash
nova auth --provider anthropic --apikey "..."
```

The `auth` command configures Nova in the CI environment without interactive prompts. Swap providers (`openai`, `openrouter`, etc.) by changing the flags.

### Autonomous mode (`--auto-approve true`)

```bash
nova --auto-approve true '...'
```

This tells Nova to run autonomously, executing approved tools without waiting for interactive confirmation, so the CI workflow can complete the requested work end to end without a human in the loop.

### Command permissions

`NOVA_COMMAND_PERMISSIONS` explicitly restricts what commands Nova can run in this job — only the `gh` and `git` commands relevant to reviewing. This is the load-bearing safety mechanism in the whole workflow: without it, an autonomous agent with `--auto-approve true` in CI would have an open-ended shell, which is a very different (and much riskier) thing to grant than "can comment on a PR."

## Customizing the reviewer

The system prompt passed to Nova in the final step is fully customizable. You can adapt it to enforce a specific style guide, weight security review over performance review (or vice versa), or change the tone of the feedback entirely.
