import { defineConfig } from 'vite';
export default defineConfig({
  // Keep local fonts compatible with nginx's font-src 'self' policy.
  build: { assetsInlineLimit: 0 },
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
    proxy: { '/api': process.env.RIGHTPIXEL_API_PROXY ?? 'http://localhost:5100' },
  },
});
