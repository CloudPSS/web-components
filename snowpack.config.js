/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
    mount: {
        stat: '/',
        src: '/_dist_',
    },
    plugins: ['@snowpack/plugin-typescript'],
    install: [],
    installOptions: {
        installTypes: true,
        polyfillNode: true,
    },
    devOptions: {},
    buildOptions: {
        out: 'publish',
    },
    proxy: {},
    alias: {},
};
