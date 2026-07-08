---
name: hackathon-deploy
description: "One-shot submission for the hackathon: build the amd64 image, check it, zip the source, push through the organizer proxy, then go live at buildathon.ltl.sh. Use when the participant is ready for the final end-to-end deploy."
---

# Hackathon Deploy

## Overview

Run the full shipping sequence for the final hackathon submission.

## Workflow

1. Ask the participant to switch to the high-reasoning mode used by this workflow.
2. Read `references/deploy-flow.md`.
3. Build and smoke-test the final image.
4. Run the submission checklist.
5. Zip the source code.
6. Push the image through the proxy.
7. Trigger the live deploy and report the live URL.

## Defaults

Use the repo's standard ports and the team id derived from the participant email unless overridden.

## Safety

Do not skip verification steps unless the participant explicitly accepts the risk.

## Memory

Store the image tag, zip path, registry URL, and live URL in `.agent-memory/`.

## Resources

- `references/deploy-flow.md`
- `scripts/deploy.ps1`