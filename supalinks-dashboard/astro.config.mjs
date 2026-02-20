import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import { loadEnv } from 'vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://supalinks.cc',
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  vite: {
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    },
  },
});
