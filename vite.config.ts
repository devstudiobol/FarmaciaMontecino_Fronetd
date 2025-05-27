import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()], // ✅ Plugin de React activado
  server: {
    host: 'farmacia.local', // URL personalizada
    port: 3000,
  },
  build: {
    outDir: 'dist', // Asegura que la carpeta de salida sea 'dist'
    emptyOutDir: true, // Limpia la carpeta antes de cada build
  },
  base: './', // ✅ Ruta relativa para evitar errores al desplegar
});