# Command: frontend-api-contract

Tarea Agent autocontenida para alinear o auditar el cliente HTTP / tipos del frontend contra el contrato backend real.

## Contexto a leer con @

Obligatorio:

- `@docs/frontend/backend-contract.md`
- `@docs/frontend/frontend-validation.md`
- `@.cursor/rules/frontend-services.mdc`
- `@fintech-core-app/src/presentation/app.ts`

Según gap detectado:

- Controllers: `@fintech-core-app/src/presentation/controllers/`
- DTOs Zod: `@fintech-core-app/src/presentation/dto/`
- DTOs use-case: `@fintech-core-app/src/use-cases/dto/`
- `@fintech-core-app/src/presentation/middlewares/ErrorHandler.ts`
- `@fintech-core-app/src/presentation/middlewares/AuthMiddleware.ts`

Si existe skill: `@.cursor/skills/frontend-api-contract/SKILL.md`.

## Objetivo

Verificar que tipos, adaptadores y llamadas HTTP del FE coinciden **exactamente** con rutas, bodies, responses y `code` documentados. Corregir desalineaciones en el frontend únicamente. Actualizar `docs/frontend/backend-contract.md` solo si el usuario lo pide y el cambio está observado en código backend.

## Archivos permitidos

- `src/domain/**` (tipos)
- `src/application/**` (ports / DTOs de aplicación FE)
- `src/infrastructure/**` (HttpClient, adaptadores)
- Tests de contrato/fixtures HTTP
- Lectura de `docs/frontend/backend-contract.md` (escritura solo si se solicita explícitamente y hay evidencia backend)

## Archivos fuera de alcance

- `src/presentation/**` (salvo que un tipo compartido rompa el build y se pida fix mínimo de imports)
- Modificar `fintech-core-app/**`
- Inventar endpoints o campos “para el futuro”
- Cambiar reglas financieras del servidor

## Secuencia de trabajo

1. Extraer del FE la lista de paths/métodos/campos usados.
2. Cruzar 1:1 con `backend-contract.md` y `app.ts`.
3. Para cada mismatch: clasificar `inventado` | `faltante en FE` | `shape incorrecto` | `[PENDIENTE]` (p. ej. wire de `balance`).
4. Corregir tipos/adaptadores FE; fixtures de test alineadas al envelope real.
5. Confirmar Auth: Bearer solo en rutas protegidas; register/login públicos.
6. Confirmar create account: sin `userId` en body.

## Criterios de aceptación

- [ ] Ningún path FE fuera de `app.ts` / `backend-contract.md`
- [ ] Bodies limitados a campos documentados
- [ ] Códigos de error manejados ⊆ catálogo documentado (resto genérico)
- [ ] Envelopes `success` / `fail` respetados
- [ ] `[PENDIENTE]` explícitos, no convertidos en tipos inventados “seguros”

## Comandos de validación

```bash
pnpm exec tsc --noEmit
pnpm test
```

Si no hay toolchain FE: diff estático + tabla de verificación en el reporte.

## Formato del reporte final

```markdown
## Contrato API — auditoría FE

| Método | Path | FE | Backend doc | Estado |
|--------|------|----|-------------|--------|
| ... | ... | sí/no | sí | OK / MISMATCH / PENDIENTE |

## Mismatches corregidos
- ...

## Pendientes (sin evidencia wire/código)
- balance JSON shape
- ...

## Archivos tocados
- ...
```
