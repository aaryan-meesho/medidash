---
name: hackathon-single-image-build
description: "Build and smoke-test the final hackathon Docker image. Use when the participant needs the one ship-ready image for judging, a final container sanity check, or a build that must work on the required ports."
---

# Hackathon Single Image Build

## Overview

Build the judge-ready image and prove it starts cleanly with the required app ports.

## Workflow

1. Read `references/single-image-contract.md`.
2. Build the final image with the repo's build script.
3. Smoke test the image locally.
4. Confirm the frontend and API ports match the contract.
5. Report success or the smallest blocking failure.

## Required Behavior

Use the one-image workflow only; do not split the app into separate deploy artifacts.

## Memory

Record the image tag and test outcome in `.agent-memory/`.

## Resources

- `references/single-image-contract.md`
- `scripts/build_single_image.ps1`