# Backend Contract — Fintech Core

**Fecha del análisis:** 2026-11-03  
**Alcance:** Contrato HTTP real del repositorio `fintech-core-app` (rutas, DTOs, códigos HTTP, autenticación y errores).  
**Fuente de verdad:** código TypeScript del backend.  
**Prohibición:** no inventar endpoints, query params, campos de body/response, códigos de error ni comportamientos no observados en el código fuente.

---

## 1. Backend localizado

| Ítem | Valor observado |
|------|-----------------|
| Carpeta raíz | `fintech-core-app/` |
| Package | `package.json` → name `fintech-core-app` |
| Package manager | `devEngines.packageManager` → pnpm `^11.21.0` |
| Entrada HTTP | `src/server.ts` → `createApp()` en `src/presentation/app.ts` |
| Puerto | `process.env.PORT ?? 3000` |
| Stack | Express 5, Zod, JWT (jsonwebtoken), Prisma 7 + `@prisma/adapter-pg`, bcrypt, decimal.js, Vitest |
| CORS | `app.use(cors())` sin origin restringido (`src/presentation/app.ts`) |
| Body parser | `express.json()` |

Variables de entorno leídas en código:

| Variable | Uso | Fuente |
|----------|-----|--------|
| `DATABASE_URL` | Obligatoria al crear la app | `src/presentation/app.ts` |
| `JWT_SECRET` | Firma JWT; default `'default_secret'` | `src/infrastructure/services/JwtTokenService.ts` |
| `JWT_EXPIRES_IN` | Expiración; default `'1h'` | `JwtTokenService.ts` |
| `PORT` | Puerto HTTP; default `3000` | `src/server.ts` |

---

## 2. Envelope de respuesta

### Éxito

Forma observada en controllers:

```json
{
  "status": "success",
  "data": {}
}
```

Mutaciones de transacciones (`transfer`, `deposit`, `withdrawal`) añaden `message` (string fijo en español). Fuentes: `TransactionController.ts`.

### Fallo de validación Zod

```json
{
  "status": "fail",
  "code": "VALIDATION_ERROR",
  "message": "Error de validación en los datos de entrada",
  "errors": [
    { "field": "email", "message": "..." }
  ]
}
```

Fuente: `src/presentation/middlewares/validateRequest.ts` → HTTP 400.

### Fallo de dominio / auth / Prisma / interno

```json
{
  "status": "fail" | "error",
  "code": "<CODE>",
  "message": "<texto>"
}
```

Fuente: `src/presentation/middlewares/ErrorHandler.ts`, `AuthMiddleware.ts`, validaciones inline en controllers.

---

## 3. Endpoints confirmados

Registro de rutas: `src/presentation/app.ts`.

### 3.1 Auth (público)

#### `POST /api/auth/register`

| Aspecto | Contrato observado |
|---------|-------------------|
| Auth | No |
| Validación | `RegisterUserSchema` (`src/presentation/dto/AuthDTOs.ts`) |
| Body | `name` string 3–100; `email` email; `password` string min 8 |
| Caso de uso | `RegisterUserUseCase` |
| HTTP éxito | 201 |
| `data` | `{ id, email, fullName, createdAt }` (`RegisterUserOutputDTO`) |
| Errores típicos | `VALIDATION_ERROR` 400; `USER_ALREADY_EXISTS` 409; `DUPLICATE_FIELD` 409 |

#### `POST /api/auth/login`

| Aspecto | Contrato observado |
|---------|-------------------|
| Auth | No |
| Validación | `LoginSchema` |
| Body | `email` email; `password` string min 1 |
| Caso de uso | `LoginUseCase` |
| HTTP éxito | 200 |
| `data` | `{ accessToken: string, user: { id, email, fullName } }` (`LoginOutputDTO`) |
| Errores típicos | `VALIDATION_ERROR` 400; `INVALID_CREDENTIALS` 401 |

