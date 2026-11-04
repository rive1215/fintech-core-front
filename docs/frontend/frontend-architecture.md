# Frontend Architecture — Fintech Core

**Fecha del análisis:** 2026-11-03  
**Alcance:** Decisiones de Clean Architecture para `fintech-core-front` derivadas exclusivamente del backend `fintech-core-app`.  
**Estado del repo FE:** vacío al momento del análisis (sin `package.json` ni código).  
**Prohibición:** no inventar contratos HTTP; la arquitectura FE debe adaptarse al backend observado en `docs/frontend/backend-contract.md`.

---

## 1. Hechos observados que condicionan la arquitectura

| Hecho | Fuente backend |
|-------|----------------|
| Capas: domain → use-cases → infrastructure → presentation | Estructura `src/` de `fintech-core-app` |
| Casos de uso HTTP: Auth, Account, Transaction (+ GetBalance) | `src/presentation/app.ts` + `src/use-cases/*` |
| Autenticación Bearer JWT; sin roles | `AuthMiddleware.ts`, `JwtTokenService.ts` |
| Validación de entrada con Zod en presentación | `presentation/dto/*`, `validateRequest.ts` |
| Errores tipados por `code` | `ErrorHandler.ts` |
| Dinero con `Decimal` en dominio | `Account.ts`, DTOs de cuenta |
| Ownership por cuenta no enforced en API | Controllers de account/transaction |

El frontend debe **espejar la separación de responsabilidades**, no copiar Prisma ni Express.

---

## 2. Capas propuestas (Clean Architecture FE)

```
fintech-core-front/
  src/
    domain/           # Tipos, entidades de lectura, errores de dominio FE
    application/      # Casos de uso / ports (interfaces) que orquestan flujos
    infrastructure/   # HTTP client, storage de token, adaptadores
    presentation/     # UI (páginas, componentes, hooks de vista)
```

### 2.1 Domain

Responsabilidad: modelos y reglas **independientes** de React y de fetch.

Incluir (derivado del backend):

- Tipos: `UserPublic`, `Account`, `AccountStatus`, `TransactionHistoryItem`, resultados de movimiento.
- Errores de aplicación mapeables desde `code` del API (`InsufficientFunds`, `AccountFrozen`, etc.).
- Constantes de status/type alineadas a enums Prisma/dominio: `ACTIVE|FROZEN`, `DEPOSIT|WITHDRAWAL|TRANSFER`, `PENDING|COMPLETED|FAILED`.

**No incluir:** llamadas HTTP, JSX, almacenamiento de token.

### 2.2 Application (use cases FE)

Un caso de uso FE por operación HTTP confirmada:

| Caso de uso FE | Puerto HTTP |
|----------------|-------------|
| `RegisterUser` | `POST /api/auth/register` |
| `Login` | `POST /api/auth/login` |
| `ListAccounts` | `GET /api/accounts` |
| `CreateAccount` | `POST /api/accounts` |
| `GetAccountBalance` | `GET /api/accounts/:accountId/balance` |
| `FreezeAccount` | `PATCH /.../freeze` |
| `UnfreezeAccount` | `PATCH /.../unfreeze` |
| `TransferMoney` | `POST /api/transactions/transfer` |
| `DepositFunds` | `POST /api/transactions/deposit` |
| `WithdrawFunds` | `POST /api/transactions/withdrawal` |
| `GetTransactionHistory` | `GET /api/transactions/history/:accountId` |

Cada use case depende de **ports** (interfaces), p. ej. `AuthApi`, `AccountApi`, `TransactionApi`, `TokenStore`.

### 2.3 Infrastructure

- `HttpClient`: base URL configurable; JSON; adjunta Bearer si hay token.
- Adaptadores que implementan los ports API.
- `TokenStore` (p. ej. `sessionStorage` / `localStorage` / memoria) — **decisión de almacenamiento [PENDIENTE]**; el backend no la prescribe.
- Mapeo de respuestas envelope `{ status, data, message?, code?, errors? }` → resultado tipado o error tipado.

### 2.4 Presentation

- Pantallas por flujo: Auth, Cuentas, Operaciones, Historial.
- Componentes sin conocer URLs ni headers.
- Validación de formularios alineada a Zod del backend (ver `frontend-validation.md`).
- Tras 401 `UNAUTHORIZED` / `INVALID_TOKEN`: limpiar sesión y redirigir a login.

---

## 3. Dependencias entre capas (regla)

```
presentation → application → domain
infrastructure → application (implementa ports) + domain
presentation NO importa infrastructure directamente salvo composition root / DI
```

Composition root (único lugar que cablea adaptadores HTTP + React): p. ej. `main.tsx` / provider de app.

---

## 4. Decisiones derivadas del Clean Architecture backend

1. **UI no es dominio:** reglas de montos > 0, cuentas distintas en transfer, estados ACTIVE/FROZEN viven en domain/application, no solo en CSS/disabled.
2. **Contrato = DTO observados:** tipar requests/responses como en `backend-contract.md`.
3. **Token fuera de componentes de negocio:** solo infrastructure + un AuthSession en application.
4. **No acoplar a Prisma / Decimal.js del backend:** modelar `balance` como tipo FE acordado tras confirmar wire format (`[PENDIENTE]`).
5. **Defensa en profundidad en UI:** aunque el API permita operar cuentas ajenas por UUID, la UI solo ofrece cuentas devueltas por `GET /api/accounts`.
6. **No crear endpoints ficticios** en mocks de arquitectura; si se mockea, mockear solo las 11 operaciones listadas.

---

## 5. Stack frontend

**[PENDIENTE]** El repositorio `fintech-core-front` está vacío. No hay evidencia en código de Vite, Next, CRA, Redux, etc.

Decisiones mínimas recomendadas (no son contrato del backend; quedan a confirmar en Prompt 2+):

- SPA TypeScript + React.
- Router para Auth vs área autenticada.
- Cliente HTTP nativo `fetch` o librería delgada; sin inventar BFF.
- Validación con Zod espejando schemas de presentación del backend.

Cualquier elección de framework debe respetar las capas anteriores.

---

## 6. Relación con documentos hermanos

| Documento | Uso |
|-----------|-----|
| `backend-contract.md` | Fuente de verdad HTTP |
| `frontend-state.md` | Qué estado vive dónde |
| `frontend-workflows.md` | Secuencias UX ↔ API |
| `frontend-validation.md` | Reglas de formularios |

---

## 7. `[PENDIENTE]`

- Elección concreta de bundler/framework y librería de estado.
- Persistencia del JWT (session vs local vs memoria).
- Estrategia de composition root / DI.
- Confirmación de serialización de `balance` y fechas.
- Si el backend añadirá ownership checks (afecta mensajes de error, no la capa).

---

## 8. Prohibición explícita

**Prohibido** diseñar capas o módulos “para endpoints futuros”, inventar APIs GraphQL/WebSocket, o documentar roles/permisos no presentes en `fintech-core-app`.
