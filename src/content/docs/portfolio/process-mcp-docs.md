---
title: "Process: Making Docs Machine-Readable for AI Agents"
description: A case study on exposing documentation to LLM agents, not just human readers — via a flat-file export and a planned live query interface.
prev: false
next: false
sidebar:
  order: 12
head:
  - tag: meta
    attrs:
      name: robots
      content: "noindex, nofollow"
---

:::note[Sanitized writing sample]
Original case study describing real, verifiable configuration from the AI-CLI docs site referenced elsewhere in this portfolio (renamed **Nova**). The `docusaurus-plugin-llms` integration described below is live and configured in that site's `docusaurus.config.js`. A second piece — exposing the docs as a queryable MCP server — was a declared dependency and a planned next step at the time of writing, and is described here as such, not as a finished system.
:::

## The problem

Documentation has always had exactly one consumer to design for: a human, reading in a browser, following links, scrolling. That assumption is breaking. AI coding agents now routinely need to *read* documentation mid-task — to look up a CLI flag, check a config schema, or understand an API before writing code against it — and a page designed for human scanning (navigation chrome, sidebar, prose transitions, screenshots) is a worse fit for that than plain, dense, structured text would be.

This is a genuinely different audience with different needs, arriving on the same docs site as human readers, and the honest response is to serve both rather than pick one.

## What's live: a flat-file export for agents

`docusaurus-plugin-llms` is registered in the site's plugin list and generates a machine-readable export of the docs tree at build time — a convention (following the emerging `llms.txt` pattern) where the entire site's content, or a summarized index of it, is available as plain text at a well-known path. An agent — or a person setting up an agent's context — can fetch this once and have the whole site's content without crawling and stripping HTML from every page individually.

```js title="docusaurus.config.js"
plugins: [
  // ...
  [
    'docusaurus-plugin-llms',
    {
      // Plugin options can be configured here
    },
  ],
],
```

The value of this over "just let the agent fetch HTML pages" is bandwidth and noise: an agent fetching rendered HTML pays for navigation markup, theme chrome, and script tags it will never use, and has to reconstruct structure the plugin already flattens for it. A static export also doesn't require the agent to have live network access to the docs site at all — it can be embedded once and reused.

## What's planned: a live, queryable interface

A flat export is static — regenerated at build time, useful for bulk ingestion, but not for a targeted query like "what does the `--auto-approve` flag default to?" without re-fetching and re-parsing the whole export. The complementary piece, declared as a project dependency (`docusaurus-plugin-mcp-server`) but not yet wired into the build at the time of writing, is exposing the docs as an **MCP (Model Context Protocol) server** — letting an agent call a tool like "search these docs" or "get this page" directly, the same way it would call any other MCP tool, without needing to have pre-ingested anything.

The distinction matters because the two approaches solve different problems:

| | Flat export (`llms.txt`-style) | MCP server |
|---|---|---|
| Best for | Bulk ingestion, embedding into a fixed context window once | Targeted, live lookups during a task |
| Freshness | As of last build | Always current |
| Cost to the agent | One fetch, then all local | A tool call per lookup, but no pre-ingestion needed |
| Cost to maintain | A build-time plugin, effectively free | A live service to run, secure, and keep available |

Treating these as complementary rather than either/or was the actual design decision here — the flat export ships now because it's nearly free (a build-time plugin, no new infrastructure), while the MCP server is deliberately sequenced later because it's a live service with its own uptime, auth, and rate-limiting concerns that a static export doesn't have.

## The broader shift this points at

This is a small, concrete instance of a larger question every docs team is going to face soon: when a meaningful fraction of your readers are agents rather than humans, does "documentation" still mean "a website," or does it mean "a queryable source of truth that happens to also render as a website for humans"? The flat-export-plus-MCP-server approach here is a hedge against having to answer that question all at once — ship the cheap, static half of the answer now, keep the door open for the live half once the operational cost is justified by actual agent traffic against the docs.
