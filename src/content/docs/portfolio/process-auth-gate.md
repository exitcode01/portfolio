---
title: "Process: Auth-Gating a Docusaurus Site on Serverless Infra"
description: A design doc walking through adding an authentication gate to a public docs site using a serverless BaaS platform.
prev: false
next: false
sidebar:
  order: 13
head:
  - tag: meta
    attrs:
      name: robots
      content: "noindex, nofollow"
---

:::note[Sanitized writing sample]
A design/implementation doc I wrote after building this myself. Internal domains and CDN URLs have been genericized.
:::

## Overview

This documents the steps taken to add an authentication gate to a Docusaurus docs site deployed on a serverless backend-as-a-service platform. Unauthenticated users are redirected to a sign-in page and returned to their original destination after login.

## How it works

```
User visits any docs page
        ↓
Root.js checks auth.isUserAuthenticated()
        ↓
Not authenticated → redirect to /app/login.html?redirect=<original URL>
        ↓
User signs in
        ↓
auth-validator checks the company email domain
        ↓
Platform sets session cookie → redirects to original URL
        ↓
Root.js checks again → authenticated → docs render normally
```

## Code changes

### 1. Load the platform SDK on every docs page

**File:** `docusaurus.config.js`

```js
scripts: [
  { src: '<platform-cdn>/sdk/js/4.4.0/webSDK.js', async: false },
  { src: '/__platform/sdk/init.js', async: false },
],
```

`async: false` ensures both scripts execute before the page renders, so the SDK is available by the time `Root.js` runs.

### 2. Create the auth gate — `src/theme/Root.js`

This swizzles Docusaurus's `Root` component, which wraps every page, and checks auth state on mount:

```js
import React, { useEffect, useState } from 'react';

export default function Root({ children }) {
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Skip the auth gate in local development — the SDK isn't available on localhost
    if (process.env.NODE_ENV === 'development') {
      setAuthChecked(true);
      return;
    }

    // Safety fallback: don't block the page if the SDK failed to load
    if (typeof window.platformAuth === 'undefined') {
      setAuthChecked(true);
      return;
    }

    window.platformAuth.isUserAuthenticated()
      .then(() => setAuthChecked(true))
      .catch(() => {
        const redirect = encodeURIComponent(window.location.href);
        window.location.replace('/app/login.html?redirect=' + redirect);
      });
  }, []);

  if (!authChecked) {
    return null; // Prevents a flash of docs content before the auth check resolves
  }

  return <>{children}</>;
}
```

**Key decisions:**
- Render `null` while the check is pending — unauthenticated users never see docs content flash on screen.
- Use `window.location.replace()`, not `href =`, so the redirect doesn't create a back-button loop.
- Bypass the gate entirely under `NODE_ENV === 'development'` so local docs writing isn't blocked by auth.
- Fail open (not closed) if the SDK didn't load — a broken SDK shouldn't take the whole site down.

### 3. Post-login redirect — `static/login.html`

The sign-in widget's `service_url` is set dynamically from the `?redirect=` query param, so users land back on the page they came from instead of always landing on a default page:

```js
const params = new URLSearchParams(window.location.search);
const redirectTo = params.get('redirect');

function isSameOrigin(url) {
  try {
    return new URL(url).origin === window.location.origin;
  } catch {
    return false;
  }
}

const config = {
  signin_providers_only: true,
  service_url: redirectTo && isSameOrigin(redirectTo) ? redirectTo : '/app/'
};
platformAuth.signIn("login-element", config);
```

The `isSameOrigin()` check exists specifically to close off an open-redirect vector: without it, `?redirect=` could be used to bounce a signed-in user to an attacker-controlled URL.

### 4. Fixing a domain-check bug

**File:** `functions/auth-validator/index.js`

The original allow-list checked for a bare domain fragment, but `email.split("@")[1]` returns the full domain — so the comparison never matched and everyone was rejected:

```js
// Before (broken): compares "example" to "example.com" — never matches
const ALLOWED_DOMAINS = ["example"];

// After (fixed)
const ALLOWED_DOMAINS = ["example.com"];
```

A one-line fix, but the kind that's invisible until someone actually tries to sign in — which is exactly what happened.

## Platform console setup

For each environment this is deployed to:

- **Sign-in methods:** enable the social sign-in provider. Because `signin_providers_only: true` hides the email/password form, forgetting this step renders an empty white box where the sign-in widget should be.
- **Sign-up settings:** enable self-signup, restricted to the company domain by the `auth-validator` function — users provision themselves on first visit, with no manual account creation needed.

## Local development

| Mode | Command | Auth behavior |
|---|---|---|
| Docs writing | `npm run start` | Auth skipped (`NODE_ENV=development`) — all pages load directly |
| Full auth flow test | Build + local serve | Auth guard is active, but session cookies don't work on `localhost` |
| Real auth test | Deploy + open the real domain | Full flow works end to end |

The sign-in iframe relies on cookie domain matching, which `localhost` can't satisfy — so the actual sign-in flow can only be verified on a deployed domain, not locally. That constraint shaped the whole "fail open in dev" decision above: without it, local docs writing would have been broken every day pending a real deploy to test against.
