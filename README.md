<img width="250" height="70" alt="logo-light" src="https://github.com/user-attachments/assets/ab45ecc7-adad-42e2-84bd-a87145fbc01b" />
<br/><br/>

Prevent critical documentation from disappearing. A simple CI check that catches when important API docs get accidentally deleted.

## The Problem

Your teammate refactors the docs to "improve organization." Three weeks later, support tickets spike because the authentication section vanished. Sound familiar?

## Install

```bash
npm install -g docguard
```

## Use

```bash
# In your PR pipeline
docguard check

# Output when something's wrong:
✗ Authentication removed from docs/api/auth.md:45
  "API key" → "access token"

  This change removed critical terms. Verify this is intentional.
```

## Quick Start

```yaml
# .github/workflows/docs.yml
name: Documentation Check
on: [pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npx docguard check
```

That's it. No configuration needed to start.
