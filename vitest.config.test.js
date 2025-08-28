import { defineConfig } from 'vite';

export default defineConfig({
	test: {
		environment: 'node',
		include: ['src/lib/**/*.spec.js'],
		exclude: ['src/**/*.svelte.{test,spec}.{js,ts}'],
		globals: true
	}
});