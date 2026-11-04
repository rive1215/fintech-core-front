---
name: frontend-feature
description: >-
  Implements one Fintech Core frontend feature under Clean Architecture using
  only documented HTTP contracts. Use when adding Auth, Account, or Transaction
  UI/use cases, scaffolding a feature slice, or when the user invokes
  frontend-feature / Prompt feature implementation.
---

# Skill: frontend-feature

Multistep workflow for FE features. Contract source: `docs/frontend/backend-contract.md`. Do not invent endpoints or DTO fields.

## When to use

User asks to implement a screen/flow (register, login, accounts, freeze, deposit, withdrawal, transfer, history) or runs command `frontend-feature`.

## Workflow

Copy and track:

```
Progress:
- [ ] 1. Inspect
- [ ] 2. Plan
- [ ] 3. Edit incrementally
- [ ] 4. Validate
- [ ] 5. Audit
```

### 1. Inspect

Read:

- `docs/frontend/backend-contract.md`
- `docs/frontend/frontend-workflows.md`
- `docs/frontend/frontend-validation.md`
- `docs/frontend/frontend-architecture.md`
- `docs/frontend/frontend-state.md`

Confirm the target operation exists in `fintech-core-app/src/presentation/app.ts` (and cited DTOs/controllers). If a doc claim lacks a source symbol → `[PENDIENTE]`, do not hard-require it.

### 2. Plan

List files per layer:

| Layer | Responsibility |
|-------|----------------|
| domain | types / error codes mapping |
| application | use case + ports |
| infrastructure | HTTP adapter + token via TokenStore port |
| presentation | hook + UI states |

Name the exact method+path from the contract. No extra calls.

### 3. Edit incrementally

Order: domain types → application use case → infrastructure adapter → presentation hook/UI.

Enforce:

- UI: no Axios/fetch/JWT/localStorage
- application/infrastructure: no React
- create account body: never `userId`
- remote UI: loading | error | empty | success
- strict TypeScript; no unjustified `any`

### 4. Validate

Apply `docs/frontend/frontend-validation.md` (Zod mirrors for auth/transactions; optional `initialBalance >= 0`). Map API `code` / `errors[]` to fields.

Run if available: `pnpm exec tsc --noEmit`, `pnpm test`, `pnpm lint`.

### 5. Audit

Dependency Rule; no invented contracts; no client-side financial engine. Report with the template in `.cursor/commands/frontend-feature.md`.

## Out of scope

Backend edits, new Cursor rules, inventing refresh/logout/roles APIs, installing packages unless the user explicitly requests scaffold/deps.
