import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    deps: {
      inline: ['punycode'],
    },
    // restoreMocks: true,
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/__test__/setup.ts'],
    css: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@test': path.resolve(__dirname, './src/__test__'),
      punycode: 'punycode/',
    },
  },
});
