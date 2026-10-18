import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  ssgOptions: { format: 'cjs', formatting: 'none' },
  build: { target: 'es2020', cssCodeSplit: true },
  test: { environment: 'jsdom', include: ['src/**/*.test.{ts,tsx}'] },
});
