# TOOLS.md - NeoDaemon Environment

## Main Server

Hostname:
bunker-ia

User:
openclaw

Purpose:

Main server for NeoDaemon and OpenClaw.

## Main Repository

Repository:

/openclaw/workspace/git_clean/neodaemon_v1

Default branch:

main

Working rule:

Never work directly on main.
Create branch → PR → Validation → Merge.

## Services

OpenClaw Gateway

systemctl --user status openclaw-gateway.service

OpenClaw Dashboard

systemctl --user status openclaw-dashboard.service

OpenClaw Dashboard Web

systemctl --user status openclaw-dashboard-web.service

OpenClaw RAG

systemctl --user status openclaw-rag-v2.service

## Known Ports

Gateway:

127.0.0.1:18789

Gateway Auth:

127.0.0.1:18791

Dashboard:

100.117.135.114:8090

API:

0.0.0.0:8000

## Image Inbox

Current goal:

Minimal Image Inbox.

Requirements:

- upload single image
- jpg/png/webp
- fixed folder
- no overwrite
- sanitized filenames
- visible by NeoDaemon

Storage:

/openclaw/data/image-inbox/uploads

Metadata:

/openclaw/data/image-inbox/meta

## Git Workflow

Preferred flow:

Branch
↓
PR
↓
PR Guardian
↓
Human approval
↓
Merge
↓
Cleanup

Never:

- direct modifications on main
- bypass PR Guardian
- force merge
- declare PASS without evidence
