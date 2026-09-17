---
title: "How-To: Generate Config Classes from Schema"
description: A task-oriented how-to guide for a schema-driven code generation tool, including a breaking-change callout.
prev: false
next: false
sidebar:
  order: 2
head:
  - tag: meta
    attrs:
      name: robots
      content: "noindex, nofollow"
---

:::note[Sanitized writing sample]
Product names have been genericized (the framework is referred to as **Vista**); internal support-contact links and download URLs have been removed.
:::

In this how-to guide, you'll learn how to generate a configuration JAR — containing config classes generated from JSON schemas — for a non-default setup that doesn't rely on the framework's usual host platform.

:::danger[Breaking changes]
Because generated classes are tied to the schemas they're built from, breaking changes are sometimes unavoidable when a schema changes. Before adopting a newly generated config JAR, check the schema updates and assess the impact on your project.

The generated classes also use JSON serialization for faster config loading. Because they're auto-generated, semantic versioning across them is hard to guarantee — **clear any cached serialized config file during upgrades** to avoid stale-schema mismatches.
:::

## Before you start

* Familiarity with the framework's global configuration, configuration loaders, and schema system.
* Familiarity with the configuration generator tool's available options.

## Step 1: Download the tool

Download the generator tool package for your target version and extract it. You'll find:

```
config-gen-tool/
├── compile-deps/       (fixed internal dependencies)
├── external-types/     (dependencies for schema value-converters)
├── schemas/            (component-wise schema definitions)
├── ConfigGen.jar        — the generation tool
└── generator.conf       — global configuration for the tool
```

## Step 2: Choose the required schemas

Config classes are generated per-schema. The `schemas/` directory ships with a full set, organized by component:

```
schemas/
├── chart/
├── core/
├── pushnotifier/
├── tab/
└── table/
```

Keep only the directories for the components you actually need, and delete the rest. In a setup that doesn't use the framework's default host platform, you also need to remove platform-specific schemas from `schemas/core` (query and SQL-string schemas) and remove personalization-related schemas from `schemas/table` and `schemas/tab` — those assume runtime pieces that aren't present in this setup.

## Step 3: Choose the configuration loader

The generator needs a loader to read schema files. Since the schemas here live in plain directories, `DirectoryConfigLoader` is the right choice — the tool ships other loaders for other schema sources.

## Step 4: Configure the generation tool

Everything else is configured in `generator.conf`.

**Loader and search paths.** The default template already points at `./schemas`, so no changes are needed if you followed the directory layout from Step 1.

```hocon title="generator.conf"
config-loader: "com.example.vista.config.base.loader.directory.DirectoryConfigLoader"
config {
  directory-loader {
    search-paths: [
      "./schemas"
    ]
  }
}
```

**Module dependencies.** If you're on Java 9+, remove the host-platform-specific module entry from `generation.require-transitive-modules` — it isn't needed outside that platform.

**Compilation.** The tool needs a JDK to compile the generated sources. Set `jdk-path` to your JDK home, and set `class-path` / `module-path` to the absolute paths of the bundled `compile-deps` and `external-types` directories:

```hocon title="generator.conf"
generation {
  jdk-path: "path/to/jdkhome"
  javac {
    class-path: "/absolute/path/to/compile-deps/*:/absolute/path/to/external-types/*"
    module-path: "/absolute/path/to/compile-deps:/absolute/path/to/external-types"
  }
}
```

:::note[Windows users]
Wrap the classpath and module path in triple quotes (`"""`) to avoid path-parsing exceptions.
:::

## Step 5: Run the generator

From inside the extracted directory:

```bash
java -jar ConfigGen.jar
```

This produces a `config-build/` output directory containing the compilation log and the generated config JAR. If generation fails, the log is the first place to look.

:::tip
Need the output somewhere else? The `destination` key lets you customize the output directory — see the tool's full option reference.
:::
