---
name: hackathon-zip-code
description: "Zip a hackathon project's source code into one clean file the participant can upload by hand to the organizer's submission folder. Use when a participant asks to zip, package, save, submit, hand in, or back up their code, or to prepare the source for submission. There is no Google Drive, no MCP, and no GitHub — this produces a local zip and tells the participant where to upload it manually."
---

# Hackathon Zip Code

## Overview

Package the source into a clean submission zip and keep secrets out of the archive.

## Workflow

1. Read `references/zip-and-upload.md`.
2. Optionally ask what to name the zip.
3. Build the zip with `scripts/make_code_zip.ps1`.
4. Refuse to continue if secret files are present.
5. Report the absolute zip path and size.
6. Tell the participant to upload the single zip file by hand.

## Safety

Exclude `node_modules/`, build output, `.env`, keys, tokens, `.db` files, and other secrets.

## Memory

Record the zip path in `.agent-memory/`.

## Resources

- `references/zip-and-upload.md`
- `scripts/make_code_zip.ps1`