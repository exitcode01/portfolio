---
title: "Reference: CLI Command Reference"
description: A complete command reference for an AI coding assistant's CLI — options, commands, config files, and JSON output format.
prev: false
next: false
sidebar:
  order: 4
head:
  - tag: meta
    attrs:
      name: robots
      content: "noindex, nofollow"
---

:::note[Sanitized writing sample]
The AI coding assistant here is referred to as **Nova**, matching the [troubleshooting sample](../troubleshooting-tmp-noexec/) and [release notes](../release-notes/) elsewhere in this portfolio. Company-specific auth references have been genericized; everything else — structure, tables, and option semantics — is as originally written. Pure reference material, deliberately free of narrative: a reader should be able to scan straight to the flag they need.
:::

> Looking for usage patterns and examples? See the CLI Usage Guide.

:::note
- Nova CLI works best with a **dark** terminal theme. Light theme is available but has known display bugs that are currently being fixed — if you notice visual issues, switching to a dark theme is recommended.
- To enable clipboard copying on Linux, install either `xclip` or `wl-copy`.
:::

## Synopsis

```bash
nova [options] [command] [prompt]
```

Options apply globally to any command. `command` is a subcommand like `auth` or `schedule`. `prompt` is passed directly to the default task runner when no subcommand is given.

```bash
nova --help           # Show all commands
nova <command> --help # Show help for a specific command
```

## Global Options

### Session Behaviour

| Option | Description |
|--------|-------------|
| `-p, --plan` | Run in plan mode |
| `--thinking <level>` | Set reasoning effort: `none\|low\|medium\|high\|xhigh` (default `medium`) |
| `-t, --timeout <seconds>` | Optional timeout in seconds (default: `0` for no timeout) |
| `--retries <count>` | Maximum consecutive mistakes (retries) before halting |
| `--auto-approve <boolean>` | Set tool auto-approval for all tools (default: `true`) |

:::danger
`--auto-approve` defaults to `true` — Nova will execute file writes, deletions, and shell commands without prompting. Set `--auto-approve false` when working in unfamiliar codebases or when you want to review each action before it runs.
:::

### Identity & Auth

| Option | Description |
|--------|-------------|
| `-m, --model <model-id>` | Model to use for the session with the selected provider |
| `-P, --provider <id>` | Provider id (default: `nova`) |
| `-k, --key <api-key>` | API key override for this run |

:::note
**Ollama** and **LM Studio** use legacy client-side tool calling, which means native tool calling is not supported. Native tool calling support is planned for a future update.
:::

### I/O & Format

| Option | Description |
|--------|-------------|
| `--json` | Output messages as JSON instead of styled text |
| `-v, --verbose` | Show verbose output |
| `-s, --system <system-prompt>` | Override the default system prompt |

### Paths

| Option | Description |
|--------|-------------|
| `-c, --cwd <path>` | Working directory |
| `--config <path>` | Configuration directory (default: `~/.nova/data/settings`) |
| `--data-dir <path>` | Use isolated local state at this directory path (default: `~/.nova`) |

### Modes

| Option | Description |
|--------|-------------|
| `-i, --tui` | Open the terminal user interface (TUI) for interactive sessions |
| `--acp` | Run in Agent Client Protocol (ACP) mode for editor integration |
| `--id <session-id>` | Resume an existing session by ID |

### General

| Option | Description |
|--------|-------------|
| `-V, --version` | Output the version number |
| `-h, --help` | Display help for command |

## Commands

| Command | Description |
|---------|-------------|
| `nova [prompt]` | Start a task or enter interactive mode |
| `auth [provider]` | Configure authentication with an AI provider |
| `config` | Show current configuration |
| `mcp` | Manage MCP servers |
| `history` / `h` | List session history or manage saved sessions |
| `version` | Show CLI version number |

### Authentication examples

**Interactive setup** (recommended for first-time setup):

```bash
nova auth
```

Opens a browser to sign in, then prompts for provider, API key, and model selection.

**Direct configuration**:

```bash
nova auth --provider <provider-name> --apikey <your-api-key> --modelid <model-id>
```

**Example with Anthropic:**

```bash
nova auth --provider anthropic --apikey sk-ant-api05-xxx --modelid <model-id>
```

:::note
Account authentication is always required, even when using third-party model providers. This authenticates your Nova account, while the provider credentials authenticate your AI model access.
:::

:::caution[Known issue — `history` command]
- CLI 2.0.0 uses a new format for storing session history, and history migrated from older versions is best-effort — some sessions may not carry over perfectly. Separately, history currently displays full chat contents instead of just the title for migrated sessions; a fix is planned.
- Only the most recent 50 sessions are shown to prevent performance issues. Older sessions remain stored but are not displayed in the list.
:::

## Common Combinations

```bash
# Plan before acting, with high reasoning
nova --plan --thinking high "refactor the auth module"

# Pipe output to jq for scripting
nova --json "list all open TODOs" | jq '.text'

# Resume a previous session
nova --id <session-id> "continue where we left off"

# Run with a specific model for one session
nova -P nova -m <model-id> "review this PR"
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NOVA_DATA_DIR` | Custom configuration directory (replaces `~/.nova/data/`) |

## JSON Output Format

When using `--json`, each message is a JSON object on its own line:

```json
{"type": "say", "text": "I'll create the file now.", "ts": 1760501486669, "say": "text"}
```

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"ask"` or `"say"` | Message category |
| `text` | `string` | Message content |
| `ts` | `number` | Unix timestamp in milliseconds |
| `say` | `string` | Subtype when `type` is `"say"` |
| `ask` | `string` | Subtype when `type` is `"ask"` |
| `reasoning` | `string` | Model reasoning (if available) |
| `partial` | `boolean` | `true` while streaming |

## Configuration Files

```
~/.nova/
  data/
    settings/
      providers.json             # API keys and provider config
      rules/                     # Global rules
      skills/                    # Global skills
    teams/                       # Team state
    sessions/                    # Session database (SQLite)
    logs/
      hub-daemon.log             # Hub logs
  plugins/                       # Global plugins
    _installed/                  # Managed by `nova plugin install`

.nova/                           # Project root
  rules/                         # Project rules
  skills/                        # Project skills
  hooks/                         # Lifecycle hooks
  plugins/                       # Project plugins
  mcp.json                       # MCP server config
  agents.yaml                    # Agent definitions
```
