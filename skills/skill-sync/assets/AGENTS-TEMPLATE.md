# Repository Guidelines

> **AI Skills are installed.** Each skill is a focused, reusable set of instructions.
> For full details on any skill, read its [SKILL.md](skills/{name}/SKILL.md)

<!-- SKILLS_TABLE -->

<!-- AUTO_INVOKE -->

---

## How to Use

- **Read a skill** before starting a task it covers — the SKILL.md has patterns, examples, and decision trees.
- **Auto-invoke skills** are triggered automatically when your action matches the table above.
- **Combine skills** when a task spans multiple domains (e.g., creating a new API endpoint may use both `prowler-api` and `prowler-test-api`).

---

<!-- PROJECT_INFO -->

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
