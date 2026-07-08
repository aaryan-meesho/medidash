---
name: hackathon-db-helper
description: "Make safe SQLite schema and data changes for hackathon apps. Use when a participant needs saved records, schema changes, migrations, seed data, or database repair."
---

# Hackathon DB Helper

## Overview

Handle SQLite changes safely and keep the app inside the allowed stack.

## Workflow

1. Inspect the current schema and app data flow.
2. Read `references/sqlite-rules.md`.
3. Make the smallest schema or data change that satisfies the request.
4. Verify the app still reads and writes correctly.
5. Keep participant-facing language simple.

## Safety Rules

Avoid destructive data changes unless the participant explicitly wants them.

## Memory

Update `.agent-memory/` when the schema, seed data, or storage path changes.

## Resources

- `references/sqlite-rules.md`
- `scripts/sqlite_smoke_check.ps1`