import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { APP_ICON_PATH, APP_NAME } from './src/core/branding.ts';

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), 'VITE_');
  // Android packages load from their local root even when a shell still has a
  // Pages deployment path set. Web builds default to the existing root path.
  const configuredBase = mode === 'android-demo' ? '/' : environment.VITE_BASE_PATH?.trim() || '/';
  if (
    /[\\?#:]/.test(configuredBase) ||
    configuredBase.includes('//') ||
    configuredBase.split('/').some((part) => part === '.' || part === '..')
  )
    throw new Error('VITE_BASE_PATH must be a local directory path such as /siissai/.');
  const base = `/${configuredBase.replace(/^\/+|\/+$/g, '')}/`.replace(/^\/\/$/, '/');
  const navigationPrefix = new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
  return {
    base,
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        scope: base,
        registerType: 'prompt',
        // The runtime registers explicitly on web; installed Android uses bundled assets.
        injectRegister: false,
        includeAssets: ['icons/*.png', 'icons/*.svg'],
        manifest: {
          name: APP_NAME,
          short_name: APP_NAME,
          description: '과학고·영재학교를 향한 수학과학 원리 탐험',
          lang: 'ko',
          start_url: base,
          scope: base,
          display: 'standalone',
          theme_color: '#ffffff',
          background_color: '#ffffff',
          icons: [
            { src: `${base}${APP_ICON_PATH}`, sizes: '192x192', type: 'image/png', purpose: 'any' },
            {
              src: `${base}icons/siikawa-512.png`,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: `${base}icons/siikawa-maskable-512.png`,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,png,jpg,jpeg,webp,svg,webmanifest,txt}'],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          navigateFallback: 'index.html',
          navigateFallbackAllowlist: [navigationPrefix],
          cleanupOutdatedCaches: true,
        },
      }),
    ],
  };
});
