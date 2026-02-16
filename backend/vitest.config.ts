import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.{ts,js}'],
    globals: true,
    environment: 'node',
    testTimeout: 20000,
    root: path.resolve(__dirname),
    pool: 'forks', // Use forks instead of threads to avoid Windows path issues
    poolOptions: {
      forks: {
        singleFork: true, // Run in a single fork to minimize fs operations
      },
    },
  },
});
