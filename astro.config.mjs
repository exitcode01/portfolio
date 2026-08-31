// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'Haressh S',
			social: [
				{ icon: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/hressh/' },
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/exitcode01' },
				{ icon: 'mastodon', label: 'Mastodon', href: 'https://mastodon.social/@hash96' },
			],
			sidebar: [
				{ label: 'Resume', link: '/resume/' },
				{ label: 'Blog', items: [{ autogenerate: { directory: 'blog' } }] },
				{ label: 'Portfolio', items: [{ autogenerate: { directory: 'portfolio' } }] },
			],
			components: {
				Header: './src/components/Header.astro',
				Sidebar: './src/components/Sidebar.astro',
				Pagination: './src/components/Pagination.astro',
			},
			customCss: ['./src/styles/starlight-theme.css'],
		}),
	],
});