### 3.2 Accounts (protegido — Bearer)

Middleware: `AuthMiddleware.handle` en todas las rutas de esta sección.

#### `GET /api/accounts`

| Aspecto | Contrato observado |
|---------|-------------------|
| Body | Ninguno |
| Identidad | `userId` desde JWT (`req.user.userId`) |
| Caso de uso | `GetUserAccountsUseCase` |
| HTTP éxito | 200 |
| `data` | `AccountOutputDTO[]` |

#### `POST /api/accounts`

| Aspecto | Contrato observado |
|---------|-------------------|
| Validación Zod presentación | **Ninguna** |
| Body aceptado por UC | `initialBalance?: number` (≥ 0; default 0 si omitido) — `CreateAccountInputDTO` |
| Identidad | Controller pasa `{ userId, ...req.body }` (`AccountController.createAccount`) |
| Caso de uso | `CreateAccountUseCase` |
| HTTP éxito | 201 |
| `data` | `AccountOutputDTO` |
| Errores típicos | `INVALID_AMOUNT` 400; `USER_NOT_FOUND` 404; `DOMAIN_VALIDATION_ERROR` 400 |

**Hecho de seguridad observado:** el spread `...req.body` ocurre *después* de `userId`, por lo que un body con `userId` podría sobrescribir el del JWT. El frontend **no debe** enviar `userId` en el body.

#### `GET /api/accounts/:accountId/balance`

| Aspecto | Contrato observado |
|---------|-------------------|
| Params | `accountId` string no vacío |
| Caso de uso | `GetBalanceUseCase` |
| HTTP éxito | 200 |
| `data` | `AccountOutputDTO` |
| Sin accountId | 400 `VALIDATION_ERROR` |
| Errores tipicos | `ACCOUNT_NOT_FOUND` 404 |

#### `PATCH /api/accounts/:accountId/freeze`

| Aspecto | Contrato observado |
|---------|-------------------|
| Params | `accountId` |
| Caso de uso | `FreezeAccountUseCase` |
| HTTP éxito | 200 |
| `data` | `AccountOutputDTO` |
| Ya congelada | `DOMAIN_VALIDATION_ERROR` 400 (`InvalidPropValueError`) |

#### `PATCH /api/accounts/:accountId/unfreeze`

| Aspecto | Contrato observado |
|---------|-------------------|
| Params | `accountId` |
| Caso de uso | `UnfreezeAccountUseCase` |
| HTTP éxito | 200 |
| `data` | `AccountOutputDTO` |
| Ya activa | `DOMAIN_VALIDATION_ERROR` 400 |

### 3.3 Transactions (protegido — Bearer)

#### `POST /api/transactions/transfer`

| Aspecto | Contrato observado |
|---------|-------------------|
| Validación | `TransferMoneySchema` (`src/presentation/dto/TransactionDTOs.ts`) |
| Body | `sourceAccountId` UUID; `destinationAccountId` UUID; `amount` number > 0; `description?` string max 100 |
| Caso de uso | `TransferMoneyUseCase` — **no consume `description`**; genera descripción interna |
| HTTP éxito | 201 |
| Envelope | `{ status, message: 'Transferencia ejecutada de forma satisfactoria', data }` |
| `data` | `{ transactionId, sourceAccountId, destinationAccountId, amount, executedAt }` |

#### `POST /api/transactions/deposit`

| Aspecto | Contrato observado |
|---------|-------------------|
| Validación | `DepositFundsSchema` |
| Body | `accountId` UUID; `amount` number > 0 |
| HTTP éxito | 201 |
| `message` | `'Depósito ejecutado de forma satisfactoria'` |
| `data` | `{ transactionId, accountId, amount, type: 'DEPOSIT', executedAt }` |

#### `POST /api/transactions/withdrawal`

