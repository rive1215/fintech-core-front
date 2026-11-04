# Frontend Workflows — Fintech Core

**Fecha del análisis:** 2026-11-03  
**Alcance:** Flujos UX ↔ HTTP confirmados contra `fintech-core-app`.  
**Prohibición:** no describir pasos que llamen endpoints, query params o campos no presentes en `backend-contract.md`.

---

## 1. Premisas observadas

- Base API: host configurable; rutas bajo `/api/...` (`src/presentation/app.ts`).
- Auth: Bearer tras login; register no autentica.
- Ownership UI: usar solo cuentas de `GET /api/accounts`.
- Errores: ramificar por `code` + HTTP.

---

## 2. Auth

### 2.1 Registro

```
Usuario completa name, email, password
  → validación cliente (espejo RegisterUserSchema)
  → POST /api/auth/register
  → 201: mostrar éxito; navegar a Login (sin token)
  → 409 USER_ALREADY_EXISTS / DUPLICATE_FIELD: email ya usado
  → 400 VALIDATION_ERROR: mostrar errors[]
```

Fuentes: `AuthController.register`, `RegisterUserUseCase`, `RegisterUserSchema`.

### 2.2 Login

```
Usuario completa email, password
  → POST /api/auth/login
  → 200: guardar accessToken + user; ir a área autenticada; disparar ListAccounts
  → 401 INVALID_CREDENTIALS
  → 400 VALIDATION_ERROR
```

Fuentes: `LoginUseCase`, `LoginSchema`.

### 2.3 Sesión expirada / inválida

```
Cualquier request protegida
  → 401 UNAUTHORIZED | INVALID_TOKEN
  → limpiar AuthSession + caches financieras
  → redirigir a Login
```

Fuente: `AuthMiddleware.ts`.

**No existe** workflow de logout API ni refresh.

---

## 3. Cuentas

### 3.1 Listar cuentas (entrada al dashboard)

```
Usuario autenticado entra a Cuentas
  → GET /api/accounts  (Bearer)
  → 200: renderizar items (accountNumber, balance, status)
  → 401: workflow sesión inválida
```

### 3.2 Crear cuenta

```
Opcionalmente captura initialBalance (>= 0)
  → POST /api/accounts  body: { initialBalance? }  // NUNCA userId
  → 201: insertar/refetch lista; feedback
  → 400 INVALID_AMOUNT | DOMAIN_VALIDATION_ERROR
  → 404 USER_NOT_FOUND (anómalo si token válido)
```

Fuentes: `CreateAccountUseCase`, `AccountController.createAccount`.

### 3.3 Consultar saldo / detalle

```
Usuario elige cuenta propia (id de lista)
  → GET /api/accounts/:accountId/balance
  → 200: mostrar AccountOutputDTO
  → 404 ACCOUNT_NOT_FOUND
```

### 3.4 Congelar

```
Cuenta status === ACTIVE
  → PATCH /api/accounts/:accountId/freeze
  → 200: status FROZEN; deshabilitar operaciones de fondos en UI
  → 400 DOMAIN_VALIDATION_ERROR si ya FROZEN
  → 404 ACCOUNT_NOT_FOUND
```

### 3.5 Descongelar

```
Cuenta status === FROZEN
  → PATCH /api/accounts/:accountId/unfreeze
  → 200: status ACTIVE
  → 400 DOMAIN_VALIDATION_ERROR si ya ACTIVE
```

---

## 4. Transacciones

### 4.1 Depósito

```
Precondición UI: cuenta ACTIVE del listado propio
  → POST /api/transactions/deposit { accountId, amount }
  → 201: feedback message + data; refetch balance + historial
  → 400 ACCOUNT_FROZEN | INVALID_AMOUNT | VALIDATION_ERROR
  → 404 ACCOUNT_NOT_FOUND
```

Fuente: `DepositUseCase`, `DepositFundsSchema`.

### 4.2 Retiro

```
Precondición UI: ACTIVE; amount <= balance mostrado (aviso UX, no garantía)
  → POST /api/transactions/withdrawal { accountId, amount }
  → 201: refetch balance + historial
  → 400 INSUFFICIENT_FUNDS | ACCOUNT_FROZEN | INVALID_AMOUNT
```

Fuente: `WithdrawalUseCase`.

### 4.3 Transferencia

```
Origen: cuenta ACTIVE propia
Destino: UUID de otra cuenta (campo libre o selector si se conoce)
Monto > 0; origen ≠ destino
description opcional (max 100) — el UC backend puede ignorarla
  → POST /api/transactions/transfer
  → 201: refetch balances afectados + historial origen
  → 400: INSUFFICIENT_FUNDS, ACCOUNT_FROZEN (origen o destino),
         INVALID_AMOUNT, DOMAIN_VALIDATION_ERROR (misma cuenta), VALIDATION_ERROR
  → 404 ACCOUNT_NOT_FOUND (origen o destino)
```

Fuentes: `TransferMoneyUseCase`, `TransferMoneySchema`.  
**Nota:** el destino puede no pertenecer al usuario; el API lo permite si el UUID existe y no está frozen.

### 4.4 Historial

```
Cuenta seleccionada
  → GET /api/transactions/history/:accountId
  → 200: lista tipada DEPOSIT | WITHDRAWAL | TRANSFER
  → Sin paginación observada: renderizar arreglo completo
```

Fuente: `GetTransactionHistoryUseCase`.

---

## 5. Mapa de pantallas sugerido (derivado, no del FE vacío)

| Pantalla | Workflows |
|----------|-----------|
| Register | 2.1 |
| Login | 2.2 |
| Accounts (lista) | 3.1, 3.2, 3.4, 3.5 |
| Account detail | 3.3, 4.4 |
| Deposit | 4.1 |
| Withdrawal | 4.2 |
| Transfer | 4.3 |

Rutas de router FE: **[PENDIENTE]** (no hay código FE).

---

## 6. Matriz de guards de UI

| Acción | Requiere token | Requiere cuenta ACTIVE | Usar solo IDs de `GET /api/accounts` |
|--------|----------------|------------------------|--------------------------------------|
| List/create accounts | Sí | — | create: N/A |
| Balance / history | Sí | No (consulta) | Recomendado sí |
| Freeze | Sí | Sí (ACTIVE) | Sí |
| Unfreeze | Sí | No (FROZEN) | Sí |
| Deposit / Withdraw / Transfer (como origen) | Sí | Sí | Sí (origen) |

---

## 7. Decisiones para el frontend

1. Encadenar login → list accounts automáticamente.
2. Tras mutaciones financieras, refrescar balance e historial de la cuenta activa.
3. Mostrar `message` de éxito de transacciones cuando venga en el envelope.
4. Bloquear en UI operaciones sobre `FROZEN` para reducir errores `ACCOUNT_FROZEN`.
5. En transfer, validar origen ≠ destino antes del request (el backend también lo valida).

---

## 8. `[PENDIENTE]`

- Deep-linking y rutas exactas del router FE.
- Cómo el usuario obtiene `destinationAccountId` (input manual UUID vs otro mecanismo no existente en API).
- Confirmación de ownership checks futuros en backend (cambiaría mensajes 403/404).
- Política UX si `GET /api/accounts` devuelve lista vacía (solo CTA crear).

---

## 9. Prohibición explícita

**Prohibido** documentar flujos de recuperación de contraseña, 2FA, logout remoto, export CSV, o cualquier llamada HTTP no listada en `backend-contract.md`.
