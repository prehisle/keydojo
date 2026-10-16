import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// `base: './'` keeps the build relocatable: GitHub Pages subpaths and the future Tauri shell.
export default defineConfig({
  base: './',
  plugins: [react()],
});
