# Command: frontend-feature

Tarea Agent autocontenida para implementar (o extender) una feature del frontend Fintech Core sin inventar contratos.

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

Según la feature, también el símbolo backend citado en el contrato (p. ej. `@fintech-core-app/src/presentation/app.ts`, controllers/DTOs/use-cases referidos).

Si existe skill de proyecto: `@.cursor/skills/frontend-feature/SKILL.md`.

## Objetivo

Implementar **una** feature alineada a un workflow documentado (Auth, Account o Transaction), respetando Clean Architecture FE y el contrato HTTP real.

## Archivos permitidos

- `src/domain/**`
- `src/application/**`
- `src/infrastructure/**`
- `src/presentation/**`
- Tests bajo `src/**` o `tests/**` que cubran la feature
- Ajustes mínimos de composition root / wiring (`src/main.tsx`, providers) si ya existen

## Archivos fuera de alcance

- Todo `fintech-core-app/**` (solo lectura)
- `docs/frontend/**` salvo lectura
- `.cursor/**` salvo lectura de rules/commands/skills
- Nuevos endpoints, OpenAPI inventado, o cambios de package.json no pedidos explícitamente en la tarea

## Secuencia de trabajo

1. **Inspección:** identificar la feature; localizar endpoint(s) y DTO(s) en `backend-contract.md`; verificar símbolos en backend.
2. **Plan:** listar capas a tocar (domain → application → infrastructure → presentation); marcar `[PENDIENTE]` si falta evidencia.
3. **Edición incremental:** tipos → ports/use case → adaptador HTTP → hook/UI → estados loading/error/empty/success.
4. **Validación:** aplicar `frontend-validation.md`; no enviar campos no documentados; no `userId` en create account.
5. **Auditoría rápida:** Dependency Rule; UI sin Axios/JWT/storage; servicios sin React; sin contratos inventados.

## Criterios de aceptación

- [ ] Solo operaciones presentes en `backend-contract.md`
- [ ] Capas respetan Dependency Rule
- [ ] UI sin I/O/token/storage directo
- [ ] Application/infrastructure sin React
- [ ] Formularios cumplen `frontend-validation.md`
- [ ] Estados loading / error / empty / success donde hay remoto
- [ ] TypeScript sin `any` injustificado
- [ ] No se modificó el backend

## Comandos de validación

Cuando el proyecto FE tenga scripts (hoy el repo puede estar vacío — ejecutar solo si existen):

```bash
pnpm lint
pnpm test
pnpm exec tsc --noEmit
```

Si no hay `package.json`/scripts: reportar `[PENDIENTE]` y validar por revisión estática contra los docs.

## Formato del reporte final

```markdown
## Feature
- Nombre / workflow:
- Endpoints usados (método + path):
- Símbolos backend verificados:

## Cambios
- Archivos creados/modificados:

## Cumplimiento
- Dependency Rule: OK | FAIL
- Contratos: OK | FAIL | PENDIENTE (...)
- Validación formularios: OK | FAIL

## Validación ejecutada
- Comandos y resultado:

## Pendientes
- ...
```
