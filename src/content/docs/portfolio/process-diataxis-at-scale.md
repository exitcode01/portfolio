---
title: "Process: Applying Diataxis Across Multiple Product Lines"
description: A case study on structuring a large, multi-product docs tree around the Diataxis framework, and where the theory gets messy in practice.
prev: false
next: false
sidebar:
  order: 10
head:
  - tag: meta
    attrs:
      name: robots
      content: "noindex, nofollow"
---

:::note[Sanitized writing sample]
This is an original case study I wrote about my own documentation architecture work, not an excerpt from a single source document — the underlying docs tree is the same one referenced throughout this portfolio (renamed **Vista**), which used a literal `tutorial/`, `how-to/`, `reference/`, `explanation/` folder split across several independently versioned sub-products.
:::

## The starting problem

A docs site that grows organically tends to converge on one shape: a pile of pages organized by *feature area* — "Tables," "Charts," "Datasources" — where each page tries to be a tutorial, a reference, and a troubleshooting guide simultaneously, depending on who wrote it and what they needed that day. It works fine at 30 pages. It stops working at 300, because a reader looking for "how do I do X" and a reader looking for "what does X do" end up on the same overloaded page, and neither is well served.

[Diataxis](https://diataxis.fr/) proposes organizing by *what the reader is trying to do* instead: tutorials (learning by doing), how-to guides (accomplishing a specific task), reference (looking up a fact), and explanation (understanding a concept). The framework's real claim isn't "these are four good categories" — it's that these four needs pull a document in genuinely incompatible directions, so a page trying to serve more than one of them will always compromise on all of them.

## What "at scale" actually means here

Applying Diataxis to a single product is a well-trodden path. Applying it across a **docs platform serving several sub-products, each independently versioned**, surfaces problems the framework's own site doesn't really discuss:

**Shared concepts, per-product instances.** A concept like "datasource" exists once at the explanation level, but each sub-product's reference section needs its own concrete reference entries for its own datasource types. Getting this right meant explanation docs stayed product-agnostic and linked *down* into per-product reference pages, rather than duplicating concept explanations inside every reference entry — a discipline that's easy to state and constantly tempting to break under deadline pressure.

**Versioning multiplies everything.** With 14 concurrently maintained versions of the main product (see the [versioning case study](../process-versioning/)), a Diataxis split isn't a one-time information architecture decision — it's a structure that has to survive being forked 14 times over. A reference page that's accurate for version 2.3 and wrong for 2.5 is worse than no version split at all, because it looks authoritative while being silently stale.

**Tutorials rot fastest, reference rots quietest.** In practice, tutorials needed the most maintenance attention — they're the most narratively specific, so a UI change breaks them visibly and immediately (a screenshot doesn't match, a button moved). Reference pages tend to degrade silently: a config key gets deprecated and the reference page just... doesn't get flagged, because nothing is obviously broken until someone tries to use the stale option. This asymmetry shaped where review effort actually went, versus where the framework would suggest effort "should" go by page count.

## Where the four categories blur, honestly

Diataxis is a strong organizing principle, not a perfect partition. A few places where the boundary got genuinely fuzzy:

- **How-to vs. tutorial.** A "how-to: generate config classes from schema" reads almost identically to a tutorial step, except it assumes prior context a tutorial wouldn't. The distinguishing test that ended up working in practice: does this page assume you already know why you're doing this? If yes, how-to. If the page's job is to build that "why" for the first time, tutorial.
- **Reference vs. explanation.** A glossary entry for `DSContext` is reference (a fact to look up). But some glossary entries kept growing until they were explaining *why* the abstraction exists — at which point the honest move was to trim the glossary entry back to a definition and move the "why" into the architecture explanation, with a link.
- **Explanation leaking into how-to.** The temptation in a how-to guide is always to justify each step ("we do this because..."). Every justification sentence in a how-to guide is a signal that either the how-to needs a link to an explanation doc, or that explanation doc doesn't exist yet and should.

## What this bought, concretely

The practical payoff wasn't "cleaner folders" — it was that **contribution got easier to review**. A pull request adding a new reference page could be reviewed against reference-page criteria (accuracy, completeness, no narrative filler) without also litigating whether it was pedagogically well-sequenced, because sequencing simply isn't reference's job. Diataxis, used this way, is less a filing system for readers and more a set of separate quality bars for writers — which is what made it survive contact with multiple contributors and multiple product teams without collapsing back into feature-area pages.
