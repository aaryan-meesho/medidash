---
name: hackathon-preview
description: "Start, restart, or preview a hackathon project locally so non-technical participants can open the app in a browser. Use when the user says show my app, run it locally, preview changes, start Docker, open the project, check if it works, or get a local URL for a React plus Node or Go plus SQLite single-image project."
---

# Hackathon Preview

## Overview

Make the app viewable with the least explanation possible. Prefer Docker preview because judging uses an image.

## Workflow

1. Inspect the project for Docker and app entry points.
2. Run `scripts/start_local_preview.ps1` from the project root.
3. If it fails, collect the exact failing command and logs, then use `hackathon-bugfix`.
4. Give the participant the frontend URL and the backend health URL through the same origin.
5. Keep long-running preview processes open only when useful.

## Participant Language

Say: "Your app is running here" and give the frontend URL.

## Memory

If `.agent-memory/` exists, read it before starting the app and record the outcome after preview succeeds or fails.

## Resource

- `scripts/start_local_preview.ps1`