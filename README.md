# fintech-core-front

Frontend React + TypeScript (Vite) para Fintech Core, organizado con Clean Architecture.

## Capas

| Carpeta | Rol |
|---------|-----|
| `src/domain` | Entidades, errores y puertos (sin React ni HTTP) |
| `src/application` | Casos de uso y `Result` (solo dependen de domain) |
| `src/infrastructure` | `HttpClient` (fetch), storage, adaptadores |
| `src/presentation` | React: pages, hooks, context, router |
| `src/config` | Config externa (`VITE_API_BASE_URL`) |
| `src/composition` | Composition root / wiring |

Documentación de contrato: `docs/frontend/`.

## Scripts (pnpm)

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm lint
pnpm build
```

## Variables de entorno

Copiar `.env.example` a `.env` si se necesita otra base URL del API.
