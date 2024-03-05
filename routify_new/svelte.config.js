import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import routify from '@roxi/routify/vite-plugin'

export default {
  // Consult https://svelte.dev/docs#compile-time-svelte-preprocess
  // for more information about preprocessors
  preprocess: vitePreprocess(),
  plugins: [
    routify({/* config */ })
  ],
}