| Aspecto | Contrato observado |
|---------|-------------------|
| Validación | `WithdrawalFundsSchema` |
| Body | `accountId` UUID; `amount` number > 0 |
| HTTP éxito | 201 |
| `message` | `'Retiro ejecutado de forma satisfactoria'` |
| `data` | `{ transactionId, accountId, amount, type: 'WITHDRAWAL', executedAt }` |

#### `GET /api/transactions/history/:accountId`

| Aspecto | Contrato observado |
|---------|-------------------|
| Params | `accountId` |
| Caso de uso | `GetTransactionHistoryUseCase` |
| HTTP éxito | 200 |
| `data` | `{ accountId, transactions: TransactionHistoryItemDTO[] }` |

Ítem de historial (`TransactionHistoryDTOs.ts`):

| Campo | Tipo observado |
|-------|----------------|
| `id` | string |
| `type` | `'DEPOSIT' \| 'WITHDRAWAL' \| 'TRANSFER'` |
| `amount` | number |
| `status` | `'PENDING' \| 'COMPLETED' \| 'FAILED'` |
| `description` | string |
| `createdAt` | Date (serializa a JSON) |
| `sourceAccountId?` | string (Withdrawal, Transfer) |
| `destinationAccountId?` | string (Deposit, Transfer) |

**No observado:** paginación, filtros por fecha/tipo, ordenamiento queryable.

---

## 4. Shape `AccountOutputDTO`

Fuente: `src/use-cases/dto/AccountDTOs.ts` + `AccountStatus` en dominio.

| Campo | Tipo en código |
|-------|----------------|
| `id` | string |
| `accountNumber` | string (formato generado `ACC-` + 9 dígitos) |
| `balance` | `Decimal` (decimal.js) en DTO de aplicación |
| `status` | `'ACTIVE' \| 'FROZEN'` |
| `userId` | string |
| `createdAt` | Date |

**[PENDIENTE]** Forma exacta de `balance` en el wire JSON (string vs number). No hay prueba HTTP que fije la serialización; Decimal.js suele exponer `toJSON` como string.

---

## 5. Autenticación y autorización

Fuente: `AuthMiddleware.ts`, `JwtTokenService.ts`, `TokenService.ts`, controllers.

| Concepto | Hecho |
|----------|-------|
| Esquema | `Authorization: Bearer <accessToken>` |
| Payload JWT | `{ userId, email }` |
| Algoritmo | HS256 |
| Rutas públicas | Solo register y login |
| Roles | No existen en código |
| Refresh / logout | No existen en código |
| Ownership por `accountId` | **No verificado** en balance, freeze, unfreeze, transfer, deposit, withdrawal ni history; cualquier usuario autenticado puede operar si conoce el UUID |

Errores auth:

| code | HTTP | Condición |
|------|------|-----------|
| `UNAUTHORIZED` | 401 | Header ausente o no `Bearer ` |
| `INVALID_TOKEN` | 401 | Token inválido o expirado |

---

## 6. Catálogo de códigos de error confirmados

| code | HTTP | Fuente |
|------|------|--------|
| `VALIDATION_ERROR` | 400 | `validateRequest`, params `accountId` |
| `INSUFFICIENT_FUNDS` | 400 | `InsufficientBalanceError` |
| `INVALID_AMOUNT` | 400 | `InvalidAmountError` |
| `ACCOUNT_FROZEN` | 400 | `AccountFrozenError` |
| `DOMAIN_VALIDATION_ERROR` | 400 | Otros `DomainError` / `InvalidPropValueError` |
| `UNAUTHORIZED` | 401 | `AuthMiddleware` |
| `INVALID_TOKEN` | 401 | `AuthMiddleware` |
| `INVALID_CREDENTIALS` | 401 | `InvalidCredentialsError` |
| `USER_ALREADY_EXISTS` | 409 | `UserAlreadyExistsError` |
| `DUPLICATE_FIELD` | 409 | Prisma `P2002` |
| `ACCOUNT_NOT_FOUND` | 404 | `AccountNotFoundError` |
| `USER_NOT_FOUND` | 404 | `UserNotFoundError` |
| `RESOURCE_NOT_FOUND` | 404 | Prisma `P2025` |
| `INTERNAL_SERVER_ERROR` | 500 | Errores no tipados (`status: 'error'`) |

