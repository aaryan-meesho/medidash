---
name: hackathon-bootstrap
description: "Create or repair a beginner-friendly hackathon starter project using only React.js for the frontend, Node.js or Go for the backend, and SQLite for storage. Use when a participant asks to start a new project, set up their laptop, install required tools, choose the allowed stack, create Docker files, or make the first locally previewable app for a single-image hackathon submission."
---

# Hackathon Bootstrap

## Overview

Help a non-technical participant go from an empty machine or empty folder to a working app they can preview. Keep participant-facing explanations plain, but execute setup with precise checks.

## Allowed Stack

Use only React.js, Node.js or Go, SQLite, and one Docker image containing the app and database startup.

## Workflow

1. Check whether `.agent-memory/` already exists.
2. If it exists, recontextualize memory before asking new questions.
3. If it does not exist, create it immediately.
4. Ask for the app idea only if it is missing from memory.
5. Run the tool check first and only install software after approval.
6. Keep the code-submission flow manual: source is zipped and uploaded by hand.
7. Create or repair the starter so it has `frontend/`, `backend/`, `db/`, `Dockerfile`, `.dockerignore`, `.env.example`, a short `README.md`, and the required `.agent-memory/` files.
8. Make the first screen usable immediately with a title, one example form, one list view, and an `/api/health` endpoint.
9. Add local commands for building and running the image.
10. Verify the app starts before saying it is ready.
11. Update the memory files after each major step.

## Required Ports

- Frontend React app: `9080`
- Backend Node.js or Go API: `8090`

## Participant Language

Say: "I am setting up your app so you can open it in a browser." Explain stack choices as the allowed building blocks for this hackathon.

## Technical Contract

Read `references/project-contract.md` before creating or repairing a starter.

## Memory Contract

Read `references/memory-contract.md` before first setup and before any resume.

## Resources

- `scripts/check_and_install_tools.ps1`
- `scripts/setup_agent_memory.ps1`
- `scripts/recontextualize_agent_memory.ps1`
- `references/project-contract.md`
- `references/memory-contract.md`