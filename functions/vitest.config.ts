import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    // Los tests comparten el emulador de Firestore: en serie para que la
    // limpieza de datos de un fichero no pise a otro.
    fileParallelism: false,
    testTimeout: 15_000,
    hookTimeout: 15_000,
  },
});
