import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://futureforth.com',
  // Match the old Squarespace addresses exactly (no trailing slash): pages build as /contact.html,
  // which Cloudflare serves at /contact, so old links and Google's index need no extra redirect.
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [
    sitemap({
      // Pages marked noindex stay out of the sitemap.
      filter: (page) => !/\/(thanks|privacy-policy|affiliate|404)$/.test(page),
    }),
  ],
});
