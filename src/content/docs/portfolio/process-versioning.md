---
title: "Process: Versioning Documentation for 14 Concurrent Releases"
description: A case study on maintaining Docusaurus-versioned documentation across many concurrently supported product releases.
prev: false
next: false
sidebar:
  order: 11
head:
  - tag: meta
    attrs:
      name: robots
      content: "noindex, nofollow"
---

:::note[Sanitized writing sample]
Original case study describing real, verifiable structure from the docs platform referenced elsewhere in this portfolio (renamed **Vista**) — at last count, 14 versions of the main product's docs were tracked concurrently via Docusaurus's native versioning (`versioned_docs/`, `versioned_sidebars/`, a `versions.json` manifest), alongside independently versioned docs trees for at least two other sub-products in the same platform. No proprietary version numbers or product names are used below.
:::

## The problem this solves

Customers don't all upgrade at once. Someone running version 2.2.0 in production needs docs that describe 2.2.0's behavior — not the current version's, which may have renamed a config key, changed a default, or removed a feature entirely. Docusaurus's built-in versioning solves this by snapshotting the entire `docs/` tree (and its sidebar) at release time into a frozen `versioned_docs/2.2.0/` copy, served at its own URL, while `docs/` itself keeps evolving as "current."

The mechanics are straightforward for one version. They get genuinely hard to reason about at 14.

## What 14 concurrent versions actually costs

**Storage and build time compound linearly, review effort doesn't.** Each version is a full copy of the docs tree — 14 versions means building and validating roughly 14x the page count on every CI run, even though most content is identical across adjacent versions. The real cost isn't disk space, it's that a broken link or a bad code sample introduced in version 2.3.0 and never fixed silently exists in every version snapshotted afterward, because snapshotting freezes the bug along with everything else.

**Backporting is a judgment call, not a mechanical one.** When a fix needs to reach multiple live versions, the question is never just "can I copy this change back" — it's "did the thing this fix describes exist yet in that version." A corrected explanation of a feature that was only added in 2.4.0 cannot be backported to the 2.2.0 snapshot; the honest move is to leave 2.2.0's docs describing the absence of that feature. Treating backporting as pure copy-paste produces docs that describe capabilities that don't exist in the version a reader is actually running — arguably worse than an unfixed typo.

**Sidebar and navigation config also gets versioned — and forgotten.** `versioned_sidebars/` freezes the *shape* of the sidebar per version too. Restructuring the current sidebar (renaming a category, moving a page) has zero effect on older versions' sidebars, which is usually correct — but it means a broad site-wide navigation change requires deciding, page by page, whether it's a structural fix that should apply everywhere or a current-version-only reorganization. Getting this wrong either fails to fix a real problem in old versions, or silently reshuffles navigation a reader on an old version never asked to have reshuffled.

**Multiple sub-products multiply the model again.** This platform didn't version just one product — several sub-products, each with independent release cadences, each got their own `@docusaurus/plugin-content-docs` instance with its own `versions.json`, own `lastVersion`, own sidebar file. That independence is the right call (product A's 2.0 release has nothing to do with product B's version numbers) but it means there's no single "docs version" for the platform as a whole — version-awareness has to be scoped per product, in the reader's head as much as in the config.

## The rule that kept this maintainable

The rule that mattered most in practice: **never edit inside `versioned_docs/` directly except to fix something that was factually wrong at the time it was published.** Anything else — improving phrasing, adding an example, restructuring a section — belongs in `docs/` (current) and gets versioned forward naturally at the next release cut. Violating this rule a few times is how version snapshots quietly drift out of sync with each other in ways nobody notices until a customer on an old version reports that "the docs don't match what's on the current site" — technically true, and also the entire point of versioning in the first place.

## What I'd tell someone about to do this

Versioning docs is cheap to turn on and expensive to run well. The tooling handles the snapshotting; it does not tell you when a fix should have been backported, when a sidebar restructure should be version-scoped, or when a stale reference page in an old snapshot has quietly become misleading rather than merely dated. That judgment is the actual job — the Docusaurus config is just the mechanism that makes exercising it possible at all.
