---
name: hackathon-submission-check
description: "Run the final judging readiness checklist for a hackathon app. Use when the participant asks if the project is ready to submit, wants a final pass/fail review, or needs the complete submission flow checked end to end."
---

# Hackathon Submission Check

## Overview

Check the full judging path end to end and return a clear pass/fail list with exact next actions.

## Workflow

1. Read `references/final-checklist.md`.
2. Verify the app builds and starts.
3. Verify the preview URL works.
4. Verify the zip step produces a clean source archive.
5. Verify the final image workflow and deploy path if applicable.
6. Return pass/fail with the next fix for each failure.

## Memory

Capture the final readiness state in `.agent-memory/`.

## Resources

- `references/final-checklist.md`
- `scripts/check_submission.ps1`