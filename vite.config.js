import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import litCss from './plugins/lit-css';
import dts from 'vite-plugin-dts';
import glob from 'fast-glob';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        checker({ typescript: true }),
        dts({
            exclude: ['src/types/**/*.d.ts'],
        }),
        litCss(),
    ],
    build: {
        sourcemap: true,
        minify: false,
        manifest: true,
        lib: {
            entry: await glob('src/*.ts'),
            formats: ['es'],
        },
        rollupOptions: {
            external: Object.keys(require('./package.json').dependencies).map((d) => new RegExp(`^${d}`)),
        },
    },
});
