# Frontend State — Fintech Core

**Fecha del análisis:** 2026-11-03  
**Alcance:** Modelo de estado de la UI derivado de los datos y flujos que el backend `fintech-core-app` realmente expone.  
**Prohibición:** no inventar entidades de estado (roles, refresh tokens, preferencias API, notificaciones push) no observadas en el backend.

---

## 1. Hechos observados (origen de datos)

| Dato | Origen API | Fuente |
|------|------------|--------|
| Sesión (`accessToken` + user público) | `POST /api/auth/login` → `data.accessToken`, `data.user` | `LoginOutputDTO` |
| Usuario recién registrado | `POST /api/auth/register` → `data` sin token | `RegisterUserOutputDTO` — **no inicia sesión sola** |
| Lista de cuentas | `GET /api/accounts` | `AccountOutputDTO[]` |
| Cuenta creada | `POST /api/accounts` | `AccountOutputDTO` |
| Detalle/saldo de cuenta | `GET /api/accounts/:accountId/balance` | `AccountOutputDTO` |
| Cuenta tras freeze/unfreeze | `PATCH .../freeze|unfreeze` | `AccountOutputDTO` |
| Resultado transferencia | `POST /api/transactions/transfer` | `TransferMoneyOutputDTO` |
| Resultado depósito/retiro | deposit/withdrawal | Fund movement DTOs |
| Historial | `GET /api/transactions/history/:accountId` | `GetTransactionHistoryOutputDTO` |

No hay endpoint de “me”, de lista global de usuarios, ni de sesión refresh.

---

## 2. Árbol de estado propuesto

### 2.1 AuthSession (persistente de sesión)

| Campo | Tipo conceptual | Notas |
|-------|-----------------|-------|
| `accessToken` | string \| null | Header Bearer; único mecanismo de auth observado |
| `user` | `{ id, email, fullName } \| null` | Solo disponible post-login (register no devuelve token) |
| `status` | `'anonymous' \| 'authenticated' \| 'unknown'` | `unknown` mientras se rehidrata token del storage |

**Invalidación:** respuestas 401 con `UNAUTHORIZED` o `INVALID_TOKEN` → limpiar sesión.

### 2.2 AccountsState

| Campo | Tipo conceptual | Notas |
|-------|-----------------|-------|
| `items` | `Account[]` | Desde listado; fuente primaria de ownership en UI |
| `selectedAccountId` | string \| null | Solo IDs presentes en `items` |
| `loading` / `error` | UI | Errores tipados por `code` |
| `lastMutation` | opcional | Resultado create/freeze/unfreeze para feedback |

Shape de cuenta (desde `AccountOutputDTO`):

```
id, accountNumber, balance, status ('ACTIVE'|'FROZEN'), userId, createdAt
```

**[PENDIENTE]** tipo runtime de `balance` en JSON.

### 2.3 TransactionsState

| Campo | Tipo conceptual | Notas |
|-------|-----------------|-------|
| `historyByAccountId` | map accountId → items[] | Solo historial del account consultado |
| `lastOperation` | transfer \| deposit \| withdrawal result \| null | Feedback post-mutación |
| `loading` / `error` | UI | Incluye `INSUFFICIENT_FUNDS`, `ACCOUNT_FROZEN`, etc. |

No cachear historial global: el API es por `accountId` sin paginación.

### 2.4 UI efímero (no dominio)

- Valores de formularios (register, login, create account, montos, cuentas origen/destino).
- Flags de submit in-flight.
- Mensajes toast/banner derivados de `message` o `code`.

No persistir passwords ni montos de formularios en storage.

---

## 3. Quién es dueño de cada estado

| Estado | Capa dueña | Persistencia |
|--------|------------|--------------|
| Token + user | Application `AuthSession` + Infrastructure `TokenStore` | **[PENDIENTE]** local vs session vs memoria |
| Cuentas | Application tras `ListAccounts` / mutaciones | Memoria; refetch tras create/freeze/unfreeze/movimientos |
| Historial | Application tras `GetTransactionHistory` | Memoria; refetch tras deposit/withdraw/transfer si la cuenta seleccionada cambió |
| Formularios | Presentation | No persistir |

---

## 4. Reglas de sincronización derivadas del backend

1. **Register ≠ Login:** tras registro exitoso, el estado auth sigue anonymous hasta login explícito (el API no emite token en register).
2. **Tras login:** guardar token; cargar `GET /api/accounts`.
3. **Tras create account / freeze / unfreeze:** actualizar ítem en `items` o refetch listado.
4. **Tras deposit / withdrawal / transfer:** invalidar o refetch balance de cuentas afectadas + historial de la cuenta activa; en transfer, origen y destino si ambos están en `items`.
5. **Cuenta `FROZEN`:** la UI debe deshabilitar deposit/withdraw/transfer que usen esa cuenta (el backend rechaza con `ACCOUNT_FROZEN`).
6. **Selección de cuenta:** si `selectedAccountId` no está en `items`, resetear a null.

---

## 5. Estado que NO debe existir (no observado)

- Roles / permissions store.
- Refresh token / token pair.
- Preferencias de usuario vía API.
- Cola offline de transacciones.
- Lista de “todas las cuentas del sistema”.
- Paginación de historial (`page`, `cursor`, etc.).

---

## 6. Decisiones para el frontend

1. Separar **sesión** de **datos financieros** (cuentas/transacciones).
2. Usar `code` del error API como clave de mensaje i18n/UI.
3. Tratar `GET /api/accounts` como fuente de verdad de “mis cuentas”.
4. No confiar en que el backend bloquee UUIDs ajenos; el estado UI solo expone `items` propios.
5. Tras 401 de token, reset total de AuthSession + Accounts + Transactions.

---

## 7. `[PENDIENTE]`

- Librería de estado (Context, Zustand, Redux, etc.) — repo FE vacío.
- Persistencia exacta del JWT.
- Política de refetch vs patch optimista (el backend no define ETags/versionado).
- Normalización de `balance` a number/string/Decimal en el store FE.

---

## 8. Prohibición explícita

**Prohibido** modelar estado para contratos no documentados en `backend-contract.md` ni asumir campos extra en `user`, `Account` o historial.
