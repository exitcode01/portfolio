---
title: "Explanation: Working with Datasources"
description: A conceptual + reference hybrid explaining a pluggable datasource architecture.
prev: false
next: false
sidebar:
  order: 9
head:
  - tag: meta
    attrs:
      name: robots
      content: "noindex, nofollow"
---

:::note[Sanitized writing sample]
The framework discussed here is referred to as **Vista**; internal class packages have been renamed accordingly.
:::

The data required to render a view is fetched from different datasources — a database, a remote API, even a flat file. In Vista, the datasource is designed as a pluggable entity rather than something baked into the view itself.

## Why a pluggable datasource?

Vista provides several built-in datasources, and lets you connect a custom one when they don't fit. Decoupling the datasource from everything else makes it possible to swap implementations, or add support for a new kind of datasource, without touching the rest of a view's logic. Datasource configuration is expressed the same way as everything else in Vista — through the framework's declarative configuration — which also means datasources get to use features like value suppliers and value converters for free.

## Elements of a datasource

Three classes do the actual work:

**`DSContext`** — an abstract class capturing the contextual details needed to query a datasource. Vista ships implementations for its supported datasources; writing a custom datasource means implementing this yourself.

> For datasource-generic query customization — adjusting a sort column or adding a condition without hardcoding to one datasource type — Vista provides `TwoDContext`, which captures modifications in a datasource-agnostic way so the same customization code works across datasource types.

**`DSContextProvider`** — reads datasource-related configuration (like the query) and constructs the matching `DSContext`. Specified via a `data-source.dscontext-provider` configuration key, using a fully-qualified class name.

**`DataFetcher`** — the parent interface for fetching data from a given `DSContext`, and for fetching the corresponding total record count. Specified via `data-source.data-fetcher`.

A configured datasource looks like this:

```hocon title="example-view.yc"
view {
    example-view {
        data-source {
            select-query {
                select-columns: [
                    { alias: "player.short_name", name: "short_name" },
                    { alias: "player.age",        name: "age" }
                ],
                table { alias: "player", name: "player" }
            }
            dscontext-provider: "com.example.vista.component.table.query.QueryContextProvider"
            data-fetcher: com.example.vista.core.ds.query.QueryDataFetcher
        }
    }
}
```

## MetaDataProvider

An optional fourth element, `MetaDataProvider`, supplies metadata about a datasource — table and column definitions for a relational datasource, or entities and fields for a GraphQL one. It's the piece that makes the `DataAccessGuard` feature (below) possible, since guarding access to data requires first knowing what data exists.

For relational datasources specifically, `RelationalMetaDataProvider` covers common contracts: retrieving table/column info, checking column encryption status, determining data types, and more.

## Supported datasource categories

Vista supports two broad categories: databases, and remote servers reached through Remote API URLs.

**Database-backed datasources** use the host platform's persistence layer (for queries built through the framework) or a query-builder library (for hand-written SQL that still needs Vista's query-modification hooks). Both obtain their connection through the platform's standard relational API.

**Remote API datasources** fetch data over HTTP, using a modern HTTP client under the hood, and are configured with a `json-path`-style field-meta key rather than the `table-name`/`field-name` keys used by database-backed sources.

## Field-meta

`field-meta` defines datasource-specific metadata per field — which JDBC type a column maps to, for instance. Every datasource type has its own set of relevant keys. It's used most heavily when merging data pulled from multiple datasources into a single view, but it's flexible enough to carry any metadata a datasource implementation needs.

## DataAccessGuard

`DataAccessGuard` controls *who* can access *what* data, across any datasource. It works together with `MetaDataProvider` (which identifies what entities exist) and per-implementation configuration (which defines the protection rules): entities can be allowed or denied globally, restricted to specific roles, or gated behind custom authorization logic.

```java
public interface DataAccessGuard {
    DataAccessViolation validateAuthorization(@NonNull DSContext dscontext)
        throws MetaDataException, DataAccessGuardException;
}

public interface DataAccessViolation {
    boolean isViolated();
    JSONObject toJson();
}
```

For relational datasources, `RelationalDataAccessGuard` implements this by controlling access to specific functions, restricting columns by data type, and allowing/denying tables and columns per role or custom logic. Validation happens automatically when using the framework's built-in data fetchers; a custom `DataFetcher` implementation is responsible for calling `DSContext.validate()` itself before fetching.

## Multi-datasource support

Views aren't limited to a single datasource. Vista's multi-datasource support lets a view pull from several datasources at once and present the combined result as one coherent response — useful whenever a UI needs to stitch together data that doesn't live in one place.

## Writing a custom datasource

When none of the built-in datasources fit, implementing `DSContext`, `DSContextProvider`, and `DataFetcher` for a custom source is a supported, expected path — not a workaround. The pluggable design exists specifically so that new datasource types can be added without changing anything else in the framework.
