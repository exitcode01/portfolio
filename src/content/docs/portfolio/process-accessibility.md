---
title: "Process: Automating WCAG2AA Accessibility Audits in CI"
description: Case study on building a repeatable pa11y-based accessibility audit for a documentation site.
prev: false
next: false
sidebar:
  order: 15
head:
  - tag: meta
    attrs:
      name: robots
      content: "noindex, nofollow"
---

:::note[Sanitized writing sample]
Internal hostnames have been replaced with `localhost` equivalents; the automation logic below is unmodified from what I built and run.
:::

## The problem

Accessibility compliance on a docs site is easy to treat as a one-time audit and then forget — until a page template changes, a new component ships, or content grows in a way that quietly breaks something for screen-reader or keyboard users. I wanted accessibility checking to be a repeatable, automatable step, not an annual manual pass.

## Approach: pa11y against representative pages

Rather than crawling the entire site (slow, and mostly redundant once you've covered every page *template*), the audit targets one representative page per doc genre: the homepage, a concept page, a tutorial, a reference page, a how-to guide, and the feature-area landing pages for each major product module. Between them, these pages exercise every major layout and content pattern the site uses.

Configuration lives in a `pa11y-ci` config file, standardized on WCAG2AA:

```json
{
  "defaults": {
    "timeout": 10000,
    "wait": 2000,
    "standard": "WCAG2AA",
    "reporters": ["json"],
    "ignore": [
      "WCAG2AA.Principle1.Guideline1_3.1_3_1.H44.NonExistentFragment"
    ]
  },
  "urls": [
    "http://localhost:3000/docs/",
    "http://localhost:3000/docs/intro",
    "http://localhost:3000/docs/tutorial/getting-started",
    "http://localhost:3000/docs/reference/schema",
    "http://localhost:3000/docs/how-to/custom-data-type",
    "http://localhost:3000/docs/table/features/summary"
  ]
}
```

The one ignored rule is a documented false-positive specific to this site's fragment-linking pattern — not a blanket suppression, but a single named exception with a reason.

## A self-contained test runner

Rather than assuming a server is already running (fragile in CI, annoying locally), the runner script starts the dev server itself, polls until it responds, runs the audit, and tears the server down on exit — success or failure:

```bash
check_server() {
    local url=$1
    local max_attempts=30
    local attempt=0
    while [ $attempt -lt $max_attempts ]; do
        if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200"; then
            echo "Server is running and responding"
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 2
    done
    return 1
}

main() {
    npm start > /dev/null 2>&1 &
    SERVER_PID=$!
    trap 'kill $SERVER_PID 2>/dev/null || true' EXIT

    check_server "http://localhost:3000/docs/" || exit 1

    run_pa11y_single "http://localhost:3000/docs/" "$REPORTS_DIR/homepage.json" "Homepage"
    # ...one run_pa11y_single call per representative page
}
```

The `trap` on `EXIT` matters more than it looks: without it, a failed or interrupted run leaves an orphaned dev server process behind, which silently breaks the *next* CI run by holding the port open.

## Structured output, not just pass/fail

Each page's raw pa11y output is preserved as its own JSON report, and then rolled up into a single summary with per-page issue counts and a total — so a maintainer can see at a glance whether a change made things better or worse, and drill into exactly which page regressed:

```json
{
  "meta": { "timestamp": "...", "standard": "WCAG2AA", "total_pages": 6, "total_issues": 0 },
  "results": [
    { "page": "homepage", "url": "...", "issue_count": 0, "issues": [] }
  ]
}
```

Keeping the per-page detail alongside the summary — rather than just emitting a pass/fail count — turned out to matter in practice: without it, a jump from 0 to 3 issues tells a reviewer *that* something broke, not *what*, and they end up re-running the audit locally to find out anyway.

## Outcome

Accessibility went from something checked when someone remembered to check it, to a standing, repeatable command any contributor can run before opening a merge request — and a candidate for wiring into the same CI pipeline that already runs lint and the Danger style review, closing the loop between "the site builds" and "the site is usable."