---

## 7. Casos de uso que consumirá el frontend

| Dominio | Caso de uso | Símbolo | Ruta HTTP |
|---------|-------------|---------|-----------|
| Auth | Registro | `RegisterUserUseCase` | `POST /api/auth/register` |
| Auth | Login | `LoginUseCase` | `POST /api/auth/login` |
| Account | Crear | `CreateAccountUseCase` | `POST /api/accounts` |
| Account | Listar | `GetUserAccountsUseCase` | `GET /api/accounts` |
| Account | Consultar saldo/datos | `GetBalanceUseCase` | `GET /api/accounts/:accountId/balance` |
| Account | Congelar | `FreezeAccountUseCase` | `PATCH /api/accounts/:accountId/freeze` |
| Account | Descongelar | `UnfreezeAccountUseCase` | `PATCH /api/accounts/:accountId/unfreeze` |
| Transaction | Transferencia | `TransferMoneyUseCase` | `POST /api/transactions/transfer` |
| Transaction | Depósito | `DepositUseCase` | `POST /api/transactions/deposit` |
| Transaction | Retiro | `WithdrawalUseCase` | `POST /api/transactions/withdrawal` |
| Transaction | Historial | `GetTransactionHistoryUseCase` | `GET /api/transactions/history/:accountId` |

No se observaron más rutas HTTP en `createApp()`.

---

## 8. Comandos backend (instalación / validación)

Fuente: `package.json`, `vitest.config.mjs`.

| Acción | Comando |
|--------|---------|
| Instalar | `pnpm install` |
| Desarrollar | `pnpm start` (`tsx watch src/server.ts`) |
| Compilar | `pnpm build` |
| Probar todo | `pnpm test` |
| Unit | `pnpm test:unit` |
| Integración | `pnpm test:integration` |
| Watch | `pnpm test:watch` |
| Coverage | `pnpm test:coverage` |

**No observado en scripts:** lint, format, `prisma generate` / `migrate` (existen schema y `prisma7.config.ts`, pero sin script npm).

---

## 9. Decisiones derivadas para el frontend

1. Tipar el cliente HTTP exactamente con los DTOs de esta tabla; no añadir campos “por si acaso”.
2. Adjuntar `Authorization: Bearer` en todas las rutas protegidas tras login.
3. Mapear UX de error por `code`, no solo por mensaje.
4. En `POST /api/accounts` enviar solo `{ initialBalance? }`; nunca `userId`.
5. Tratar `description` de transfer como opcional en UI; el backend puede ignorarlo.
6. Asumir ownership en UI (filtrar/usar solo cuentas del listado propio) aunque el API no lo enforce.
7. Base URL configurable (p. ej. `http://localhost:3000`); el backend no fija un origin FE.

---

## 10. `[PENDIENTE]`

- Serialización wire de `balance` (`Decimal`).
- Confirmación runtime de fechas ISO en `createdAt` / `executedAt`.
- Valores reales de `JWT_SECRET` / `JWT_EXPIRES_IN` / `DATABASE_URL` del entorno del equipo (no documentar secretos).
- Si el backend corregirá el override de `userId` en create account y añadirá ownership checks.
- URL base de despliegue y política CORS restringida (hoy abierta).
- Scripts Prisma oficiales del proyecto (generate/migrate) no listados en `package.json`.

---

## 11. Prohibición explícita

**Queda prohibido** documentar o implementar en el frontend contratos no observados: refresh tokens, logout API, roles, paginación de historial, filtros query, endpoints de perfil, webhooks, OpenAPI no presente en repo, ni campos DTO no listados arriba.
