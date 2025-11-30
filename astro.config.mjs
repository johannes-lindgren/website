import tailwind from '@astrojs/tailwind'
import { defineConfig } from 'astro/config'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeSlug from 'rehype-slug'

import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import pagefind from 'astro-pagefind'
import preact from '@astrojs/preact'

// https://astro.build/config
export default defineConfig({
  site: 'https://astro-micro.vercel.app',
  integrations: [tailwind(), sitemap(), mdx(), pagefind(), preact()],
  markdown: {
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: 'append' }],
    ],
    shikiConfig: {
      theme: 'css-variables',
    },
  },
})
