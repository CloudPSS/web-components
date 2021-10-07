import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        sourcemap: true,
        manifest: true,
        lib: {
            entry: 'src/index.ts',
            formats: ['es'],
        },
        rollupOptions: {
            external: Object.keys(require('./package.json').dependencies).map((d) => new RegExp(`^${d}`)),
        },
    },
});
