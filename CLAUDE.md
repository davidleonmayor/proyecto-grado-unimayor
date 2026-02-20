# Repository Guidelines

> **AI Skills are installed.** Each skill is a focused, reusable set of instructions.
> For full details on any skill, read its [SKILL.md](skills/{name}/SKILL.md)

### Available Skills

| Skill | Description | Reference |
|-------|-------------|-----------|
| `backend-context` | Backend architecture, patterns and conventions for the Express.js 5 API. Trigger: When working on backend code, API routes, controllers, or database. | [SKILL.md](skills/backend-context/SKILL.md) |
| `frontend-context` | Frontend architecture, patterns and conventions for the Next.js 15 app. Trigger: When working on frontend code, components, pages, or API integration. | [SKILL.md](skills/frontend-context/SKILL.md) |
| `project-info` | General monorepo structure and component overview. Trigger: When AI needs project context or component locations. | [SKILL.md](skills/project-info/SKILL.md) |
| `skill-creator` | Creates new AI agent skills following the Agent Skills spec. Trigger: When user asks to create a new skill, add agent instructions, or document patterns for AI. | [SKILL.md](skills/skill-creator/SKILL.md) |
| `skill-sync` | Synchronizes skill metadata to AGENTS.md Auto-invoke sections. Trigger: When syncing skill metadata to AGENTS.md. | [SKILL.md](skills/skill-sync/SKILL.md) |
| `skill-commit` | Creates professional git commits following conventional-commits format. Trigger: When creating commits, after completing code changes, when user asks to commit. | [SKILL.md](skills/skill-commit/SKILL.md) |

### Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action | Skill |
|--------|-------|
| Creating new skills | `skill-creator` |
| Syncing skill metadata to AGENTS.md | `skill-sync` |
| Creating a git commit | `skill-commit` |
| Committing changes | `skill-commit` |

---

## How to Use

- **Read a skill** before starting a task it covers — the SKILL.md has patterns, examples, and decision trees.
- **Auto-invoke skills** are triggered automatically when your action matches the table above.
- **Combine skills** when a task spans multiple domains (e.g., creating a new API endpoint may use both `backend-context` and `frontend-context`).

---

## Project Overview

Monorepo for the university graduation project (UniMayor).

| Component | Stack | Location |
|-----------|-------|----------|
| Frontend | Next.js 15 (App Router) | `frontend/` |
| Backend | Express.js 5 | `backend/` |
| Landing | Astro 5 | `landing/` |
| AI Skills | Shell + Markdown | `skills/` |

---

## Development Commands

```bash
# Dev
pnpm dev              # Start all services
pnpm dev:frontend     # Frontend only
pnpm dev:backend      # Backend only
pnpm dev:landing      # Landing only

# Build
pnpm build            # Build all
pnpm build:frontend   # Build frontend
pnpm build:backend    # Build backend
pnpm build:landing    # Build landing

# Test
pnpm test             # Run all tests

# Docker
docker compose up     # Start with Docker
docker compose build  # Rebuild images
```

---

## Commit Guidelines

- Use [Conventional Commits](https://www.conventionalcommits.org/) format: `type(scope): description`
- Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `ci`
- Keep the subject line under 72 characters
- Reference issue numbers when applicable
