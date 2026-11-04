---
name: frontend-api-contract
description: >-
  Aligns or audits Fintech Core frontend HTTP types and adapters against the
  real backend contract. Use when checking API mismatch, DTO drift, envelope
  mapping, Bearer auth wiring, or when the user invokes frontend-api-contract.
---

# Skill: frontend-api-contract

Keep FE HTTP surface ⊆ documented backend. Primary doc: `docs/frontend/backend-contract.md`. Backend routes: `fintech-core-app/src/presentation/app.ts`.

## When to use

Contract audits, fixing invented fields/paths, wiring HttpClient envelopes, or command `frontend-api-contract`.

## Workflow

```
Progress:
- [ ] 1. Inventory FE calls/types
- [ ] 2. Diff vs backend-contract + app.ts
- [ ] 3. Classify mismatches
- [ ] 4. Fix FE only
- [ ] 5. Report
```

### 1. Inventory

Collect from `src/infrastructure` and ports: method, path, request fields, response `data` shape, error `code` handling.

### 2. Diff

For each call, verify against `docs/frontend/backend-contract.md` and confirm the route still exists in `app.ts`. Check Zod/DTO sources cited in the doc when shapes disagree.

### 3. Classify

| Class | Action |
|-------|--------|
| Invented in FE | Remove or stop calling |
| Missing in FE | Add only if feature needs a **documented** endpoint |
| Wrong shape | Align to documented DTO |
| No wire evidence | `[PENDIENTE]` (e.g. `balance` Decimal JSON) — do not guess a fake schema as mandatory |

### 4. Fix FE only

- Success envelope `{ status: 'success', data }` (+ `message` on money mutations)
- Fail `{ status: 'fail'|'error', code, message, errors? }`
- Bearer on protected routes only
- `POST /api/accounts` without `userId`
- Error catalog: only documented codes get specific handling

Do not modify `fintech-core-app`. Do not edit `docs/frontend/*` unless the user asks and backend code proves the change.

### 5. Report

Use the table format in `.cursor/commands/frontend-api-contract.md`. Run `pnpm exec tsc --noEmit` / `pnpm test` when scripts exist.

## Non-negotiables

- No new endpoints, query params, or DTO properties
- No financial rule reimplementation
- Services remain React-free
