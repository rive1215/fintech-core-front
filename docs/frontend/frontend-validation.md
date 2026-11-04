# Frontend Validation — Fintech Core

**Fecha del análisis:** 2026-11-03  
**Alcance:** Reglas de validación de formularios y precondiciones de UI alineadas a Zod de presentación y validaciones de casos de uso del backend `fintech-core-app`.  
**Prohibición:** no añadir reglas de negocio o campos de validación no observados en schemas/DTOs/use cases del backend.

---

## 1. Fuente de verdad de validación

| Capa backend | Archivo | Efecto en FE |
|--------------|---------|--------------|
| Zod presentación | `src/presentation/dto/AuthDTOs.ts` | Formularios register/login |
| Zod presentación | `src/presentation/dto/TransactionDTOs.ts` | Transfer / deposit / withdrawal |
| Params en controller | `AccountController`, `TransactionController` | `accountId` path no vacío |
| Casos de uso | `CreateAccountUseCase`, transfer/deposit/withdrawal, freeze/unfreeze | Precondiciones UI |
| Middleware | `validateRequest.ts` | Shape de `errors[]` en 400 |

Rutas **sin** Zod de body: `POST /api/accounts`, y todos los GET/PATCH por path. El FE debe validar localmente lo que el UC exige.

---

## 2. Auth — espejo Zod

### 2.1 Register (`RegisterUserSchema`)

| Campo | Reglas observadas | Mensajes Zod (referencia) |
|-------|-------------------|---------------------------|
| `name` | string; min 3; max 100 | nombre requerido / al menos 3 / no exceder 100 |
| `email` | email válido | formato inválido |
| `password` | string; min 8 | requerida / mínimo 8 |

No hay reglas extra de complejidad (mayúsculas, símbolos, etc.) en el código.

### 2.2 Login (`LoginSchema`)

| Campo | Reglas observadas |
|-------|-------------------|
| `email` | email válido |
| `password` | string; min 1 (no vacío) |

---

## 3. Accounts

### 3.1 Create account (sin Zod presentación)

Desde `CreateAccountInputDTO` + `CreateAccountUseCase`:

| Campo | Reglas |
|-------|--------|
| `initialBalance` | opcional; si se envía, number ≥ 0 |
| `userId` | **no enviar** (viene del JWT; el controller hace spread de body) |

Validación FE recomendada: si el input está vacío, omitir el campo; si hay valor, parsear number finito ≥ 0.

### 3.2 Path `accountId` (balance, freeze, unfreeze, history)

| Regla | HTTP backend si falla |
|-------|----------------------|
| string no vacío | 400 `VALIDATION_ERROR` |

Adicional UI: UUID preferible (las cuentas se crean con `crypto.randomUUID()`). El path **no** pasa por `z.uuid()` en estos endpoints (sí en bodies de transacciones).

### 3.3 Freeze / Unfreeze (precondiciones UC)

| Acción | Precondición dominio | Error si se viola |
|--------|----------------------|-------------------|
| Freeze | cuenta existe; status ≠ `FROZEN` | `ACCOUNT_NOT_FOUND` / `DOMAIN_VALIDATION_ERROR` |
| Unfreeze | cuenta existe; status ≠ `ACTIVE` | idem |

Validación FE: habilitar freeze solo si `ACTIVE`; unfreeze solo si `FROZEN`.

---

## 4. Transactions — espejo Zod + UC

### 4.1 Transfer (`TransferMoneySchema` + `TransferMoneyUseCase`)

| Campo | Zod presentación | Reglas UC adicionales |
|-------|------------------|------------------------|
| `sourceAccountId` | UUID | cuenta existe; no `FROZEN`; saldo ≥ amount |
| `destinationAccountId` | UUID | existe; no `FROZEN`; ≠ source |
| `amount` | number; `positive` (> 0) | `amount <= 0` → `INVALID_AMOUNT` |
| `description` | opcional; string max 100 | **ignorada por el UC** (puede enviarse; no es requerida) |

Validación FE previa al submit:

