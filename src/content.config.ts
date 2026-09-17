import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { glob } from 'astro/loaders';

export const collections = {
	docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
	photos: defineCollection({
		loader: glob({ pattern: '**/*.md', base: './src/content/photography' }),
		schema: ({ image }) =>
			z.object({
				title: z.string(),
				description: z.string().optional(),
				date: z.coerce.date(),
				image: image(),
				tags: z.array(z.string()).default([]),
				location: z.string().optional(),
				camera: z.string().optional(),
			}),
	}),
};
