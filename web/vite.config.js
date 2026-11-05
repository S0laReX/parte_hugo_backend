import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // permite abrir la web desde otras computadoras de la red
    port: 5173
  }
});