1. Ambos IDs UUID válidos.
2. `sourceAccountId !== destinationAccountId`.
3. `amount` number finito > 0.
4. Si se conoce balance origen: avisar si `amount > balance` (el backend sigue siendo autoridad con `INSUFFICIENT_FUNDS`).
5. Origen (y, si aplica, destino conocido) no `FROZEN`.

### 4.2 Deposit (`DepositFundsSchema` + `DepositUseCase`)

| Campo | Reglas |
|-------|--------|
| `accountId` | UUID |
| `amount` | number > 0 |
| Cuenta | debe existir y no `FROZEN` |

### 4.3 Withdrawal (`WithdrawalFundsSchema` + `WithdrawalUseCase`)

| Campo | Reglas |
|-------|--------|
| `accountId` | UUID |
| `amount` | number > 0 |
| Cuenta | ACTIVE; saldo ≥ amount (backend) |

### 4.4 History

Sin body. Solo `accountId` path no vacío.

---

## 5. Manejo de errores de validación del API

Respuesta Zod (`validateRequest.ts`):

```json
{
  "status": "fail",
  "code": "VALIDATION_ERROR",
  "message": "Error de validación en los datos de entrada",
  "errors": [
    { "field": "<path Zod>", "message": "<issue.message>" }
  ]
}
```

**Decisión FE:** mapear `errors[].field` a inputs del formulario; si no hay `errors`, mostrar `message` / `code`.

Otros códigos post-submit (no son “field errors” pero deben mostrarse):

| code | Acción UI típica |
|------|------------------|
| `INVALID_CREDENTIALS` | Banner en login |
| `USER_ALREADY_EXISTS` | Campo email |
| `INSUFFICIENT_FUNDS` | Campo amount / banner |
| `ACCOUNT_FROZEN` | Banner + refrescar status cuenta |
| `ACCOUNT_NOT_FOUND` | Banner / volver a lista |
| `INVALID_AMOUNT` | Campo amount |
| `DOMAIN_VALIDATION_ERROR` | Banner con `message` |
| `UNAUTHORIZED` / `INVALID_TOKEN` | Logout local |

---

## 6. Estrategia de validación FE

1. **Cliente primero** con schemas Zod gemelos a `presentation/dto/*` para auth y transacciones.
2. **Create account:** schema FE propio mínimo (`initialBalance` opcional ≥ 0); no inventar más campos.
3. **Servidor siempre gana:** re-renderizar errores del API aunque la validación local haya pasado.
4. **Tipos de amount:** enviar `number` JSON (Zod `.number()`), no strings monetarios con símbolo.
5. **No validar** complejidad de password, IBAN, moneda ISO, ni 2FA — no existen en backend.

---

## 7. Tabla resumen formularios → endpoint

| Formulario | Endpoint | Schema a espejar |
|------------|----------|------------------|
| Register | `POST /api/auth/register` | `RegisterUserSchema` |
| Login | `POST /api/auth/login` | `LoginSchema` |
| Create account | `POST /api/accounts` | FE: `initialBalance?` ≥ 0 |
| Transfer | `POST /api/transactions/transfer` | `TransferMoneySchema` |
| Deposit | `POST /api/transactions/deposit` | `DepositFundsSchema` |
| Withdrawal | `POST /api/transactions/withdrawal` | `WithdrawalFundsSchema` |

---

## 8. `[PENDIENTE]`

- Librería exacta de forms (React Hook Form, Formik, etc.) — FE vacío.
- Locale de mensajes (backend en español; FE puede reutilizar o mapear por `code`).
- Precisión decimal en inputs (backend usa `decimal.js` / `Decimal(19,4)` en Prisma); confirmar cuántos decimales aceptar en UI.
- Validación de formato visual de `accountNumber` (`ACC-` + dígitos) solo display; no se usa como ID de API.

---

## 9. Prohibición explícita

**Prohibido** exigir campos no presentes en los schemas/DTOs observados (`phone`, `currency`, `otp`, `confirmPassword` como contrato API, paginación, etc.). `confirmPassword` solo podría existir como ayuda UX local y **no** enviarse al backend.
