// @ts-check
import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";
import icon from "astro-icon";
import tailwindcss from "@tailwindcss/vite";

// GitHub Pages project site: https://burnninel.github.io/DevDocs/
// `site` + `base` must stay in sync with the repository name.
export default defineConfig({
	site: "https://burnninel.github.io",
	base: "/DevDocs",
	trailingSlash: "always",
	build: {
		format: "directory",
	},
	integrations: [vue(), icon()],
	vite: {
		plugins: [tailwindcss()],
	},
	markdown: {
		// Shiki powers code highlighting via the <Code /> component too.
		shikiConfig: {
			theme: "github-dark-default",
			wrap: false,
		},
	},
});
