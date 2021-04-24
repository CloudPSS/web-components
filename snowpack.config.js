/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
    mount: {
        static: '/',
        src: '/_dist_',
    },
    plugins: ['@snowpack/plugin-typescript'],
    packageOptions: {
        polyfillNode: true,
    },
    devOptions: {},
    buildOptions: {
        out: 'publish',
    },
    alias: {},
};
