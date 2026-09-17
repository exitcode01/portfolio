---
title: "Troubleshooting: Linux /tmp noexec Error"
description: A problem-cause-fix-verify troubleshooting writeup for a real CLI startup bug.
prev: false
next: false
sidebar:
  order: 6
head:
  - tag: meta
    attrs:
      name: robots
      content: "noindex, nofollow"
---

:::note[Sanitized writing sample]
The AI coding assistant this troubleshooting page was written for is referred to here as **Nova**; internal download links and package registry URLs have been removed.
:::

:::tip[Fixed in 2.1.0-beta]
This issue has been fixed in **Nova 2.1.0-beta**. Try updating to that version before applying the workaround below.
:::

## Could not run the Nova CLI: initialization error (Linux)

Running Nova on Linux fails with:

```text
error: Failed to initialize render library: Failed to open library "/tmp/.<random-name>.so":
/tmp/.<random-name>.so: failed to map segment from shared object
```

## Why it happens

Nova extracts a temporary shared library (`.so`) into `/tmp` and loads it at runtime. If `/tmp` is mounted with the `noexec` option, Linux refuses to execute binaries from it, so the terminal UI can't start.

## Fix option A (recommended): use a temp directory in your home

1. Create a temp directory:

   ```bash
   mkdir -p "$HOME/tmp"
   ```

2. Run Nova using it:

   ```bash
   TMPDIR="$HOME/tmp" nova
   ```

3. Make it permanent by adding it to your shell profile:

   ```bash
   export TMPDIR="$HOME/tmp"
   ```

   Then reload your shell:

   ```bash
   source ~/.bashrc
   ```

## Fix option B: remount /tmp with exec (admin access required)

If you have admin access:

```bash
sudo mount -o remount,exec /tmp
```

Then run:

```bash
nova
```

## Verify

```bash
mount | grep /tmp
```

You should see `exec` (not `noexec`) in the mount options.
