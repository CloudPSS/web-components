const fs = require('fs-extra');
const path = require('path');

// DO NOT DELETE THIS FILE
// This file is used by build system to build a clean npm package with the compiled js files in the root of the package.
// It will not be included in the npm package.

async function main() {
    await fs.remove(path.resolve(__dirname, './publish/tsconfig.tsbuildinfo'));
    await fs.remove(path.resolve(__dirname, './publish/tsconfig.json'));
    await fs.remove(path.resolve(__dirname, './publish/tsconfig.check.json'));
}

main();
