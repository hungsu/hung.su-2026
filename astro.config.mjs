// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://hung.su',
	integrations: [mdx(), sitemap()],
	server: {
		host: '0.0.0.0',
	},
});
