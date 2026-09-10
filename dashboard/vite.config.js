import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        open: true,
        proxy: {
            // Proxy REST API calls to FastAPI backend in dev mode
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
            // Proxy WebSocket connections to FastAPI backend in dev mode
            '/ws': {
                target: 'ws://localhost:8000',
                ws: true,
                changeOrigin: true,
            },
        },
    },
    resolve: {
        alias: {
            '@': '/src',
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: false,
    },
});
