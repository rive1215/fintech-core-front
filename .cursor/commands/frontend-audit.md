# Command: frontend-audit

Tarea Agent autocontenida para auditar el frontend respecto a arquitectura, estado, workflows, validación y contrato — sin implementar features nuevas salvo fixes mínimos de cumplimiento.

## Contexto a leer con @

Obligatorio:

- `@docs/frontend/backend-contract.md`
- `@docs/frontend/frontend-architecture.md`
- `@docs/frontend/frontend-state.md`
- `@docs/frontend/frontend-workflows.md`
- `@docs/frontend/frontend-validation.md`
- `@.cursor/rules/frontend-architecture.mdc`
- `@.cursor/rules/frontend-react.mdc`
- `@.cursor/rules/frontend-services.mdc`

Código FE existente bajo `@src/` (si aún no hay código, emitir auditoría de “repo vacío / solo docs”).

Opcional verificación backend: `@fintech-core-app/src/presentation/app.ts`.

## Objetivo

Producir un informe de cumplimiento (pass/fail/pendiente) y, solo si el usuario lo autoriza en el mismo prompt, aplicar fixes mínimos. Por defecto: **solo auditoría**.

## Archivos permitidos

- Lectura de todo `src/**`, `docs/frontend/**`, `.cursor/**`
- Escritura solo con autorización explícita del usuario y limitada a fixes de cumplimiento en `src/**`

## Archivos fuera de alcance

- Refactors grandes, nuevas features, cambios de stack
- Modificar backend
- Inventar contratos para “cerrar” gaps

## Secuencia de trabajo

1. Inventariar estructura de carpetas vs capas documentadas.
2. Grep de violaciones: `axios`/`fetch` en presentation; `localStorage`/`sessionStorage`/`jwt` en components; `react` en application/infrastructure.
3. Cruzar llamadas HTTP vs `backend-contract.md`.
4. Revisar estados loading/error/empty/success en pantallas remotas.
5. Revisar formularios vs `frontend-validation.md`.
6. Revisar separación sesión / local / remoto (`frontend-state.md`).
7. Listar `[PENDIENTE]` de los docs base que aún bloquean decisiones (token store, balance wire, stack).

## Criterios de aceptación del informe

- [ ] Cada hallazgo cita archivo FE o doc base
- [ ] Severidad: Critical / Major / Minor / Pendiente
- [ ] Ninguna recomendación introduce endpoints no documentados
- [ ] Matriz de reglas ↔ evidencia incluida

## Comandos de validación

```bash
pnpm lint
pnpm test
pnpm exec tsc --noEmit
```

Más greps manuales:

```bash
# Orientativos — adaptar al shell del entorno
rg "localStorage|sessionStorage" src/presentation
rg "from 'react'|from \"react\"" src/application src/infrastructure
rg "/api/" src/presentation
```

## Formato del reporte final

```markdown
## Resumen
- Cumplimiento global: PASS | FAIL | N/A (sin código)
- Critical: N | Major: N | Minor: N | Pendiente: N

## Hallazgos
| ID | Severidad | Regla/doc | Evidencia | Recomendación |
|----|-----------|-----------|-----------|---------------|
| A1 | Critical | architecture | path:line | ... |

## Contratos
- Endpoints FE vs doc: OK | mismatches...

## Validación ejecutada
- ...

## Siguiente acción sugerida
- Command `frontend-feature` / `frontend-api-contract` / fix puntual
```
