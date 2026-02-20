---
name: skill-commit
description: >
  Creates professional git commits following conventional-commits format.
  Trigger: When creating commits, after completing code changes, when user asks to commit.
license: Apache-2.0
metadata:
  author: davidleonmayor
  version: "1.0"
  scope: [root, backend, frontend, landing, skills]
  auto_invoke:
    - "Creating a git commit"
    - "Committing changes"
---

## Critical Rules

- ALWAYS use conventional-commits format: `type(scope): description`
- ALWAYS keep the first line under 72 characters
- ALWAYS ask for user confirmation before committing
- NEVER be overly specific (avoid counts like "6 subsections", "3 files")
- NEVER include implementation details in the title
- NEVER use `-n` flag unless user explicitly requests it
- NEVER use `git push --force` or `git push -f` (destructive, rewrites history)
- NEVER proactively offer to commit - wait for user to explicitly request it

---

## Commit Format

```
type(scope): concise description

- Key change 1
- Key change 2
- Key change 3
```

### Types

| Type | Use When |
|------|----------|
| `feat` | New feature or functionality |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `chore` | Maintenance, dependencies, configs |
| `refactor` | Code change without feature/fix |
| `test` | Adding or updating tests |
| `perf` | Performance improvement |
| `style` | Formatting, no code change |
| `ci` | CI/CD pipeline changes |

### Scopes

| Scope | When |
|-------|------|
| `frontend` | Changes in `frontend/` |
| `backend` | Changes in `backend/` |
| `landing` | Changes in `landing/` |
| `skills` | Changes in `skills/` |
| `ci` | Changes in `.github/` |
| `docs` | Documentation changes |
| `UI` | UI-only changes across frontend/landing |
| `API` | API-only changes in backend |
| `UI/API` | Changes spanning both frontend and backend |
| *omit* | Multiple scopes or root-level |

---

## Good vs Bad Examples

### Title Line

```
# GOOD - Concise and clear
feat(frontend): add student registration form
fix(backend): resolve JWT validation on refresh
refactor(frontend): implement scalable modular architecture
chore(skills): add commit skill configuration
feat(UI/API): connect teachers section with backend

# BAD - Too specific or verbose
feat(frontend): add student registration form with 5 fields and email validation using regex
fix(backend): fix the bug in auth controller on line 45
chore(skills): add comprehensive commit documentation covering 8 sections
```

### Body (Bullet Points)

```
# GOOD - High-level changes
- Add student CRUD endpoints
- Connect frontend forms with backend API
- Update authentication middleware

# BAD - Too detailed
- Add POST /api/students with name, email, code fields
- Update lines 45-67 in StudentsPage.tsx
- Add validateJwt middleware to 3 routes
```

---

## Workflow

1. **Analyze changes**
   ```bash
   git status
   git diff --stat HEAD
   git log -3 --oneline  # Check recent commit style
   ```

2. **Draft commit message**
   - Choose appropriate type and scope
   - Write concise title (< 72 chars)
   - Add 2-5 bullet points for significant changes

3. **Present to user for confirmation**
   - Show files to be committed
   - Show proposed message
   - Wait for explicit confirmation

4. **Execute commit**
   ```bash
   git add <files>
   git commit -m "$(cat <<'EOF'
   type(scope): description

   - Change 1
   - Change 2
   EOF
   )"
   ```

---

## Decision Tree

```
Single file changed?
├─ Yes → May omit body, title only
└─ No → Include body with key changes

Multiple scopes affected?
├─ Yes → Omit scope: `feat: description`
│        Or use combined scope: `feat(UI/API): description`
└─ No → Include scope: `feat(frontend): description`

Fixing a bug?
├─ User-facing → fix(scope): description
└─ Internal/dev → chore(scope): fix description

Adding documentation?
├─ Code docs (docstrings) → Part of feat/fix
└─ Standalone docs → docs: or docs(scope):
```

---

## Commands

```bash
# Check current state
git status
git diff --stat HEAD

# Standard commit
git add <files>
git commit -m "type(scope): description"

# Multi-line commit
git commit -m "$(cat <<'EOF'
type(scope): description

- Change 1
- Change 2
EOF
)"

# Amend last commit (same message)
git commit --amend --no-edit

# Amend with new message
git commit --amend -m "new message"
```
