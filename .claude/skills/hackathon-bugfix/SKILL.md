---
name: hackathon-bugfix
description: "Diagnose and fix common hackathon app failures in React, Node.js or Go, SQLite, Docker, code zipping, and proxy registry setup. Use when a non-technical participant says the page is blank, a button does nothing, data is not saving, Docker will not start, SQLite is broken, the image build fails, the code zip fails, the app crashes, or an error message is confusing."
---

# Hackathon Bugfix

## Overview

Find the first real failure, explain it simply, and repair the app with the smallest safe change.

## Workflow

1. Reproduce or inspect the failure.
2. Read `references/common-failures.md`.
3. Collect diagnostics with `scripts/collect_diagnostics.ps1`.
4. Fix the cause, not just the symptom.
5. Re-run the smallest check that proves the issue is gone.
6. Summarize what changed in plain language.

## Safety

Do not widen the fix beyond the failing slice unless the evidence requires it.

## Memory

Record the exact error, the fix, and any remaining blocker in `.agent-memory/`.

## Resources

- `references/common-failures.md`
- `scripts/collect_diagnostics.ps1`