import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@config': path.resolve(rootDir, 'src/config'),
      '@domain': path.resolve(rootDir, 'src/domain'),
      '@application': path.resolve(rootDir, 'src/application'),
      '@infrastructure': path.resolve(rootDir, 'src/infrastructure'),
      '@presentation': path.resolve(rootDir, 'src/presentation'),
    },
  },
});
