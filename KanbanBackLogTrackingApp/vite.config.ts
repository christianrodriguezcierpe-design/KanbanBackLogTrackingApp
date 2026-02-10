import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];

  return {
    plugins: [react()],
    base: mode === 'production' && repoName ? `/${repoName}/` : '/',
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/testSetup.ts',
    },
  };
});
