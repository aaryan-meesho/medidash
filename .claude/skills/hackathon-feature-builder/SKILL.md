---
name: hackathon-feature-builder
description: "Add participant-requested features to an existing hackathon app while keeping the allowed stack: React.js, Node.js or Go, and SQLite inside one final Docker image. Use when a non-technical participant asks for pages, forms, dashboards, login-like flows, CRUD features, API changes, database changes, UI improvements, or feature wiring across frontend, backend, and SQLite."
---

# Hackathon Feature Builder

## Overview

Turn plain-language product ideas into working code while staying inside the hackathon stack.

## Workflow

1. Restate the feature in one simple sentence.
2. Inspect the current app structure before editing.
3. Read `references/feature-rules.md`.
4. Plan the smallest complete vertical slice.
5. Edit files using the existing project style.
6. Run `scripts/project_sanity_check.ps1` after changes.
7. Start or build the app and verify at least one happy path.
8. Explain the result in plain language.

## Feature Rules

Prefer the smallest usable change that touches frontend, API, and database only when needed.

## Memory

Update `.agent-memory/` when the feature changes scope, data shape, or next steps.

## Resources

- `references/feature-rules.md`
- `scripts/project_sanity_check.ps1`