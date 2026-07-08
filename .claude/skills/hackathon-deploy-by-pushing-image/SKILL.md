---
name: hackathon-deploy-by-pushing-image
description: "Verify the image locally, then push it through the organizer Docker proxy for hackathon judging. Use when the participant wants to publish the image to the shared registry or move from local testing to team deployment."
---

# Hackathon Deploy By Pushing Image

## Overview

Prepare the local image, confirm it is healthy, and push it through the organizer proxy only after approval.

## Workflow

1. Verify the image locally first.
2. Ask for the participant's Meesho organization email unless it is already in `.agent-memory/`.
3. Derive the team id from the email prefix.
4. Read `references/proxy-registry.md`.
5. Push the image through the organizer registry proxy.
6. Report the final image reference in plain language.

## Safety

Do not push until the participant or organizer confirms the action.

## Memory

Store the email-derived team id and pushed image tag in `.agent-memory/`.

## Resources

- `references/proxy-registry.md`
- `scripts/push_to_proxy_registry.ps1`