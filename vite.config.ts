import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // This ensures that `process.env.API_KEY` in your code is replaced with the actual string value during build
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // This prevents "process is not defined" error if any other code references process
      'process.env': {}
    }
  };
});