---
title: "Process: A Docs-as-Code CI/CD Pipeline with Automated Style Review"
description: Case study on a GitLab CI pipeline that lints, auto-reviews, tests, and deploys documentation changes.
prev: false
next: false
sidebar:
  order: 14
head:
  - tag: meta
    attrs:
      name: robots
      content: "noindex, nofollow"
---

:::note[Sanitized writing sample]
Case study of a CI/CD pipeline I designed and maintain for a large, multi-product Docusaurus site. Internal hostnames and issue-tracker links have been removed; the pipeline logic below reflects the real configuration.
:::

## The problem

A docs site with over a thousand pages, several independently versioned sub-products, and multiple contributors needs more than "does it build." Two recurring failure modes drove this pipeline's design:

1. Style and terminology drift — different contributors writing "config" vs. "configuration," inconsistent capitalization of product-specific terms, code blocks without a language tag for syntax highlighting.
2. Reviewers spending review time on formatting nits instead of content, because nothing caught the nits automatically before a human ever looked at the merge request.

## Pipeline stages

```
lint → review → test → deploy
```

**Lint** runs `markdownlint` — but only against files that actually changed in the merge request, not the whole repository, keeping feedback fast and relevant:

```yaml
markdown_lint:
  stage: lint
  script:
    - git fetch origin $CI_DEFAULT_BRANCH
    - CHANGED_FILES=$(git diff --name-only origin/$CI_DEFAULT_BRANCH...HEAD | grep -E '\.(md|mdx)$' || true)
    - if [ -z "$CHANGED_FILES" ]; then echo "No markdown files changed. Skipping lint."; exit 0; fi
    - markdownlint --config .markdownlint.jsonc $CHANGED_FILES > lint-results.txt 2>&1 || true
  rules:
    - if: $CI_COMMIT_REF_NAME != $CI_DEFAULT_BRANCH && $CI_COMMIT_MESSAGE !~ /\[skip lint\]/i
```

**Review** runs a custom Dangerfile that goes beyond markdownlint's formatting checks into project-specific documentation style rules, and posts the combined results as a single merge request comment. This is the piece I built and maintain.

**Test** does a full production build, to catch broken links and MDX errors before merge.

**Deploy** publishes to GitLab Pages on the default branch, and spins up an isolated **review app per merge request** — so a reviewer can click through the actual rendered docs, not just read a diff, before approving.

## The Dangerfile: automated style review

Markdownlint catches formatting. It doesn't know that this project prefers "datasource" over "data source," or that HOCON configuration snippets should use `:` rather than `=`, or that a Java code sample's fence title should match the class name inside it. Those are project-specific conventions that only make sense with context — so I wrote a rule engine for them.

A representative rule, checking for consistent terminology while skipping code fences and inline code so the check doesn't false-positive on actual code:

```ruby
lines.each_with_index do |line, index|
  line_number = index + 1
  next if in_code_fence

  line_without_inline_code = line.gsub(/`[^`]*`/, '')

  if line_without_inline_code.match(/\bdata source\b/i)
    file_violations << "**[TERMINOLOGY]** (Line #{line_number}): Use 'datasource' instead of 'data source'"
  end
  if line_without_inline_code.match(/\bfolder\b/i) && !line_without_inline_code.match(/GUI|interface/i)
    file_violations << "**[TERMINOLOGY]** (Line #{line_number}): Use 'directory' instead of 'folder' (unless in GUI context)"
  end
end
```

Other rules in the same file catch: HOCON snippets using `=` instead of `:`, config-block comments using `#` instead of the project's `//` convention, code fences missing a language tag, Java snippet titles that don't match their class name, and internal links written as document IDs instead of relative paths (which break in ways that are easy to miss in review but immediately obvious once published).

The Dangerfile merges these style findings with the markdownlint output from the lint stage into one MR comment, organized by file, with a "how to fix" section and a documented escape hatch (`[skip lint]` in the commit message) for genuinely urgent changes:

```ruby
if all_issues.any?
  message = <<~MSG
    #{all_issues.join("\n")}

    ### How to Fix
    - Review the Documentation Style Guide
    - Use consistent terminology as outlined above

    ### Quick Actions
    - Fix the issues above, or use `[skip lint]` in the commit message for urgent changes
  MSG
  warn(message)
else
  message("No documentation issues found!")
end
```

## Why review apps, not just a build check

A green "test" stage only proves the site builds — it says nothing about whether a restructured page reads well, whether a new admonition renders correctly, or whether a screenshot is now out of date. The `deploy_review` job solves that by publishing a live, isolated preview for every merge request:

```yaml
deploy_review:
  stage: deploy
  script:
    - npm install
    - npm run build
    - mv ./build ./public-review
  environment:
    name: review/$CI_COMMIT_REF_NAME
    url: https://$CI_ENVIRONMENT_SLUG.<pages-domain>
  rules:
    - if: $CI_COMMIT_REF_NAME != $CI_DEFAULT_BRANCH && $CI_PIPELINE_SOURCE == "merge_request_event"
```

This turns doc review from "read a markdown diff and imagine how it renders" into "click the link and look at the actual page" — a small change that measurably raised the number of rendering issues caught before merge rather than after.

## Outcome

The net effect: contributors get style feedback in seconds instead of in a human reviewer's comment three hours later, reviewers spend their attention on content and structure instead of terminology nits, and every merge request ships with a clickable preview instead of a promise that the diff "should be fine."
