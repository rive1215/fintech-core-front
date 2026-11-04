# ==========================================================
# ETAPA 1: Builder (Compilación de React con Vite y pnpm)
# ==========================================================
FROM node:24-alpine AS builder

# Debe coincidir con package.json → "packageManager": "pnpm@10.15.0"
# Si las versiones no coinciden, pnpm intenta bajar @pnpm/exe y falla en Alpine (musl).
RUN npm i -g pnpm@10.15.0

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Evita el switch a @pnpm/exe (sin binario linux-x64-musl en Alpine).
RUN echo "package-manager-strict=false" >> .npmrc \
  && pnpm install --frozen-lockfile

COPY . .

# Variable que consume src/config/env.ts (no VITE_API_URL).
ARG VITE_API_BASE_URL=http://localhost:3000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN pnpm build

# ==========================================================
# ETAPA 2: Servidor Web de Archivos Estáticos (Nginx)
# ==========================================================
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
